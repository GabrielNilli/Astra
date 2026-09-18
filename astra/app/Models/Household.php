<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    protected $fillable = ['name'];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
    public function chartEntries()
    {
        return $this->hasMany(ChartEntry::class);
    }
}
