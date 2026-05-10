<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TelegramController extends Controller
{
    public function webhook(Request $request)
    {
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
