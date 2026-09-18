<?php

namespace App\Models;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ChartEntry extends Model
{
    protected $fillable = [
        'household_id',
        'created_by',
        'category',
        'value',
        'recorded_on',
        'is_shared'
    ];

    protected $casts = [
        'recorded_on' => 'date',
        'is_shared' => 'boolean',
    ];
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
