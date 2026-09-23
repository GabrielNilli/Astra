<?php

use App\Models\Note;
use App\Models\Section;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('a note can be created with a section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $user->id]);

    $response = $this->postJson('/api/notes', [
        'content' => 'Nota con sezione',
        'section_id' => $section->id,
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('notes', [
        'content' => 'Nota con sezione',
        'section_id' => $section->id,
    ]);
});

test('a note\'s section can be changed on update', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $user->id]);
    $note = Note::factory()->create(['created_by' => $user->id, 'section_id' => null]);

    $response = $this->putJson("/api/notes/{$note->id}", [
        'content' => $note->content,
        'section_id' => $section->id,
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('notes', ['id' => $note->id, 'section_id' => $section->id]);
});

test('notes index can be filtered by section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $sectionA = Section::factory()->create(['created_by' => $user->id]);
    $sectionB = Section::factory()->create(['created_by' => $user->id]);
    Note::factory()->create(['created_by' => $user->id, 'section_id' => $sectionA->id, 'title' => 'In A']);
    Note::factory()->create(['created_by' => $user->id, 'section_id' => $sectionB->id, 'title' => 'In B']);

    $response = $this->getJson("/api/notes?section_id={$sectionA->id}");

    $response->assertOk();
    $titles = collect($response->json())->pluck('title');
    expect($titles)->toContain('In A');
    expect($titles)->not->toContain('In B');
});

test('creating a note rejects a section_id that does not exist', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/notes', [
        'content' => 'Nota',
        'section_id' => 999999,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('section_id');
});
