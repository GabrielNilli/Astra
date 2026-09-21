<?php

namespace App\Models;

use App\Models\Concerns\Shareable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory, Shareable;

    protected $fillable = [
        'created_by',
        'title',
        'content',
        'color',
        'icon',
        'is_shared',
        'has_reminder',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'has_reminder' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
}
