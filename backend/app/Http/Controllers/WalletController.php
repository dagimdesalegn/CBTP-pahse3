<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        abort_unless($request->user()->hasAccess('wallet'), 403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|not_in:0',
            'description' => 'nullable|string|max:255',
        ]);

        $transaction = DB::transaction(function () use ($request, $validated) {
            $user = User::lockForUpdate()->findOrFail($validated['user_id']);
            $amount = (float) $validated['amount'];
            $user->account_balance = max(0, (float) $user->account_balance + $amount);
            $user->save();

            return WalletTransaction::create([
                'user_id' => $user->id,
                'created_by' => $request->user()->id,
                'type' => $amount >= 0 ? 'credit' : 'debit',
                'amount' => abs($amount),
                'balance_after' => $user->account_balance,
                'description' => $validated['description'] ?? 'Admin balance adjustment',
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
            $order = Order::where('user_id', $user->id)->findOrFail($validated['order_id']);
            $amount = (float) $order->total_price;

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
                    'tx_ref' => 'wallet-' . $order->id . '-' . now()->timestamp,
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
}
