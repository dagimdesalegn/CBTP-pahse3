<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();
        $currentUser = $request->user();

        if ($currentUser->role === 'manager') {
            $query->where('role', 'member');
            $this->whereKebeleMatches($query, $currentUser->manager_kebele);
        }

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

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($users);
    }

    public function show($id)
    {
        $this->authorize('view', User::class);

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function updateAccess(Request $request, $id)
    {
        abort_unless($request->user()->hasAccess('users'), 403);

        $validated = $request->validate([
            'role' => 'nullable|in:member,manager,admin',
            'access_level' => 'nullable|in:super_admin,operations_admin,report_admin,support_admin',
            'membership_status' => 'nullable|in:active,suspended,inactive',
            'manager_kebele' => 'nullable|string|max:255',
        ]);

        $user = User::findOrFail($id);

        if (($validated['role'] ?? $user->role) !== 'manager') {
            $validated['manager_kebele'] = null;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User access updated',
            'user' => $user,
        ]);
    }

    public function verify(Request $request, $id)
    {
        $this->authorize('update', User::class);

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // normalize phone before validation (strip spaces and hyphens)
        if ($request->has('phone')) {
            $request->merge([
                'phone' => preg_replace('/[\s-]/', '', $request->input('phone')),
            ]);
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
            'verification_region' => 'required|string|max:255',
            'verification_city' => 'required|string|max:255',
            'verification_woreda_subcity' => 'required|string|max:255',
            'verification_kebele' => 'required|string|max:255',
            'kebele_id_image' => 'required|file|mimes:jpg,jpeg,png,webp,heic,heif,pdf|max:10240',
            'coupon_id_image' => 'required|file|mimes:jpg,jpeg,png,webp,heic,heif,pdf|max:10240',
            'phone' => [
                'nullable',
                'string',
                'max:32',
                // Ethiopian format: +251[79]xxxxxxxx, 0[79]xxxxxxxx, or [79]xxxxxxxx
                'regex:/^(\+251[79]\d{8}|0[79]\d{8}|[79]\d{8})$/'
            ],
        ]);

        $file = $request->file('kebele_id_image');
        if (!$file || !$file->isValid()) {
            return response()->json([
                'message' => 'The identity document failed to upload.',
                'errors' => [
                    'kebele_id_image' => ['The identity document failed to upload.'],
                ],
            ], 422);
        }

        $couponFile = $request->file('coupon_id_image');
        if (!$couponFile || !$couponFile->isValid()) {
            return response()->json([
                'message' => 'The coupon ID image failed to upload.',
                'errors' => [
                    'coupon_id_image' => ['The coupon ID image failed to upload.'],
                ],
            ], 422);
        }

        $path = $file->store('verification-ids', 'public');
        $couponPath = $couponFile->store('verification-coupons', 'public');

        $updateData = [
            'verification_region' => $validated['verification_region'],
            'verification_city' => $validated['verification_city'],
            'verification_woreda_subcity' => $validated['verification_woreda_subcity'],
            'verification_kebele' => $validated['verification_kebele'],
            'kebele_id_image_path' => $path,
            'coupon_id_image_path' => $couponPath,
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
                Log::error('Notification send failed: ' . $e->getMessage());
            }
        });

        return $response;
    }

    private function whereKebeleMatches($query, ?string $kebele): void
    {
        $normalized = $this->normalizeKebele($kebele);
        if (!$normalized) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->whereRaw("TRIM(REPLACE(LOWER(verification_kebele), ' kebele', '')) = ?", [$normalized]);
    }

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
