export interface iUpdateProduct {
	title: string;
	rate: number;
	main_price: number;
	minimal_order: number;
	price_min: number;
	price_max: number;
	kabupaten: string;
	description: string;
}

export interface iProductReq {
	title: string;
	minimal_order: number;
	minimal_order_date: string;
	main_price: string | number;
	main_image: iProductImage[];
	description: string;
	terms_conditions?: string;
	rate: number;
	kabupaten: string;
	price_min: string | number;
	price_max: string | number;
	category: {
		connect: number;
	} | null;
	users_permissions_user: {
		connect: {
			id: string;
		};
	};
	documentId?: string; // For Edit Product
	variant: iProductVariant[];
	escrow: boolean;
}

export interface iUserPermissions {
	id: string;
}

export interface iProductImage {
	id: string;
	url?: string;
	mime?: string;
	file?: File | null;
}

export interface iProdCatRes {
	id: number;
	documentId: string;
	title: string;
}

export interface iProductRes extends Omit<iProductReq, "users_permissions_user" | "main_image" | "category"> {
	users_permissions_user: iUserPermissions;
	main_image: iProductImage[];
	category: iProdCatRes;
	documentId: string;
	user_event_type: {
		id: number;
		name: string;
	};
	event_date: string;
	kota_event: string;
	waktu_event: string;
	lokasi_event: string;
}

export interface iProductVariant {
	name: string;
	quota: string;
	price: string | number;
	purchase_deadline: string;
}

export interface iProductVariantFormValues {
	variant: iProductVariant[];
}

export interface iTicketVariant extends Omit<iProductVariant, "purchase_deadline"> {
	purchase_deadline: string;
}

export interface iTicketImage {
	id: string;
	url?: string;
	file?: File;
}
export interface iTicketFormReq {
	documentId?: string;
	title: string;
	description: string;
	main_price: number;
	minimal_order: number;
	minimal_order_date: string;
	main_image: iProductImage[];
	price_min: number;
	price_max: number;
	users_permissions_user: number | null;
	variant: iTicketVariant[];
	event_date: string;
	waktu_event: string;
	lokasi_event: string;
	kota_event: string;
	maximal_order_date: string;
}
