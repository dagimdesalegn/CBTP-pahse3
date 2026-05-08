<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Services\NotificationService;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate(20);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function verify(Request $request, $id)
    {
        $this->authorize('update', User::class);

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'is_verified' => 'required|boolean',
        ]);

        $user->update($validated);

           // Notify member if just verified
           if ($validated['is_verified'] && $user->wasChanged('is_verified')) {
               NotificationService::notifyRegistrationApproved($user);
           }

        return response()->json([
            'message' => 'User verification status updated',
            'user' => $user,
        ]);
    }

    public function linkTelegram(Request $request, $id)
    {
        $validated = $request->validate([
            'telegram_id' => 'required|string',
        ]);

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update(['telegram_id' => $validated['telegram_id']]);

        return response()->json([
            'message' => 'Telegram account linked',
            'user' => $user,
        ]);
    }
}
