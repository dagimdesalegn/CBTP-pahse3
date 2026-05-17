<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
        $frontendUrl = rtrim(config('app.app.frontend_url', config('app.app.url')), '/');

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

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if ($user) {
            $plainToken = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($plainToken),
                    'created_at' => now(),
                ]
            );

            $frontendUrl = rtrim(config('app.app.frontend_url', config('app.app.url')), '/');
            $resetUrl = $frontendUrl . '/reset-password?token=' . urlencode($plainToken) . '&email=' . urlencode($email);

            try {
                Http::withToken(config('services.resend.api_key'))
                    ->withHeaders([
                        'User-Agent' => 'Shemachoch/1.0 (+https://shemachoch.tech)',
                    ])
                    ->acceptJson()
                    ->post('https://api.resend.com/emails', [
                        'from' => config('services.resend.from'),
                        'to' => [$email],
                        'subject' => 'Reset your Shemachoch password',
                        'html' => view('emails.password-reset', [
                            'name' => $user->name,
                            'resetUrl' => $resetUrl,
                        ])->render(),
                    ])
                    ->throw();
            } catch (\Throwable $e) {
                Log::error('Password reset email failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'If an account exists for this email, a password reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = strtolower(trim($validated['email']));
        $reset = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (
            !$reset ||
            !Hash::check($validated['token'], $reset->token) ||
            Carbon::parse($reset->created_at)->lt(now()->subMinutes(60))
        ) {
            return response()->json([
                'message' => 'This password reset link is invalid or expired.',
                'errors' => [
                    'token' => ['This password reset link is invalid or expired.'],
                ],
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'This password reset link is invalid or expired.',
                'errors' => [
                    'email' => ['This password reset link is invalid or expired.'],
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. Please sign in with your new password.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $deletedMarker = 'deleted-' . $user->id . '-' . Str::uuid();
        $verificationFiles = array_filter([
            $user->kebele_id_image_path,
            $user->coupon_id_image_path,
        ]);

        $user->tokens()->delete();
        $user->forceFill([
            'name' => 'Deleted User',
            'email' => $deletedMarker . '@deleted.local',
            'phone' => null,
            'kebele_id' => $deletedMarker,
            'kebele_id_image_path' => null,
            'coupon_id_image_path' => null,
            'coupon_id' => null,
            'verification_submitted_at' => null,
            'verification_region' => null,
            'verification_city' => null,
            'verification_woreda_subcity' => null,
            'verification_kebele' => null,
            'telegram_id' => null,
            'google_id' => null,
            'avatar_url' => null,
            'password' => Hash::make(Str::random(32)),
            'is_verified' => false,
        ])->save();

        foreach ($verificationFiles as $path) {
            Storage::disk('public')->delete($path);
        }

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
