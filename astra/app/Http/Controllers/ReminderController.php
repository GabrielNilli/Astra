<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return Reminder::where('created_by', $userId)
            ->orWhereHas('shares', fn ($query) => $query->where('user_id', $userId))
            ->orderBy('remind_at')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'note_id' => 'nullable|exists:notes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'remind_at' => 'required|date',
            'recurrence' => ['sometimes', 'in:'.implode(',', Reminder::RECURRENCES)],
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $reminder = Reminder::create([
            'note_id' => $request->note_id,
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'remind_at' => $request->remind_at,
            'recurrence' => $request->input('recurrence', 'none'),
            'is_shared' => $request->boolean('is_shared'),
        ]);

        if ($request->boolean('is_shared') && $request->filled('shared_with')) {
            $reminder->sharedWithUsers()->sync($request->input('shared_with'));
        }

        return response()->json($reminder->load('sharedWithUsers'), 201);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $this->authorizeAccess($request, $reminder);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'remind_at' => 'sometimes|required|date',
            'recurrence' => ['sometimes', 'in:'.implode(',', Reminder::RECURRENCES)],
            'is_done' => 'sometimes|boolean',
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $reminder->update($request->only('title', 'description', 'remind_at', 'recurrence', 'is_done', 'is_shared'));

        if ($request->has('shared_with')) {
            $reminder->sharedWithUsers()->sync($request->input('shared_with', []));
        }

        return $reminder->load('sharedWithUsers');
    }

    public function destroy(Request $request, Reminder $reminder)
    {
        $this->authorizeAccess($request, $reminder);

        $reminder->delete();

        return response()->noContent();
    }

    private function authorizeAccess(Request $request, Reminder $reminder): void
    {
        $userId = $request->user()->id;

        $canTouch = $reminder->created_by === $userId
            || $reminder->shares()->where('user_id', $userId)->exists();

        abort_unless($canTouch, 403);
    }
}
