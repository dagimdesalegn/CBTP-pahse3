<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Notification;

class NotificationPolicy
{
    public function broadcast(User $user): bool
    {
        return $user->role === 'admin';
    }
}
