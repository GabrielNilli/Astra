<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'name',
        'is_preset',
    ];

    protected $casts = [
        'is_preset' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function notes()
    {
        return $this->belongsToMany(Note::class, 'note_section')->withTimestamps();
    }
}
