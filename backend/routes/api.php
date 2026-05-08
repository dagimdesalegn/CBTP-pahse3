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

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Telegram webhook
Route::post('/telegram/webhook', [TelegramController::class, 'webhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Products - All users can view
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Products - Manager/Admin only
    Route::middleware('role:manager,admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

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

    // Notifications - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/notifications/broadcast', [NotificationController::class, 'broadcast']);
    });

    // Users - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}/verify', [UserController::class, 'verify']);
    });

    // Reports - Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/reports/inventory', [ReportController::class, 'inventoryReport']);
        Route::get('/reports/orders', [ReportController::class, 'ordersReport']);
        Route::get('/reports/members', [ReportController::class, 'membersReport']);
    });

    // Telegram
    Route::post('/telegram/link', [TelegramController::class, 'linkAccount']);
});
