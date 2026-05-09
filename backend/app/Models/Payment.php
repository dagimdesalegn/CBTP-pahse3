<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'tx_ref',
        'chapa_ref_id',
        'amount',
        'currency',
        'status',
        'checkout_url',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
