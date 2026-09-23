<?php

use App\Models\Section;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('index lists preset sections and the user\'s own custom sections, but not other users\' custom sections', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Sanctum::actingAs($user);

    Section::factory()->create(['created_by' => $user->id, 'name' => 'Mia sezione', 'is_preset' => false]);
    Section::factory()->create(['created_by' => $otherUser->id, 'name' => 'Sezione altrui', 'is_preset' => false]);

    $response = $this->getJson('/api/sections');

    $response->assertOk();
    $names = collect($response->json())->pluck('name');

    expect($names)->toContain('Lavoro', 'Personale', 'Idee', 'Studio', 'Mia sezione');
    expect($names)->not->toContain('Sezione altrui');
});

test('authenticated user can create a custom section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/sections', ['name' => 'Progetti']);

    $response->assertCreated();
    $response->assertJsonFragment(['name' => 'Progetti', 'is_preset' => false]);
    $this->assertDatabaseHas('sections', [
        'name' => 'Progetti',
        'created_by' => $user->id,
        'is_preset' => false,
    ]);
});

test('creating a section requires a name', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/sections', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('name');
});

test('user can delete their own custom section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $user->id, 'is_preset' => false]);

    $response = $this->deleteJson("/api/sections/{$section->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('sections', ['id' => $section->id]);
});

test('user cannot delete a preset section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $preset = Section::where('is_preset', true)->firstOrFail();

    $response = $this->deleteJson("/api/sections/{$preset->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('sections', ['id' => $preset->id]);
});

test('user cannot delete another user\'s custom section', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $otherUser->id, 'is_preset' => false]);

    $response = $this->deleteJson("/api/sections/{$section->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('sections', ['id' => $section->id]);
});

test('guests cannot access sections', function () {
    $this->getJson('/api/sections')->assertUnauthorized();
    $this->postJson('/api/sections', ['name' => 'X'])->assertUnauthorized();
});
