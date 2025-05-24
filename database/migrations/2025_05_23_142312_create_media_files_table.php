<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();

            // User who uploaded it (NOT NULL)
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete(); // When user is deleted, delete their files

            // File info
            $table->string('type'); // 'image', 'video', etc.
            $table->string('path'); // 'media/xyz123.jpg'
            $table->string('mime_type'); // 'image/png'
            $table->unsignedBigInteger('size'); // In bytes
            $table->string('hash'); // SHA256 file hash

            // Optional
            $table->string('title')->nullable();
            $table->boolean('is_public')->default(false);
            $table->json('meta')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};
