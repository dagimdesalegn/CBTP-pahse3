<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('users') || $user->hasAccess('reports');
    }

    public function view(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('users') || $user->hasAccess('reports');
    }

    public function update(User $user): bool
    {
        return $user->role === 'manager' || $user->hasAccess('users');
    }
}
