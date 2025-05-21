import React from "react";
import { Plus } from "lucide-react";

type ImageUploaderProps = {
  onChange: (files: File[]) => void;
};

export function ImageUploader({ onChange }: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    onChange(selected);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-9 h-9 flex items-center justify-center border border-gray-200 hover:bg-gray-300 rounded-md"
      >
        <Plus className="w-4 h-4 text-black dark:text-white" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </>
  );
}
