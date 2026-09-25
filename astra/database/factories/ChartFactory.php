<?php

namespace Database\Factories;

use App\Enums\ChartType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Chart>
 */
class ChartFactory extends Factory
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
            'name' => fake()->word(),
            'type' => fake()->randomElement(ChartType::cases()),
            'is_shared' => false,
        ];
    }
}
