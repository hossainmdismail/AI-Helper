<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MediaFileController extends Controller
{
    /**
     * Store a newly uploaded media file.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|mimes:jpeg,png,jpg,webp,gif,pdf|max:20480', // 20MB
        ]);

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            if (!$file->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => "{$file->getClientOriginalName()} is not valid.",
                ], 422);
            }

            $fileContent = file_get_contents($file->getRealPath());
            $hash = hash('sha256', $fileContent);


            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Upload using Laravel’s clean API
            $path = $file->storeAs('media', $filename, 's3');
            // Generate public URL
            $url = Storage::disk('s3')->url($path);
            if ($path) {
                $media = MediaFile::create([
                    'user_id'   => Auth::id(),
                    'type'      => explode('/', $file->getMimeType())[0],
                    'path'      => $path,
                    'mime_type' => $file->getMimeType(),
                    'size'      => $file->getSize(),
                    'hash'      => $hash,
                    'title'     => $request->title ?? $file->getClientOriginalName(),
                    'meta'      => json_encode([
                        'original_name' => $file->getClientOriginalName(),
                        'extension'     => $file->getClientOriginalExtension(),
                    ]),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Failed to upload {$file->getClientOriginalName()}",
                ], 500);
            }

            $uploadedFiles[] = [
                'id' => $media->id,
                'path' => $url,
                'url' => $url,
            ];
        }

        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
        ]);
    }


    public function destroy(MediaFile $media)
    {
        if ($media->user_id != Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete from S3 disk, check if file exists first
        if (Storage::disk('s3')->exists($media->path)) {
            Storage::disk('s3')->delete($media->path);
        }

        // Delete record from DB
        $media->delete();

        return response()->json(['success' => true]);
    }
}
