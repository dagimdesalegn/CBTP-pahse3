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
            'phone' => [
                'nullable',
                'string',
                'max:32',
                // Ethiopian format: +251[79]xxxxxxxx, 0[79]xxxxxxxx, or [79]xxxxxxxx
                'regex:/^(\+251[79]\d{8}|0[79]\d{8}|[79]\d{8})$/'
            ],
        ]);

        $path = $request->file('kebele_id_image')->store('verification-ids', 'public');

        $updateData = [
            'kebele_id' => $validated['kebele_id'],
            'coupon_id' => $validated['coupon_id'],
            'kebele_id_image_path' => $path,
            'verification_submitted_at' => now(),
            'is_verified' => false,
        ];

        if (!empty($validated['phone'])) {
            $updateData['phone'] = $validated['phone'];
        }

        $user->update($updateData);

        // Send response immediately, notification fires after response sent
        $response = response()->json([
            'message' => 'Verification submitted successfully',
            'user' => $user,
        ]);

        // Queue notification to run after response is sent
        app()->terminating(function () use ($user) {
            try {
                NotificationService::notifyNewUserRegistration($user);
            } catch (\Exception $e) {
                \Log::error('Notification send failed: ' . $e->getMessage());
            }
        });

        return $response;
    }
}
