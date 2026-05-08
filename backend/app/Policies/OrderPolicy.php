<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->role !== 'member' || $user->id === $order->user_id;
    }
}
