export interface iProduct {
	id: number;
	title: string;
}

export type PaymentStatus = "cancelled" | "pending" | "paid" | "processing" | "settlement";

export type TransactionType = "equipment" | "ticket";

// Unified transaction interface that can handle both equipment and ticket transactions
export interface iOrder {
	id: number;
	documentId: string;
	payment_status: PaymentStatus;
	transaction_type: TransactionType;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	order_id: string;
	email: string;
	customer_name: string;
	telp: string;
	note: string;
	event_type: string | null;
	vendor_doc_id: string;

	// Equipment-specific fields
	variant?: string;
	quantity?: number;
	shipping_location?: string;
	event_date?: string;
	loading_date?: string;
	loading_time?: string;
	products?: iProduct[];
	verification?: string | null;

	// Ticket-specific fields
	product_name?: string;
	price?: string;
	total_price?: string;
	customer_mail?: string;
	verification_ticket?: boolean;
	vendor_id?: string;
	waktu_event?: string;
	recipients?: any[];
}

// Legacy interfaces for backward compatibility
export interface iOrderItem extends iOrder {
	transaction_type: "equipment";
	variant: string;
	quantity: number;
	shipping_location: string;
	event_date: string;
	loading_date: string;
	loading_time: string;
	products: iProduct[];
	verification: string | null;
}

export interface iOrderTicket {
	id: number;
	documentId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	product_name: string;
	price: string;
	quantity: string;
	variant: string;
	customer_name: string;
	telp: string;
	total_price: string;
	payment_status: PaymentStatus;
	event_date: string;
	note: string;
	order_id: string;
	customer_mail: string;
	verification: boolean;
	vendor_id: string;
	event_type: string;
	waktu_event: string;
	transaction_type: "ticket";
}
