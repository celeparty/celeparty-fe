"use client";

import {
  ITicketTransaction,
  ITransactionTicket,
} from "@/lib/interfaces/ticket.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateToIndonesian } from "@/lib/dateFormatIndonesia";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Helper component for individual ticket holder details
const TicketHolderCard = ({ ticket }: { ticket: ITransactionTicket }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (ticket.ticket_code) {
      QRCode.toDataURL(ticket.ticket_code, { width: 200 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Failed to generate QR code", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, [ticket.ticket_code]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "valid":
        return <Badge variant="success">Valid</Badge>;
      case "used":
        return <Badge variant="secondary">Used</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge>{status || 'N/A'}</Badge>;
    }
  };

  return (
    <Card className="bg-gray-50/50 dark:bg-gray-900/50">
      <CardContent className="p-4 grid md:grid-cols-2 gap-4 items-center">
        <div className="space-y-2">
          <DetailItem label="Nama" value={ticket.name} />
          <DetailItem label="Email" value={ticket.email} />
          <DetailItem label="No. WhatsApp" value={ticket.phone_number || "N/A"} />
          <DetailItem
            label="Jenis Identitas"
            value={ticket.identity_type || "N/A"}
          />
          <DetailItem
            label="No. Identitas"
            value={ticket.identity_number || "N/A"}
          />
           <div className="flex items-center space-x-2 pt-1">
            <p className="text-sm font-medium text-gray-500 w-32 shrink-0">Status Tiket</p>
            {getStatusBadge(ticket.status)}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          {isLoading ? (
            <Skeleton className="w-40 h-40" />
          ) : qrCodeUrl ? (
            <img src={qrCodeUrl} alt={`QR Code for ${ticket.ticket_code}`} className="rounded-md"/>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-xs text-center text-gray-500 p-2">QR Code tidak tersedia</p>
            </div>
          )}
          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {ticket.ticket_code || "NO_CODE"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col sm:flex-row">
      <p className="text-sm font-medium text-gray-500 w-full sm:w-48 shrink-0">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</p>
    </div>
  );

const PaymentStatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
        case 'paid':
        case 'capture':
        case 'settlement':
            return <Badge variant="success">Paid</Badge>;
        case 'pending':
            return <Badge variant="warning">Pending</Badge>;
        case 'failed':
        case 'expire':
        case 'cancel':
            return <Badge variant="destructive">Failed</Badge>;
        default:
            return <Badge>{status || 'N/A'}</Badge>;
    }
};

export const TicketOrderDetails = ({
  transaction,
}: {
  transaction: ITicketTransaction;
}) => {
  const { product, ticket_variant } = transaction;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="space-y-6 p-1 max-h-[80vh] overflow-y-auto">
      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <DetailItem label="Nama Tiket" value={product.name} />
                <DetailItem label="Tanggal Acara" value={formatDateToIndonesian(product.date_event)} />
                {product.time_event && (
                  <DetailItem label="Jam Acara" value={`${product.time_event.substring(0, 5)} WIB`} />
                )}
                {product.end_date_event && product.date_event !== product.end_date_event && (
                    <DetailItem label="Tanggal Selesai" value={formatDateToIndonesian(product.end_date_event)} />
                )}
                {product.end_time_event && (
                    <DetailItem label="Jam Selesai" value={`${product.end_time_event.substring(0, 5)} WIB`} />
                )}
                 <DetailItem label="Kota" value={product.city || 'N/A'} />
                 <DetailItem label="Lokasi" value={product.location || 'N/A'} />
            </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          <DetailItem label="Kode Invoice" value={transaction.invoice_code} />
          <DetailItem label="Waktu Transaksi" value={formatDateToIndonesian(transaction.createdAt, true)} />
          <DetailItem label="Nama Pemesan" value={transaction.user.username} />
          <DetailItem label="Email Pemesan" value={transaction.user.email} />
          <DetailItem label="Jenis Varian" value={ticket_variant.name} />
          <DetailItem label="Harga Varian" value={formatCurrency(ticket_variant.price)} />
          <DetailItem label="Jumlah" value={`${transaction.quantity} tiket`} />
          <DetailItem label="Total Pembayaran" value={formatCurrency(transaction.total_amount)} />
          <div className="flex items-center pt-1">
            <p className="text-sm font-medium text-gray-500 w-48 shrink-0">Status Pembayaran</p>
            <PaymentStatusBadge status={transaction.payment_status} />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Holder Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Penerima Tiket</CardTitle>
          <CardDescription>
            Jumlah tiket dibeli: {transaction.transaction_tickets.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction.transaction_tickets.map((ticket) => (
            <TicketHolderCard key={ticket.id} ticket={ticket} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
