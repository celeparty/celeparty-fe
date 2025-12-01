"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import {
	iTicketSummary,
	iTicketDetail,
	iExportFilter,
	iExportFormat,
} from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { formatNumberWithDots } from "@/lib/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface iTicketDetailPageProps {
	product: iTicketSummary;
}

export const TicketDetailPage: React.FC<iTicketDetailPageProps> = ({ product }) => {
	const { data: session } = useSession();
	const [sortBy, setSortBy] = useState<"date" | "variant" | "status">("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [filterVariant, setFilterVariant] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [searchRecipient, setSearchRecipient] = useState<string>("");

	// Fetch detail tiket
	const getTicketDetails = async () => {
		if (!session?.jwt) return [];
		try {
			const response = await axiosUser(
				"GET",
				`/api/tickets/detail/${product.product_id}`,
				session.jwt
			);
			return response?.data || [];
		} catch (error) {
			console.error("Error fetching ticket details:", error);
			return [];
		}
	};

	const detailQuery = useQuery({
		queryKey: ["ticketDetails", product.product_id, session?.jwt],
		queryFn: getTicketDetails,
		enabled: !!session?.jwt,
		staleTime: 5 * 60 * 1000,
	});

	// Filter dan sort data
	const filteredData = useMemo(() => {
		let data = detailQuery.data || [];

		// Filter by variant
		if (filterVariant !== "all") {
			data = data.filter((t) => t.variant_name === filterVariant);
		}

		// Filter by status
		if (filterStatus !== "all") {
			data = data.filter((t) => t.verification_status === filterStatus);
		}

		// Filter by recipient name
		if (searchRecipient) {
			data = data.filter((t) =>
				t.recipient_name.toLowerCase().includes(searchRecipient.toLowerCase())
			);
		}

		// Sort
		data.sort((a, b) => {
			let compareValue = 0;

			if (sortBy === "date") {
				compareValue =
					new Date(b.purchase_date).getTime() -
					new Date(a.purchase_date).getTime();
			} else if (sortBy === "variant") {
				compareValue = a.variant_name.localeCompare(b.variant_name);
			} else if (sortBy === "status") {
				compareValue = a.verification_status.localeCompare(b.verification_status);
			}

			return sortOrder === "asc" ? -compareValue : compareValue;
		});

		return data;
	}, [detailQuery.data, sortBy, sortOrder, filterVariant, filterStatus, searchRecipient]);

	// Get unique variants for filter
	const uniqueVariants = useMemo(() => {
		return [...new Set(detailQuery.data?.map((t) => t.variant_name) || [])];
	}, [detailQuery.data]);

	// Export handlers
	const handleExportExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(
			filteredData.map((t) => ({
				"Kode Tiket": t.ticket_code,
				"Nama Penerima": t.recipient_name,
				"Email": t.recipient_email,
				"No. Telepon": t.recipient_phone,
				"Varian": t.variant_name,
				"Status Verifikasi": t.verification_status,
				"Tanggal Beli": t.purchase_date,
				"Tanggal Verifikasi": t.verification_date || "-",
			}))
		);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(
			workbook,
			worksheet,
			`Tiket-${product.product_title}`
		);
		XLSX.writeFile(
			workbook,
			`Tiket_${product.product_title}_${new Date().toISOString().split("T")[0]}.xlsx`
		);
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();
		const tableData = filteredData.map((t) => [
			t.ticket_code,
			t.recipient_name,
			t.recipient_email,
			t.variant_name,
			t.verification_status,
			t.purchase_date,
		]);

		(doc as any).autoTable({
			head: [
				[
					"Kode Tiket",
					"Nama Penerima",
					"Email",
					"Varian",
					"Status",
					"Tanggal Beli",
				],
			],
			body: tableData,
			startY: 20,
			margin: { top: 15 },
		});

		doc.text(`Laporan Tiket - ${product.product_title}`, 14, 10);
		doc.save(
			`Tiket_${product.product_title}_${new Date().toISOString().split("T")[0]}.pdf`
		);
	};

	const handleExportCSV = () => {
		const headers = [
			"Kode Tiket",
			"Nama Penerima",
			"Email",
			"No. Telepon",
			"Varian",
			"Status Verifikasi",
			"Tanggal Beli",
			"Tanggal Verifikasi",
		];
		const rows = filteredData.map((t) => [
			t.ticket_code,
			t.recipient_name,
			t.recipient_email,
			t.recipient_phone,
			t.variant_name,
			t.verification_status,
			t.purchase_date,
			t.verification_date || "-",
		]);

		const csv = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `Tiket_${product.product_title}_${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
	};

	if (detailQuery.isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton width="100%" height="100px" />
				<Skeleton width="100%" height="400px" />
			</div>
		);
	}

	return (
		<div>
			{/* Summary Section */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-blue-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600">Total Tiket</p>
					<p className="text-2xl font-bold text-blue-600">
						{product.variants.reduce((sum, v) => sum + v.quota, 0)}
					</p>
				</div>
				<div className="bg-green-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600">Terjual</p>
					<p className="text-2xl font-bold text-green-600">
						{product.totalTicketsSold}
					</p>
				</div>
				<div className="bg-yellow-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600">Terverifikasi</p>
					<p className="text-2xl font-bold text-yellow-600">
						{filteredData.filter((t) => t.verification_status === "verified").length}
					</p>
				</div>
				<div className="bg-purple-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600">Total Income</p>
					<p className="text-2xl font-bold text-purple-600">
						Rp {formatNumberWithDots(product.totalRevenue)}
					</p>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
				<h3 className="font-semibold mb-4 flex items-center gap-2">
					<Filter className="w-4 h-4" />
					Filter & Sort
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
					<Input
						placeholder="Cari nama penerima..."
						value={searchRecipient}
						onChange={(e) => setSearchRecipient(e.target.value)}
						className="text-sm"
					/>
					<Select value={filterVariant} onValueChange={setFilterVariant}>
						<SelectTrigger>
							<SelectValue placeholder="Filter Varian" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua Varian</SelectItem>
							{uniqueVariants.map((variant) => (
								<SelectItem key={variant} value={variant}>
									{variant}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={filterStatus} onValueChange={setFilterStatus}>
						<SelectTrigger>
							<SelectValue placeholder="Filter Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua Status</SelectItem>
							<SelectItem value="verified">Terverifikasi</SelectItem>
							<SelectItem value="unverified">Belum Verifikasi</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
						<SelectTrigger>
							<SelectValue placeholder="Urutkan Berdasarkan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date">Tanggal</SelectItem>
							<SelectItem value="variant">Varian</SelectItem>
							<SelectItem value="status">Status</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
						<SelectTrigger>
							<SelectValue placeholder="Urutan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="desc">Terbaru</SelectItem>
							<SelectItem value="asc">Terlama</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Export Buttons */}
			<div className="flex gap-2 mb-4">
				<Button
					variant="outline"
					size="sm"
					onClick={handleExportExcel}
					className="flex items-center gap-2"
				>
					<Download className="w-4 h-4" />
					Export Excel
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleExportPDF}
					className="flex items-center gap-2"
				>
					<Download className="w-4 h-4" />
					Export PDF
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleExportCSV}
					className="flex items-center gap-2"
				>
					<Download className="w-4 h-4" />
					Export CSV
				</Button>
			</div>

			{/* Details Table */}
			<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-100 border-b border-gray-200">
							<th className="px-4 py-3 text-left text-sm font-semibold">Kode Tiket</th>
							<th className="px-4 py-3 text-left text-sm font-semibold">Nama Penerima</th>
							<th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
							<th className="px-4 py-3 text-left text-sm font-semibold">Varian</th>
							<th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
							<th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Beli</th>
							<th className="px-4 py-3 text-left text-sm font-semibold">Tanggal Verifikasi</th>
						</tr>
					</thead>
					<tbody>
						{filteredData.length > 0 ? (
							filteredData.map((ticket) => (
								<tr
									key={ticket.id}
									className="border-b border-gray-200 hover:bg-gray-50"
								>
									<td className="px-4 py-3 text-sm font-mono">{ticket.ticket_code}</td>
									<td className="px-4 py-3 text-sm">{ticket.recipient_name}</td>
									<td className="px-4 py-3 text-sm text-blue-600">
										{ticket.recipient_email}
									</td>
									<td className="px-4 py-3 text-sm">{ticket.variant_name}</td>
									<td className="px-4 py-3 text-center">
										<span
											className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
												ticket.verification_status === "verified"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{ticket.verification_status === "verified"
												? "Terverifikasi"
												: "Belum Verifikasi"}
										</span>
									</td>
									<td className="px-4 py-3 text-sm">
										{new Date(ticket.purchase_date).toLocaleDateString("id-ID")}
									</td>
									<td className="px-4 py-3 text-sm">
										{ticket.verification_date
											? new Date(ticket.verification_date).toLocaleDateString("id-ID")
											: "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="px-4 py-8 text-center text-gray-500">
									Tidak ada data tiket
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-4 text-sm text-gray-600">
				Menampilkan {filteredData.length} dari{" "}
				{detailQuery.data?.length || 0} tiket
			</div>
		</div>
	);
};
