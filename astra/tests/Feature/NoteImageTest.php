<?php

use App\Models\Note;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(fn () => Storage::fake('public'));

test('images can be attached to a note and are listed with it', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $note = Note::factory()->create(['created_by' => $user->id]);

    $this->postJson("/api/notes/{$note->id}/images", [
        'images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.png')],
    ])->assertCreated()->assertJsonCount(2);

    $image = $note->images()->first();
    Storage::disk('public')->assertExists($image->path);

    $data = $this->getJson('/api/notes')->assertOk()->json('0');
    expect($data['images'])->toHaveCount(2);
    expect($data['images'][0])->toHaveKey('url')->not->toHaveKey('path');
});

test('a note image can be removed together with its file', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $path = UploadedFile::fake()->image('a.jpg')->store("notes/{$note->id}", 'public');
    $image = $note->images()->create(['path' => $path]);

    $this->deleteJson("/api/note-images/{$image->id}")->assertNoContent();

    Storage::disk('public')->assertMissing($path);
    $this->assertDatabaseMissing('note_images', ['id' => $image->id]);
});

test('deleting a note removes its image files', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $note = Note::factory()->create(['created_by' => $user->id]);
    $path = UploadedFile::fake()->image('a.jpg')->store("notes/{$note->id}", 'public');
    $note->images()->create(['path' => $path]);

    $this->deleteJson("/api/notes/{$note->id}")->assertNoContent();

    Storage::disk('public')->assertMissing($path);
});

test('images cannot be attached to a note of another user', function () {
    Sanctum::actingAs(User::factory()->create());
    $note = Note::factory()->create();

    $this->postJson("/api/notes/{$note->id}/images", [
        'images' => [UploadedFile::fake()->image('a.jpg')],
    ])->assertForbidden();
});

test('non image files are rejected and a note holds at most ten images', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $note = Note::factory()->create(['created_by' => $user->id]);

    $this->postJson("/api/notes/{$note->id}/images", [
        'images' => [UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')],
    ])->assertUnprocessable();

    foreach (range(1, 10) as $i) {
        $note->images()->create(['path' => "notes/{$note->id}/{$i}.jpg"]);
    }

    $this->postJson("/api/notes/{$note->id}/images", [
        'images' => [UploadedFile::fake()->image('extra.jpg')],
    ])->assertUnprocessable();
});
