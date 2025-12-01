// Utility functions untuk Ticket Management

import { iTicketDetail, iExportFilter } from "@/lib/interfaces/iTicketManagement";

/**
 * Format revenue dengan system fee
 */
export const calculateNetIncome = (
	gross: number,
	systemFeePercentage: number = 5
): number => {
	const fee = (gross * systemFeePercentage) / 100;
	return gross - fee;
};

/**
 * Calculate sold percentage
 */
export const calculateSoldPercentage = (
	sold: number,
	quota: number
): number => {
	if (quota === 0) return 0;
	return (sold / quota) * 100;
};

/**
 * Format ticket data untuk export
 */
export const formatTicketForExport = (tickets: iTicketDetail[]) => {
	return tickets.map((ticket) => ({
		"Kode Tiket": ticket.ticket_code,
		"Nama Penerima": ticket.recipient_name,
		"Email": ticket.recipient_email,
		"No. Telepon": ticket.recipient_phone,
		"Tipe Identitas": ticket.recipient_identity_type,
		"No. Identitas": ticket.recipient_identity_number,
		"Produk": ticket.product_title,
		"Varian": ticket.variant_name,
		"Tanggal Pembelian": new Date(ticket.purchase_date).toLocaleDateString(
			"id-ID"
		),
		"Status Pembayaran": ticket.payment_status === "paid" ? "Dibayar" : "Bypass",
		"Status Verifikasi":
			ticket.verification_status === "verified" ? "Terverifikasi" : "Belum",
		"Tanggal Verifikasi": ticket.verification_date
			? new Date(ticket.verification_date).toLocaleDateString("id-ID")
			: "-",
		"Waktu Verifikasi": ticket.verification_time || "-",
	}));
};

/**
 * Generate QR code data untuk tiket
 */
export const generateTicketQRData = (
	ticketId: string,
	uniqueToken: string
): string => {
	return JSON.stringify({
		ticketId,
		token: uniqueToken,
		timestamp: new Date().toISOString(),
	});
};

/**
 * Validate recipient data
 */
export const validateRecipientData = (
	name: string,
	email: string,
	phone: string,
	identityNumber: string
): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!name || name.trim().length === 0) {
		errors.push("Nama penerima harus diisi");
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email || !emailRegex.test(email)) {
		errors.push("Email tidak valid");
	}

	const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
	if (!phone || !phoneRegex.test(phone)) {
		errors.push("Nomor telepon tidak valid");
	}

	if (!identityNumber || identityNumber.trim().length === 0) {
		errors.push("Nomor identitas harus diisi");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Format verification history untuk display
 */
export const formatVerificationTime = (date: string, time: string): string => {
	try {
		const fullDateTime = new Date(`${date}T${time}`);
		return fullDateTime.toLocaleString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	} catch {
		return "-";
	}
};

/**
 * Generate ticket code
 */
export const generateTicketCode = (productId: string, index: number): string => {
	const timestamp = Date.now().toString().slice(-6);
	const randomNum = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, "0");
	return `TKT-${productId.toUpperCase().slice(0, 3)}-${timestamp}-${randomNum}`;
};
