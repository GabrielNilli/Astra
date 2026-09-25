<?php

namespace App\Models;

use App\Enums\ChartType;
use App\Models\Concerns\Shareable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chart extends Model
{
    use HasFactory, Shareable;

    protected $fillable = [
        'created_by',
        'name',
        'type',
        'is_shared',
    ];

    protected $casts = [
        'type' => ChartType::class,
        'is_shared' => 'boolean',
    ];

    public function isAccessibleBy(int $userId): bool
    {
        return $this->created_by === $userId || $this->shares()->where('user_id', $userId)->exists();
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function entries()
    {
        return $this->hasMany(ChartEntry::class)->orderBy('recorded_on');
    }
}
