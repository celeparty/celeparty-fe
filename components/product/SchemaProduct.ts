import { z } from "zod";

export const SchemaProduct = z.object({
  title: z.string().min(3, { message: "Nama Harus diisi minimal 3 karakter" }),
  main_price: z.string().min(1, { message: "Harga harus diisi" }),
  description: z.string().min(1, { message: "Deskripsi harus diisi" }),
  price_min: z.string().min(1, { message: "Harga harus diisi" }),
  price_max: z.string().min(1, { message: "Harga harus diisi" }),
});
