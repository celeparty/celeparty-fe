import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportData {
	orderId: string;
	tanggal: string;
	namaPelanggan: string;
	produk: string;
	qty?: number;
	hargaSatuan?: number;
	totalPembayaran: number;
	statusPembayaran: string;
	telepon?: string;
	lokasi?: string;
}

export const exportToCSV = (data: ExportData[], filename: string = "transaksi.csv") => {
	try {
		const csvContent = [
			["Order ID", "Tanggal", "Nama Pelanggan", "Produk", "Qty", "Harga Satuan", "Total Pembayaran", "Status", "Telepon", "Lokasi"],
			...data.map((item) => [
				item.orderId,
				item.tanggal,
				item.namaPelanggan,
				item.produk,
				item.qty || "",
				item.hargaSatuan || "",
				item.totalPembayaran,
				item.statusPembayaran,
				item.telepon || "",
				item.lokasi || "",
			]),
		]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		console.error("Export CSV error:", error);
		throw error;
	}
};

export const exportToExcel = (data: ExportData[], filename: string = "transaksi.xlsx") => {
	try {
		const workbookData = data.map((item) => ({
			"Order ID": item.orderId,
			Tanggal: item.tanggal,
			"Nama Pelanggan": item.namaPelanggan,
			Produk: item.produk,
			Qty: item.qty || "",
			"Harga Satuan": item.hargaSatuan || "",
			"Total Pembayaran": item.totalPembayaran,
			Status: item.statusPembayaran,
			Telepon: item.telepon || "",
			Lokasi: item.lokasi || "",
		}));

		const worksheet = XLSX.utils.json_to_sheet(workbookData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
		XLSX.writeFile(workbook, filename);
	} catch (error) {
		console.error("Export Excel error:", error);
		throw error;
	}
};

export const exportToPDF = (data: ExportData[], filename: string = "transaksi.pdf") => {
	try {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();

		// Header
		doc.setFontSize(16);
		doc.text("Laporan Transaksi", pageWidth / 2, 15, { align: "center" });

		// Date info
		doc.setFontSize(10);
		doc.text(`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`, 15, 25);

		// Table
		const tableColumn = ["Order ID", "Tanggal", "Pelanggan", "Produk", "Total", "Status"];
		const tableRows = data.map((item) => [
			item.orderId,
			item.tanggal,
			item.namaPelanggan,
			item.produk,
			`Rp ${item.totalPembayaran.toLocaleString("id-ID")}`,
			item.statusPembayaran,
		]);

		(doc as any).autoTable({
			columns: tableColumn.map((col) => ({ header: col, width: pageWidth / 6 })),
			body: tableRows,
			startY: 35,
			theme: "grid",
			headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
			bodyStyles: { textColor: [0, 0, 0] },
			alternateRowStyles: { fillColor: [240, 240, 240] },
		});

		doc.save(filename);
	} catch (error) {
		console.error("Export PDF error:", error);
		throw error;
	}
};
