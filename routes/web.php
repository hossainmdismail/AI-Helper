<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MediaFileController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('assignment', function () {
        return Inertia::render('assignment/generator');
    })->name('assignment');
    Route::post('/chat/store', [ChatController::class, 'store'])->name('chat.store');

    route::get('chat', function () {
        return Inertia::render('chat/chatbook');
    })->name('chat');
    route::get('chatapp', function () {
        return Inertia::render('chat/chatapp');
    })->name('chatapp');

    Route::post('/chatapp/stream', [ChatController::class, 'storeMessage']);
    Route::get('/chatapp/history', [ChatController::class, 'getChatList']);
    Route::get('/chatapp/messages/{chat}', [ChatController::class, 'getChatMessages']);

    // Media File Upload
    Route::post('/medias/upload', [MediaFileController::class, 'store'])
        ->name('medias.upload');
    Route::delete('/medias/{media}', [MediaFileController::class, 'destroy'])->name('medias.destroy');
});



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
