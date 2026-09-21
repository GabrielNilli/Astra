<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'profile_pic'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'created_by');
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class, 'created_by');
    }

    public function chartEntries()
    {
        return $this->hasMany(ChartEntry::class, 'created_by');
    }

    public function sharedNotes()
    {
        return $this->morphedByMany(Note::class, 'shareable', 'shares');
    }

    public function sharedReminders()
    {
        return $this->morphedByMany(Reminder::class, 'shareable', 'shares');
    }

    public function sharedChartEntries()
    {
        return $this->morphedByMany(ChartEntry::class, 'shareable', 'shares');
    }
}
