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
    public function storeMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $chat = $request->chat_id
            ? Chats::find($request->chat_id)
            : Chats::create([
                'user_id' => Auth::id(),
                'title' => mb_substr($request->message, 0, 60),
            ]);

        // Save user message first
        $userMessage = new Message();
        $userMessage->chat_id = $chat->id;
        $userMessage->user_id = Auth::id();
        $userMessage->message_type = 'text';
        $userMessage->sender_type = 'user';
        $userMessage->content = $request->message;
        $userMessage->save();

        // Prepare media content here
        $mediaContent = [];
        if ($request->images) {
            $mediaContent = collect($request->images)->map(function ($url) {
                return [
                    'type' => 'image_url',
                    'image_url' => [
                        'url' => $url,
                    ],
                ];
            })->toArray();
        }

        return new StreamedResponse(function () use ($request, $chat, $mediaContent) {
            $fullResponse = '';

            try {
                $response = OpenAI::chat()->createStreamed([
                    'model' => 'gpt-4o',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "You are ChatGPT. Always respond in **Markdown**."
                        ],
                        [
                            'role' => 'user',
                            'content' => array_merge(
                                [['type' => 'text', 'text' => $request->message]],
                                $mediaContent
                            )
                        ]
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

                // Save AI response after streaming
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
                error_log('OpenAI stream error: ' . $e->getMessage());
                echo "data: " . json_encode(['error' => "Something went wrong: {$e->getMessage()}"]) . "\n\n";
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
            'message' => 'This is a test message',
        ], 500);
        $files = $request->file('images'); // This will be an array of UploadedFile

        return response()->json([
            'count' => count($files),
            'filenames' => collect($files)->map(fn($file) => $file->getClientOriginalName()),
            'mime_types' => collect($files)->map(fn($file) => $file->getMimeType()),
            'sizes_kb' => collect($files)->map(fn($file) => round($file->getSize() / 1024, 2) . ' KB'),
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
