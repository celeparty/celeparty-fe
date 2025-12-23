// components/ticket-templates/interfaces.ts

export interface StrapiEntity<T> {
	id: number;
	attributes: T;
}

export interface TicketProduct {
	name: string;
	description: string;
	date: string;
	location: string;
	// Add other product fields as needed
}

export interface TransactionTicket {
	order_id: string;
	total_price: number;
	payment_method: string;
	// Add other transaction fields as needed
}

export interface User {
	username: string;
	email: string;
	// Add other user fields as needed
}

export interface TicketData {
	ticket_code: string;
	barcode_url: string;
	recipient_name: string;
	recipient_email: string;
	recipient_whatsapp?: string;
	id_type?: string;
	id_number?: string;
	createdAt: string;
	ticket_product: StrapiEntity<TicketProduct>;
	transaction_ticket: StrapiEntity<TransactionTicket>;
	user?: StrapiEntity<User>;
}
export interface iTicketTemplateConfig {
  logo_url: string;
  company_name: string;
  company_slogan?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;

  contact_info: {
    phone: string;
    email?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    facebook?: string;
  };

  primary_color: string;
  accent_color: string;
  text_color: string;

  show_qr_code: boolean;
  show_footer_line: boolean;
  show_social_media: boolean;
  footer_message?: string;

  paper_width: number;
  paper_height: number;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
}