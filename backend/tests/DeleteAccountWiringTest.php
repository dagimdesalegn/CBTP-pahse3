<?php

$authController = file_get_contents(__DIR__ . '/../app/Http/Controllers/AuthController.php');
$userModel = file_get_contents(__DIR__ . '/../app/Models/User.php');
$routes = file_get_contents(__DIR__ . '/../routes/api.php');
$profile = file_get_contents(__DIR__ . '/../../frontend/src/pages/member/Profile.jsx');

$expectations = [
    [$authController, 'public function deleteAccount', 'AuthController should expose deleteAccount.'],
    [$authController, '$user->tokens()->delete();', 'Delete account should revoke tokens.'],
    [$authController, 'deleted-', 'Delete account should anonymize unique personal identifiers before deletion.'],
    [$authController, "Storage::disk('public')->delete", 'Delete account should remove uploaded verification documents.'],
    [$authController, '$user->delete();', 'Delete account should delete the authenticated user.'],
    [$userModel, 'SoftDeletes;', 'User model should soft-delete accounts to preserve order/report history.'],
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
