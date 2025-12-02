/**
 * Utility Helper Functions untuk Ticket Template
 * Fungsi-fungsi pembantu untuk manipulasi tiket
 */

import { iTicketTemplateData, iTicketTemplateConfig } from '@/components/ticket-templates/interfaces';

/**
 * Format ticket data dari API response
 * Mengkonversi data dari backend ke format yang dibutuhkan template
 */
export const formatTicketDataFromAPI = (apiData: any): iTicketTemplateData => {
	return {
		product_title: apiData.product?.title || apiData.product_title || '',
		product_description: apiData.product?.description || apiData.product_description || '',
		event_date: apiData.product?.event_date || apiData.event_date || '',
		event_location: apiData.product?.kota || apiData.event_location || '',

		ticket_code: apiData.ticket_code || '',
		variant_name: apiData.variant?.name || apiData.variant_name || '',
		ticket_type: apiData.ticket_type || 'Standard',

		recipient_name: apiData.recipient_name || '',
		recipient_email: apiData.recipient_email || '',
		recipient_phone: apiData.recipient_phone || '',
		recipient_identity_type: apiData.recipient_identity_type || '',
		recipient_identity_number: apiData.recipient_identity_number || '',

		qr_code_data: apiData.ticket_code || apiData.qr_code_data || '',
		qr_code_image: apiData.qr_code_image || undefined,

		generated_date: new Date(),
		purchase_date: apiData.purchase_date ? new Date(apiData.purchase_date) : undefined,
		ticket_validity_date: apiData.ticket_validity_date || '',
	};
};

/**
 * Validate ticket data
 * Memastikan data tiket memiliki informasi yang lengkap
 */
export const validateTicketData = (data: iTicketTemplateData): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!data.product_title) errors.push('Product title is required');
	if (!data.ticket_code) errors.push('Ticket code is required');
	if (!data.recipient_name) errors.push('Recipient name is required');
	if (!data.recipient_email) errors.push('Recipient email is required');
	if (!data.recipient_phone) errors.push('Recipient phone is required');
	if (!data.qr_code_data) errors.push('QR code data is required');

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Generate sample ticket data untuk testing
 * Berguna untuk preview template
 */
export const generateSampleTicketData = (): iTicketTemplateData => {
	return {
		product_title: 'Concert - The Grand Performance',
		product_description: 'Konser musik live dengan artis-artis ternama. Durasi 4 jam dengan berbagai genre musik. Tersedia free snacks dan beverages.',
		event_date: new Date(2024, 11, 15).toISOString(),
		event_location: 'Jakarta Convention Center (JCC), Jakarta',

		ticket_code: 'TKT-20241215-001234',
		variant_name: 'VIP Front Row',
		ticket_type: 'Paid',

		recipient_name: 'John Doe',
		recipient_email: 'john.doe@example.com',
		recipient_phone: '+62 812-3456-7890',
		recipient_identity_type: 'KTP',
		recipient_identity_number: '3271234567890123',

		qr_code_data: 'TKT-20241215-001234|john.doe@example.com|verified',
		qr_code_image: undefined,

		generated_date: new Date(),
		purchase_date: new Date(2024, 10, 1),
		ticket_validity_date: '2024-12-15',
	};
};

/**
 * Generate sample template config
 */
export const generateSampleTemplateConfig = (): iTicketTemplateConfig => {
	return {
		logo_url: '/images/logo.png',
		company_name: 'CeleParty Events',
		company_slogan: 'Rayakan Momen Spesialmu dengan CeleParty',
		company_website: 'www.celeparty.com',
		company_phone: '+62 812-3456-7890',
		company_email: 'support@celeparty.com',

		contact_info: {
			phone: '+62 812-3456-7890',
			email: 'support@celeparty.com',
			instagram: 'celeparty.id',
			tiktok: 'celepartyid',
			whatsapp: '628123456789',
			facebook: 'celeparty.id',
		},

		primary_color: '#3E2882',
		accent_color: '#DA7E01',
		text_color: '#000000',

		show_qr_code: true,
		show_footer_line: true,
		show_social_media: true,
		footer_message: 'Terima kasih telah memilih CeleParty. Nikmati acara Anda!',

		paper_width: 21,
		paper_height: 29.7,
		margin_top: 1,
		margin_bottom: 1,
		margin_left: 1,
		margin_right: 1,
	};
};

/**
 * Check apakah logo bisa dimuat
 * Berguna untuk fallback jika logo tidak ada
 */
export const checkLogoAvailability = async (logoUrl?: string): Promise<boolean> => {
	if (!logoUrl) return false;

	try {
		const response = await fetch(logoUrl, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
};

/**
 * Sanitize filename untuk PDF
 * Menghapus karakter yang tidak valid
 */
export const sanitizeFilename = (filename: string): string => {
	return filename
		.replace(/[^a-z0-9_-]/gi, '_')
		.replace(/_+/g, '_')
		.toLowerCase();
};

/**
 * Format phone number untuk display
 * @param phone - Nomor telepon
 * @returns Nomor telepon yang sudah diformat
 */
export const formatPhoneNumber = (phone: string): string => {
	// Remove all non-digit characters
	const cleaned = phone.replace(/\D/g, '');

	// Format as Indonesian number
	if (cleaned.startsWith('62')) {
		return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
	}

	// Default formatting
	return phone;
};

/**
 * Merge multiple PDFs (memerlukan library tambahan jika digunakan)
 * Placeholder untuk future implementation
 */
export const mergePDFs = async (pdfBase64Array: string[]): Promise<string> => {
	// TODO: Implement PDF merging using pdf-lib or similar
	console.warn('PDF merging not yet implemented');
	return '';
};
