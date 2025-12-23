/**
 * Utility Helper Functions untuk Ticket Template
 */

import { TicketData, iTicketTemplateConfig } from '@/components/ticket-templates/interfaces';

/**
 * Format ticket data dari API response
 */
export const formatTicketDataFromAPI = (apiData: any): TicketData => {
	return {
		ticket_code: apiData.ticket_code,
		barcode_url: apiData.barcode_url,
		recipient_name: apiData.recipient_name,
		recipient_email: apiData.recipient_email,
		recipient_whatsapp: apiData.recipient_whatsapp,
		createdAt: apiData.createdAt,

		ticket_product: {
			id: apiData.product?.id ?? 0,
			attributes: {
				name: apiData.product?.title ?? '',
				description: apiData.product?.description ?? '',
				date: apiData.product?.event_date ?? '',
				location: apiData.product?.kota ?? '',
			},
		},

		transaction_ticket: {
			id: apiData.transaction?.id ?? 0,
			attributes: {
				order_id: apiData.transaction?.order_id ?? '',
				total_price: apiData.transaction?.total_price ?? 0,
				payment_method: apiData.transaction?.payment_method ?? '',
				varian: apiData.transaction?.varian ?? 'Regular',
			},
		},

		user: {
			id: apiData.user?.id ?? 0,
			attributes: {
				username: apiData.user?.username ?? '',
				email: apiData.user?.email ?? '',
			},
		},
	};
};

/**
 * Validate ticket data (VERSI BARU)
 */
export const validateTicketData = (data: TicketData) => {
	const errors: string[] = [];

	if (!data.ticket_product?.attributes?.name)
		errors.push('Product name is required');

	if (!data.ticket_code)
		errors.push('Ticket code is required');

	if (!data.recipient_name)
		errors.push('Recipient name is required');

	if (!data.recipient_email)
		errors.push('Recipient email is required');

	if (!data.barcode_url)
		errors.push('Barcode URL is required');

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Generate sample ticket data (SESUI INTERFACE)
 */
export const generateSampleTicketData = (): TicketData => {
	return {
		ticket_code: 'TKT-20241215-001234',
		barcode_url: 'https://api.celeparty.com/barcode/sample.png',
		recipient_name: 'John Doe',
		recipient_email: 'john.doe@example.com',
		recipient_whatsapp: '+6281234567890',
		createdAt: new Date().toISOString(),

		ticket_product: {
			id: 1,
			attributes: {
				name: 'Concert - The Grand Performance',
				description: 'Konser musik live dengan artis ternama',
				date: '2024-12-15',
				location: 'Jakarta Convention Center (JCC)',
			},
		},

		transaction_ticket: {
			id: 1,
			attributes: {
				order_id: 'ORDER-123456',
				total_price: 750000,
				payment_method: 'Midtrans',
				varian: 'VIP Front Row',
			},
		},

		user: {
			id: 1,
			attributes: {
				username: 'johndoe',
				email: 'john.doe@example.com',
			},
		},
	};
};

/**
 * Generate sample template config
 */
export const generateSampleTemplateConfig = (): iTicketTemplateConfig => ({
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
	footer_message: 'Terima kasih telah memilih CeleParty',

	paper_width: 21,
	paper_height: 29.7,
	margin_top: 1,
	margin_bottom: 1,
	margin_left: 1,
	margin_right: 1,
});
