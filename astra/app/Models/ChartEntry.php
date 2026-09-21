<?php

namespace App\Models;

use App\Models\Concerns\Shareable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChartEntry extends Model
{
    use HasFactory, Shareable;

    protected $fillable = [
        'created_by',
        'category',
        'value',
        'recorded_on',
        'is_shared',
    ];

    protected $casts = [
        'recorded_on' => 'date',
        'is_shared' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
