<?php

$fields = [
    'manager_kebele',
    'kebele',
    'Bosa Addis Kebele',
    'verification_kebele',
];

$files = [
    'product_controller' => file_get_contents(__DIR__ . '/../app/Http/Controllers/ProductController.php'),
    'order_controller' => file_get_contents(__DIR__ . '/../app/Http/Controllers/OrderController.php'),
    'user_model' => file_get_contents(__DIR__ . '/../app/Models/User.php'),
    'product_model' => file_get_contents(__DIR__ . '/../app/Models/Product.php'),
    'migrations' => implode("\n", array_map('file_get_contents', glob(__DIR__ . '/../database/migrations/*.php'))),
];

foreach ($fields as $field) {
    $found = array_filter($files, fn ($contents) => str_contains($contents, $field));
    if (!$found) {
        fwrite(STDERR, "Expected Kebele scoped products wiring to include {$field}." . PHP_EOL);
        exit(1);
    }
}

$requiredSnippets = [
    'ProductController should assign manager-created products to manager_kebele' => "'kebele' => \$this->productKebeleForCreate(\$request)",
    'ProductController should enforce scoped product access' => 'ensureProductInUserScope',
    'ProductController should return newest products first' => "orderByDesc('created_at')",
    'OrderController should reject cross-Kebele order items' => 'Product is not available in your Kebele',
    'OrderController should scope manager order queries' => 'whereHas(\'orderItems.product\'',
];

$combined = implode("\n", $files);
foreach ($requiredSnippets as $message => $snippet) {
    if (!str_contains($combined, $snippet)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Kebele scoped product and order wiring is present." . PHP_EOL;
