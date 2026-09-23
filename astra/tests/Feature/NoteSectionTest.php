<?php

use App\Models\Note;
use App\Models\Section;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('a note can be created in several sections', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $sections = Section::factory()->count(2)->create(['created_by' => $user->id]);

    $response = $this->postJson('/api/notes', [
        'content' => 'Nota con sezioni',
        'section_ids' => $sections->pluck('id')->all(),
    ]);

    $response->assertCreated();
    expect($response->json('sections'))->toHaveCount(2);
    $this->assertDatabaseCount('note_section', 2);
});

test('the sections of a note can be replaced or cleared on update', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    [$a, $b] = Section::factory()->count(2)->create(['created_by' => $user->id]);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $note->sections()->sync([$a->id]);

    $this->putJson("/api/notes/{$note->id}", ['content' => $note->content, 'section_ids' => [$b->id]])->assertOk();
    expect($note->fresh()->sections->pluck('id')->all())->toBe([$b->id]);

    $this->putJson("/api/notes/{$note->id}", ['content' => $note->content, 'section_ids' => []])->assertOk();
    expect($note->fresh()->sections)->toHaveCount(0);
});

test('updating a note without section_ids keeps its sections', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $user->id]);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $note->sections()->sync([$section->id]);

    $this->putJson("/api/notes/{$note->id}", ['content' => 'Nuovo testo', 'color' => '#fff'])->assertOk();

    expect($note->fresh()->sections)->toHaveCount(1);
});

test('notes index can be filtered by section', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $sectionA = Section::factory()->create(['created_by' => $user->id]);
    $sectionB = Section::factory()->create(['created_by' => $user->id]);
    Note::factory()->create(['created_by' => $user->id, 'title' => 'In A'])->sections()->sync([$sectionA->id]);
    Note::factory()->create(['created_by' => $user->id, 'title' => 'In B'])->sections()->sync([$sectionB->id]);
    Note::factory()->create(['created_by' => $user->id, 'title' => 'In A e B'])->sections()->sync([$sectionA->id, $sectionB->id]);

    $titles = collect($this->getJson("/api/notes?section_id={$sectionA->id}")->assertOk()->json())->pluck('title');

    expect($titles)->toContain('In A')->toContain('In A e B');
    expect($titles)->not->toContain('In B');
});

test('creating a note rejects a section id that does not exist', function () {
    Sanctum::actingAs(User::factory()->create());

    $response = $this->postJson('/api/notes', [
        'content' => 'Nota',
        'section_ids' => [999999],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('section_ids.0');
});

test('notes index includes section, author, recipients and reminders', function () {
    $user = User::factory()->create();
    $recipient = User::factory()->create();
    Sanctum::actingAs($user);
    $section = Section::factory()->create(['created_by' => $user->id, 'name' => 'Lavoro']);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $note->sections()->sync([$section->id]);
    $note->sharedWithUsers()->sync([$recipient->id]);

    $data = $this->getJson('/api/notes')->assertOk()->json('0');

    expect($data['sections'][0]['name'])->toBe('Lavoro');
    expect($data['author']['id'])->toBe($user->id);
    expect($data['shared_with_users'][0]['id'])->toBe($recipient->id);
    expect($data['shared_with_users'][0])->not->toHaveKey('email');
    expect($data)->toHaveKey('reminders');
});

test('changing a reminder date moves its next run', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $reminder = \App\Models\Reminder::create([
        'note_id' => $note->id,
        'created_by' => $user->id,
        'title' => 'Test',
        'remind_at' => '2026-10-01 10:00:00',
    ]);

    $this->putJson("/api/reminders/{$reminder->id}", ['remind_at' => '2026-11-05 08:30:00'])->assertOk();

    expect($reminder->fresh()->next_run_at->format('Y-m-d H:i'))->toBe('2026-11-05 08:30');
});
