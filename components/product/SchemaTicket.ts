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
});
