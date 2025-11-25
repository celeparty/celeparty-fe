"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosUser } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface iTicketDetail {
  id: number;
  recipient_name: string;
  identity_type: string;
  identity_number: string;
  whatsapp_number: string;
  recipient_email: string;
  barcode: string;
  status: string;
  transaction_ticket: iTicketSummary & { createdAt?: string };
}

interface iTicketSummary {
  id: number;
  product_name: string;
  price: string;
  quantity: string;
  variant: string;
  customer_name: string;
  telp: string;
  total_price: string;
  payment_status: string;
  event_date: string;
  event_type: string;
  note: string;
  order_id: string;
  customer_mail: string;
  verification: boolean;
  recipients: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
  ticket_details: Array<iTicketDetail>;
}

interface TicketDashboardTabProps {
  vendorDocumentId: string;
  jwtToken: string;
}

export const TicketDashboardTab: React.FC<TicketDashboardTabProps> = ({ vendorDocumentId, jwtToken }) => {
  const [selectedProduct, setSelectedProduct] = useState<iTicketSummary | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const getTicketSummary = async () => {
    if (!vendorDocumentId) {
      throw new Error("Vendor ID is missing");
    }
    const response = await axiosUser(
      "GET",
      \`/api/transaction-tickets?filters[vendor_id][$eq]=\${encodeURIComponent(vendorDocumentId)}&populate=ticket_details,recipients&sort=createdAt:desc\`,
      jwtToken,
    );
    return response;
  };

  const query = useQuery({
    queryKey: ["ticketSummary"],
    queryFn: getTicketSummary,
    enabled: !!jwtToken,
  });

  if (query.isLoading) {
    return <Skeleton width="100%" height="200px" />;
  }

  if (query.isError) {
    return <ErrorNetwork style="mt-0" />;
  }

  const ticketData: iTicketSummary[] = query?.data?.data || [];

  const handleViewDetail = (product: iTicketSummary) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const TicketDetailView = ({ product }: { product: iTicketSummary }) => {
    const [filterVariant, setFilterVariant] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredDetails =
      product.ticket_details?.filter((item: iTicketDetail) => {
        const variantMatch =
          filterVariant === "all" || item.transaction_ticket.variant === filterVariant;
        const statusMatch =
          filterStatus === "all" ||
          (filterStatus === "used" && item.status === "used") ||
          (filterStatus === "active" && item.status === "active") ||
          (filterStatus === "cancelled" && item.status === "cancelled");
        return variantMatch && statusMatch;
      }) || [];

    const handleExport = (format: string) => {
      if (!product.ticket_details) return;

      const exportData = filteredDetails.map((item: iTicketDetail) => ({
        "Nama Penerima": item.recipient_name,
        "Email Penerima": item.recipient_email,
        "Tipe Identitas": item.identity_type,
        "No. Identitas": item.identity_number,
        "No. Whatsapp": item.whatsapp_number,
        "Barcode": item.barcode,
        "Status Tiket": item.status,
        "Nama Produk": item.transaction_ticket.product_name,
        "Varian": item.transaction_ticket.variant,
        "Nama Customer": item.transaction_ticket.customer_name,
        "Email Customer": item.transaction_ticket.customer_mail,
        "Tanggal Acara": item.transaction_ticket.event_date,
        "Tanggal Pembelian": item.transaction_ticket.createdAt ? new Date(item.transaction_ticket.createdAt).toLocaleDateString() : "-",
        "Status Pembayaran": item.transaction_ticket.payment_status,
        "Total Harga": item.transaction_ticket.total_price,
      }));

      switch (format) {
        case "excel":
          const worksheet = XLSX.utils.json_to_sheet(exportData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "TicketDetails");
          const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
          const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
          saveAs(excelBlob, \`ticket-details-\${product.product_name}.xlsx\`);
          break;
        case "csv":
          const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));
          const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          saveAs(csvBlob, \`ticket-details-\${product.product_name}.csv\`);
          break;
        case "pdf":
          const doc = new jsPDF();
          const tableColumn = [
            "Nama Penerima",
            "Email Penerima",
            "Tipe Identitas",
            "No. Identitas",
            "No. Whatsapp",
            "Barcode",
            "Status Tiket",
            "Nama Produk",
            "Varian",
            "Nama Customer",
            "Email Customer",
            "Tanggal Acara",
            "Tanggal Pembelian",
            "Status Pembayaran",
            "Total Harga",
          ];
          const tableRows: any[] = [];

          exportData.forEach((item: { [key: string]: string }) => {
            const rowData = [
              item["Nama Penerima"],
              item["Email Penerima"],
              item["Tipe Identitas"],
              item["No. Identitas"],
              item["No. Whatsapp"],
              item["Barcode"],
              item["Status Tiket"],
              item["Nama Produk"],
              item["Varian"],
              item["Nama Customer"],
              item["Email Customer"],
              item["Tanggal Acara"],
              item["Tanggal Pembelian"],
              item["Status Pembayaran"],
              item["Total Harga"],
            ];
            tableRows.push(rowData);
          });

          doc.text(\`\${product.product_name} - Ticket Details\`, 14, 15);
          (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
          });
          doc.save(\`ticket-details-\${product.product_name}.pdf\`);
          break;
        default:
          console.warn(\`Unsupported export format: \${format}\`);
      }
    };

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-bold text-lg">{product.product_name} - Detail</h5>
          <Button onClick={() => setShowDetail(false)} variant="outline">
            Kembali
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {product.ticket_details?.length ? (
            <>
              {(() => {
                const totalTickets = product.quantity ? parseInt(product.quantity) : 0;
                const totalUsed = product.ticket_details.filter((t) => t.status === "used").length;
                const totalActive = product.ticket_details.filter((t) => t.status === "active").length;
                const totalCancelled = product.ticket_details.filter((t) => t.status === "cancelled").length;
                const totalRemaining = totalTickets - totalUsed;
                const percentSold = totalTickets > 0 ? ((totalUsed / totalTickets) * 100).toFixed(2) : "0";
                const price = product.price ? parseInt(product.price) : 0;
                const netIncome = price * totalUsed;
                return (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h6 className="font-semibold">Summary</h6>
                    <p>Total Tiket: {totalTickets}</p>
                    <p>Terjual: {totalUsed}</p>
                    <p>Sisa: {totalRemaining}</p>
                    <p>Persentase Terjual: {percentSold} %</p>
                    <p>Total Aktif: {totalActive}</p>
                    <p>Total Batal: {totalCancelled}</p>
                    <p>Harga Jual: Rp {price.toLocaleString()}</p>
                    <p>Income Bersih: Rp {netIncome.toLocaleString()}</p>
                  </div>
                );
              })()}
            </>
          ) : (
            <p>Tidak ada data tiket tersedia.</p>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={filterVariant}
            onChange={(e) => setFilterVariant(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Semua Varian</option>
            {Array.from(new Set(product.ticket_details.map((t) => t.transaction_ticket.variant))).map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Semua Status</option>
            <option value="used">Digunakan</option>
            <option value="active">Aktif</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={() => handleExport("excel")} size="sm">
              Export Excel
            </Button>
            <Button onClick={() => handleExport("pdf")} size="sm">
              Export PDF
            </Button>
            <Button onClick={() => handleExport("csv")} size="sm">
              Export CSV
            </Button>
          </div>
        </div>

        {/* Detail Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Penerima</TableHead>
              <TableHead>Email Penerima</TableHead>
              <TableHead>Tipe Identitas</TableHead>
              <TableHead>No. Identitas</TableHead>
              <TableHead>No. Whatsapp</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Status Tiket</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Varian</TableHead>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Email Customer</TableHead>
              <TableHead>Tanggal Acara</TableHead>
              <TableHead>Tanggal Pembelian</TableHead>
              <TableHead>Status Pembayaran</TableHead>
              <TableHead>Total Harga</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.length > 0 ? (
              filteredDetails.map((item: iTicketDetail) => (
                <TableRow key={item.id}>
                  <TableCell>{item.recipient_name}</TableCell>
                  <TableCell>{item.recipient_email}</TableCell>
                  <TableCell>{item.identity_type}</TableCell>
                  <TableCell>{item.identity_number}</TableCell>
                  <TableCell>{item.whatsapp_number}</TableCell>
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.transaction_ticket.product_name}</TableCell>
                  <TableCell>{item.transaction_ticket.variant}</TableCell>
                  <TableCell>{item.transaction_ticket.customer_name}</TableCell>
                  <TableCell>{item.transaction_ticket.customer_mail}</TableCell>
                  <TableCell>{item.transaction_ticket.event_date}</TableCell>
                  <TableCell>{item.transaction_ticket.createdAt ? new Date(item.transaction_ticket.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{item.transaction_ticket.payment_status}</TableCell>
                  <TableCell>{item.transaction_ticket.total_price}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="text-center">
                  Tidak ada data tiket yang cocok
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (showDetail && selectedProduct) {
    return <TicketDetailView product={selectedProduct} />;
  }

  return (
    <div>
      <h5 className="font-bold text-lg mb-4">Dashboard Ticket</h5>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk Tiket</TableHead>
            <TableHead>Varian Tiket</TableHead>
            <TableHead>Jumlah Tiket</TableHead>
            <TableHead>Jumlah Terjual</TableHead>
            <TableHead>Sisa Stok</TableHead>
            <TableHead>Persentasi Terjual</TableHead>
            <TableHead>Jumlah Terverifikasi</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Total Income Bersih</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticketData.length > 0 ? (
            ticketData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.product_name}</TableCell>
                <TableCell>{product.variant}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.ticket_details.filter((t) => t.status === "used").length}</TableCell>
                <TableCell>
                  {product.quantity
                    ? parseInt(product.quantity) -
                      product.ticket_details.filter((t) => t.status === "used").length
                    : 0}
                </TableCell>
                <TableCell>
                  {product.quantity
                    ? (
                        (product.ticket_details.filter((t) => t.status === "used").length /
                          parseInt(product.quantity)) *
                        100
                      ).toFixed(2)
                    : "0"}
                  %
                </TableCell>
                <TableCell>
                  {product.ticket_details.filter((t) => t.status === "used").length}
                </TableCell>
                <TableCell>Rp {parseInt(product.price).toLocaleString()}</TableCell>
                <TableCell>
                  Rp{" "}
                  {(
                    parseInt(product.price) *
                    product.ticket_details.filter((t) => t.status === "used").length
                  ).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleViewDetail(product)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Tidak ada data tiket tersedia
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

export default TicketDashboardTab;
