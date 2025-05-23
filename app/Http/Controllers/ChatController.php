<?php

namespace App\Http\Controllers;

use App\Models\Chats;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Services\ChatGPTService;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;
use OpenAI\Laravel\Facades\OpenAI;

class ChatController extends Controller
{
    // public function storeMessage(Request $request, ChatGPTService $chatGPT)
    // {
    //     $request->validate([
    //         'message' => 'required|string',
    //         'chat_id' => 'nullable|exists:chats,id',
    //         'images.*' => 'nullable|image|max:2048', // validate each image
    //     ]);

    //     $chat = $request->chat_id
    //         ? Chats::find($request->chat_id)
    //         : Chats::create(['user_id' => Auth::user()->id, 'title' => mb_substr($request->message, 0, 60)]);

    //     $imagePaths = [];

    //     if ($request->hasFile('images')) {
    //         foreach ($request->file('images') as $image) {
    //             $path = $image->store('chat_images', 'public');
    //             $imagePaths[] = '/storage/' . $path;
    //         }
    //     }

    //     $message = new Message();
    //     $message->chat_id = $chat->id;
    //     $message->user_id = Auth::user()->id;
    //     $message->message_type = 'text';
    //     $message->sender_type = 'user';
    //     $message->content = $request->message;
    //     $message->save();

    //     $response = $chatGPT->ask($request->message); // returns full OpenAI response
    //     $aiReply = $response->choices[0]->message->content ?? 'No response from AI.';

    //     // 5. Save AI message
    //     $aiMessage = new Message();
    //     $aiMessage->chat_id = $chat->id;
    //     $aiMessage->user_id = null; // or system ID
    //     $aiMessage->message_type = 'text';
    //     $aiMessage->sender_type = 'ai';
    //     $aiMessage->content = $aiReply;
    //     $aiMessage->save();


    //     return response()->json([
    //         'chat_id' => $chat->id,
    //         'message' => $aiMessage->content,
    //     ]);
    // }

    public function storeMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'chat_id' => 'nullable|exists:chats,id',
            'images.*' => 'nullable|image|max:2048',
        ]);

        $chat = $request->chat_id
            ? Chats::find($request->chat_id)
            : Chats::create([
                'user_id' => Auth::id(),
                'title' => mb_substr($request->message, 0, 60),
            ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('chat_images', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        // Save user's message
        $userMessage = new Message();
        $userMessage->chat_id = $chat->id;
        $userMessage->user_id = Auth::id();
        $userMessage->message_type = 'text';
        $userMessage->sender_type = 'user';
        $userMessage->content = $request->message;
        $userMessage->save();

        // AI streaming response
        return new StreamedResponse(function () use ($request, $chat) {
            $fullResponse = '';

            try {
                $response = OpenAI::chat()->createStreamed([
                    'model' => 'gpt-4.1', // or 'gpt-4' or 'gpt-4o'
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "You are ChatGPT, a large language model trained by OpenAI. Always respond in **Markdown format**. Use headings, lists, code blocks, bold, italics, and everything Markdown to make your replies clear and readable. Stay conversational and helpful."
                        ],
                        ['role' => 'user', 'content' => $request->message],
                    ],
                    'stream' => true,
                ]);

                foreach ($response as $chunk) {
                    $content = $chunk->choices[0]->delta->content ?? '';
                    if ($content !== '') {
                        $fullResponse .= $content;

                        echo $content;
                        ob_flush();
                        flush();
                    }

                    if (connection_aborted()) {
                        break;
                    }
                }

                // Save AI response after stream
                if (!empty($fullResponse)) {
                    $aiMessage = new Message();
                    $aiMessage->chat_id = $chat->id;
                    $aiMessage->user_id = null;
                    $aiMessage->message_type = 'text';
                    $aiMessage->sender_type = 'ai';
                    $aiMessage->content = $fullResponse;
                    $aiMessage->save();
                }
            } catch (\Exception $e) {
                echo "data: " . json_encode(['error' => 'Something went wrong while streaming.']) . "\n\n";
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }


    public function streamMessage(Request $request)
    {
        return response()->json([
            'message' => $request->all(),
        ]);
        $text = "Yo this is a test stream, coming at you live word by word. Ain’t this cool or what?";
        $words = explode(" ", $text);

        return response()->stream(function () use ($words) {
            foreach ($words as $word) {
                echo $word . ' ';
                ob_flush();
                flush();
                usleep(100_000); // 100ms delay
            }
        }, 200, [
            "Content-Type" => "text/event-stream",
            "Cache-Control" => "no-cache",
            "Connection" => "keep-alive",
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
