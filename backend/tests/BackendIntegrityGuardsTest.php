<?php

$files = [
    'wallet' => file_get_contents(__DIR__ . '/../app/Http/Controllers/WalletController.php'),
    'order' => file_get_contents(__DIR__ . '/../app/Http/Controllers/OrderController.php'),
    'payment' => file_get_contents(__DIR__ . '/../app/Http/Controllers/PaymentController.php'),
    'inventory' => file_get_contents(__DIR__ . '/../app/Http/Controllers/InventoryController.php'),
    'routes' => file_get_contents(__DIR__ . '/../routes/api.php'),
    'report' => file_get_contents(__DIR__ . '/../app/Http/Controllers/ReportController.php'),
    'productController' => file_get_contents(__DIR__ . '/../app/Http/Controllers/ProductController.php'),
    'inventoryLog' => file_get_contents(__DIR__ . '/../app/Models/InventoryLog.php'),
    'inventoryLogPolicy' => file_get_contents(__DIR__ . '/../app/Policies/InventoryLogPolicy.php'),
    'telegram' => file_get_contents(__DIR__ . '/../app/Http/Controllers/TelegramController.php'),
    'product' => file_get_contents(__DIR__ . '/../app/Http/Controllers/ProductController.php'),
    'user' => file_get_contents(__DIR__ . '/../app/Http/Controllers/UserController.php'),
    'services' => file_get_contents(__DIR__ . '/../config/services.php'),
];

$expectations = [
    [$files['wallet'], "where('status', 'success')", 'Wallet payment must check for successful existing payment.'],
    [$files['wallet'], "abort(409, 'Order is already paid')", 'Wallet payment must reject already paid orders.'],
    [$files['wallet'], "role === 'manager'", 'Managers should be allowed to adjust member wallets.'],
    [$files['wallet'], 'ensureManagerCanAdjustWallet', 'Manager wallet adjustments must be scoped to assigned members.'],
    [$files['wallet'], 'normalizeKebele', 'Manager wallet scope must normalize Kebele names.'],
    [$files['routes'], "Route::middleware('role:manager,admin')->group(function ()", 'Manager/admin route group should exist for scoped user and wallet actions.'],
    [$files['routes'], "Route::post('/wallet/adjust'", 'Wallet adjustment route should be available outside admin-only routes.'],
    [$files['report'], 'kebele_summary', 'Inventory report should return Kebele stock summaries.'],
    [$files['report'], 'category_summary', 'Inventory report should return category summaries.'],
    [$files['report'], 'supplier_summary', 'Inventory report should return supplier summaries.'],
    [$files['report'], "filled('kebele')", 'Inventory report should support Kebele filtering.'],
    [$files['report'], "filled('supplier_id')", 'Inventory report should support supplier filtering.'],
    [$files['report'], "filled('stock_status')", 'Inventory report should support stock status filtering.'],
    [$files['inventory'], "filled('kebele')", 'Inventory logs should support Kebele filtering.'],
    [$files['inventory'], "filled('manager_id')", 'Inventory logs should support actor filtering.'],
    [$files['inventory'], "'quantity' => 'required|integer|min:0'", 'Manual inventory updates must reject negative stock.'],
    [$files['inventoryLog'], 'previous_quantity', 'Inventory logs should track previous quantity.'],
    [$files['inventoryLog'], 'new_quantity', 'Inventory logs should track new quantity.'],
    [$files['inventoryLogPolicy'], "hasAccess('reports')", 'Report admins should be allowed to view inventory movement history.'],
    [$files['productController'], 'InventoryLog::create', 'Product quantity edits should write inventory logs.'],
    [$files['productController'], 'lockForUpdate()', 'Product quantity edits should lock rows before logging stock changes.'],
    [$files['order'], 'InventoryLog::create', 'Order stock changes should write inventory logs.'],
    [$files['order'], 'restoreCancelledOrderStock($lockedOrder, $request->user())', 'Cancellation restore logs should be attributed to the status updater.'],
    [$files['order'], 'DB::transaction(function ()', 'Order creation/status updates must use transactions.'],
    [$files['order'], 'lockForUpdate()', 'Order stock operations must use row locks.'],
    [$files['order'], 'restoreCancelledOrderStock', 'Cancelling an order must restore reserved stock.'],
    [$files['payment'], 'ensureOrderPaymentVisibleToUser', 'Payments must enforce owner/kebele visibility.'],
    [$files['payment'], 'return response()->json([\'message\' => \'Payment verified\'])', 'Public payment callback should not return payment details.'],
    [$files['inventory'], 'ensureProductInUserScope', 'Inventory updates/logs must enforce product scope.'],
    [$files['telegram'], 'telegram.webhook_secret', 'Telegram webhook must validate a configured shared secret.'],
    [$files['product'], "'discount_price' => 'nullable|numeric|min:0|lt:price'", 'Product update must keep discount below price.'],
    [$files['user'], 'Storage::disk(\'public\')->delete', 'Verification resubmission must remove old PII files.'],
    [$files['services'], "'webhook_secret'", 'Telegram webhook secret must be configurable.'],
];

foreach ($expectations as [$contents, $needle, $message]) {
    if (!str_contains($contents, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Backend integrity guards are present." . PHP_EOL;
