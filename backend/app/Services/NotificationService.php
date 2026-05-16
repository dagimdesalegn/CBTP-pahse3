<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public static function notifyUser(User $user, string $title, string $message): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
        ]);

        self::sendTelegramNotification($user, $title, $message);

        return $notification;
    }

    public static function sendTelegramNotification(User $user, string $title, string $message): void
    {
        $botToken = config('services.telegram.bot_token');

        if (!$botToken || !$user->telegram_id) {
            return;
        }

        $payload = [
            'chat_id' => $user->telegram_id,
            'text' => trim($title . "\n\n" . $message),
        ];

        if (config('services.telegram.mini_app_url')) {
            $payload['reply_markup'] = [
                'inline_keyboard' => [
                    [
                        [
                            'text' => 'Open Shemachoch',
                            'web_app' => [
                                'url' => config('services.telegram.mini_app_url'),
                            ],
                        ],
                    ],
                ],
            ];
        }

        try {
            $response = Http::timeout(8)->post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);

            if ($response->failed()) {
                Log::warning('Telegram notification rejected', [
                    'user_id' => $user->id,
                    'chat_id' => $user->telegram_id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Telegram notification failed', [
                'user_id' => $user->id,
                'chat_id' => $user->telegram_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notify all managers/admins when a new order is placed
     */
    public static function notifyNewOrder($order)
    {
        $managers = User::whereIn('role', ['manager', 'admin'])->get();

        foreach ($managers as $manager) {
            self::notifyUser($manager, '📋 New Order Placed', "Member {$order->user->name} placed a new order #{$order->id}");
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
            self::notifyUser($admin, '👤 New User Registration', $message);
        }
    }

    /**
     * Notify member when their registration is approved
     */
    public static function notifyRegistrationApproved($user)
    {
        self::notifyUser($user, '✅ Registration Approved', 'Your account has been verified! You can now start shopping.');
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

        self::notifyUser($order->user, '📦 Order Status Update', $message);
    }
}
