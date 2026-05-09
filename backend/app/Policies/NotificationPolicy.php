<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Notification;

class NotificationPolicy
{
    public function view(User $user): bool
    {
        return true; // Everyone can view their notifications
    }

    public function broadcast(User $user): bool
    {
        return $user->hasAccess('messages');
    }
}
