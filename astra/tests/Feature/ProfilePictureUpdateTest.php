<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

test('authenticated user can upload a profile picture', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->post('/api/user/profile-picture', [
        'photo' => UploadedFile::fake()->image('avatar.jpg'),
    ]);

    $response->assertOk();
    $user->refresh();

    expect($user->getRawOriginal('profile_pic'))->not->toBeNull();
    expect($response->json('profile_pic'))->toContain('/storage/avatars/');
    Storage::disk('public')->assertExists($user->getRawOriginal('profile_pic'));
});

test('uploading a new profile picture deletes the previous file', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->post('/api/user/profile-picture', [
        'photo' => UploadedFile::fake()->image('first.jpg'),
    ])->assertOk();
    $firstPath = $user->refresh()->getRawOriginal('profile_pic');

    $this->post('/api/user/profile-picture', [
        'photo' => UploadedFile::fake()->image('second.jpg'),
    ])->assertOk();
    $secondPath = $user->refresh()->getRawOriginal('profile_pic');

    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('profile picture upload requires an image file', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->post('/api/user/profile-picture', [
        'photo' => UploadedFile::fake()->create('notes.txt', 10),
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('photo');
});

test('guests cannot upload a profile picture', function () {
    $response = $this->post('/api/user/profile-picture', [
        'photo' => UploadedFile::fake()->image('avatar.jpg'),
    ]);

    $response->assertUnauthorized();
});
