<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function update(Request $request, $productId)
    {
        $this->authorize('update', Product::class);

        $validated = $request->validate([
            'quantity' => 'required|integer',
            'reason' => 'required|string',
        ]);

        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $changeAmount = $validated['quantity'] - $product->quantity;

        $product->update(['quantity' => $validated['quantity']]);

        InventoryLog::create([
            'product_id' => $productId,
            'change_amount' => $changeAmount,
            'reason' => $validated['reason'],
            'manager_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Inventory updated successfully',
            'product' => $product,
        ]);
    }

    public function logs(Request $request)
    {
        $this->authorize('viewAny', InventoryLog::class);

        $query = InventoryLog::with('product', 'manager');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
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
}
