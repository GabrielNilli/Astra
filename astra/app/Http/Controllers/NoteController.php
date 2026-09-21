<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return Note::where('created_by', $userId)
            ->orWhereHas('shares', fn ($query) => $query->where('user_id', $userId))
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:32',
            'icon' => 'nullable|string|max:64',
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $note = Note::create([
            'created_by' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'color' => $request->color,
            'icon' => $request->icon,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        if ($request->boolean('is_shared') && $request->filled('shared_with')) {
            $note->sharedWithUsers()->sync($request->input('shared_with'));
        }

        return response()->json($note->load('sharedWithUsers'), 201);
    }

    public function update(Request $request, Note $note)
    {
        $this->authorizeAccess($request, $note);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:32',
            'icon' => 'nullable|string|max:64',
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $note->update($request->only('title', 'content', 'color', 'icon', 'is_shared'));

        if ($request->has('shared_with')) {
            $note->sharedWithUsers()->sync($request->input('shared_with', []));
        }

        return $note->load('sharedWithUsers');
    }

    public function destroy(Request $request, Note $note)
    {
        $this->authorizeAccess($request, $note);

        $note->delete();

        return response()->noContent();
    }

    private function authorizeAccess(Request $request, Note $note): void
    {
        $userId = $request->user()->id;

        $canTouch = $note->created_by === $userId
            || $note->shares()->where('user_id', $userId)->exists();

        abort_unless($canTouch, 403);
    }
}
