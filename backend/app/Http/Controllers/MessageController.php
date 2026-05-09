<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function recipients(Request $request)
    {
        $user = $request->user();

        $query = User::query()
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'role');

        if ($user->role === 'member') {
            $query->whereIn('role', ['admin', 'manager']);
        }

        return response()->json($query->orderBy('role')->orderBy('name')->get());
    }

    public function inbox(Request $request)
    {
        $messages = Message::with('sender:id,name,email,role')
            ->where('recipient_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($messages);
    }

    public function sent(Request $request)
    {
        $messages = Message::with('recipient:id,name,email,role')
            ->where('sender_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $sender = $request->user();

        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string|max:5000',
        ]);

        $recipient = User::findOrFail($validated['recipient_id']);

        if ($sender->role === 'member' && !in_array($recipient->role, ['admin', 'manager'], true)) {
            return response()->json(['error' => 'Members can message only staff accounts'], 403);
        }

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'subject' => $validated['subject'] ?? null,
            'content' => $validated['content'],
        ])->load('recipient:id,name,email,role');

        return response()->json([
            'message' => 'Message sent',
            'data' => $message,
        ], 201);
    }

    public function markRead(Request $request, $id)
    {
        $message = Message::where('recipient_id', $request->user()->id)->findOrFail($id);

        if (!$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json($message->load('sender:id,name,email,role'));
    }
}
