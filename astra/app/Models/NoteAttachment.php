<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class NoteAttachment extends Model
{
    protected $fillable = [
        'note_id',
        'path',
        'filename',
        'mime_type',
        'size',
    ];

    // Il path interno non serve al client: espone solo l'URL pubblico.
    protected $hidden = ['path'];

    protected $appends = ['url'];

    public static function disk()
    {
        return Storage::disk(config('filesystems.note_attachments_disk'));
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => static::disk()->url($this->path),
        );
    }

    public function note()
    {
        return $this->belongsTo(Note::class);
    }
}
