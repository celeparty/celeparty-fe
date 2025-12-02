/**
 * Utility untuk Default Template Configuration
 * Menyediakan default config untuk template tiket
 */

import { iTicketTemplateConfig } from '@/components/ticket-templates/interfaces';

/**
 * Get default template configuration
 * Menggunakan warna primary dan accent dari design system
 */
export const getDefaultTemplateConfig = (): iTicketTemplateConfig => {
	return {
		// Company/Event Info
		logo_url: '/images/logo.png', // Pastikan logo ada di public/images/
		company_name: 'CeleParty',
		company_slogan: 'Rayakan Momen Spesialmu dengan CeleParty',
		company_website: 'www.celeparty.com',
		company_phone: '+62 812-3456-7890',
		company_email: 'info@celeparty.com',

		// Contact & Social Media
		contact_info: {
			phone: '+62 812-3456-7890',
			email: 'info@celeparty.com',
			instagram: 'celeparty.id',
			tiktok: 'celepartyid',
			whatsapp: '628123456789',
			facebook: 'celeparty.id',
		},

		// Styling - menggunakan warna dari Tailwind config
		primary_color: '#3E2882', // c-blue
		accent_color: '#DA7E01', // c-orange
		text_color: '#000000',

		// Template Options
		show_qr_code: true,
		show_footer_line: true,
		show_social_media: true,
		footer_message: 'Terima kasih telah memilih CeleParty. Nikmati acara Anda!',

		// Paper Settings
		paper_width: 21, // A4 width
		paper_height: 29.7, // A4 height
		margin_top: 1,
		margin_bottom: 1,
		margin_left: 1,
		margin_right: 1,
	};
};

/**
 * Merge custom config dengan default config
 * @param customConfig - Custom configuration
 * @returns Merged configuration
 */
export const mergeTemplateConfig = (
	customConfig?: Partial<iTicketTemplateConfig>
): iTicketTemplateConfig => {
	const defaultConfig = getDefaultTemplateConfig();

	if (!customConfig) {
		return defaultConfig;
	}

	return {
		...defaultConfig,
		...customConfig,
		contact_info: {
			...defaultConfig.contact_info,
			...(customConfig.contact_info || {}),
		},
	};
};

/**
 * Validate template config
 * Memastikan config memiliki field yang diperlukan
 */
export const validateTemplateConfig = (config: iTicketTemplateConfig): boolean => {
	// Required fields
	if (!config.company_name || !config.contact_info.phone) {
		console.warn('Template config missing required fields: company_name, contact_info.phone');
		return false;
	}

	return true;
};

/**
 * Get config untuk branding custom
 * Digunakan untuk event atau vendor spesifik
 */
export const getCustomBrandingConfig = (
	branding?: Partial<iTicketTemplateConfig>
): iTicketTemplateConfig => {
	return mergeTemplateConfig({
		...branding,
	});
};
