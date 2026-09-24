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
        'note_type',
        'block_data',
        'is_shared',
        'has_reminder',
        'is_pinned',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'has_reminder' => 'boolean',
        'is_pinned' => 'boolean',
        'block_data' => 'array',
    ];

    protected static function booted(): void
    {
        // Le righe note_images spariscono in cascata dal DB, i file vanno tolti dal disco a mano
        static::deleting(function (self $note) {
            $paths = $note->images()->pluck('path')->all();
            if ($paths) {
                NoteImage::disk()->delete($paths);
            }
        });
    }

    public function images()
    {
        return $this->hasMany(NoteImage::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'note_section')->withTimestamps();
    }
}
