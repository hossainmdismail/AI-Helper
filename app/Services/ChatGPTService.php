<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;

class ChatGPTService
{
    public function ask(string $prompt)
    {
        return OpenAI::chat()->create([
            'model' => 'gpt-4.1',
            'messages' => [
                ['role' => 'system', 'content' => 'You are ChatGPT, a large language model trained by OpenAI. Follow the user\'s instructions carefully. Respond conversationally.'],
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);
    }
}
