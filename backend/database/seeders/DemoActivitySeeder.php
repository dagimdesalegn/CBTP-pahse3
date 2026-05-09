<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Message;
use App\Models\InventoryLog;
use App\Models\StoredReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoActivitySeeder extends Seeder
{
    public function run(): void
    {
        $members = User::where('role', 'member')->get();
        $products = Product::where('is_active', true)->get()->keyBy('name');

        if ($members->isEmpty() || $products->isEmpty()) {
            return;
        }

        Payment::query()->delete();
        OrderItem::query()->delete();
        Order::query()->delete();
        Notification::query()->delete();
        Message::query()->delete();
        StoredReport::query()->delete();
        InventoryLog::query()->delete();

        $orders = [
            ['member' => 'amanuel.member@example.com', 'status' => 'completed', 'days_ago' => 12, 'items' => [['White Teff - 5 kg', 1], ['Sunflower Cooking Oil - 1 L', 2], ['Berbere Spice - 250 g', 1]]],
            ['member' => 'amanuel.member@example.com', 'status' => 'ready', 'days_ago' => 2, 'items' => [['Red Lentils - 1 kg', 2], ['Ground Coffee - 250 g', 1], ['Dish Soap - 750 ml', 1]]],
            ['member' => 'mekdes.member@example.com', 'status' => 'approved', 'days_ago' => 1, 'items' => [['Long Grain Rice - 5 kg', 1], ['Refined Sugar - 1 kg', 3], ['Black Tea - 100 bags', 1]]],
            ['member' => 'mekdes.member@example.com', 'status' => 'completed', 'days_ago' => 18, 'items' => [['Wheat Flour - 5 kg', 2], ['Iodized Salt - 1 kg', 2], ['Bath Soap - 4 pack', 1]]],
            ['member' => 'dawit.member@example.com', 'status' => 'pending', 'days_ago' => 0, 'items' => [['Vegetable Cooking Oil - 3 L', 1], ['Shiro Powder - 1 kg', 2], ['Tomato Paste - 400 g', 3]]],
            ['member' => 'dawit.member@example.com', 'status' => 'completed', 'days_ago' => 25, 'items' => [['Brown Teff - 5 kg', 1], ['Pure Honey - 500 g', 1], ['Powdered Milk - 400 g', 1]]],
            ['member' => 'yonas.member@example.com', 'status' => 'cancelled', 'days_ago' => 5, 'items' => [['AA Batteries - 4 pack', 1], ['Ballpoint Pens - 12 pack', 2]]],
            ['member' => 'yonas.member@example.com', 'status' => 'ready', 'days_ago' => 3, 'items' => [['Chickpeas - 1 kg', 3], ['Laundry Detergent - 1 kg', 1], ['Toilet Paper - 10 rolls', 1]]],
            ['member' => 'sara.member@example.com', 'status' => 'pending', 'days_ago' => 1, 'items' => [['Green Lentils - 1 kg', 1], ['Macaroni Pasta - 500 g', 4]]],
            ['member' => 'hana.member@example.com', 'status' => 'pending', 'days_ago' => 4, 'items' => [['Exercise Books - 10 pack', 2], ['Ballpoint Pens - 12 pack', 1]]],
            ['member' => 'bethel.member@example.com', 'status' => 'completed', 'days_ago' => 8, 'items' => [['Ground Coffee - 250 g', 2], ['Pure Honey - 500 g', 1], ['UHT Milk - 1 L', 3]]],
            ['member' => 'bethel.member@example.com', 'status' => 'approved', 'days_ago' => 0, 'items' => [['Spaghetti - 500 g', 5], ['Tomato Paste - 400 g', 2], ['Dish Soap - 750 ml', 1]]],
            ['member' => 'noah.member@example.com', 'status' => 'ready', 'days_ago' => 6, 'items' => [['Brown Sugar - 1 kg', 2], ['Black Tea - 100 bags', 1], ['Bath Soap - 4 pack', 1]]],
            ['member' => 'liya.member@example.com', 'status' => 'pending', 'days_ago' => 2, 'items' => [['Powdered Milk - 400 g', 1], ['Red Lentils - 1 kg', 1]]],
        ];

        $createdOrders = collect();

        foreach ($orders as $entry) {
            $member = $members->firstWhere('email', $entry['member']);
            if (!$member) {
                continue;
            }

            $total = collect($entry['items'])->sum(function ($item) use ($products) {
                $product = $products->get($item[0]);
                return $product ? ((float) $product->price * $item[1]) : 0;
            });

            $order = Order::create([
                'user_id' => $member->id,
                'status' => $entry['status'],
                'fulfillment_type' => $entry['status'] === 'ready' ? 'pickup' : (rand(0, 1) ? 'pickup' : 'delivery'),
                'delivery_address' => rand(0, 1) ? 'Bosa Addis Kebele, near community office' : null,
                'total_price' => $total,
                'notes' => $entry['status'] === 'cancelled' ? 'Demo cancellation due to stock issue.' : null,
                'created_at' => now()->subDays($entry['days_ago'])->subHours(rand(1, 8)),
                'updated_at' => now()->subDays(max(0, $entry['days_ago'] - 1)),
            ]);

            foreach ($entry['items'] as [$productName, $quantity]) {
                $product = $products->get($productName);
                if (!$product) {
                    continue;
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                ]);
            }

            $createdOrders->push($order);

            if (in_array($entry['status'], ['completed', 'ready'], true)) {
                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $member->id,
                    'tx_ref' => 'demo-' . $order->id . '-' . $member->id,
                    'amount' => $order->total_price,
                    'currency' => 'ETB',
                    'status' => $entry['status'] === 'completed' ? 'success' : 'initialized',
                    'checkout_url' => $entry['status'] === 'ready' ? 'https://checkout.chapa.co/demo/shemachoch-' . $order->id : null,
                    'meta' => ['seeded' => true],
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ]);
            }
        }

        $manager = User::where('role', 'manager')->first();
        if ($manager) {
            foreach ([
                ['White Teff - 5 kg', 40, 'Monthly supplier restock'],
                ['Bleach - 1 L', -12, 'Low stock shelf transfer'],
                ['Ballpoint Pens - 12 pack', 35, 'School season delivery'],
                ['Vegetable Cooking Oil - 3 L', 25, 'Warehouse replenishment'],
                ['AA Batteries - 4 pack', -8, 'Stock count correction'],
            ] as [$productName, $change, $reason]) {
                $product = $products->get($productName);
                if ($product) {
                    InventoryLog::create([
                        'product_id' => $product->id,
                        'change_amount' => $change,
                        'reason' => $reason,
                        'manager_id' => $manager->id,
                        'created_at' => now()->subDays(rand(1, 9)),
                    ]);
                }
            }
        }

        foreach ($members as $member) {
            Notification::create([
                'user_id' => $member->id,
                'title' => 'New Shemachoch catalog is available',
                'message' => 'Browse updated grains, household supplies, beverages, and stationery in the member marketplace.',
                'is_read' => $member->is_verified,
                'created_at' => now()->subDays(2),
            ]);

            Notification::create([
                'user_id' => $member->id,
                'title' => $member->is_verified ? 'Account verified' : 'Verification pending',
                'message' => $member->is_verified
                    ? 'Your account can place pickup orders from available stock.'
                    : 'Your verification request is waiting for admin review.',
                'is_read' => false,
                'created_at' => now()->subHours(rand(2, 12)),
            ]);
        }

        $admin = User::where('email', 'admin@gmail.com')->first();
        $support = User::where('email', 'support.admin@example.com')->first() ?: $admin;
        $amanuel = User::where('email', 'amanuel.member@example.com')->first();
        $mekdes = User::where('email', 'mekdes.member@example.com')->first();

        foreach ([
            [$amanuel, $support, 'Pickup time question', 'Can I collect my ready order tomorrow morning?'],
            [$support, $amanuel, 'Re: Pickup time question', 'Yes, your order will be available after 9:00 AM. Bring your order number.'],
            [$mekdes, $admin, 'Wallet top-up request', 'Please confirm my latest cooperative wallet deposit.'],
            [$admin, $mekdes, 'Wallet top-up request', 'Your account has been reviewed. The balance is now visible in your profile.'],
        ] as [$sender, $recipient, $subject, $content]) {
            if ($sender && $recipient) {
                Message::create([
                    'sender_id' => $sender->id,
                    'recipient_id' => $recipient->id,
                    'subject' => $subject,
                    'content' => $content,
                    'is_read' => $recipient->role !== 'member',
                    'read_at' => $recipient->role !== 'member' ? now()->subHours(4) : null,
                    'created_at' => now()->subHours(rand(2, 36)),
                    'updated_at' => now()->subHours(rand(1, 12)),
                ]);
            }
        }

        if ($admin) {
            $productsReport = Product::where('is_active', true)->get();
            $completedOrders = $createdOrders->where('status', 'completed');

            StoredReport::create([
                'type' => 'inventory',
                'generated_by' => $admin->id,
                'data' => [
                    'total_products' => $productsReport->count(),
                    'total_stock_value' => $productsReport->sum(fn ($product) => $product->quantity * $product->price),
                    'low_stock_count' => $productsReport->filter(fn ($product) => $product->quantity > 0 && $product->quantity <= 10)->count(),
                    'out_of_stock_count' => $productsReport->filter(fn ($product) => $product->quantity === 0)->count(),
                ],
                'summary' => [
                    'products' => $productsReport->count(),
                    'stock_value' => round($productsReport->sum(fn ($product) => $product->quantity * $product->price), 2),
                ],
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ]);

            StoredReport::create([
                'type' => 'orders',
                'generated_by' => $admin->id,
                'date_from' => now()->subDays(30)->toDateString(),
                'date_to' => now()->toDateString(),
                'data' => [
                    'total_orders' => $createdOrders->count(),
                    'total_revenue' => $completedOrders->sum('total_price'),
                    'avg_order_value' => $createdOrders->count() ? $createdOrders->sum('total_price') / $createdOrders->count() : 0,
                    'status_breakdown' => $createdOrders->groupBy('status')->map->count(),
                ],
                'summary' => [
                    'orders' => $createdOrders->count(),
                    'revenue' => round($completedOrders->sum('total_price'), 2),
                ],
                'created_at' => now()->subHours(8),
                'updated_at' => now()->subHours(8),
            ]);
        }
    }
}
