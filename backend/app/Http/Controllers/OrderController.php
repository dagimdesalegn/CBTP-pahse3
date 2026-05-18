<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

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
                $this->whereProductKebeleMatches($productQuery, $user->manager_kebele);
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

        $requestedItems = collect($validated['items'])
            ->groupBy('product_id')
            ->map(fn ($items, $productId) => [
                'product_id' => (int) $productId,
                'quantity' => (int) $items->sum('quantity'),
            ])
            ->values();

        $order = DB::transaction(function () use ($validated, $requestedItems, $user) {
            $totalPrice = 0;
            $items = [];

            foreach ($requestedItems as $item) {
                $product = Product::whereKey($item['product_id'])->lockForUpdate()->first();

                if (!$product || !$product->is_active) {
                    abort(404, 'Product not found or is inactive');
                }

                if ($user->role === 'member' && !$this->kebeleMatches($product->kebele, $user->verification_kebele)) {
                    abort(403, 'Product is not available in your Kebele: ' . $product->name);
                }

                if ($product->quantity < $item['quantity']) {
                    abort(400, 'Insufficient stock for product: ' . $product->name);
                }

                $unitPrice = (float) $product->effective_price;
                $totalPrice += $unitPrice * $item['quantity'];

                $items[] = [
                    'product' => $product,
                    'product_id' => $product->id,
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
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                $previousQuantity = $item['product']->quantity;
                $item['product']->decrement('quantity', $item['quantity']);
                $item['product']->refresh();
                InventoryLog::create([
                    'product_id' => $item['product_id'],
                    'change_amount' => -$item['quantity'],
                    'previous_quantity' => $previousQuantity,
                    'new_quantity' => (int) $item['product']->quantity,
                    'reason' => "Order #{$order->id} placed",
                    'type' => 'order_sale',
                    'manager_id' => $user->id,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                ]);
            }

            return $order;
        });

        // Send notification
       // Notify member
       NotificationService::notifyNewOrder($order);
       
       // Also notify member their order was placed
       NotificationService::notifyUser(
           $user,
           '✅ Order Placed',
           'Your order #' . $order->id . ' has been placed successfully'
       );

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

        $order = Order::with('orderItems.product')->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }
        if ($request->user()->role === 'manager' && !$this->orderIsInManagerScope($order, $request->user())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $oldStatus = DB::transaction(function () use ($order, $validated, $request) {
            $lockedOrder = Order::with('orderItems.product')
                ->lockForUpdate()
                ->findOrFail($order->id);
            $oldStatus = $lockedOrder->status;

            if ($oldStatus === Order::STATUS_CANCELLED && $validated['status'] !== Order::STATUS_CANCELLED) {
                abort(409, 'Cancelled orders cannot be reopened');
            }

            if ($oldStatus !== Order::STATUS_CANCELLED && $validated['status'] === Order::STATUS_CANCELLED) {
                $this->restoreCancelledOrderStock($lockedOrder, $request->user());
            }

            $lockedOrder->update(['status' => $validated['status']]);
            $order->setRawAttributes($lockedOrder->fresh()->getAttributes(), true);

            return $oldStatus;
        });

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
                $this->whereProductKebeleMatches($query, $manager->manager_kebele);
            })
            ->exists();
    }

    private function restoreCancelledOrderStock(Order $order, $actor): void
    {
        foreach ($order->orderItems as $item) {
            $product = Product::whereKey($item->product_id)
                ->lockForUpdate()
                ->firstOrFail();
            $previousQuantity = $product->quantity;
            $product->increment('quantity', $item->quantity);
            $product->refresh();

            InventoryLog::create([
                'product_id' => $item->product_id,
                'change_amount' => $item->quantity,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => (int) $product->quantity,
                'reason' => "Order #{$order->id} cancelled",
                'type' => 'order_cancel_restore',
                'manager_id' => $actor->id,
                'reference_type' => Order::class,
                'reference_id' => $order->id,
            ]);
        }
    }

    private function whereProductKebeleMatches($query, ?string $kebele): void
    {
        $normalized = $this->normalizeKebele($kebele);
        if (!$normalized) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->whereRaw("TRIM(REPLACE(LOWER(kebele), ' kebele', '')) = ?", [$normalized]);
    }

    private function kebeleMatches(?string $productKebele, ?string $userKebele): bool
    {
        return $this->normalizeKebele($productKebele) === $this->normalizeKebele($userKebele);
    }

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
