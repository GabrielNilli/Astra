<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $owner = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $recipient = User::factory()->create([
            'name' => 'Shared With User',
            'email' => 'shared@example.com',
        ]);

        $note = Note::factory()->create([
            'created_by' => $owner->id,
            'is_shared' => true,
        ]);

        $note->sharedWithUsers()->attach($recipient->id);
    }
}
