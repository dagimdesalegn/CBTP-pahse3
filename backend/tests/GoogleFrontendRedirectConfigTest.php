<?php

$appConfig = file_get_contents(__DIR__ . '/../config/app.php');
$authController = file_get_contents(__DIR__ . '/../app/Http/Controllers/AuthController.php');

if (!str_contains($appConfig, "'frontend_url' => env('FRONTEND_URL'")) {
    fwrite(STDERR, 'App config should expose FRONTEND_URL through cached config.' . PHP_EOL);
    exit(1);
}

if (str_contains($authController, "env('FRONTEND_URL'")) {
    fwrite(STDERR, 'AuthController should not read FRONTEND_URL with env() at runtime.' . PHP_EOL);
    exit(1);
}

if (!str_contains($authController, "config('app.app.frontend_url'")) {
    fwrite(STDERR, 'Google callback should read frontend URL from cached config.' . PHP_EOL);
    exit(1);
}

echo "Google callback frontend redirect uses cached config." . PHP_EOL;
