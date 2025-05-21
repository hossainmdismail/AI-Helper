<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'message_type',
        'sender_type',
        'content',
    ];

    //
    public function chat()
    {
        return $this->belongsTo(Chats::class);
    }
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
