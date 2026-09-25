<?php

namespace App\Http\Controllers;

use App\Enums\ChartType;
use App\Models\Chart;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ChartController extends Controller
{
    private const RELATIONS = [
        'author:id,name,profile_pic',
        'sharedWithUsers:id,name,profile_pic',
        'entries:id,chart_id,value,color,recorded_on',
    ];

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return Chart::where('created_by', $userId)
            ->orWhereHas('shares', fn ($query) => $query->where('user_id', $userId))
            ->with(self::RELATIONS)
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', new Enum(ChartType::class)],
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $chart = Chart::create([
            'created_by' => $request->user()->id,
            'name' => $request->name,
            'type' => $request->type,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        if ($request->boolean('is_shared') && $request->filled('shared_with')) {
            $chart->sharedWithUsers()->sync($request->input('shared_with'));
        }

        return response()->json($chart->load(self::RELATIONS), 201);
    }

    public function update(Request $request, Chart $chart)
    {
        $this->authorizeAccess($request, $chart);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', new Enum(ChartType::class)],
            'is_shared' => 'sometimes|boolean',
            'shared_with' => 'sometimes|array',
            'shared_with.*' => 'integer|exists:users,id',
        ]);

        $chart->update($request->only('name', 'type', 'is_shared'));

        if ($request->has('shared_with')) {
            $chart->sharedWithUsers()->sync($request->input('shared_with', []));
        }

        return $chart->load(self::RELATIONS);
    }

    public function destroy(Request $request, Chart $chart)
    {
        abort_unless($chart->created_by === $request->user()->id, 403);

        $chart->delete();

        return response()->noContent();
    }

    private function authorizeAccess(Request $request, Chart $chart): void
    {
        abort_unless($chart->isAccessibleBy($request->user()->id), 403);
    }
}
