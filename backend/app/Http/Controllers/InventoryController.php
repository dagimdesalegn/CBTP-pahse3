<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function update(Request $request, $productId)
    {
        $this->authorize('update', Product::class);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string',
            'type' => 'nullable|string|max:255',
        ]);

        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $this->ensureProductInUserScope($product, $request->user());

        [$product, $previousQuantity, $changeAmount] = DB::transaction(function () use ($productId, $validated, $request) {
            $product = Product::whereKey($productId)->lockForUpdate()->firstOrFail();
            $this->ensureProductInUserScope($product, $request->user());

            $previousQuantity = $product->quantity;
            $changeAmount = $validated['quantity'] - $previousQuantity;

            $product->update(['quantity' => $validated['quantity']]);
            $product->refresh();

            InventoryLog::create([
                'product_id' => $productId,
                'change_amount' => $changeAmount,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $validated['quantity'],
                'reason' => $validated['reason'],
                'type' => $validated['type'] ?? ($changeAmount > 0 ? 'manual_increase' : ($changeAmount < 0 ? 'manual_decrease' : 'manual_note')),
                'manager_id' => $request->user()->id,
            ]);

            return [$product, $previousQuantity, $changeAmount];
        });

        if ($changeAmount > 0 || ($previousQuantity <= 0 && $product->quantity > 0)) {
            NotificationService::notifyStockAvailable($product, max($changeAmount, $product->quantity), 'restock');
        }

        return response()->json([
            'message' => 'Inventory updated successfully',
            'product' => $product,
        ]);
    }

    public function logs(Request $request)
    {
        $this->authorize('viewAny', InventoryLog::class);

        $query = InventoryLog::with('product', 'manager');

        if ($request->user()->role === 'manager') {
            $managerKebele = $request->user()->manager_kebele;
            $query->whereHas('product', function ($productQuery) use ($managerKebele) {
                $this->whereKebeleMatches($productQuery, $managerKebele);
            });
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('kebele')) {
            $kebele = $request->input('kebele');
            $query->whereHas('product', function ($productQuery) use ($kebele) {
                $this->whereKebeleMatches($productQuery, $kebele);
            });
        }

        if ($request->filled('manager_id')) {
            $query->where('manager_id', $request->integer('manager_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($logs);
    }

    private function ensureProductInUserScope(Product $product, $user): void
    {
        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'manager' && $this->kebeleMatches($product->kebele, $user->manager_kebele)) {
            return;
        }

        abort(404, 'Product not found');
    }

    private function whereKebeleMatches($query, ?string $kebele): void
    {
        $normalized = $this->normalizeKebele($kebele);
        if (!$normalized) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->whereRaw("TRIM(REPLACE(LOWER(kebele), ' kebele', '')) = ?", [$normalized]);
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
