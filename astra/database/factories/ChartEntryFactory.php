<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\ChartEntry>
 */
class ChartEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'created_by' => User::factory(),
            'category' => fake()->word(),
            'value' => fake()->randomFloat(2, 1, 500),
            'recorded_on' => fake()->dateTimeBetween('-1 month', 'now'),
            'is_shared' => false,
        ];
    }
}
