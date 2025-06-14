import { iProductImage } from "@/lib/interfaces/iProduct";
import { useRef } from "react";

interface FileUploaderProps {
  image: iProductImage;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
}

export const FileUploader = ({
  image,
  onFileChange,
  onRemove,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="border rounded-lg p-4">
      {image.url ? (
        <div className="relative">
          <img
            src={image.url}
            alt="Product preview"
            className="w-full h-32 object-contain"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="w-full h-32 border-2 border-dashed flex items-center justify-center cursor-pointer"
        >
          <span>Click to upload</span>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
