<?php

return [
    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'bot_username' => env('TELEGRAM_BOT_USERNAME'),
        'webhook_url' => env('TELEGRAM_WEBHOOK_URL'),
        'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
        'mini_app_url' => env('TELEGRAM_MINI_APP_URL'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'chapa' => [
        'secret_key' => env('CHAPA_SECRET_KEY'),
        'base_url' => env('CHAPA_BASE_URL', 'https://api.chapa.co/v1'),
        'callback_url' => env('CHAPA_CALLBACK_URL'),
        'return_url' => env('CHAPA_RETURN_URL'),
        'currency' => env('CHAPA_CURRENCY', 'ETB'),
    ],

    'resend' => [
        'api_key' => env('RESEND_API_KEY'),
        'from' => env('RESEND_FROM_EMAIL', 'Shemachoch <onboarding@resend.dev>'),
    ],
];
