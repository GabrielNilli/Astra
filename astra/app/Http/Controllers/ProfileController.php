<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function updatePicture(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:4096',
        ]);

        $user = $request->user();
        $previousPath = $user->getRawOriginal('profile_pic');

        $path = $request->file('photo')->store('avatars', config('filesystems.avatars_disk'));

        $user->update(['profile_pic' => $path]);

        if ($previousPath) {
            Storage::disk(config('filesystems.avatars_disk'))->delete($previousPath);
        }

        return response()->json($user);
    }
}
