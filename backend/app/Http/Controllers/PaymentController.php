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

        $order = Order::with('user')->findOrFail($validated['order_id']);

        if ($user->role === 'member' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $existing = Payment::where('order_id', $order->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($existing && in_array($existing->status, ['initialized', 'pending'])) {
            return response()->json([
                'message' => 'Payment already initialized',
                'payment' => $existing,
                'checkout_url' => $existing->checkout_url,
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
            'callback_url' => $chapa->callbackUrl(),
            'return_url' => $chapa->returnUrl($order->id),
            'customization' => [
                'title' => 'Shemachoch Payment',
                'description' => 'Order #' . $order->id,
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

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'tx_ref' => $txRef,
            'amount' => $order->total_price,
            'currency' => $chapa->currency(),
            'status' => 'initialized',
            'checkout_url' => $response['data']['checkout_url'] ?? null,
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

        return response()->json(['message' => 'Payment verified', 'payment' => $payment]);
    }

    public function verify(Request $request, $txRef, ChapaService $chapa)
    {
        $payment = Payment::where('tx_ref', $txRef)->first();
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

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
        $order = Order::findOrFail($orderId);

        if ($user->role === 'member' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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
}
