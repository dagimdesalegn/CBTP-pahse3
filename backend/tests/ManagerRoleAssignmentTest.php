<?php

$controller = file_get_contents(__DIR__ . '/../app/Http/Controllers/UserController.php');
$ui = file_get_contents(__DIR__ . '/../../frontend/src/pages/admin/UserManagement.jsx');

$expectations = [
    [$controller, "'role' => 'nullable|in:member,manager,admin'", 'UserController should validate role updates.'],
    [$controller, "if ((\$validated['role'] ?? \$user->role) !== 'manager')", 'UserController should clear manager_kebele when user is not manager.'],
    [$ui, 'const [selectedRole, setSelectedRole]', 'Admin UI should track selected role.'],
    [$ui, 'name="role"', 'Admin UI should render a role selector.'],
    [$ui, 'role: selectedRole', 'Admin UI should send selected role to backend.'],
    [$ui, "selectedRole === 'manager'", 'Admin UI should show Kebele assignment for selected manager role.'],
];

foreach ($expectations as [$contents, $needle, $message]) {
    if (!str_contains($contents, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Manager role assignment wiring is present." . PHP_EOL;
