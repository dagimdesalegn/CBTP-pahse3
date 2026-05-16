<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\StoredReportController;
use App\Http\Controllers\WalletController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

// Telegram webhook
Route::post('/telegram/webhook', [TelegramController::class, 'webhook']);

// Payment callback (Chapa)
Route::post('/payments/callback', [PaymentController::class, 'callback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);

    // Products - All users can view
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Products - Manager/Admin only
    Route::middleware('role:manager,admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);
    });

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::get('/payments/order/{orderId}', [PaymentController::class, 'orderPayment']);
    Route::get('/payments/verify/{txRef}', [PaymentController::class, 'verify']);
    Route::get('/orders/{id}/payment', [PaymentController::class, 'orderPayment']);
    Route::get('/wallet', [WalletController::class, 'show']);
    Route::post('/wallet/pay-order', [WalletController::class, 'payOrder']);

    // Internal messages
    Route::get('/message-recipients', [MessageController::class, 'recipients']);
    Route::get('/messages', [MessageController::class, 'inbox']);
    Route::get('/messages/sent', [MessageController::class, 'sent']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markRead']);

    // Orders - Manager/Admin only
    Route::middleware('role:manager,admin')->group(function () {
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    });

    // Inventory - Manager/Admin only
    Route::middleware('role:manager,admin')->group(function () {
        Route::put('/inventory/{product_id}', [InventoryController::class, 'update']);
        Route::get('/inventory/logs', [InventoryController::class, 'logs']);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);

    // Member verification
    Route::post('/users/verification', [UserController::class, 'submitVerification']);

    // Notifications - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/notifications/broadcast', [NotificationController::class, 'broadcast']);
    });

    // Users - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}/verify', [UserController::class, 'verify']);
        Route::put('/users/{id}/access', [UserController::class, 'updateAccess']);
        Route::post('/wallet/adjust', [WalletController::class, 'adjust']);
    });

    // Reports - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/reports/inventory', [ReportController::class, 'inventoryReport']);
        Route::get('/reports/orders', [ReportController::class, 'ordersReport']);
        Route::get('/reports/members', [ReportController::class, 'membersReport']);
        Route::get('/reports/stored', [StoredReportController::class, 'index']);
        Route::post('/reports/stored', [StoredReportController::class, 'store']);
        Route::get('/reports/stored/{id}', [StoredReportController::class, 'show']);
    });

    // Telegram
    Route::post('/telegram/link', [TelegramController::class, 'linkAccount']);
    Route::post('/telegram/link-current-user', [TelegramController::class, 'linkCurrentUser']);
});
