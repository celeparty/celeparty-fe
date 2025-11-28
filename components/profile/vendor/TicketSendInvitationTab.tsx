"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosUser } from "@/lib/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";
import { toast } from "react-hot-toast";

interface iProductVariant {
  id: number;
  variant_name: string;
  price: number;
  stock: number;
}

interface iProduct {
  id: number;
  product_name: string;
  variants: iProductVariant[];
}

interface iSentTicket {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  recipient_email: string;
  recipient_name: string;
  sent_at: string;
  status: string;
}

interface TicketSendInvitationTabProps {
  vendorDocumentId: string;
  jwtToken: string;
}


const TicketSendInvitationTab: React.FC<TicketSendInvitationTabProps> = ({ vendorDocumentId, jwtToken }) => {
  const [products, setProducts] = React.useState<iProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(null);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [recipientPhone, setRecipientPhone] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await axiosUser(
          "GET",
          `/api/products?vendor_id=${encodeURIComponent(vendorDocumentId)}&populate=variants`,
          jwtToken,
        );
        setProducts(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to load products", error);
        toast.error("Gagal memuat produk");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    if (vendorDocumentId && jwtToken) {
      fetchProducts();
    }
  }, [vendorDocumentId, jwtToken]);

  const getSentTickets = async () => {
    try {
      const response = await axiosUser(
        "GET",
        `/api/transaction-tickets?filters[vendor_id][$eq]=${encodeURIComponent(vendorDocumentId)}&filters[payment_status][$eq]=bypass&sort=createdAt:desc`,
        jwtToken,
      );
      return response;
    } catch (error) {
      return [];
    }
  };

  const sentTicketsQuery = useQuery({
    queryKey: ["sentTickets"],
    queryFn: getSentTickets,
    enabled: !!vendorDocumentId && !!jwtToken,
  });

  // Form validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!selectedProductId) {
      toast.error("Silakan pilih produk tiket");
      return false;
    }
    if (!selectedVariantId) {
      toast.error("Silakan pilih varian tiket");
      return false;
    }
    if (quantity < 1) {
      toast.error("Jumlah tiket minimal 1");
      return false;
    }
    if (!recipientName.trim()) {
      toast.error("Nama penerima tidak boleh kosong");
      return false;
    }
    if (!recipientEmail.trim()) {
      toast.error("Email penerima tidak boleh kosong");
      return false;
    }
    if (!validateEmail(recipientEmail)) {
      toast.error("Format email tidak valid");
      return false;
    }
    if (!password.trim()) {
      toast.error("Password tidak boleh kosong");
      return false;
    }
    return true;
  };

  const sendTicketsMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Validation failed");
      }

      const payload = {
        product_id: selectedProductId,
        variant_id: selectedVariantId,
        quantity,
        recipient_email: recipientEmail.trim(),
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        password,
      };

      const response = await axiosUser(
        "POST",
        "/api/ticket-send-bypass",
        jwtToken!,
        payload,
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Tiket berhasil dikirim");
      sentTicketsQuery.refetch();
      // Reset form
      setSelectedProductId(null);
      setSelectedVariantId(null);
      setQuantity(1);
      setRecipientName("");
      setRecipientEmail("");
      setRecipientPhone("");
      setPassword("");
    },
    onError: (error: any) => {
      if (error.message !== "Validation failed") {
        toast.error(error?.response?.data?.error?.message || "Gagal mengirim tiket");
      }
    },
  });

  const handleSendTickets = (e: React.FormEvent) => {
    e.preventDefault();
    sendTicketsMutation.mutate();
  };

  if (sentTicketsQuery.isLoading) {
    return <Skeleton width="100%" height="200px" />;
  }

  if (sentTicketsQuery.isError) {
    return <ErrorNetwork style="mt-0" />;
  }

  const sentTickets: iSentTicket[] = sentTicketsQuery?.data?.data || [];

  return (
    <div>
      <h5 className="font-bold text-lg mb-4">Kirim Undangan Tiket</h5>

      <form onSubmit={handleSendTickets} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4 max-w-xl">
        <div>
          <label htmlFor="product" className="block font-semibold mb-1">
            Pilih Produk Tiket
          </label>
          <select
            id="product"
            className="w-full border rounded px-3 py-2"
            value={selectedProductId ?? ""}
            onChange={(e) => {
              const productId = e.target.value ? parseInt(e.target.value) : null;
              setSelectedProductId(productId);
              setSelectedVariantId(null);
            }}
            required
            disabled={isLoadingProducts}
          >
            <option value="">
              {isLoadingProducts ? "Memuat produk..." : "-- Pilih Produk --"}
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_name}
              </option>
            ))}
          </select>
        </div>

        {selectedProductId && (
          <div>
            <label htmlFor="variant" className="block font-semibold mb-1">
              Pilih Varian Tiket
            </label>
            <select
              id="variant"
              className="w-full border rounded px-3 py-2"
              value={selectedVariantId ?? ""}
              onChange={(e) => setSelectedVariantId(e.target.value ? parseInt(e.target.value) : null)}
              required
            >
              <option value="">-- Pilih Varian --</option>
              {products
                .find((p) => p.id === selectedProductId)
                ?.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.variant_name} - Harga: Rp {variant.price.toLocaleString()} - Stok: {variant.stock}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="quantity" className="block font-semibold mb-1">
            Jumlah Tiket
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="recipientName" className="block font-semibold mb-1">
            Nama Penerima
          </label>
          <input
            id="recipientName"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="recipientEmail" className="block font-semibold mb-1">
            Email Penerima
          </label>
          <input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="recipientPhone" className="block font-semibold mb-1">
            No. Whatsapp Penerima (optional)
          </label>
          <input
            id="recipientPhone"
            type="tel"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-semibold mb-1">
            Konfirmasi Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <Button type="submit" disabled={sendTicketsMutation.isPending}>
          {sendTicketsMutation.isPending ? "Mengirim..." : "Kirim Tiket"}
        </Button>
      </form>

      <h6 className="font-semibold mb-4">Riwayat Pengiriman Tiket</h6>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk Tiket</TableHead>
            <TableHead>Varian</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Nama Penerima</TableHead>
            <TableHead>Email Penerima</TableHead>
            <TableHead>Waktu Pengiriman</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sentTickets.length > 0 ? (
            sentTickets.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.variant_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.recipient_name}</TableCell>
                <TableCell>{item.recipient_email}</TableCell>
                <TableCell>{new Date(item.sent_at).toLocaleString()}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Tidak ada riwayat pengiriman tiket
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { TicketSendInvitationTab };
