<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Reminder>
 */
class ReminderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $remindAt = fake()->dateTimeBetween('now', '+1 month');

        return [
            'note_id' => null,
            'created_by' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'remind_at' => $remindAt,
            'recurrence' => 'none',
            'next_run_at' => $remindAt,
            'is_done' => false,
            'is_shared' => false,
        ];
    }
}
