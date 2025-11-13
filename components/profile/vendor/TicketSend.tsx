"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { Send, Plus, Minus } from "lucide-react";
import { toast } from "react-hot-toast";

interface iTicketProduct {
  id: number;
  title: string;
  variants: Array<{
    name: string;
    price: number;
    stock: number;
  }>;
}

interface iRecipient {
  name: string;
  email: string;
  phone: string;
}

interface iSendHistory {
  id: number;
  recipient_name: string;
  recipient_email: string;
  ticket_name: string;
  variant: string;
  quantity: number;
  sent_at: string;
}

export const TicketSend: React.FC = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [recipients, setRecipients] = useState<iRecipient[]>([
    { name: "", email: "", phone: "" }
  ]);
  const [note, setNote] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const getTicketProducts = async () => {
    const response = await axiosUser(
      "GET",
      `/api/tickets?filters[users_permissions_user][documentId][$eq]=${session?.user?.documentId}&populate=*`,
      `${session?.jwt}`
    );
    return response;
  };

  const getSendHistory = async () => {
    const response = await axiosUser(
      "GET",
      `/api/transaction-tickets?filters[vendor_id][$eq]=${session?.user?.documentId}&filters[payment_status][$eq]=bypass&sort=createdAt:desc`,
      `${session?.jwt}`
    );
    return response;
  };

  const productsQuery = useQuery({
    queryKey: ["ticketProducts"],
    queryFn: getTicketProducts,
    enabled: !!session?.jwt,
  });

  const historyQuery = useQuery({
    queryKey: ["sendHistory"],
    queryFn: getSendHistory,
    enabled: !!session?.jwt,
  });

  const sendTicketMutation = useMutation({
    mutationFn: async () => {
      const selectedProductData = productsQuery.data?.data?.find(
        (p: iTicketProduct) => p.id.toString() === selectedProduct
      );

      const payload = {
        data: {
          product_name: selectedProductData?.title,
          variant: selectedVariant,
          quantity: quantity.toString(),
          customer_name: recipients.map(r => r.name).join(", "),
          customer_mail: recipients.map(r => r.email).join(", "),
          telp: recipients.map(r => r.phone).join(", "),
          total_price: (selectedProductData?.variants?.find((v: { name: string; price: number; stock: number }) => v.name === selectedVariant)?.price || 0) * quantity,
          payment_status: "bypass",
          verification: false,
          vendor_id: session?.user?.documentId,
          recipients: recipients,
          note: note,
          event_date: selectedProductData?.event_date,
          event_type: selectedProductData?.event_type,
        }
      };

      const response = await axiosUser(
        "POST",
        "/api/transaction-tickets-proxy",
        `${session?.jwt}`,
        payload
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Tiket berhasil dikirim!");
      queryClient.invalidateQueries({ queryKey: ["sendHistory"] });
      resetForm();
      setShowPasswordDialog(false);
      setPassword("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Gagal mengirim tiket");
    },
  });

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedVariant("");
    setQuantity(1);
    setRecipients([{ name: "", email: "", phone: "" }]);
    setNote("");
  };

  const addRecipient = () => {
    setRecipients([...recipients, { name: "", email: "", phone: "" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof iRecipient, value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleSendClick = () => {
    if (!selectedProduct || !selectedVariant || recipients.some(r => !r.name || !r.email)) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }
    setShowPasswordDialog(true);
  };

  const confirmSend = () => {
    if (!password) {
      toast.error("Password diperlukan untuk konfirmasi");
      return;
    }
    sendTicketMutation.mutate();
  };

  if (productsQuery.isLoading || historyQuery.isLoading) {
    return <Skeleton width="100%" height="200px" />;
  }

  if (productsQuery.isError || historyQuery.isError) {
    return <ErrorNetwork style="mt-0" />;
  }

  const ticketProducts: iTicketProduct[] = productsQuery?.data?.data || [];
  const sendHistory: iSendHistory[] = historyQuery?.data?.data || [];
  const selectedProductData = ticketProducts.find(p => p.id.toString() === selectedProduct);

  return (
    <div>
      <h5 className="font-bold text-lg mb-4">Kirim Undangan Tiket</h5>

      {/* Send Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="product">Pilih Produk Tiket</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk tiket" />
              </SelectTrigger>
              <SelectContent>
                {ticketProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="variant">Pilih Varian</Label>
            <Select
              value={selectedVariant}
              onValueChange={setSelectedVariant}
              disabled={!selectedProduct}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih varian" />
              </SelectTrigger>
              <SelectContent>
                {selectedProductData?.variants?.map((variant) => (
                  <SelectItem key={variant.name} value={variant.name}>
                    {variant.name} - Rp {variant.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="quantity">Jumlah Tiket</Label>
          <div className="flex items-center gap-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center"
              min="1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Recipients */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <Label>Detail Penerima ({recipients.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRecipient}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Penerima
            </Button>
          </div>
          {recipients.map((recipient, index) => (
            <div key={index} className="border rounded p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Penerima {index + 1}</span>
                {recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRecipient(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Nama"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, "email", e.target.value)}
                />
                <Input
                  placeholder="No. Telepon"
                  value={recipient.phone}
                  onChange={(e) => updateRecipient(index, "phone", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <Label htmlFor="note">Catatan (Opsional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan"
          />
        </div>

        <Button
          onClick={handleSendClick}
          className="flex items-center gap-2"
          disabled={sendTicketMutation.isPending}
        >
          <Send className="h-4 w-4" />
          {sendTicketMutation.isPending ? "Mengirim..." : "Kirim Tiket"}
        </Button>
      </div>

      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Password</DialogTitle>
            <DialogDescription>
              Masukkan password akun Anda untuk mengkonfirmasi pengiriman tiket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Batal
            </Button>
            <Button onClick={confirmSend} disabled={sendTicketMutation.isPending}>
              {sendTicketMutation.isPending ? "Mengirim..." : "Konfirmasi & Kirim"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Table */}
      <div>
        <h6 className="font-semibold mb-4">Riwayat Pengiriman Tiket</h6>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Penerima</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nama Tiket</TableHead>
              <TableHead>Varian</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Waktu Pengiriman</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sendHistory.length > 0 ? (
              sendHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.recipient_name}</TableCell>
                  <TableCell>{item.recipient_email}</TableCell>
                  <TableCell>{item.ticket_name}</TableCell>
                  <TableCell>{item.variant}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{new Date(item.sent_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Belum ada riwayat pengiriman
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
