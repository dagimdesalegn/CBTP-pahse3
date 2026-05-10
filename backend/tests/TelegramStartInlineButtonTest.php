<?php

$controller = file_get_contents(__DIR__ . '/../app/Http/Controllers/TelegramController.php');

$expectations = [
    'reply_markup' => 'Telegram /start response should include inline keyboard markup.',
    'inline_keyboard' => 'Telegram /start response should define inline keyboard buttons.',
    'web_app' => 'Telegram /start button should open the Mini App as a Web App.',
    'config(\'services.telegram.mini_app_url\')' => 'Telegram /start button should use the configured Mini App URL.',
];

foreach ($expectations as $needle => $message) {
    if (!str_contains($controller, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Telegram /start inline button structure is present." . PHP_EOL;
