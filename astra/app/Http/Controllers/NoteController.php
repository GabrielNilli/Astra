<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /** Relazioni restituite con ogni nota, così la UI mostra tutto senza altre chiamate. */
    private const RELATIONS = [
        'sections:id,name',
        'author:id,name,profile_pic',
        'sharedWithUsers:id,name,profile_pic',
        'reminders:id,note_id,remind_at,recurrence,is_done',
        'images:id,note_id,path',
    ];

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return Note::where(function ($query) use ($userId) {
            $query->where('created_by', $userId)
                ->orWhereHas('shares', fn ($shares) => $shares->where('user_id', $userId));
        })
            ->with(self::RELATIONS)
            ->when($request->filled('section_id'), fn ($query) => $query->whereHas('sections', fn ($sections) => $sections->whereKey($request->integer('section_id'))))
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
            'section_ids' => 'sometimes|array',
            'section_ids.*' => 'integer|exists:sections,id',
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

        if ($request->filled('section_ids')) {
            $note->sections()->sync($request->input('section_ids'));
        }

        if ($request->boolean('is_shared') && $request->filled('shared_with')) {
            $note->sharedWithUsers()->sync($request->input('shared_with'));
        }

        return response()->json($note->load(self::RELATIONS), 201);
    }

    public function update(Request $request, Note $note)
    {
        $this->authorizeAccess($request, $note);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'color' => 'nullable|string|max:32',
            'icon' => 'nullable|string|max:64',
            'section_ids' => 'sometimes|array',
            'section_ids.*' => 'integer|exists:sections,id',
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $note->update($request->only('title', 'content', 'color', 'icon', 'is_shared'));

        if ($request->has('section_ids')) {
            $note->sections()->sync($request->input('section_ids', []));
        }

        if ($request->has('shared_with')) {
            $note->sharedWithUsers()->sync($request->input('shared_with', []));
        }

        return $note->load(self::RELATIONS);
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
