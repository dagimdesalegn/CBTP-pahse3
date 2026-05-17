<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'kebele_id',
        'kebele_id_image_path',
        'coupon_id_image_path',
        'coupon_id',
        'verification_submitted_at',
        'verification_region',
        'verification_city',
        'verification_woreda_subcity',
        'verification_kebele',
        'manager_kebele',
        'role',
        'access_level',
        'is_verified',
        'account_balance',
        'membership_status',
        'telegram_id',
        'google_id',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'account_balance' => 'decimal:2',
    ];

    public function hasAccess(string $permission): bool
    {
        if ($this->role === 'manager') {
            return in_array($permission, ['products', 'orders', 'inventory', 'suppliers', 'messages'], true);
        }

        if ($this->role !== 'admin') {
            return false;
        }

        $level = $this->access_level ?: 'super_admin';

        if ($level === 'super_admin') {
            return true;
        }

        $permissions = [
            'operations_admin' => ['products', 'orders', 'inventory', 'suppliers', 'users', 'messages', 'wallet'],
            'report_admin' => ['reports', 'messages'],
            'support_admin' => ['users', 'orders', 'messages', 'wallet'],
        ];

        return in_array($permission, $permissions[$level] ?? [], true);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class, 'manager_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    public function storedReports()
    {
        return $this->hasMany(StoredReport::class, 'generated_by');
    }
}
