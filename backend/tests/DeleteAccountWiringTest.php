<?php

$authController = file_get_contents(__DIR__ . '/../app/Http/Controllers/AuthController.php');
$routes = file_get_contents(__DIR__ . '/../routes/api.php');
$profile = file_get_contents(__DIR__ . '/../../frontend/src/pages/member/Profile.jsx');

$expectations = [
    [$authController, 'public function deleteAccount', 'AuthController should expose deleteAccount.'],
    [$authController, '$user->tokens()->delete();', 'Delete account should revoke tokens.'],
    [$authController, '$user->delete();', 'Delete account should delete the authenticated user.'],
    [$routes, "Route::delete('/account'", 'API should expose protected delete account route.'],
    [$profile, 'Delete account', 'Profile should show a delete account option.'],
    [$profile, "deleteConfirmation !== 'DELETE'", 'Profile should require DELETE confirmation.'],
    [$profile, "api.delete('/account')", 'Profile should call delete account endpoint.'],
    [$profile, "localStorage.removeItem('token')", 'Profile should clear token after deletion.'],
];

foreach ($expectations as [$contents, $needle, $message]) {
    if (!str_contains($contents, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Delete account wiring is present." . PHP_EOL;
