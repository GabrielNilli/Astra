<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        return Section::where('is_preset', true)
            ->orWhere('created_by', $request->user()->id)
            ->orderByDesc('is_preset')
            ->orderBy('name')
            ->get();
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
