<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Validation\Rule;

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
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('kebele_id', 'like', '%' . $request->search . '%');
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

    public function submitVerification(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'member') {
            return response()->json(['error' => 'Only members can submit verification'], 403);
        }

        $validated = $request->validate([
            'kebele_id' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'kebele_id')->ignore($user->id),
            ],
            'coupon_id' => 'required|string|max:255',
            'kebele_id_image' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('kebele_id_image')->store('verification-ids', 'public');

        $user->update([
            'kebele_id' => $validated['kebele_id'],
            'coupon_id' => $validated['coupon_id'],
            'kebele_id_image_path' => $path,
            'verification_submitted_at' => now(),
            'is_verified' => false,
        ]);

        NotificationService::notifyNewUserRegistration($user);

        return response()->json([
            'message' => 'Verification submitted successfully',
            'user' => $user,
        ]);
    }
}
