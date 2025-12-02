/**
 * Interfaces untuk Ticket Template System
 * Mendefinisikan struktur data untuk ticket dan template configuration
 */

export interface iTicketTemplateData {
	// Informasi Produk
	product_title: string;
	product_description?: string;
	event_date?: string;
	event_location?: string;
	
	// Informasi Tiket
	ticket_code: string;
	variant_name: string;
	ticket_type?: string;
	
	// Informasi Penerima
	recipient_name: string;
	recipient_email: string;
	recipient_phone: string;
	recipient_identity_type?: string; // KTP, Paspor, dll
	recipient_identity_number?: string;
	
	// QR Code
	qr_code_data: string; // Data untuk generate QR code
	qr_code_image?: string; // Base64 encoded QR code image
	
	// Metadata
	generated_date: Date;
	purchase_date?: Date;
	ticket_validity_date?: string; // Format: YYYY-MM-DD
}

export interface iTicketTemplateConfig {
	// Company/Event Info
	logo_url?: string;
	logo_base64?: string;
	company_name: string;
	company_slogan?: string;
	company_website?: string;
	company_phone: string;
	company_email?: string;
	
	// Contact & Social Media
	contact_info: {
		phone: string;
		email?: string;
		instagram?: string;
		tiktok?: string;
		whatsapp?: string;
		facebook?: string;
	};
	
	// Styling
	primary_color?: string; // Hex color, default: #3E2882 (c-blue)
	accent_color?: string; // Hex color, default: #DA7E01 (c-orange)
	text_color?: string; // Hex color, default: #000000
	
	// Template Options
	show_qr_code: boolean;
	show_footer_line: boolean;
	show_social_media: boolean;
	footer_message?: string;
	
	// Paper Settings (for PDF)
	paper_width?: number; // cm, default: 21 (A4 width)
	paper_height?: number; // cm, default: 29.7 (A4 height)
	margin_top?: number; // cm
	margin_bottom?: number; // cm
	margin_left?: number; // cm
	margin_right?: number; // cm
}

export interface iPDFGenerateOptions {
	filename?: string;
	scale?: number; // Default: 2 (for better quality)
	quality?: number; // Default: 100 (jpeg quality 0-100)
	format?: 'A4' | 'letter' | 'custom';
	orientation?: 'portrait' | 'landscape';
	download?: boolean; // Auto download after generate
	returnBase64?: boolean; // Return base64 instead of downloading
}

export interface iTicketTemplateContext {
	data: iTicketTemplateData;
	config: iTicketTemplateConfig;
	className?: string;
}
