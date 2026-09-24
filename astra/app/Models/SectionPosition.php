<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionPosition extends Model
{
    protected $fillable = [
        'user_id',
        'section_id',
        'position',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
