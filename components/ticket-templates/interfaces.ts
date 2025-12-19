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
	user: StrapiEntity<User>;
}