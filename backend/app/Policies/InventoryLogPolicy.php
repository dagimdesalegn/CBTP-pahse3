<?php

namespace App\Policies;

use App\Models\User;
use App\Models\InventoryLog;

class InventoryLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('inventory');
    }

    public function view(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('inventory');
    }
}
