// Ticket Management Interfaces

export interface iTicketSummary {
	product_id: string;
	product_title: string;
	product_image: string;
	variants: iVariantSummary[];
	totalRevenue: number;
	totalTicketsSold: number;
}

export interface iVariantSummary {
	variant_id: string;
	variant_name: string;
	price: number;
	quota: number;
	sold: number;
	verified: number;
	remaining: number;
	soldPercentage: number;
	netIncome: number;
	systemFeePercentage: number;
}

export interface iTicketDetail {
	id: string;
	documentId: string;
	ticket_code: string;
	unique_token: string;
	product_title: string;
	variant_name: string;
	recipient_name: string;
	recipient_email: string;
	recipient_phone: string;
	recipient_identity_type: string;
	recipient_identity_number: string;
	purchase_date: string;
	payment_status: string; // "paid" | "bypass"
	verification_status: string; // "unverified" | "verified"
	verification_date?: string;
	verification_time?: string;
	used_at?: string;
	qr_code?: string;
}

export interface iTicketVerificationHistory {
	id: string;
	ticket_code: string;
	recipient_name: string;
	variant_name: string;
	verification_date: string;
	verification_time: string;
	verified_by?: string;
}

export interface iSendTicketRequest {
	product_id: string;
	variant_id: string;
	recipients: iTicketRecipient[];
	password: string;
}

export interface iTicketRecipient {
	name: string;
	email: string;
	phone: string;
	identity_type: string;
	identity_number: string;
}

export interface iSendTicketHistory {
	id: string;
	send_date: string;
	product_title: string;
	variant_name: string;
	recipient_count: number;
	recipients: iTicketRecipient[];
	sent_by: string;
}

export interface iTicketScanResult {
	success: boolean;
	ticket: iTicketDetail;
	message: string;
}

export interface iExportFilter {
	variant?: string;
	status?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface iExportFormat {
	format: "excel" | "pdf" | "csv";
	filename: string;
}
