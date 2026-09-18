<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index(Request $request)
    {
        $household = $request->user()->households()->firstOrFail();

        return Reminder::where('household_id', $household->id)
            ->where(function ($query) use ($request) {
                $query->where('is_shared', true)
                    ->orWhere('created_by', $request->user()->id);
            })
            ->orderBy('remind_at')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'remind_at' => 'required|date',
            'is_shared' => 'sometimes|boolean',
        ]);

        $household = $request->user()->households()->firstOrFail();

        $reminder = $household->reminders()->create([
            'title' => $request->title,
            'description' => $request->description,
            'remind_at' => $request->remind_at,
            'created_by' => $request->user()->id,
            'is_shared' => $request->boolean('is_shared'),
        ]);

        return response()->json($reminder, 201);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $this->authorizeAccess($request, $reminder);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'remind_at' => 'sometimes|required|date',
            'is_done' => 'sometimes|boolean',
            'is_shared' => 'sometimes|boolean',
        ]);

        $reminder->update($request->only('title', 'description', 'remind_at', 'is_done', 'is_shared'));

        return $reminder;
    }

    public function destroy(Request $request, Reminder $reminder)
    {
        $this->authorizeAccess($request, $reminder);

        $reminder->delete();

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
