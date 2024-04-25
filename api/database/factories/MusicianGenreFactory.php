<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MusicianGenre>
 */
class MusicianGenreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'musician_id' => $this->faker->numberBetween(1, 10),
            'genre_id' => $this->faker->numberBetween(1, 8)
        ];
    }
}
