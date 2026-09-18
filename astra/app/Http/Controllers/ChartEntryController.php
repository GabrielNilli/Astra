<?php

namespace App\Http\Controllers;

use App\Models\ChartEntry;
use Illuminate\Http\Request;

class ChartEntryController extends Controller
{
    public function index(Request $request)
    {
        $household = $request->user()->households()->firstOrFail();

        return ChartEntry::where('household_id', $household->id)
            ->where(function ($query) use ($request) {
                $query->where('is_shared', true)
                    ->orWhere('created_by', $request->user()->id);
            })
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
        ]);

        $household = $request->user()->households()->firstOrFail();

        $entry = $household->chartEntries()->create([
            'category' => $request->category,
            'value' => $request->value,
            'recorded_on' => $request->recorded_on,
            'created_by' => $request->user()->id,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        return response()->json($entry, 201);
    }

    public function destroy(Request $request, ChartEntry $chartEntry)
    {
        $household = $request->user()->households()->firstOrFail();

        $sameHousehold = $chartEntry->household_id === $household->id;
        $canTouch = $chartEntry->is_shared || $chartEntry->created_by === $request->user()->id;

        abort_unless($sameHousehold && $canTouch, 403);

        $chartEntry->delete();

        return response()->noContent();
    }
}
