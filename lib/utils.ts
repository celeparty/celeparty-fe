import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import { iMerchantProfile } from "./interfaces/iMerchant";
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
	const numberString = value?.toString().replace(/\D/g, "");
	if (!numberString) return "";
	return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export async function fetchAndConvertToFile(imageData: iProductImage): Promise<File> {
	try {
		if (!imageData.url) {
			throw new Error("Image URL is undefined");
		}
		let fullUrl = imageData.url;

		if (imageData.url.startsWith("/uploads")) {
			const cleanPath = imageData.url.startsWith("/") ? imageData.url.slice(1) : imageData.url;

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

export const formatMoneyReq = (price: string | number) => {
	const formattedPrice = parseInt(String(price).replace(/\./g, ""));
	return formattedPrice;
};

export const sanitizeVendorData = (formData: iMerchantProfile) => {
	const { role, password, resetPasswordToken, confirmationToken, ...cleanData } = formData;
	return cleanData;
};

export const formatDate = (isoString: string) => {
	try {
		const date = parseISO(isoString);
		// Use Indonesian date format
		const day = String(date.getDate()).padStart(2, "0");
		const monthIndex = date.getMonth();
		const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
		                "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
		const month = months[monthIndex];
		const year = date.getFullYear();
		return `${day} ${month} ${year}`;
	} catch {
		return ""; // Return empty string if parsing fails
	}
};
