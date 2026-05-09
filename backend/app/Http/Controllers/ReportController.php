<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function inventoryReport(Request $request)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);
        $this->authorize('viewAny', Product::class);

        $products = Product::where('is_active', true)->get();

        $lowStockThreshold = 10;
        $lowStockProducts = $products->filter(fn($p) => $p->quantity > 0 && $p->quantity <= $lowStockThreshold);
        $outOfStockProducts = $products->filter(fn($p) => $p->quantity === 0);

        return response()->json([
            'total_products' => $products->count(),
            'total_stock_value' => $products->sum(fn($p) => $p->quantity * $p->price),
            'low_stock_count' => $lowStockProducts->count(),
            'out_of_stock_count' => $outOfStockProducts->count(),
            'products' => $products,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
        ]);
    }

    public function ordersReport(Request $request)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);
        $this->authorize('viewAny', Order::class);

        $query = Order::with('user', 'orderItems.product');

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->get();

        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total_price');
        $statusBreakdown = $orders->groupBy('status')->map->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'avg_order_value' => $avgOrderValue,
            'status_breakdown' => $statusBreakdown,
            'orders' => $orders,
        ]);
    }

    public function membersReport(Request $request)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);
        $this->authorize('viewAny', User::class);

        $members = User::where('role', 'member')->withCount('orders')->get();

        $totalMembers = $members->count();
        $verifiedMembers = $members->filter(fn($m) => $m->is_verified)->count();
        $unverifiedMembers = $totalMembers - $verifiedMembers;

        $memberActivity = $members->map(function ($member) {
            $totalOrdersValue = $member->orders()->sum('total_price');
            return [
                'id' => $member->id,
                'name' => $member->name,
                'phone' => $member->phone,
                'orders_count' => $member->orders_count,
                'total_orders_value' => $totalOrdersValue,
                'is_verified' => $member->is_verified,
            ];
        })->sortByDesc('orders_count')->values();

        return response()->json([
            'total_members' => $totalMembers,
            'verified_members' => $verifiedMembers,
            'unverified_members' => $unverifiedMembers,
            'member_activity' => $memberActivity,
        ]);
    }
}
