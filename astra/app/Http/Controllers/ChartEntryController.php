<?php

namespace App\Http\Controllers;

use App\Models\Chart;
use App\Models\ChartEntry;
use Illuminate\Http\Request;

class ChartEntryController extends Controller
{
    public function store(Request $request, Chart $chart)
    {
        abort_unless($chart->isAccessibleBy($request->user()->id), 403);

        $request->validate([
            'value' => 'required|numeric',
            'label' => 'sometimes|nullable|string|max:64',
            'color' => 'sometimes|nullable|string|max:32',
            'recorded_on' => 'required|date',
        ]);

        $entry = $chart->entries()->create([
            'value' => $request->value,
            'label' => $request->input('label'),
            'color' => $request->input('color'),
            'recorded_on' => $request->recorded_on,
        ]);

        return response()->json($entry, 201);
    }

    public function update(Request $request, ChartEntry $chartEntry)
    {
        abort_unless($chartEntry->chart->isAccessibleBy($request->user()->id), 403);

        $request->validate([
            'value' => 'required|numeric',
            'label' => 'sometimes|nullable|string|max:64',
            'color' => 'sometimes|nullable|string|max:32',
            'recorded_on' => 'required|date',
        ]);

        $chartEntry->update([
            'value' => $request->value,
            'label' => $request->input('label'),
            'color' => $request->input('color'),
            'recorded_on' => $request->recorded_on,
        ]);

        return $chartEntry;
    }

    public function destroy(Request $request, ChartEntry $chartEntry)
    {
        abort_unless($chartEntry->chart->isAccessibleBy($request->user()->id), 403);

        $chartEntry->delete();

        return response()->noContent();
    }
}
