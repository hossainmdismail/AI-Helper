<?php

namespace App\Http\Controllers;

use App\Models\Chats;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Services\ChatGPTService;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function storeMessage(Request $request, ChatGPTService $chatGPT)
    {
        $request->validate([
            'message' => 'required|string',
            'chat_id' => 'nullable|exists:chats,id',
            'images.*' => 'nullable|image|max:2048', // validate each image
        ]);

        $chat = $request->chat_id
            ? Chats::find($request->chat_id)
            : Chats::create(['user_id' => Auth::user()->id, 'title' => mb_substr($request->message, 0, 60)]);

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('chat_images', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $message = new Message();
        $message->chat_id = $chat->id;
        $message->user_id = Auth::user()->id;
        $message->message_type = 'text';
        $message->sender_type = 'user';
        $message->content = $request->message;
        $message->save();

        $response = $chatGPT->ask($request->message); // returns full OpenAI response
        $aiReply = $response->choices[0]->message->content ?? 'No response from AI.';

        // 5. Save AI message
        $aiMessage = new Message();
        $aiMessage->chat_id = $chat->id;
        $aiMessage->user_id = null; // or system ID
        $aiMessage->message_type = 'text';
        $aiMessage->sender_type = 'ai';
        $aiMessage->content = $aiReply;
        $aiMessage->save();


        return response()->json([
            'chat_id' => $chat->id,
            'message' => $aiMessage->content,
        ]);
    }


    public function getChatMessages($chatId)
    {
        $messages = Message::where('chat_id', $chatId)->with('user')->get();

        return response()->json([
            'messages' => $messages
        ]);
    }

    public function getChatList()
    {
        $chats = Chats::where('user_id', Auth::user()->id)
            ->latest()
            ->get();

        return response()->json($chats);
    }
}
