<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::query();

        // Members can only see their own orders
        if ($user->role === 'member') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            $query->whereHas('orderItems.product', function ($productQuery) use ($user) {
                $productQuery->where('kebele', $user->manager_kebele ?: '__missing_manager_kebele__');
            });
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

        $orders = $query->with('user', 'orderItems.product', 'payment')->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::with('user', 'orderItems.product', 'payment')->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $user = $request->user();
        // Members can only see their own orders
        if ($user->role === 'member' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->role === 'manager' && !$this->orderIsInManagerScope($order, $user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $user = $request->user();

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
            'fulfillment_type' => 'nullable|in:pickup,delivery',
            'delivery_address' => 'required_if:fulfillment_type,delivery|nullable|string|max:255',
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

            if ($user->role === 'member' && $product->kebele !== $user->verification_kebele) {
                return response()->json([
                    'error' => 'Product is not available in your Kebele: ' . $product->name,
                ], 403);
            }

            if ($product->quantity < $item['quantity']) {
                return response()->json([
                    'error' => 'Insufficient stock for product: ' . $product->name,
                ], 400);
            }

            $unitPrice = $product->effective_price;
            $itemTotal = $unitPrice * $item['quantity'];
            $totalPrice += $itemTotal;

            $items[] = [
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
            ];
        }

        $order = Order::create([
            'user_id' => $user->id,
            'status' => Order::STATUS_PENDING,
            'fulfillment_type' => $validated['fulfillment_type'] ?? 'pickup',
            'delivery_address' => $validated['delivery_address'] ?? null,
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
       // Notify member
       NotificationService::notifyNewOrder($order);
       
       // Also notify member their order was placed
       Notification::create([
           'user_id' => $user->id,
           'title' => '✅ Order Placed',
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
        if ($request->user()->role === 'manager' && !$this->orderIsInManagerScope($order, $request->user())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);

           // Notify member of status update
           NotificationService::notifyOrderStatusUpdate($order, $oldStatus, $validated['status']);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order,
        ]);
    }

    private function orderIsInManagerScope(Order $order, $manager): bool
    {
        if (!$manager->manager_kebele) {
            return false;
        }

        return $order->orderItems()
            ->whereHas('product', function ($query) use ($manager) {
                $query->where('kebele', $manager->manager_kebele);
            })
            ->exists();
    }
}
