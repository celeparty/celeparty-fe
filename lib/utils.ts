import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export async function fetchAndConvertToFile(imageData: any): Promise<File> {
  // Ensure URL is complete (prepend domain if needed)
  const fullUrl = imageData.url.startsWith("/uploads")
    ? imageData.url
    : `${process.env.BASE_API}${imageData.url}`;

  const response = await fetch(fullUrl);
  const blob = await response.blob();

  const file = new File(
    [blob],
    imageData.name || "image", // Fallback name if none
    { type: imageData.mime || blob.type || "application/octet-stream" }
  );

  return file;
}
