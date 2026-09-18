<?php

namespace App\Models;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = [
        'household_id',
        'created_by',
        'title',
        'content',
        'is_shared'
    ];

    protected $casts = [
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
