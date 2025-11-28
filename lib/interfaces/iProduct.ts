export interface iUpdateProduct {
	title: string;
	rate: number;
	kabupaten: string;
	description: string;
}

export interface iProductImage {
	id: string;
	url: string;
	mime: string;
	file?: File;
}

export interface iProductVariant {
	name: string;
	price: number;
	quota: string;
}

export interface iProductReq {
	title: string;
	description: string;
	main_image: iProductImage[];
	terms_conditions?: string;
	category: {
		connect: { id: number }[];
	};
	kabupaten: string;
	variant: iProductVariant[];
	escrow?: boolean;
}

export interface iProductRes {
	id: number;
	documentId: string;
	title: string;
	description: string;
	main_image: iProductImage[];
	kabupaten: string;
	category: any;
	rate: number;
	users_permissions_user: any;
	variant: iProductVariant[];
	escrow: boolean;
	user_event_type: any;
	event_date?: string;
	kota_event?: string;
	waktu_event?: string;
	end_date?: string;
	end_time?: string;
	lokasi_event?: string;
}

export interface iTicketFormReq {
	title: string;
	description: string;
	event_date: string;
	waktu_event: string;
	end_date: string;
	end_time: string;
	kota_event: string;
	lokasi_event: string;
	main_image: iProductImage[];
	terms_conditions?: string;
	variant: iTicketVariant[];
}

export interface iTicketVariant {
	name: string;
	price: number;
	quota: string;
	purchase_deadline: string;
}

export interface iTicketImage {
	id: string;
	url: string;
	mime: string;
	file?: File;
}
