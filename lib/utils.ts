import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { iProductImage } from "./interfaces/iProduct";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(val);
};

export const formatNumberWithDots = (value: string | number): string => {
  const numberString = value.toString().replace(/\D/g, "");
  if (!numberString) return "";
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export async function fetchAndConvertToFile(
  imageData: iProductImage
): Promise<File> {
  try {
    let fullUrl = imageData.url;

    if (imageData.url.startsWith("/uploads")) {
      const cleanPath = imageData.url.startsWith("/")
        ? imageData.url.slice(1)
        : imageData.url;

      fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
    }
    const response = await fetch(fullUrl);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();

    const filename = imageData.url.split("/").pop() || `image-${Date.now()}`;
    const fileExtension = blob.type.split("/")[1] || "jpg";

    return new File([blob], `${filename}.${fileExtension}`, {
      type: blob.type || "image/jpeg",
    });
  } catch (error) {
    console.error("Failed to convert image to file:", error);
    throw error;
  }
}
