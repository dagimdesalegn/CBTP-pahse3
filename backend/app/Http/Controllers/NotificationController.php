<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        if ($notification->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification,
        ]);
    }

    public function markAllAsRead()
    {
        $user = auth()->user();

        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    public function broadcast(Request $request)
    {
        $this->authorize('broadcast', Notification::class);

        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $users = \App\Models\User::where('role', 'member')->get();

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'message' => $validated['message'],
            ]);
        }

        return response()->json([
            'message' => 'Broadcast sent to all members',
        ]);
    }
}
