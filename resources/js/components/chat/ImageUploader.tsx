import { useRef } from "react";
import { Plus } from "lucide-react";

interface Props {
  onChange: (files: File[]) => void;
}

export default function ImageUploader({ onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const imagesOnly = fileArray.filter((file) => file.type.startsWith("image/"));
    if (imagesOnly.length > 0) {
      onChange(imagesOnly);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="text-muted-foreground border p-1 rounded-md cursor-pointer hover:text-primary transition-colors"
        title="Upload image"
      >
        <Plus className="w-6 h-6" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
