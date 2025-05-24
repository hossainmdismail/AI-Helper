import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import ImageUploader from "@/components/chat/ImageUploader";
import clsx from "clsx";

interface UploadedImage {
    file: File | null;
    url: string;
    serverPath: string;
    id: number;
    uploading?: boolean; // 🆕 add this
}



interface Props {
    onSend: (message: string, images?: string[]) => void;
}

export default function MessageInput({ onSend }: Props) {
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [processing, setProcessing] = useState(false);
    const [loadingPreviews, setLoadingPreviews] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() && images.length === 0) return;

        setProcessing(true);
        const imagePaths = images.map((img) => img.serverPath);
        onSend(message, imagePaths);
        setMessage("");
        setImages([]);
        setProcessing(false);
    };

    const handleImageUpload = async (files: File[]) => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

        // Create temporary preview placeholders
        const tempUploads: UploadedImage[] = files.map((file, i) => ({
            file,
            url: URL.createObjectURL(file),
            serverPath: "",
            id: Date.now() + i,
            uploading: true,
        }));

        // Add to image previews
        setImages((prev) => [...prev, ...tempUploads]);

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files[]", file));

            const res = await fetch("/medias/upload", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": token || "",
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const json = await res.json();

            const uploadedFiles = json.files.map((file: any) => ({
                file: null,
                url: file.path,
                serverPath: file.path,
                id: file.id,
            }));

            // Replace tempUploads with uploadedFiles
            setImages((prev) => {
                const withoutTemp = prev.filter((img) => !img.uploading);
                return [...withoutTemp, ...uploadedFiles];
            });
        } catch (err) {
            console.error("Upload failed", err);

            // Remove temp uploading images if upload fails
            setImages((prev) => prev.filter((img) => !img.uploading));
        }
    };


    const removeImage = async (index: number) => {
        const image = images[index];
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

        try {
            const res = await fetch(`/medias/${image.id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": token || "",
                    Accept: "application/json",
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            const updated = [...images];
            updated.splice(index, 1);
            setImages(updated);

        } catch (err) {
            const updated = [...images];
            updated.splice(index, 1);
            setImages(updated);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="w-full p-4 pt-0">
            <div className="px-4 py-4 border border-gray-200 shadow-md w-full rounded-2xl bg-white">
                {/* Image Preview */}
                {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {images.map((img, index) => {
                            const isPDF =
                                img.file?.type === "application/pdf" ||
                                img.url.toLowerCase().endsWith(".pdf");

                            return (
                                <div
                                    key={img.id}
                                    className="relative w-20 h-20 rounded overflow-hidden bg-gray-100 flex items-center justify-center text-xs"
                                >
                                    {img.uploading ? (
                                        <div className="text-gray-500 animate-pulse text-xs">Uploading...</div>
                                    ) : isPDF ? (
                                        <>
                                            <span className="text-gray-700 text-sm">📄 PDF</span>
                                            <a
                                                href={img.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute bottom-1 text-blue-600 underline text-xs"
                                            >
                                                View
                                            </a>
                                        </>
                                    ) : (
                                        <img
                                            src={img.url}
                                            alt={`preview-${index}`}
                                            className="object-cover w-full h-full rounded"
                                        />
                                    )}

                                    {!img.uploading && (
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-0 right-0 bg-black/50 text-white px-1 text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Message Input */}
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={2}
                    className="resize-none"
                />

                {/* Buttons */}
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
                                className={clsx("cursor-pointer", { "opacity-50": processing })}
                                disabled={processing || (!message.trim() && images.length === 0)}
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
