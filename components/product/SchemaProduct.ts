import { z } from "zod";

export const SchemaProduct = z.object({
	title: z.string().min(3, { message: "Nama Harus diisi minimal 3 karakter" }),
	description: z.string().min(1, { message: "Deskripsi harus diisi" }),
	kabupaten: z.string().min(1, { message: "Kota/Kabupaten harus diisi" }),
});
