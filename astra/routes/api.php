<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChartEntryController;
use App\Http\Controllers\NoteAttachmentController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NoteImageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\RemindersCronController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Colpito da Cloud Scheduler ogni minuto, non da utenti autenticati: auth via header segreto.
Route::post('/internal/reminders/send-due', [RemindersCronController::class, 'sendDue']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/profile-picture', [ProfileController::class, 'updatePicture']);
    Route::patch('/user/accent-color', [ProfileController::class, 'updateAccentColor']);

    Route::get('/users/search', [UserController::class, 'search']);

    Route::apiResource('notes', NoteController::class)->except('show');
    Route::post('/notes/{note}/images', [NoteImageController::class, 'store']);
    Route::delete('/note-images/{noteImage}', [NoteImageController::class, 'destroy']);
    Route::post('/notes/{note}/attachments', [NoteAttachmentController::class, 'store']);
    Route::delete('/note-attachments/{noteAttachment}', [NoteAttachmentController::class, 'destroy']);
    Route::patch('/sections/reorder', [SectionController::class, 'reorder']);
    Route::apiResource('sections', SectionController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('reminders', ReminderController::class)->except('show');
    Route::post('/push-subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('/push-subscriptions', [PushSubscriptionController::class, 'destroy']);
    Route::apiResource('chart-entries', ChartEntryController::class)->only(['index', 'store', 'destroy']);
});
