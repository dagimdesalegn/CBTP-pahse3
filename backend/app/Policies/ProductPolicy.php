<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Product;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true; // Everyone can view products
    }

    public function create(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('products');
    }

    public function update(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('products');
    }

    public function delete(User $user): bool
    {
        return $user->hasAccess('products');
    }
}
