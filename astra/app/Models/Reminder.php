<?php

namespace App\Models;

use App\Models\Concerns\Shareable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory, Shareable;

    public const RECURRENCES = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

    protected $fillable = [
        'note_id',
        'created_by',
        'title',
        'description',
        'remind_at',
        'recurrence',
        'next_run_at',
        'is_done',
        'is_shared',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'next_run_at' => 'datetime',
        'is_done' => 'boolean',
        'is_shared' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $reminder) {
            if (! $reminder->next_run_at) {
                $reminder->next_run_at = $reminder->remind_at;
            }
        });

        static::created(fn (self $reminder) => static::syncNoteHasReminder($reminder->note_id));

        static::updated(function (self $reminder) {
            if ($reminder->wasChanged('note_id')) {
                static::syncNoteHasReminder($reminder->getOriginal('note_id'));
            }

            static::syncNoteHasReminder($reminder->note_id);
        });

        static::deleted(fn (self $reminder) => static::syncNoteHasReminder($reminder->note_id));
    }

    private static function syncNoteHasReminder(?int $noteId): void
    {
        if (! $noteId) {
            return;
        }

        Note::whereKey($noteId)->update([
            'has_reminder' => static::where('note_id', $noteId)->exists(),
        ]);
    }

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
