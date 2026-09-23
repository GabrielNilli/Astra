<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChartEntryController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SectionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/profile-picture', [ProfileController::class, 'updatePicture']);

    Route::apiResource('notes', NoteController::class)->except('show');
    Route::apiResource('sections', SectionController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('reminders', ReminderController::class)->except('show');
    Route::apiResource('chart-entries', ChartEntryController::class)->only(['index', 'store', 'destroy']);
});
