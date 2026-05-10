<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$suffix = uniqid('kebele_', true);
$createdUsers = collect();
$createdProducts = collect();
$createdOrders = collect();

$makeRequest = function (string $method, string $uri, array $payload, User $user) {
    Auth::setUser($user);
    $request = Request::create($uri, $method, $payload);
    $request->setUserResolver(fn () => $user);

    return $request;
};

try {
    $manager = User::create([
        'name' => 'Kebele Test Manager',
        'email' => "{$suffix}@manager.test",
        'password' => 'password',
        'kebele_id' => "{$suffix}-manager",
        'role' => 'manager',
        'is_verified' => true,
        'manager_kebele' => 'Bosa Addis Kebele',
    ]);
    $member = User::create([
        'name' => 'Kebele Test Member',
        'email' => "{$suffix}@member.test",
        'password' => 'password',
        'kebele_id' => "{$suffix}-member",
        'role' => 'member',
        'is_verified' => true,
        'verification_kebele' => 'Bosa Addis Kebele',
    ]);
    $createdUsers->push($manager, $member);

    $productController = app(ProductController::class);
    $createResponse = $productController->store($makeRequest('POST', '/api/products', [
        'name' => 'Live Kebele Scoped Product',
        'price' => 10,
        'quantity' => 10,
        'category' => 'test',
    ], $manager));
    $createdProduct = $createResponse->getData()->product;
    $createdProducts->push($createdProduct->id);

    if ($createdProduct->kebele !== 'Bosa Addis Kebele') {
        throw new RuntimeException('Manager-created product did not inherit manager_kebele.');
    }

    $otherProduct = Product::create([
        'name' => 'Live Other Kebele Product',
        'price' => 10,
        'quantity' => 10,
        'category' => 'test',
        'kebele' => 'Other Kebele',
        'is_active' => true,
    ]);
    $createdProducts->push($otherProduct->id);

    $listResponse = $productController->index($makeRequest('GET', '/api/products', [], $member));
    $listedKebeles = collect($listResponse->getData()->data)->pluck('kebele')->unique()->values()->all();
    if ($listedKebeles !== ['Bosa Addis Kebele']) {
        throw new RuntimeException('Member product list was not limited to their verification_kebele.');
    }

    $orderController = app(OrderController::class);
    $blockedOrderResponse = $orderController->store($makeRequest('POST', '/api/orders', [
        'items' => [
            ['product_id' => $otherProduct->id, 'quantity' => 1],
        ],
    ], $member));
    if ($blockedOrderResponse->getStatusCode() !== 403) {
        throw new RuntimeException('Cross-Kebele order was not rejected.');
    }

    $order = Order::create([
        'user_id' => $member->id,
        'status' => Order::STATUS_PENDING,
        'total_price' => 10,
    ]);
    $createdOrders->push($order->id);
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $createdProduct->id,
        'quantity' => 1,
        'unit_price' => 10,
    ]);

    $orderListResponse = $orderController->index($makeRequest('GET', '/api/orders', [], $manager));
    $managerOrderIds = collect($orderListResponse->getData()->data)->pluck('id');
    if (!$managerOrderIds->contains($order->id)) {
        throw new RuntimeException('Manager order list did not include same-Kebele order.');
    }

    echo "Live Kebele behavior verified." . PHP_EOL;
} finally {
    DB::transaction(function () use ($createdOrders, $createdProducts, $createdUsers) {
        OrderItem::whereIn('order_id', $createdOrders)->delete();
        Order::whereIn('id', $createdOrders)->delete();
        Product::whereIn('id', $createdProducts)->delete();
        User::whereIn('id', $createdUsers->pluck('id'))->delete();
    });
}
