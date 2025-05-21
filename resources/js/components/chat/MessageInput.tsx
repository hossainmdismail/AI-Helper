import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import ImageUploader from "@/components/chat/ImageUploader"; // You must have this
import clsx from "clsx";

interface Props {
  onSend: (message: string, images?: File[]) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && images.length === 0) return;

    setProcessing(true);
    onSend(message, images);
    setMessage("");
    setImages([]);
    setProcessing(false);
  };

  const handleImageUpload = (files: File[]) => {
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 pt-0">
      <div className="px-4 py-4 border border-gray-200 shadow-md w-full rounded-2xl bg-white">
        {/* Image Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
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
