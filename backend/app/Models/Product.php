<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_am',
        'name_or',
        'description',
        'description_am',
        'description_or',
        'price',
        'discount_price',
        'quantity',
        'category',
        'supplier_id',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'effective_price',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function getEffectivePriceAttribute()
    {
        if ($this->discount_price !== null && $this->discount_price < $this->price) {
            return number_format((float) $this->discount_price, 2, '.', '');
        }

        return number_format((float) $this->price, 2, '.', '');
    }

    public function isOutOfStock()
    {
        return $this->quantity <= 0;
    }

    public function isLowStock($threshold = 10)
    {
        return $this->quantity > 0 && $this->quantity <= $threshold;
    }
}
