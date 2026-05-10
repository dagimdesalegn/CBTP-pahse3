<?php

$fields = [
    'verification_region',
    'verification_city',
    'verification_woreda_subcity',
    'verification_kebele',
];

$controller = file_get_contents(__DIR__ . '/../app/Http/Controllers/UserController.php');
$model = file_get_contents(__DIR__ . '/../app/Models/User.php');
$migrations = implode("\n", array_map('file_get_contents', glob(__DIR__ . '/../database/migrations/*.php')));

foreach ($fields as $field) {
    if (!str_contains($controller, "'{$field}' => 'required|string|max:255'")) {
        fwrite(STDERR, "UserController should validate {$field} as required string." . PHP_EOL);
        exit(1);
    }

    if (!str_contains($controller, "'{$field}' => \$validated['{$field}']")) {
        fwrite(STDERR, "UserController should persist {$field} from validated data." . PHP_EOL);
        exit(1);
    }

    if (!str_contains($model, "'{$field}'")) {
        fwrite(STDERR, "User model should allow {$field} mass assignment." . PHP_EOL);
        exit(1);
    }

    if (!str_contains($migrations, "string('{$field}')")) {
        fwrite(STDERR, "Migrations should create {$field}." . PHP_EOL);
        exit(1);
    }
}

echo "Verification address fields are wired through backend persistence." . PHP_EOL;
