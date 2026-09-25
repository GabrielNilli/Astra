<?php

namespace App\Models;

use App\Models\Concerns\Shareable;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
        'archived_at',
    ];

    protected $casts = [
        'is_shared' => 'boolean',
        'has_reminder' => 'boolean',
        'is_pinned' => 'boolean',
        'block_data' => 'array',
        'archived_at' => 'datetime',
    ];

    protected $appends = ['is_archived'];

    protected function isArchived(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->archived_at !== null,
        );
    }

    protected static function booted(): void
    {
        // Le righe note_images/note_attachments spariscono in cascata dal DB, i file vanno tolti dal disco a mano
        static::deleting(function (self $note) {
            $imagePaths = $note->images()->pluck('path')->all();
            if ($imagePaths) {
                NoteImage::disk()->delete($imagePaths);
            }

            $attachmentPaths = $note->attachments()->pluck('path')->all();
            if ($attachmentPaths) {
                NoteAttachment::disk()->delete($attachmentPaths);
            }
        });
    }

    public function images()
    {
        return $this->hasMany(NoteImage::class);
    }

    public function attachments()
    {
        return $this->hasMany(NoteAttachment::class);
    }

    public function isAccessibleBy(int $userId): bool
    {
        return $this->created_by === $userId || $this->shares()->where('user_id', $userId)->exists();
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
