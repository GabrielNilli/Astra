<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChartEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'chart_id',
        'value',
        'color',
        'recorded_on',
    ];

    protected $casts = [
        'recorded_on' => 'date:Y-m-d',
    ];

    public function chart()
    {
        return $this->belongsTo(Chart::class);
    }
}
