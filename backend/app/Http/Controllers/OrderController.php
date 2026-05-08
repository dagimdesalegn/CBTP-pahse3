<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Notification;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Order::query();

        // Members can only see their own orders
        if ($user->role === 'member') {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id') && ($user->role === 'manager' || $user->role === 'admin')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->with('user', 'orderItems.product')->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('user', 'orderItems.product')->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Members can only see their own orders
        if (auth()->user()->role === 'member' && $order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // Only verified members can place orders
        if ($user->role === 'member' && !$user->is_verified) {
            return response()->json([
                'error' => 'Your account must be verified before placing orders',
            ], 403);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $totalPrice = 0;
        $items = [];

        // Check stock and calculate total
        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);

            if (!$product || !$product->is_active) {
                return response()->json([
                    'error' => 'Product not found or is inactive',
                ], 404);
            }

            if ($product->quantity < $item['quantity']) {
                return response()->json([
                    'error' => 'Insufficient stock for product: ' . $product->name,
                ], 400);
            }

            $itemTotal = $product->price * $item['quantity'];
            $totalPrice += $itemTotal;

            $items[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
            ];
        }

        $order = Order::create([
            'user_id' => $user->id,
            'status' => Order::STATUS_PENDING,
            'total_price' => $totalPrice,
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($items as $item) {
            OrderItem::create(array_merge(['order_id' => $order->id], $item));

            // Deduct stock
            $product = Product::find($item['product_id']);
            $product->decrement('quantity', $item['quantity']);
        }

        // Send notification
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Order Placed',
            'message' => 'Your order #' . $order->id . ' has been placed successfully',
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('orderItems.product'),
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', Order::$statuses),
        ]);

        $order = Order::find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

        // Send notification to member
        $statusMessage = [
            Order::STATUS_APPROVED => 'Your order has been approved',
            Order::STATUS_READY => 'Your order is ready for pickup',
            Order::STATUS_COMPLETED => 'Your order has been completed',
            Order::STATUS_CANCELLED => 'Your order has been cancelled',
        ];

        if (isset($statusMessage[$validated['status']])) {
            Notification::create([
                'user_id' => $order->user_id,
                'title' => 'Order Status Updated',
                'message' => $statusMessage[$validated['status']],
            ]);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }
}
