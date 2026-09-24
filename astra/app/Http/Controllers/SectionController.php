<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\SectionPosition;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $sections = Section::where('is_preset', true)
            ->orWhere('created_by', $userId)
            ->with(['positions' => fn ($query) => $query->where('user_id', $userId)])
            ->orderByDesc('is_preset')
            ->orderBy('name')
            ->get();

        // L'ordine è personale: le sezioni senza posizione salvata dall'utente
        // restano in fondo, nell'ordine di oggi (preset prima, poi alfabetico).
        return $sections
            ->sortBy(fn ($section) => $section->positions->first()?->position ?? PHP_INT_MAX)
            ->values();
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'section_ids' => 'required|array',
            'section_ids.*' => 'integer|exists:sections,id',
        ]);

        $userId = $request->user()->id;

        $visibleIds = Section::where('is_preset', true)
            ->orWhere('created_by', $userId)
            ->pluck('id');

        foreach ($request->input('section_ids') as $index => $sectionId) {
            if (! $visibleIds->contains($sectionId)) {
                continue;
            }

            SectionPosition::updateOrCreate(
                ['user_id' => $userId, 'section_id' => $sectionId],
                ['position' => $index],
            );
        }

        return response()->noContent();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $section = Section::create([
            'created_by' => $request->user()->id,
            'name' => $request->name,
            'is_preset' => false,
        ]);

        return response()->json($section, 201);
    }

    public function destroy(Request $request, Section $section)
    {
        abort_unless(
            ! $section->is_preset && $section->created_by === $request->user()->id,
            403,
        );

        $section->delete();

        return response()->noContent();
    }
}
