<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('user search finds users by name without exposing email', function () {
    Sanctum::actingAs(User::factory()->create(['name' => 'Me Myself']));
    User::factory()->create(['name' => 'Mario Rossi']);
    User::factory()->create(['name' => 'Luigi Verdi']);

    $response = $this->getJson('/api/users/search?q=mari');

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
    expect($response->json('0.name'))->toBe('Mario Rossi');
    expect($response->json('0'))->not->toHaveKey('email');
});

test('user search excludes the current user', function () {
    Sanctum::actingAs(User::factory()->create(['name' => 'Mario Bianchi']));
    User::factory()->create(['name' => 'Mario Rossi']);

    $names = collect($this->getJson('/api/users/search?q=mario')->json())->pluck('name');

    expect($names)->toContain('Mario Rossi');
    expect($names)->not->toContain('Mario Bianchi');
});

test('user search without a query lists the first ten users', function () {
    Sanctum::actingAs(User::factory()->create());
    User::factory()->count(12)->create();

    $response = $this->getJson('/api/users/search');

    $response->assertOk();
    expect($response->json())->toHaveCount(10);
});

test('user search requires authentication', function () {
    $this->getJson('/api/users/search?q=mario')->assertUnauthorized();
});
