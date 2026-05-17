<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;

class TelegramController extends Controller
{
    public function webhook(Request $request)
    {
        $webhookSecret = config('services.telegram.webhook_secret');
        if ($webhookSecret && !hash_equals($webhookSecret, (string) $request->header('X-Telegram-Bot-Api-Secret-Token'))) {
            return response()->json(['error' => 'Invalid Telegram webhook secret'], 403);
        }

        $update = $request->all();

        if (isset($update['message'])) {
            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $text = $message['text'] ?? '';

            // Handle Telegram bot commands
            if ($text === '/start') {
                $this->sendTelegramMessage(
                    $chatId,
                    'Welcome to Shemachoch! Please use the web app to continue.',
                    [
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
                    ]
                );
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function linkAccount(Request $request)
    {
        $validated = $request->validate([
            'telegram_id' => 'required|string',
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $validated['phone'])->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user->update(['telegram_id' => $validated['telegram_id']]);

        $token = $user->createToken('telegram-token')->plainTextToken;

        return response()->json([
            'message' => 'Account linked successfully',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function linkCurrentUser(Request $request)
    {
        $validated = $request->validate([
            'init_data' => 'required|string',
        ]);

        $telegramUser = $this->validatedTelegramUser($validated['init_data']);

        if (!$telegramUser || empty($telegramUser['id'])) {
            return response()->json(['error' => 'Invalid Telegram session'], 422);
        }

        $user = $request->user();
        $user->update(['telegram_id' => (string) $telegramUser['id']]);

        return response()->json([
            'message' => 'Telegram account linked',
            'user' => $user->fresh(),
        ]);
    }

    private function validatedTelegramUser(string $initData): ?array
    {
        $botToken = config('services.telegram.bot_token');

        if (!$botToken) {
            return null;
        }

        parse_str($initData, $data);
        $receivedHash = Arr::pull($data, 'hash');

        if (!$receivedHash) {
            return null;
        }

        ksort($data);
        $dataCheckString = collect($data)
            ->map(fn ($value, $key) => $key . '=' . $value)
            ->implode("\n");

        $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);
        $calculatedHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        if (!hash_equals($calculatedHash, $receivedHash)) {
            return null;
        }

        if (!empty($data['auth_date']) && (time() - (int) $data['auth_date']) > 604800) {
            return null;
        }

        $telegramUser = json_decode($data['user'] ?? '', true);

        return is_array($telegramUser) ? $telegramUser : null;
    }

    protected function sendTelegramMessage($chatId, $message, ?array $replyMarkup = null)
    {
        $botToken = config('services.telegram.bot_token');

        $payload = [
            'chat_id' => $chatId,
            'text' => $message,
        ];

        if ($replyMarkup) {
            $payload['reply_markup'] = $replyMarkup;
        }

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);
    }
}
