import { iProductImage } from "@/lib/interfaces/iProduct";
import { useRef } from "react";

interface FileUploaderProps {
	image: iProductImage;
	onFileChange: (file: File | null) => void;
	onRemove: () => void;
}

export const FileUploader = ({ image, onFileChange, onRemove }: FileUploaderProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const getImageSrc = (url?: string) => {
		if (!url) return "";
		// already absolute or blob
		if (url.startsWith("http") || url.startsWith("blob:")) return url;
		// determine public strapi/base url (client-side env)
		const publicBase = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NEXT_PUBLIC_BASE_API || "").replace(/\/(api\/?)?$/, "");
		if (url.startsWith("/")) {
			if (publicBase) return `${publicBase}${url}`;
			return url;
		}
		return publicBase ? `${publicBase}/${url}` : url;
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		onFileChange(file);
	};

	const triggerFileInput = () => {
		inputRef.current?.click();
	};

	return (
		<div className="border rounded-lg p-4 relative">
			{image.url ? (
				<>
					<img src={getImageSrc(image.url)} alt="Product preview" className="w-full h-32 object-contain" />
				</>
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
			<button
				type="button"
				onClick={onRemove}
				className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6"
			>
				&times;
			</button>
		</div>
	);
};
