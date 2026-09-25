<?php

namespace Database\Factories;

use App\Models\Chart;
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
            'chart_id' => Chart::factory(),
            'value' => fake()->randomFloat(2, 1, 500),
            'recorded_on' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
