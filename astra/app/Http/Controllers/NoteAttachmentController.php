<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteAttachment;
use Illuminate\Http\Request;

class NoteAttachmentController extends Controller
{
    private const MAX_ATTACHMENTS_PER_NOTE = 10;

    // Estensioni bloccate anche se il MIME dichiarato dal browser sembra innocuo.
    private const BLOCKED_EXTENSIONS = ['exe', 'sh', 'bat', 'cmd', 'msi', 'com', 'scr'];

    public function store(Request $request, Note $note)
    {
        $this->authorizeNote($request, $note);

        $request->validate([
            'attachments' => 'required|array|min:1|max:'.self::MAX_ATTACHMENTS_PER_NOTE,
            'attachments.*' => 'file|max:15360',
        ]);

        foreach ($request->file('attachments') as $file) {
            $extension = strtolower($file->getClientOriginalExtension());
            abort_if(in_array($extension, self::BLOCKED_EXTENSIONS, true), 422, 'Tipo di file non consentito.');
        }

        abort_if(
            $note->attachments()->count() + count($request->file('attachments')) > self::MAX_ATTACHMENTS_PER_NOTE,
            422,
            'Una nota può contenere al massimo '.self::MAX_ATTACHMENTS_PER_NOTE.' allegati.',
        );

        foreach ($request->file('attachments') as $file) {
            $path = $file->store("notes/{$note->id}/attachments", config('filesystems.note_attachments_disk'));
            $note->attachments()->create([
                'path' => $path,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return response()->json($note->attachments()->get(), 201);
    }

    public function destroy(Request $request, NoteAttachment $noteAttachment)
    {
        $this->authorizeNote($request, $noteAttachment->note);

        NoteAttachment::disk()->delete($noteAttachment->path);
        $noteAttachment->delete();

        return response()->noContent();
    }

    private function authorizeNote(Request $request, Note $note): void
    {
        abort_unless($note->isAccessibleBy($request->user()->id), 403);
    }
}
