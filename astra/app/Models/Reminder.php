<?php

namespace App\Models;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    protected $fillable = [
        'household_id',
        'created_by',
        'title',
        'description',
        'remind_at',
        'is_done',
        'is_shared'
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'is_done' => 'boolean',
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
