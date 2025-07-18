import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Box from "@/components/Box";
import { Button } from "@/components/ui/button";
import { axiosUser } from "@/lib/services";
import { FileUploader } from "@/components/product/FileUploader";

interface TicketVariant {
  name: string;
  price: number;
  quota: string;
  purchase_deadline: string;
}

interface TicketFormState {
  title: string;
  description: string;
  main_price: number;
  minimal_order: number;
  minimal_order_date: string;
  main_image: { id: string; url?: string; file?: File }[];
  price_min: number;
  price_max: number;
  users_permissions_user: number | null;
  variant: TicketVariant[];
}

const initialState: TicketFormState = {
  title: "",
  description: "",
  main_price: 0,
  minimal_order: 0,
  minimal_order_date: "",
  main_image: [],
  price_min: 0,
  price_max: 0,
  users_permissions_user: null,
  variant: [],
};

const MAX_IMAGES = 5;

export default function TicketForm() {
  const { data: session } = useSession();
  const [form, setForm] = useState<TicketFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handler untuk input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk variant
  const handleVariantChange = (idx: number, field: keyof TicketVariant, value: string | number) => {
    setForm((prev) => {
      const variants = [...prev.variant];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...prev, variant: variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variant: [...prev.variant, { name: "", price: 0, quota: "", purchase_deadline: "" }] }));
  };

  const removeVariant = (idx: number) => {
    setForm((prev) => {
      const variants = [...prev.variant];
      variants.splice(idx, 1);
      return { ...prev, variant: variants };
    });
  };

  // Handler untuk upload gambar
  const handleFileChange = async (index: number, file: File | null) => {
    if (file) {
      // Upload ke Strapi
      const formData = new FormData();
      formData.append("files", file);
      try {
        const uploadRes = await axiosUser(
          "POST",
          "/api/upload",
          session?.jwt || "",
          formData
        );
        if (uploadRes && Array.isArray(uploadRes) && uploadRes[0]?.id) {
          const imageObj = {
            id: String(uploadRes[0].id),
            url: uploadRes[0].url || undefined,
          };
          setForm((prev) => {
            const imgs = [...prev.main_image];
            imgs[index] = imageObj;
            return { ...prev, main_image: imgs };
          });
        }
      } catch (err) {
        setError("Gagal upload gambar");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const imgs = [...prev.main_image];
      imgs.splice(index, 1);
      return { ...prev, main_image: imgs };
    });
  };

  const handleAddImage = () => {
    if (form.main_image.length < MAX_IMAGES) {
      setForm((prev) => ({ ...prev, main_image: [...prev.main_image, { id: "" }] }));
    }
  };

  // Handler submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Compose payload persis seperti Postman
      const payload: any = {
        data: {
          title: form.title,
          description: form.description,
          main_price: Number(form.main_price),
          minimal_order: Number(form.minimal_order),
          minimal_order_date: form.minimal_order_date || undefined,
          main_image: form.main_image.filter(img => img.id).map((img) => ({ id: img.id })),
          price_min: Number(form.price_min),
          price_max: Number(form.price_max),
          users_permissions_user: {
            connect: [
              { id: session?.user?.id ? Number(session.user.id) : undefined },
            ],
          },
          user_event_type: {
            connect: [
              { id: 15 },
            ],
          },
          variant: form.variant.length > 0 ? form.variant.map((v) => ({
            name: v.name,
            price: Number(v.price),
            quota: v.quota,
            purchase_deadline: v.purchase_deadline || undefined,
          })) : [],
        },
      };
      // Clean up undefined/null
      Object.keys(payload.data).forEach((k) => {
        if (
          payload.data[k] === undefined ||
          payload.data[k] === null ||
          (Array.isArray(payload.data[k]) && payload.data[k].length === 0)
        ) {
          delete payload.data[k];
        }
      });
      // POST ke Strapi
      const res = await axiosUser(
        "POST",
        "/api/products?status=draft",
        process.env.KEY_API || "",
        payload
      );
      setSuccess(true);
      setForm(initialState);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Gagal submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Nama Tiket</label>
        <input name="title" value={form.title} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Deskripsi</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Harga Utama</label>
        <input name="main_price" type="number" value={form.main_price} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Minimal Order</label>
        <input name="minimal_order" type="number" value={form.minimal_order} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Tanggal Minimal Order</label>
        <input name="minimal_order_date" type="date" value={form.minimal_order_date} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Harga Minimal</label>
        <input name="price_min" type="number" value={form.price_min} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Harga Maksimal</label>
        <input name="price_max" type="number" value={form.price_max} onChange={handleChange} className="border p-2 w-full" />
      </div>
      <div>
        <label>Gambar Produk (max 5)</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {form.main_image.map((img, idx) => (
            <div key={idx} className="w-24">
              <FileUploader
                image={img}
                onFileChange={(file) => handleFileChange(idx, file)}
                onRemove={() => handleRemoveImage(idx)}
              />
            </div>
          ))}
          {form.main_image.length < MAX_IMAGES && (
            <Button type="button" onClick={handleAddImage}>
              + Gambar
            </Button>
          )}
        </div>
      </div>
      <div>
        <label>Variant</label>
        <Button type="button" onClick={addVariant} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded">Tambah Variant</Button>
        {form.variant.map((v, idx) => (
          <div key={idx} className="border p-2 my-2">
            <input
              placeholder="Nama Variant"
              value={v.name}
              onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
              className="border p-1 mr-2"
            />
            <input
              placeholder="Harga"
              type="number"
              value={v.price}
              onChange={(e) => handleVariantChange(idx, "price", Number(e.target.value))}
              className="border p-1 mr-2"
            />
            <input
              placeholder="Quota"
              value={v.quota}
              onChange={(e) => handleVariantChange(idx, "quota", e.target.value)}
              className="border p-1 mr-2"
            />
            <input
              placeholder="Deadline"
              type="date"
              value={v.purchase_deadline}
              onChange={(e) => handleVariantChange(idx, "purchase_deadline", e.target.value)}
              className="border p-1 mr-2"
            />
            <Button type="button" onClick={() => removeVariant(idx)} className="text-red-500">Hapus</Button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Tiket"}
        </Button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-500 mt-2">Tiket berhasil ditambahkan!</div>}
    </form>
  );
} 