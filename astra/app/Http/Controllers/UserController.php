<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Cerca utenti per nome per scegliere i destinatari di una condivisione.
     * Espone solo id, nome e avatar (mai l'email) ed esclude l'utente corrente.
     */
    public function search(Request $request)
    {
        $request->validate(['q' => 'nullable|string|max:100']);

        $term = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $request->string('q')->trim()->toString());

        return User::where('id', '!=', $request->user()->id)
            ->when($term !== '', fn ($query) => $query->where('name', 'like', "%{$term}%"))
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'profile_pic']);
    }
}
