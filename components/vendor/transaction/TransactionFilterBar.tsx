"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ChevronDown, Filter, RotateCcw, Download } from "lucide-react";
import toast from "react-hot-toast";

import xlsx from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface iTransaction {
	id: string;
	attributes: {
		order_id: string;
		payment_status: string;
		createdAt: string;
		totalAmount: number;
		customer_name?: string;
		products?: Array<{
			product_name: string;
			quantity: number;
			price: number;
		}>;
		product?: {
			data: {
				attributes: {
					title: string;
				};
			};
		};
		transaction_date?: string;
		event_date?: string;
	};
}

interface iTransactionFilterBarProps {
	transactions: iTransaction[];
	productType: "tiket" | "umum";
	onFilteredDataChange: (filteredData: iTransaction[]) => void;
}

export const TransactionFilterBar: React.FC<iTransactionFilterBarProps> = ({
	transactions,
	productType,
	onFilteredDataChange,
}) => {
	const [showFilters, setShowFilters] = useState(false);
	const [dateFrom, setDateFrom] = useState<string>("");
	const [dateTo, setDateTo] = useState<string>("");
	const [paymentStatus, setPaymentStatus] = useState<string>("all");
	const [productName, setProductName] = useState<string>("");
	const [orderId, setOrderId] = useState<string>("");

	// Extract unique products for filter dropdown
	const uniqueProducts = useMemo(() => {
		const products = new Set<string>();
		transactions.forEach((t) => {
			const productName =
				t.attributes.products?.[0]?.product_name ||
				t.attributes.product?.data?.attributes?.title ||
				"Unknown";
			if (productName && productName !== "Unknown") {
				products.add(productName);
			}
		});
		return Array.from(products).sort();
	}, [transactions]);

	// Filter transactions based on criteria
	const filteredTransactions = useMemo(() => {
		return transactions.filter((transaction) => {
			const attributes = transaction.attributes;
			const transactionDate = attributes.createdAt || attributes.transaction_date;

			// Date range filter
			if (dateFrom && transactionDate) {
				const filterDate = new Date(dateFrom);
				const transDate = new Date(transactionDate);
				if (transDate < filterDate) return false;
			}

			if (dateTo && transactionDate) {
				const filterDate = new Date(dateTo);
				filterDate.setHours(23, 59, 59, 999);
				const transDate = new Date(transactionDate);
				if (transDate > filterDate) return false;
			}

			// Payment status filter
			if (paymentStatus !== "all") {
				if (attributes.payment_status !== paymentStatus) return false;
			}

			// Product name filter
			if (productName) {
				const pName =
					attributes.products?.[0]?.product_name ||
					attributes.product?.data?.attributes?.title ||
					"";
				if (!pName.toLowerCase().includes(productName.toLowerCase())) return false;
			}

			// Order ID filter
			if (orderId) {
				if (!attributes.order_id.toLowerCase().includes(orderId.toLowerCase())) return false;
			}

			return true;
		});
	}, [transactions, dateFrom, dateTo, paymentStatus, productName, orderId]);

	// Update parent component with filtered data
	React.useEffect(() => {
		onFilteredDataChange(filteredTransactions);
	}, [filteredTransactions, onFilteredDataChange]);

	const handleResetFilters = useCallback(() => {
		setDateFrom("");
		setDateTo("");
		setPaymentStatus("all");
		setProductName("");
		setOrderId("");
		toast.success("Filter direset");
	}, []);

	const exportToCSV = useCallback(() => {
		if (filteredTransactions.length === 0) {
			toast.error("Tidak ada data untuk di-export");
			return;
		}

		try {
			const csvData = filteredTransactions.map((t) => ({
				"Order ID": t.attributes.order_id,
				"Tanggal": format(new Date(t.attributes.createdAt), "dd-MM-yyyy HH:mm"),
				"Produk": t.attributes.products?.[0]?.product_name || "N/A",
				"Jumlah": t.attributes.products?.[0]?.quantity || "-",
				"Harga": t.attributes.products?.[0]?.price || t.attributes.totalAmount,
				"Total": t.attributes.totalAmount,
				"Status": t.attributes.payment_status,
				"Pelanggan": t.attributes.customer_name || "N/A",
			}));

			const worksheet = xlsx.utils.json_to_sheet(csvData);
			const workbook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");

			// Format columns
			const colWidths = [
				{ wch: 15 }, // Order ID
				{ wch: 18 }, // Tanggal
				{ wch: 25 }, // Produk
				{ wch: 8 }, // Jumlah
				{ wch: 12 }, // Harga
				{ wch: 12 }, // Total
				{ wch: 12 }, // Status
				{ wch: 20 }, // Pelanggan
			];
			worksheet["!cols"] = colWidths;

			xlsx.writeFile(workbook, `Transaksi_${productType}_${format(new Date(), "ddMMyyyyHHmm")}.csv`);
			toast.success("CSV berhasil di-download");
		} catch (error) {
			console.error("CSV Export Error:", error);
			toast.error("Gagal mengexport CSV");
		}
	}, [filteredTransactions, productType]);

	const exportToExcel = useCallback(() => {
		if (filteredTransactions.length === 0) {
			toast.error("Tidak ada data untuk di-export");
			return;
		}

		try {
			const excelData = filteredTransactions.map((t) => ({
				"Order ID": t.attributes.order_id,
				"Tanggal": format(new Date(t.attributes.createdAt), "dd-MM-yyyy HH:mm"),
				"Produk": t.attributes.products?.[0]?.product_name || "Unknown",
				"Jumlah": t.attributes.products?.[0]?.quantity || 0,
				"Harga Satuan": t.attributes.products?.[0]?.price || 0,
				"Total": t.attributes.totalAmount,
				"Status Pembayaran": t.attributes.payment_status,
				"Nama Pelanggan": t.attributes.customer_name || "N/A",
			}));

			const worksheet = xlsx.utils.json_to_sheet(excelData);
			const workbook = xlsx.utils.book_new();
			xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");

			// Format columns
			worksheet["!cols"] = [
				{ wch: 15 },
				{ wch: 18 },
				{ wch: 25 },
				{ wch: 8 },
				{ wch: 15 },
				{ wch: 12 },
				{ wch: 15 },
				{ wch: 20 },
			];

			// Format header
			const headerStyle = {
				font: { bold: true, color: { rgb: "FFFFFF" } },
				fill: { fgColor: { rgb: "4472C4" } },
				alignment: { horizontal: "center", vertical: "center" },
			};

			for (let i = 0; i < excelData.length + 1; i++) {
				const cell = worksheet.getCell ? worksheet.getCell(i, 1) : null;
				if (cell) {
					cell.style = headerStyle;
				}
			}

			xlsx.writeFile(workbook, `Transaksi_${productType}_${format(new Date(), "ddMMyyyyHHmm")}.xlsx`);
			toast.success("Excel berhasil di-download");
		} catch (error) {
			console.error("Excel Export Error:", error);
			toast.error("Gagal mengexport Excel");
		}
	}, [filteredTransactions, productType]);

	const exportToPDF = useCallback(() => {
		if (filteredTransactions.length === 0) {
			toast.error("Tidak ada data untuk di-export");
			return;
		}

		try {
			const doc = new jsPDF();
			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();

			// Title
			doc.setFont("helvetica", "bold");
			doc.setFontSize(16);
			doc.text(`Laporan Transaksi ${productType === "tiket" ? "Tiket" : "Produk Umum"}`, pageWidth / 2, 15, {
				align: "center",
			});

			// Date range info
			doc.setFont("helvetica", "normal");
			doc.setFontSize(10);
			const dateRangeText =
				dateFrom || dateTo
					? `Periode: ${dateFrom ? format(new Date(dateFrom), "dd-MM-yyyy") : "-"} s/d ${dateTo ? format(new Date(dateTo), "dd-MM-yyyy") : "-"}`
					: "Semua Periode";
			doc.text(dateRangeText, pageWidth / 2, 22, { align: "center" });

			// Table data
			const tableData = filteredTransactions.map((t) => [
				t.attributes.order_id,
				format(new Date(t.attributes.createdAt), "dd/MM/yyyy"),
				t.attributes.products?.[0]?.product_name || "Unknown",
				t.attributes.products?.[0]?.quantity || "-",
				`Rp ${(t.attributes.products?.[0]?.price || 0).toLocaleString("id-ID")}`,
				`Rp ${t.attributes.totalAmount.toLocaleString("id-ID")}`,
				t.attributes.payment_status,
			]);

			const columns = [
				{ header: "Order ID", dataKey: "order_id" },
				{ header: "Tanggal", dataKey: "date" },
				{ header: "Produk", dataKey: "product" },
				{ header: "Qty", dataKey: "qty" },
				{ header: "Harga", dataKey: "price" },
				{ header: "Total", dataKey: "total" },
				{ header: "Status", dataKey: "status" },
			];

			(doc as any).autoTable({
				head: [["Order ID", "Tanggal", "Produk", "Qty", "Harga", "Total", "Status"]],
				body: tableData,
				startY: 30,
				margin: { left: 10, right: 10 },
				didDrawPage: (data: any) => {
					const pageCount = (doc as any).internal.pages.length - 1;
					doc.setFont("helvetica", "normal");
					doc.setFontSize(9);
					doc.text(`Halaman ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: "right" });
				},
			});

			doc.save(`Transaksi_${productType}_${format(new Date(), "ddMMyyyyHHmm")}.pdf`);
			toast.success("PDF berhasil di-download");
		} catch (error) {
			console.error("PDF Export Error:", error);
			toast.error("Gagal mengexport PDF");
		}
	}, [filteredTransactions, dateFrom, dateTo, productType]);

	return (
		<div className="mb-6 space-y-4">
			{/* Filter Button & Export Buttons */}
			<div className="flex flex-wrap gap-2 items-center">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2"
				>
					<Filter size={16} />
					Filter ({filteredTransactions.length}/{transactions.length})
				</Button>

				{/* Export Buttons */}
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={exportToCSV}
						className="flex items-center gap-2"
						title="Download as CSV"
					>
						<Download size={16} />
						CSV
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={exportToExcel}
						className="flex items-center gap-2"
						title="Download as Excel"
					>
						<Download size={16} />
						Excel
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={exportToPDF}
						className="flex items-center gap-2"
						title="Download as PDF"
					>
						<Download size={16} />
						PDF
					</Button>
				</div>

				{/* Reset Button */}
				{(dateFrom || dateTo || paymentStatus !== "all" || productName || orderId) && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleResetFilters}
						className="flex items-center gap-2 ml-auto"
					>
						<RotateCcw size={16} />
						Reset
					</Button>
				)}
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						{/* Date From */}
						<div>
							<label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
							<input
								type="date"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
							/>
						</div>

						{/* Date To */}
						<div>
							<label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
							<input
								type="date"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
							/>
						</div>

						{/* Payment Status */}
						<div>
							<label className="block text-sm font-medium mb-2">Status Pembayaran</label>
							<select
								value={paymentStatus}
								onChange={(e) => setPaymentStatus(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
							>
								<option value="all">Semua Status</option>
								<option value="paid">Sudah Dibayar</option>
								<option value="settlement">Settlement</option>
								<option value="pending">Pending</option>
								<option value="failed">Gagal</option>
							</select>
						</div>

						{/* Product Name */}
						<div>
							<label className="block text-sm font-medium mb-2">Nama Produk</label>
							{uniqueProducts.length > 0 ? (
								<select
									value={productName}
									onChange={(e) => setProductName(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
								>
									<option value="">Semua Produk</option>
									{uniqueProducts.map((product) => (
										<option key={product} value={product}>
											{product}
										</option>
									))}
								</select>
							) : (
								<input
									type="text"
									value={productName}
									onChange={(e) => setProductName(e.target.value)}
									placeholder="Cari nama produk..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
								/>
							)}
						</div>

						{/* Order ID */}
						<div>
							<label className="block text-sm font-medium mb-2">Order ID</label>
							<input
								type="text"
								value={orderId}
								onChange={(e) => setOrderId(e.target.value)}
								placeholder="Cari order ID..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-green"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Results Summary */}
			{filteredTransactions.length !== transactions.length && (
				<div className="text-sm text-gray-600">
					📊 Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
				</div>
			)}
		</div>
	);
};
