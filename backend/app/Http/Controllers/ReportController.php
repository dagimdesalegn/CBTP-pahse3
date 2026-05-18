<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function inventoryReport(Request $request)
    {
        abort_unless($request->user()->hasAccess('reports'), 403);
        $this->authorize('viewAny', Product::class);

        $productsQuery = Product::with('supplier')->where('is_active', true);

        if ($request->filled('kebele')) {
            $this->whereKebeleMatches($productsQuery, $request->input('kebele'));
        }

        if ($request->filled('category')) {
            $productsQuery->where('category', $request->input('category'));
        }

        if ($request->filled('supplier_id')) {
            $productsQuery->where('supplier_id', $request->integer('supplier_id'));
        }

        $products = $productsQuery->get();

        $lowStockThreshold = 10;
        $lowStockProducts = $products->filter(fn($p) => $p->quantity > 0 && $p->quantity <= $lowStockThreshold);
        $outOfStockProducts = $products->filter(fn($p) => $p->quantity === 0);
        $stockStatus = $request->filled('stock_status') ? $request->input('stock_status') : null;

        if ($stockStatus === 'low') {
            $products = $lowStockProducts->values();
        } elseif ($stockStatus === 'out') {
            $products = $outOfStockProducts->values();
        } elseif ($stockStatus === 'in_stock') {
            $products = $products->filter(fn($p) => $p->quantity > 0)->values();
        }

        $lowStockProducts = $products->filter(fn($p) => $p->quantity > 0 && $p->quantity <= $lowStockThreshold)->values();
        $outOfStockProducts = $products->filter(fn($p) => $p->quantity === 0)->values();

        return response()->json([
            'total_products' => $products->count(),
            'total_stock_value' => $products->sum(fn($p) => $p->quantity * $p->price),
            'low_stock_count' => $lowStockProducts->count(),
            'out_of_stock_count' => $outOfStockProducts->count(),
            'kebele_summary' => $this->stockSummaryBy($products, fn ($product) => $product->kebele ?: 'Not assigned'),
            'category_summary' => $this->stockSummaryBy($products, fn ($product) => $product->category ?: 'Uncategorized'),
            'supplier_summary' => $this->stockSummaryBy($products, fn ($product) => $product->supplier?->company_name ?: 'No supplier'),
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

    private function stockSummaryBy($products, callable $keyResolver)
    {
        return $products
            ->groupBy($keyResolver)
            ->map(function ($items, $key) {
                return [
                    'key' => $key,
                    'label' => Str::headline((string) $key),
                    'product_count' => $items->count(),
                    'stock_units' => $items->sum('quantity'),
                    'stock_value' => $items->sum(fn ($product) => $product->quantity * $product->price),
                    'low_stock_count' => $items->filter(fn ($product) => $product->quantity > 0 && $product->quantity <= 10)->count(),
                    'out_of_stock_count' => $items->filter(fn ($product) => $product->quantity === 0)->count(),
                ];
            })
            ->values();
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

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
