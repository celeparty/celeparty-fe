export interface CartItem {
	product_id: string | number;
	product_name: string;
	price: number;
	image: string;
	quantity: number;
	note?: string;
	loading_date?: string;
	loading_time?: string;
	event_date?: string;
	end_date?: string; // Ticket end date
	waktu_event?: string; // Ticket event time
	end_time?: string; // Ticket end time
	kota_event?: string; // Ticket event city
	lokasi_event?: string; // Ticket event location
	shipping_location?: string;
	customer_name?: string;
	telp?: string;
	variant?: string;
	vendor_id?: string;
	user_event_type?: string;
	product_type?: "ticket" | "equipment"; // Add product type to distinguish between tickets and equipment
	recipients?: TicketRecipient[]; // For tickets with quantity > 1
}

export interface TicketRecipient {
	name: string;
	identity_type: "KTP" | "SIM" | "Lainnya";
	identity_number: string;
	whatsapp_number: string;
	email: string;
}
