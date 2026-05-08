<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Policies\ProductPolicy;
use App\Policies\OrderPolicy;
use App\Policies\UserPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\InventoryLogPolicy;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Notification;
use App\Models\InventoryLog;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        User::class => UserPolicy::class,
        Notification::class => NotificationPolicy::class,
        InventoryLog::class => InventoryLogPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }

    public function register(): void
    {
    }
}
