
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
	title: string;
	variants: Array<{
		name: string;
		total_tickets: number;
		sold_tickets: number;
		remaining_stock: number;
		sold_percentage: number;
		verified_count: number;
		price: number;
		net_income: number;
	}>;
}

interface iTicketDetail {
	id: number;
	customer_name: string;
	customer_email: string;
	variant: string;
	verification: boolean;
	createdAt: string;
	order_id: string;
}

export const TicketDashboard: React.FC = () => {
	const { data: session } = useSession();
	const [selectedProduct, setSelectedProduct] = useState<iTicketSummary | null>(null);
	const [showDetail, setShowDetail] = useState(false);

	const getTicketSummary = async () => {
		const response = await axiosUser(
			"GET",
			`/api/tickets?filters[users_permissions_user][documentId][$eq]=${session?.user?.documentId}&populate=*`,
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

		const getTicketDetails = async () => {
			const response = await axiosUser(
				"GET",
				`/api/transaction-tickets?filters[product_id][$eq]=${product.id}&populate=*`,
				`${session?.jwt}`,
			);
			return response;
		};

		const detailQuery = useQuery({
			queryKey: ["ticketDetails", product.id],
			queryFn: getTicketDetails,
			enabled: !!session?.jwt && showDetail,
		});

		const filteredDetails =
			detailQuery?.data?.data?.filter((item: iTicketDetail) => {
				const variantMatch = filterVariant === "all" || item.variant === filterVariant;
				const statusMatch =
					filterStatus === "all" ||
					(filterStatus === "verified" && item.verification) ||
					(filterStatus === "unverified" && !item.verification);
				return variantMatch && statusMatch;
			}) || [];

		const handleExport = (format: string) => {
			if (!detailQuery?.data?.data) return;

			const exportData = filteredDetails.map((item: iTicketDetail) => ({
				"Nama Customer": item.customer_name,
				"Email": item.customer_email,
				"Varian": item.variant,
				"Status Verifikasi": item.verification ? "Terverifikasi" : "Belum Terverifikasi",
				"Tanggal Pembelian": new Date(item.createdAt).toLocaleDateString(),
			}));

			switch (format) {
				case "excel":
					// XLSX export
					const worksheet = XLSX.utils.json_to_sheet(exportData);
					const workbook = XLSX.utils.book_new();
					XLSX.utils.book_append_sheet(workbook, worksheet, "TicketDetails");
					const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
					const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
					saveAs(excelBlob, `ticket-details-${product.title}.xlsx`);
					break;
				case "csv":
					// CSV export
					const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));
					const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
					saveAs(csvBlob, `ticket-details-${product.title}.csv`);
					break;
				case "pdf":
					// PDF export using jsPDF and autotable
					const doc = new jsPDF();
					const tableColumn = ["Nama Customer", "Email", "Varian", "Status Verifikasi", "Tanggal Pembelian"];
					const tableRows: any[] = [];

					exportData.forEach((item: { [key: string]: string }) => {
						const rowData = [
							item["Nama Customer"],
							item.Email,
							item.Varian,
							item["Status Verifikasi"],
							item["Tanggal Pembelian"],
						];
						tableRows.push(rowData);
					});

					doc.text(`${product.title} - Ticket Details`, 14, 15);
					(doc as any).autoTable({
						head: [tableColumn],
						body: tableRows,
						startY: 20,
					});
					doc.save(`ticket-details-${product.title}.pdf`);
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
			}
		};

		return (
			<div className="mt-6">
				<div className="flex justify-between items-center mb-4">
					<h5 className="font-bold text-lg">{product.title} - Detail</h5>
					<Button onClick={() => setShowDetail(false)} variant="outline">
						Kembali
					</Button>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					{product.variants.map((variant) => (
						<div key={variant.name} className="bg-gray-50 p-4 rounded-lg">
							<h6 className="font-semibold">{variant.name}</h6>
							<p>Total: {variant.total_tickets}</p>
							<p>Terjual: {variant.sold_tickets}</p>
							<p>Sisa: {variant.remaining_stock}</p>
							<p>Persentase: {variant.sold_percentage}%</p>
							<p>Terverifikasi: {variant.verified_count}</p>
							<p>Harga: Rp {variant.price.toLocaleString()}</p>
							<p>Income Bersih: Rp {variant.net_income.toLocaleString()}</p>
						</div>
					))}
				</div>

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
