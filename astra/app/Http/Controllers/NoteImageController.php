<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteImage;
use Illuminate\Http\Request;

class NoteImageController extends Controller
{
    private const MAX_IMAGES_PER_NOTE = 10;

    public function store(Request $request, Note $note)
    {
        $this->authorizeNote($request, $note);

        $request->validate([
            'images' => 'required|array|min:1|max:'.self::MAX_IMAGES_PER_NOTE,
            'images.*' => 'image|mimes:jpg,jpeg,png,webp,gif|max:4096',
        ]);

        abort_if(
            $note->images()->count() + count($request->file('images')) > self::MAX_IMAGES_PER_NOTE,
            422,
            'Una nota può contenere al massimo '.self::MAX_IMAGES_PER_NOTE.' immagini.',
        );

        foreach ($request->file('images') as $file) {
            $path = $file->store("notes/{$note->id}", config('filesystems.note_images_disk'));
            $note->images()->create(['path' => $path]);
        }

        return response()->json($note->images()->get(), 201);
    }

    public function destroy(Request $request, NoteImage $noteImage)
    {
        $this->authorizeNote($request, $noteImage->note);

        NoteImage::disk()->delete($noteImage->path);
        $noteImage->delete();

        return response()->noContent();
    }

    private function authorizeNote(Request $request, Note $note): void
    {
        $userId = $request->user()->id;

        abort_unless(
            $note->created_by === $userId || $note->shares()->where('user_id', $userId)->exists(),
            403,
        );
    }
}
