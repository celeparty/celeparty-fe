
"use client";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosUser } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

interface iTicketDetail {
	id: number;
	recipient_name: string;
	identity_type: string;
	identity_number: string;
	whatsapp_number: string;
	recipient_email: string;
	barcode: string;
	status: string;
	transaction_ticket: iTicketSummary;
}

export const TicketDashboard: React.FC = () => {
	const { data: session } = useSession();
	const [selectedProduct, setSelectedProduct] = useState<iTicketSummary | null>(null);
	const [showDetail, setShowDetail] = useState(false);

	const getTicketSummary = async () => {
		const response = await axiosUser(
			"GET",
			`/api/transaction-tickets?filters[vendor_id][$eq]=${session?.user?.documentId}&populate=ticket_details,recipients&sort=createdAt:desc`,
			`${session?.jwt}`,
		);
		return response;
	};

	const query = useQuery({
		queryKey: ["ticketSummary"],
		queryFn: getTicketSummary,
		enabled: !!session?.jwt,
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
				const variantMatch = filterVariant === "all" || item.variant === filterVariant || item.transaction_ticket.variant === filterVariant;
				const statusMatch =
					filterStatus === "all" ||
					(filterStatus === "verified" && item.status === "used") ||
					(filterStatus === "unverified" && item.status !== "used");
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
				"Tanggal Pembelian": new Date(item.transaction_ticket.createdAt).toLocaleDateString(),
				"Status Pembayaran": item.transaction_ticket.payment_status,
				"Total Harga": item.transaction_ticket.total_price
			}));

			switch (format) {
				case "excel":
					const worksheet = XLSX.utils.json_to_sheet(exportData);
					const workbook = XLSX.utils.book_new();
					XLSX.utils.book_append_sheet(workbook, worksheet, "TicketDetails");
					const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
					const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
					saveAs(excelBlob, `ticket-details-${product.product_name}.xlsx`);
					break;
				case "csv":
					const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));
					const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
					saveAs(csvBlob, `ticket-details-${product.product_name}.csv`);
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
						"Total Harga"
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
							item["Total Harga"]
						];
						tableRows.push(rowData);
					});

					doc.text(`${product.product_name} - Ticket Details`, 14, 15);
					(doc as any).autoTable({
						head: [tableColumn],
						body: tableRows,
						startY: 20,
					});
					doc.save(`ticket-details-${product.product_name}.pdf`);
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
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
								// Calculate summary data from ticket details
								const totalTickets = product.quantity;
								const totalSold = product.ticket_details.filter((t) => t.status === "used").length;
								const totalRemaining = totalTickets ? parseInt(totalTickets) - totalSold : 0;
								const percentSold = totalTickets ? ((totalSold / parseInt(totalTickets)) * 100).toFixed(2) : "0";
								const totalVerified = product.ticket_details.filter((t) => t.status === "used").length;
								const price = parseInt(product.price);
								const netIncome = price * totalSold;

								return (
									<>
										<div className="bg-gray-50 p-4 rounded-lg">
											<h6 className="font-semibold">Summary</h6>
											<p>Total Tiket: {totalTickets}</p>
											<p>Terjual: {totalSold}</p>
											<p>Sisa: {totalRemaining}</p>
											<p>Persentase Terjual: {percentSold} %</p>
											<p>Terverifikasi: {totalVerified}</p>
											<p>Harga Jual: Rp {price.toLocaleString()}</p>
											<p>Income Bersih: Rp {netIncome.toLocaleString()}</p>
										</div>
									</>
								);
							})()}
						</>
					) : (
						<p>Tidak ada data tiket tersedia.</p>
					)}
				</div>
=======
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
				const variantMatch = filterVariant === "all" || item.variant === filterVariant || item.transaction_ticket.variant === filterVariant;
				const statusMatch =
					filterStatus === "all" ||
					(filterStatus === "verified" && item.status === "used") ||
					(filterStatus === "unverified" && item.status !== "used");
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
				"Tanggal Pembelian": new Date(item.transaction_ticket.createdAt).toLocaleDateString(),
				"Status Pembayaran": item.transaction_ticket.payment_status,
				"Total Harga": item.transaction_ticket.total_price
			}));

			switch (format) {
				case "excel":
					const worksheet = XLSX.utils.json_to_sheet(exportData);
					const workbook = XLSX.utils.book_new();
					XLSX.utils.book_append_sheet(workbook, worksheet, "TicketDetails");
					const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
					const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
					saveAs(excelBlob, `ticket-details-${product.product_name}.xlsx`);
					break;
				case "csv":
					const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));
					const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
					saveAs(csvBlob, `ticket-details-${product.product_name}.csv`);
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
						"Total Harga"
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
							item["Total Harga"]
						];
						tableRows.push(rowData);
					});

					doc.text(`${product.product_name} - Ticket Details`, 14, 15);
					(doc as any).autoTable({
						head: [tableColumn],
						body: tableRows,
						startY: 20,
					});
					doc.save(`ticket-details-${product.product_name}.pdf`);
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
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
								const totalTickets = product.quantity;
								const totalSold = product.ticket_details.filter((t) => t.status === "used").length;
								const totalRemaining = totalTickets ? parseInt(totalTickets) - totalSold : 0;
								const percentSold = totalTickets ? ((totalSold / parseInt(totalTickets)) * 100).toFixed(2) : "0";
								const totalVerified = product.ticket_details.filter((t) => t.status === "used").length;
								const price = parseInt(product.price);
								const netIncome = price * totalSold;

								return (
									<>
										<div className="bg-gray-50 p-4 rounded-lg">
											<h6 className="font-semibold">Summary</h6>
											<p>Total Tiket: {totalTickets}</p>
											<p>Terjual: {totalSold}</p>
											<p>Sisa: {totalRemaining}</p>
											<p>Persentase Terjual: {percentSold} %</p>
											<p>Terverifikasi: {totalVerified}</p>
											<p>Harga Jual: Rp {price.toLocaleString()}</p>
											<p>Income Bersih: Rp {netIncome.toLocaleString()}</p>
										</div>
									</>
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
						{[...new Set(product.ticket_details.map((t) => t.identity_type))].map((type) => (
							<option key={type} value={type}>
								{type}
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
									<TableCell>{new Date(item.transaction_ticket.createdAt).toLocaleDateString()}</TableCell>
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
};

				{/* Filters */}
				<div className="flex gap-4 mb-4">
					<select
						value={filterVariant}
						onChange={(e) => setFilterVariant(e.target.value)}
						className="border rounded px-3 py-2"
					>
						<option value="all">Semua Varian</option>
						{product.variants.map((v) => (
							<option key={v.name} value={v.name}>
								{v.name}
							</option>
						))}
					</select>
					<select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						className="border rounded px-3 py-2"
					>
						<option value="all">Semua Status</option>
						<option value="verified">Terverifikasi</option>
						<option value="unverified">Belum Terverifikasi</option>
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
							<TableHead>Nama Customer</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Varian</TableHead>
							<TableHead>Status Verifikasi</TableHead>
							<TableHead>Tanggal Pembelian</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredDetails.map((item: iTicketDetail) => (
							<TableRow key={item.id}>
								<TableCell>{item.customer_name}</TableCell>
								<TableCell>{item.customer_email}</TableCell>
								<TableCell>{item.variant}</TableCell>
								<TableCell>
									<span
										className={`px-2 py-1 rounded text-sm ${
											item.verification
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{item.verification ? "Terverifikasi" : "Belum"}
									</span>
								</TableCell>
								<TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
								<TableCell>
									<Button
										size="sm"
										onClick={() => {
											const link = document.createElement("a");
											link.href = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/transaction-tickets/generateInvoice/${item.id}`;
											link.download = `invoice-${item.order_id}.pdf`;
											link.click();
										}}
										className="flex items-center gap-2"
									>
										<Download className="h-4 w-4" />
										Invoice
									</Button>
								</TableCell>
							</TableRow>
						))}
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
					{ticketData.map((product) =>
						product.variants.map((variant) => (
							<TableRow key={`${product.id}-${variant.name}`}>
								<TableCell className="font-medium">{product.title}</TableCell>
								<TableCell>{variant.name}</TableCell>
								<TableCell>{variant.total_tickets}</TableCell>
								<TableCell>{variant.sold_tickets}</TableCell>
								<TableCell>{variant.remaining_stock}</TableCell>
								<TableCell>{variant.sold_percentage}%</TableCell>
								<TableCell>{variant.verified_count}</TableCell>
								<TableCell>Rp {variant.price.toLocaleString()}</TableCell>
								<TableCell>Rp {variant.net_income.toLocaleString()}</TableCell>
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
						)),
					)}
				</TableBody>
			</Table>
		</div>
	);
};
