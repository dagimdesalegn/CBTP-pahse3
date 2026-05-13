<?php

$authController = file_get_contents(__DIR__ . '/../app/Http/Controllers/AuthController.php');
$routes = file_get_contents(__DIR__ . '/../routes/api.php');
$services = file_get_contents(__DIR__ . '/../config/services.php');
$app = file_get_contents(__DIR__ . '/../../frontend/src/App.jsx');
$login = file_get_contents(__DIR__ . '/../../frontend/src/pages/auth/Login.jsx');
$forgot = file_exists(__DIR__ . '/../../frontend/src/pages/auth/ForgotPassword.jsx')
    ? file_get_contents(__DIR__ . '/../../frontend/src/pages/auth/ForgotPassword.jsx')
    : '';
$reset = file_exists(__DIR__ . '/../../frontend/src/pages/auth/ResetPassword.jsx')
    ? file_get_contents(__DIR__ . '/../../frontend/src/pages/auth/ResetPassword.jsx')
    : '';

$expectations = [
    [$services, "'resend' => [", 'Resend config should be defined.'],
    [$authController, 'public function forgotPassword', 'AuthController should expose forgotPassword.'],
    [$authController, 'public function resetPassword', 'AuthController should expose resetPassword.'],
    [$authController, "DB::table('password_reset_tokens')", 'AuthController should use password_reset_tokens table.'],
    [$authController, 'Http::withToken(config(\'services.resend.api_key\'))', 'AuthController should send reset email through Resend.'],
    [$authController, "Hash::make(\$validated['password'])", 'AuthController should hash the new password.'],
    [$routes, "Route::post('/password/forgot'", 'API should expose forgot-password route.'],
    [$routes, "Route::post('/password/reset'", 'API should expose reset-password route.'],
    [$app, 'ForgotPassword', 'Frontend should register ForgotPassword page.'],
    [$app, 'ResetPassword', 'Frontend should register ResetPassword page.'],
    [$login, 'forgot-password', 'Login should link to forgot password.'],
    [$forgot, "api.post('/password/forgot'", 'ForgotPassword page should call backend.'],
    [$reset, "api.post('/password/reset'", 'ResetPassword page should call backend.'],
];

foreach ($expectations as [$contents, $needle, $message]) {
    if (!str_contains($contents, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Forgot password wiring is present." . PHP_EOL;
