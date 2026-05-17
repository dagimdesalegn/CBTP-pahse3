<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\ChapaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function initialize(Request $request, ChapaService $chapa)
    {
        $user = $request->user();

        if (!$chapa->isConfigured()) {
            return response()->json([
                'error' => 'Payment provider is not configured. Add CHAPA_SECRET_KEY to enable online payments.',
            ], 503);
        }

        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::with('user', 'orderItems.product')->findOrFail($validated['order_id']);
        $this->ensureOrderPaymentVisibleToUser($order, $user);

        $existing = Payment::where('order_id', $order->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($existing && in_array($existing->status, ['initialized', 'pending'], true)) {
            if ($existing->checkout_url) {
                return response()->json([
                    'message' => 'Payment already initialized',
                    'payment' => $existing,
                    'checkout_url' => $existing->checkout_url,
                ]);
            }

            $existing->update([
                'status' => 'failed',
                'meta' => array_merge($existing->meta ?? [], [
                    'local_error' => 'Missing Chapa checkout URL; reinitializing payment.',
                ]),
            ]);
        }

        if ($existing && $existing->status === 'success') {
            return response()->json([
                'message' => 'Order already paid',
                'payment' => $existing,
            ], 409);
        }

        $txRef = 'order-' . $order->id . '-' . Str::uuid();
        $phone = $this->formatPhone($order->user->phone);

        $payload = [
            'amount' => (string) $order->total_price,
            'currency' => $chapa->currency(),
            'email' => $order->user->email,
            'first_name' => $this->firstName($order->user->name),
            'last_name' => $this->lastName($order->user->name),
            'tx_ref' => $txRef,
            'callback_url' => $chapa->callbackUrl($request),
            'return_url' => $chapa->returnUrl($order->id, $request, $txRef),
            'customization' => [
                'title' => 'Shemachoch',
                'description' => 'Order ' . $order->id,
            ],
        ];

        if ($phone) {
            $payload['phone_number'] = $phone;
        }

        $response = $chapa->initialize($payload);

        if (!is_array($response) || ($response['status'] ?? null) !== 'success') {
            return response()->json([
                'error' => 'Unable to initialize payment',
                'details' => $response,
            ], 502);
        }

        $checkoutUrl = $response['data']['checkout_url'] ?? null;

        if (!$checkoutUrl) {
            return response()->json([
                'error' => 'Chapa did not return a checkout link',
                'details' => $response,
            ], 502);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'tx_ref' => $txRef,
            'amount' => $order->total_price,
            'currency' => $chapa->currency(),
            'status' => 'initialized',
            'checkout_url' => $checkoutUrl,
            'meta' => $response,
        ]);

        return response()->json([
            'message' => 'Payment initialized',
            'payment' => $payment,
            'checkout_url' => $payment->checkout_url,
        ]);
    }

    public function callback(Request $request, ChapaService $chapa)
    {
        $txRef = $request->input('trx_ref') ?? $request->input('tx_ref');
        $refId = $request->input('ref_id');

        if (!$txRef) {
            return response()->json(['error' => 'Missing tx_ref'], 400);
        }

        $payment = Payment::where('tx_ref', $txRef)->first();
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $verification = $chapa->verify($txRef);
        $status = $verification['data']['status'] ?? ($verification['status'] ?? 'pending');

        $payment->update([
            'chapa_ref_id' => $refId ?? ($verification['data']['reference'] ?? null),
            'status' => $status,
            'meta' => $verification,
        ]);

        return response()->json(['message' => 'Payment verified']);
    }

    public function createInPerson(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::with('orderItems.product')->findOrFail($validated['order_id']);
        $this->ensureOrderPaymentVisibleToUser($order, $request->user());

        if ($order->status === Order::STATUS_CANCELLED) {
            return response()->json(['error' => 'Cancelled orders cannot be paid'], 409);
        }

        $existingSuccess = Payment::where('order_id', $order->id)
            ->where('status', 'success')
            ->first();

        if ($existingSuccess) {
            return response()->json([
                'message' => 'Order already paid',
                'payment' => $existingSuccess,
            ], 409);
        }

        $payment = Payment::where('order_id', $order->id)
            ->where('status', 'pending')
            ->where('tx_ref', 'like', 'in-person-' . $order->id . '-%')
            ->first();

        if (!$payment) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'tx_ref' => 'in-person-' . $order->id . '-' . Str::uuid(),
                'amount' => $order->total_price,
                'currency' => 'ETB',
                'status' => 'pending',
                'meta' => [
                    'provider' => 'in_person',
                    'note' => 'Member will pay in person during pickup or delivery.',
                ],
            ]);
        }

        return response()->json([
            'message' => 'In-person payment selected. Please pay during pickup or delivery.',
            'payment' => $payment,
        ]);
    }

    public function updateStatus(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,success,failed,cancelled',
        ]);

        $payment->load('order.orderItems.product');
        $this->ensureOrderPaymentVisibleToUser($payment->order, $request->user());

        if (($payment->meta['provider'] ?? null) !== 'in_person') {
            return response()->json(['error' => 'Only in-person payments can be updated manually'], 422);
        }

        $payment->update([
            'status' => $validated['status'],
            'meta' => array_merge($payment->meta ?? [], [
                'updated_by' => $request->user()->id,
                'updated_manually_at' => now()->toIso8601String(),
            ]),
        ]);

        return response()->json([
            'message' => 'Payment status updated',
            'payment' => $payment->fresh(),
        ]);
    }

    public function verify(Request $request, $txRef, ChapaService $chapa)
    {
        $payment = Payment::where('tx_ref', $txRef)->first();
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $payment->load('order.orderItems.product');
        $this->ensureOrderPaymentVisibleToUser($payment->order, $request->user());

        $verification = $chapa->verify($txRef);
        $status = $verification['data']['status'] ?? ($verification['status'] ?? 'pending');

        $payment->update([
            'status' => $status,
            'meta' => $verification,
        ]);

        return response()->json(['message' => 'Payment verified', 'payment' => $payment]);
    }

    public function orderPayment(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::with('orderItems.product')->findOrFail($orderId);
        $this->ensureOrderPaymentVisibleToUser($order, $user);

        $payment = Payment::where('order_id', $order->id)->orderBy('created_at', 'desc')->first();

        return response()->json(['payment' => $payment]);
    }

    private function formatPhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $normalized = preg_replace('/[\s-]/', '', $phone);

        if (str_starts_with($normalized, '+251')) {
            $normalized = '0' . substr($normalized, 4);
        }

        if (strlen($normalized) === 9 && ($normalized[0] === '9' || $normalized[0] === '7')) {
            $normalized = '0' . $normalized;
        }

        if (preg_match('/^(09|07)\d{8}$/', $normalized)) {
            return $normalized;
        }

        return null;
    }

    private function firstName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name));
        return $parts[0] ?? 'Member';
    }

    private function lastName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name));
        return $parts[1] ?? 'Member';
    }

    private function ensureOrderPaymentVisibleToUser(Order $order, $user): void
    {
        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'member' && $order->user_id === $user->id) {
            return;
        }

        if ($user->role === 'manager' && $this->orderIsInManagerScope($order, $user)) {
            return;
        }

        abort(403, 'Unauthorized');
    }

    private function orderIsInManagerScope(Order $order, $manager): bool
    {
        if (!$manager->manager_kebele) {
            return false;
        }

        $order->loadMissing('orderItems.product');

        return $order->orderItems->contains(function ($item) use ($manager) {
            return $this->kebeleMatches($item->product?->kebele, $manager->manager_kebele);
        });
    }

    private function kebeleMatches(?string $left, ?string $right): bool
    {
        return $this->normalizeKebele($left) === $this->normalizeKebele($right);
    }

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
