<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'change_amount',
        'previous_quantity',
        'new_quantity',
        'reason',
        'type',
        'manager_id',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'change_amount' => 'integer',
        'previous_quantity' => 'integer',
        'new_quantity' => 'integer',
    ];

    const UPDATED_AT = null;

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
