<?php

use App\Models\Note;
use App\Models\Reminder;
use App\Models\User;
use App\Notifications\ReminderDueNotification;
use App\Services\ReminderDispatcher;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

test('a due reminder on a shared note notifies the users the note is shared with', function () {
    Notification::fake();

    $author = User::factory()->create();
    $recipient = User::factory()->create();
    $recipient->updatePushSubscription('https://push.example.com/'.$recipient->id);
    $author->updatePushSubscription('https://push.example.com/'.$author->id);

    $note = Note::factory()->create(['created_by' => $author->id, 'is_shared' => true]);
    $note->sharedWithUsers()->sync([$recipient->id]);
    Reminder::factory()->create([
        'note_id' => $note->id,
        'created_by' => $author->id,
        'remind_at' => now()->subMinute(),
    ]);

    app(ReminderDispatcher::class)->dispatchDue();

    Notification::assertSentTo($author, ReminderDueNotification::class);
    Notification::assertSentTo($recipient, ReminderDueNotification::class);
});

test('a user the note is shared with can update its reminder', function () {
    $author = User::factory()->create();
    $recipient = User::factory()->create();
    $note = Note::factory()->create(['created_by' => $author->id, 'is_shared' => true]);
    $note->sharedWithUsers()->sync([$recipient->id]);
    $reminder = Reminder::factory()->create(['note_id' => $note->id, 'created_by' => $author->id]);

    Sanctum::actingAs($recipient);

    $this->patchJson("/api/reminders/{$reminder->id}", ['is_done' => true])->assertOk();
    expect($reminder->fresh()->is_done)->toBeTrue();
});
