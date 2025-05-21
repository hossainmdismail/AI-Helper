<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    //
    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
