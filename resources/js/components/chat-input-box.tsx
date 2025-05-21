// components/ChatInputBox.tsx
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { ImageUploader } from "./ui/image-uploader";

type ChatInputBoxProps = {
    isNew?: boolean;
    chatId?: number | null;
    onSendMessage?: (message: string) => void; // 👈 new prop
};

export function ChatInputBox({ isNew = false, chatId = null, onSendMessage }: ChatInputBoxProps) {
    const { data, setData, post, processing, reset } = useForm({
        message: "",
        new: isNew,
        uuid: chatId,
    });

    const [uid, setUid] = useState();
    console.log(uid);


    const [images, setImages] = React.useState<File[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const message = data.message.trim();
        if (!message) return;

        // Instantly show message in chat before backend response
        onSendMessage?.(message); // 👈 pass message to parent

        // Send to Laravel (optional, you can remove this if fully SSE)
        post(route("chat.store"), {
            onSuccess: () => reset(),
        });
    };

    const handleImageUpload = (newFiles: File[]) => {
        setImages((prev) => [...prev, ...newFiles]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const copy = [...prev];
            copy.splice(index, 1);
            return copy;
        });
    };

    return (
        <form className="bg-white w-full p-4 pt-0 absolute bottom-0" onSubmit={handleSubmit}>
            <div className="px-4 py-4 border border-gray-200 shadow-md w-full rounded-2xl">
                {/* Image Preview */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((file, index) => (
                        <div key={index} className="relative w-20 h-20 rounded overflow-hidden">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                className="object-cover w-full h-full rounded"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-0 right-0 bg-black/50 text-white px-1 text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <Textarea
                    value={data.message}
                    onChange={(e) => setData("message", e.target.value)}
                    placeholder="Type your message here..."
                />

                <div className="flex justify-between items-center pt-4">
                    <ul className="flex gap-3 text-muted-foreground">
                        <li>
                            <ImageUploader onChange={handleImageUpload} />
                        </li>
                        <li>
                            <Button type="button" className="cursor-pointer" variant="outline">
                                Search
                            </Button>
                        </li>
                    </ul>

                    <ul className="flex gap-2">
                        <li>
                            <Button
                                type="submit"
                                className="cursor-pointer"
                                disabled={processing || !data.message.trim()}
                            >
                                <SendHorizonal className="w-4 h-4" />
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </form>
    );
}
