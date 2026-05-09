<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\NotificationService;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function googleRedirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googleCallback()
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->away($frontendUrl . '/login?error=google');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        $avatarUrl = $googleUser->getAvatar();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'phone' => null,
                'kebele_id' => 'GOOGLE-' . $googleUser->getId(),
                'avatar_url' => $avatarUrl,
                'password' => Hash::make(Str::random(32)),
                'role' => 'member',
                'is_verified' => false,
            ]);

            NotificationService::notifyNewUserRegistration($user);
        } else {
            if (!$user->google_id) {
                $user->google_id = $googleUser->getId();
            }
            if (!$user->email) {
                $user->email = $googleUser->getEmail();
            }
            if ($avatarUrl && $user->avatar_url !== $avatarUrl) {
                $user->avatar_url = $avatarUrl;
            }
            $user->save();
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return redirect()->away($frontendUrl . '/auth/google/callback?token=' . urlencode($token));
    }
    public function register(Request $request)
    {
        $kebeleId = trim((string) $request->input('kebele_id'));
        if ($kebeleId === '') {
            $kebeleId = 'PENDING-' . (string) Str::uuid();
        }

        $request->merge([
            'name' => trim((string) $request->input('name')),
            'email' => trim((string) $request->input('email')),
            'kebele_id' => $kebeleId,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'kebele_id' => 'required|string|unique:users,kebele_id',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'kebele_id' => $validated['kebele_id'],
            'password' => Hash::make($validated['password']),
            'role' => 'member',
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

    // Notify admins of new registration
    NotificationService::notifyNewUserRegistration($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge([
            'email' => trim((string) $request->input('email')),
        ]);

        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'error' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
