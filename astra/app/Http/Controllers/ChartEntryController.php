<?php

namespace App\Http\Controllers;

use App\Models\ChartEntry;
use Illuminate\Http\Request;

class ChartEntryController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return ChartEntry::where('created_by', $userId)
            ->orWhereHas('shares', fn ($query) => $query->where('user_id', $userId))
            ->orderBy('recorded_on')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:255',
            'value' => 'required|numeric',
            'recorded_on' => 'required|date',
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $entry = ChartEntry::create([
            'created_by' => $request->user()->id,
            'category' => $request->category,
            'value' => $request->value,
            'recorded_on' => $request->recorded_on,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        if ($request->boolean('is_shared') && $request->filled('shared_with')) {
            $entry->sharedWithUsers()->sync($request->input('shared_with'));
        }

        return response()->json($entry->load('sharedWithUsers'), 201);
    }

    public function destroy(Request $request, ChartEntry $chartEntry)
    {
        $userId = $request->user()->id;

        $canTouch = $chartEntry->created_by === $userId
            || $chartEntry->shares()->where('user_id', $userId)->exists();

        abort_unless($canTouch, 403);

        $chartEntry->delete();

        return response()->noContent();
    }
}
