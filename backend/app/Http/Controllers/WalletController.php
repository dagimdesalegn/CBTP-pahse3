<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load(['walletTransactions' => fn ($query) => $query->latest()->limit(20)]);

        return response()->json([
            'balance' => $user->account_balance,
            'membership_status' => $user->membership_status,
            'transactions' => $user->walletTransactions,
        ]);
    }

    public function adjust(Request $request)
    {
        $actor = $request->user();

        abort_unless($actor->role === 'manager' || $actor->hasAccess('wallet'), 403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|not_in:0',
            'description' => 'nullable|string|max:255',
        ]);

        $transaction = DB::transaction(function () use ($actor, $validated) {
            $user = User::lockForUpdate()->findOrFail($validated['user_id']);
            $amount = (float) $validated['amount'];

            abort_unless($user->role === 'member', 422, 'Only member wallets can be adjusted');
            $this->ensureManagerCanAdjustWallet($actor, $user, $amount);

            $user->account_balance = max(0, (float) $user->account_balance + $amount);
            $user->save();

            return WalletTransaction::create([
                'user_id' => $user->id,
                'created_by' => $actor->id,
                'type' => $amount >= 0 ? 'credit' : 'debit',
                'amount' => abs($amount),
                'balance_after' => $user->account_balance,
                'description' => $validated['description'] ?? ($actor->role === 'manager' ? 'Manager wallet top-up' : 'Admin balance adjustment'),
            ]);
        });

        return response()->json([
            'message' => 'Wallet balance updated',
            'transaction' => $transaction,
        ]);
    }

    public function payOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $payment = DB::transaction(function () use ($request, $validated) {
            $user = User::lockForUpdate()->findOrFail($request->user()->id);
            $order = Order::where('user_id', $user->id)
                ->lockForUpdate()
                ->findOrFail($validated['order_id']);
            $amount = (float) $order->total_price;

            if ($order->status === Order::STATUS_CANCELLED) {
                abort(409, 'Cancelled orders cannot be paid');
            }

            $alreadyPaid = Payment::where('order_id', $order->id)
                ->where('status', 'success')
                ->lockForUpdate()
                ->exists();

            if ($alreadyPaid) {
                abort(409, 'Order is already paid');
            }

            if ((float) $user->account_balance < $amount) {
                abort(422, 'Insufficient wallet balance');
            }

            $user->account_balance = (float) $user->account_balance - $amount;
            $user->save();

            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => 'order_payment',
                'amount' => $amount,
                'balance_after' => $user->account_balance,
                'description' => "Wallet payment for order #{$order->id}",
            ]);

            return Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'user_id' => $user->id,
                    'tx_ref' => 'wallet-' . $order->id . '-' . Str::uuid(),
                    'amount' => $amount,
                    'currency' => 'ETB',
                    'status' => 'success',
                    'meta' => ['provider' => 'wallet'],
                ]
            );
        });

        return response()->json([
            'message' => 'Order paid from wallet',
            'payment' => $payment,
        ]);
    }

    private function ensureManagerCanAdjustWallet(User $actor, User $target, float $amount): void
    {
        if ($actor->role !== 'manager') {
            return;
        }

        abort_unless($amount > 0, 403, 'Managers can only top up wallet balances');
        abort_unless(
            $this->normalizeKebele($actor->manager_kebele) === $this->normalizeKebele($target->verification_kebele),
            403,
            'Managers can only adjust wallets for members in their assigned Kebele'
        );
    }

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
