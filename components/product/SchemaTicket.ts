import { z } from "zod";

export const SchemaTicket = z.object({
	title: z.string().min(3, { message: "Nama Tiket harus diisi minimal 3 karakter" }),
	description: z.string().min(1, { message: "Deskripsi harus diisi" }),
	event_date: z.string().min(1, { message: "Tanggal acara harus diisi" }),
	waktu_event: z.string().min(1, { message: "Waktu acara harus diisi" }),
	end_date: z.string().min(1, { message: "Tanggal selesai harus diisi" }),
	end_time: z.string().min(1, { message: "Jam selesai harus diisi" }),
	kota_event: z.string().min(1, { message: "Kota acara harus diisi" }),
	lokasi_event: z.string().min(1, { message: "Lokasi acara harus diisi" }),
	main_image: z.array(z.object({
		id: z.string(),
		url: z.string(),
		mime: z.string(),
		file: z.instanceof(File).optional(),
	})).min(1, { message: "Minimal 1 gambar harus diunggah" }),
	variant: z.array(z.object({
		name: z.string().min(1, { message: "Nama variant harus diisi" }),
		price: z.number().min(0, { message: "Harga harus lebih dari 0" }),
		quota: z.string().min(1, { message: "Kuota harus diisi" }),
		purchase_deadline: z.string().min(1, { message: "Deadline pembelian harus diisi" }),
	})).min(1, { message: "Minimal 1 variant harus ditambahkan" }),
	terms_conditions: z.string().optional().default(""),
});
