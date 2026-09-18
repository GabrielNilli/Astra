<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $household = $request->user()->households()->firstOrFail();

        return Note::where('household_id', $household->id)
            ->where(function ($query) use ($request) {
                $query->where('is_shared', true)
                    ->orWhere('created_by', $request->user()->id);
            })
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'is_shared' => 'sometimes|boolean',
        ]);

        $household = $request->user()->households()->firstOrFail();

        $note = $household->notes()->create([
            'title' => $request->title,
            'content' => $request->content,
            'created_by' => $request->user()->id,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        return response()->json($note, 201);
    }

    public function update(Request $request, Note $note)
    {
        $this->authorizeAccess($request, $note);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'is_shared' => 'sometimes|boolean',
        ]);

        $note->update($request->only('title', 'content', 'is_shared'));

        return $note;
    }

    public function destroy(Request $request, Note $note)
    {
        $this->authorizeAccess($request, $note);

        $note->delete();

        return response()->noContent();
    }

    private function authorizeAccess(Request $request, $model)
    {
        $household = $request->user()->households()->firstOrFail();

        $sameHousehold = $model->household_id === $household->id;
        $canTouch = $model->is_shared || $model->created_by === $request->user()->id;

        abort_unless($sameHousehold && $canTouch, 403);
    }
}
