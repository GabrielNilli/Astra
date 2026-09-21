<?php

namespace App\Models\Concerns;

use App\Models\Share;
use App\Models\User;

trait Shareable
{
    protected static function bootShareable(): void
    {
        static::deleting(function ($model) {
            $model->shares()->delete();
        });
    }

    public function shares()
    {
        return $this->morphMany(Share::class, 'shareable');
    }

    public function sharedWithUsers()
    {
        return $this->morphToMany(User::class, 'shareable', 'shares')->withTimestamps();
    }
}
