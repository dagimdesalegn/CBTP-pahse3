<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoredReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'generated_by',
        'date_from',
        'date_to',
        'data',
        'summary',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
        'data' => 'array',
        'summary' => 'array',
    ];

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
