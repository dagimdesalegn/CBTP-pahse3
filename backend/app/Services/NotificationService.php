<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Notify all managers/admins when a new order is placed
     */
    public static function notifyNewOrder($order)
    {
        $managers = User::whereIn('role', ['manager', 'admin'])->get();

        foreach ($managers as $manager) {
            Notification::create([
                'user_id' => $manager->id,
                'title' => '📋 New Order Placed',
                'message' => "Member {$order->user->name} placed a new order #{$order->id}",
            ]);
        }
    }

    /**
     * Notify admin when a new user registers
     */
    public static function notifyNewUserRegistration($user)
    {
        $admins = User::where('role', 'admin')->get();

        $message = "New member registration: {$user->name} ({$user->email})";

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => '👤 New User Registration',
                'message' => $message,
            ]);
        }
    }

    /**
     * Notify member when their registration is approved
     */
    public static function notifyRegistrationApproved($user)
    {
        Notification::create([
            'user_id' => $user->id,
            'title' => '✅ Registration Approved',
            'message' => 'Your account has been verified! You can now start shopping.',
        ]);
    }

    /**
     * Notify member when their order status is updated
     */
    public static function notifyOrderStatusUpdate($order, $oldStatus, $newStatus)
    {
        $statusMessages = [
            'pending' => '📋 Your order has been received',
            'approved' => '✅ Your order has been approved',
            'ready' => '📦 Your order is ready for pickup',
            'completed' => '✓ Your order has been completed',
            'cancelled' => '❌ Your order has been cancelled',
        ];

        $message = $statusMessages[$newStatus] ?? "Your order status has been updated to {$newStatus}";

        Notification::create([
            'user_id' => $order->user_id,
            'title' => '📦 Order Status Update',
            'message' => $message,
        ]);
    }
}
