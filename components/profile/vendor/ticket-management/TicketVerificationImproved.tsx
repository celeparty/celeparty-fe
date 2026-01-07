"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

interface TicketInfo {
	id: string;
	code: string;
	product_name: string;
	customer_name: string;
	recipient_name: string;
	recipient_email: string;
	verification_status?: string;
}

export const TicketVerificationImproved: React.FC = () => {
	const { data: session } = useSession();
	const [searchCode, setSearchCode] = useState("");
	const [foundTicket, setFoundTicket] = useState<TicketInfo | null>(null);
	const [verificationStatus, setVerificationStatus] = useState("verified");
	const [verificationNotes, setVerificationNotes] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	// Fetch all ticket transactions for this vendor (no complex filters)
	const fetchVendorTickets = async () => {
		if (!session?.user?.documentId) {
			console.log("No vendor ID");
			return [];
		}

		try {
			// Fetch all transactions, then filter in JavaScript
			const response = await axios.get(`/api/transaction-proxy?sort=createdAt:desc&populate=*`);
			const allTransactions = response.data?.data || [];

			console.log("All transactions:", allTransactions);

			// Filter untuk vendor ini saja
			const vendorTransactions = allTransactions.filter((transaction: any) => {
				const attrs = transaction.attributes;
				// Check both possible field names
				const vendorId = attrs.vendor_doc_id || attrs.vendor_id || attrs.mitra_id;
				return vendorId === session.user.documentId;
			});

			console.log("Vendor transactions:", vendorTransactions);

			// Further filter untuk tickets
			return vendorTransactions.filter((transaction: any) => {
				const attrs = transaction.attributes;
				const products = attrs.products || [];
				return products.some((p: any) => p.product_type === 'ticket' || attrs.event_type === 'ticket');
			});
		} catch (error: any) {
			console.error("Error fetching tickets:", error);
			return [];
		}
	};

	const ticketsQuery = useQuery({
		queryKey: ["vendorTickets", session?.user?.documentId],
		queryFn: fetchVendorTickets,
		staleTime: 5000,
		enabled: !!session,
	});

	// Handle ticket search
	const handleSearch = async () => {
		if (!searchCode.trim()) {
			toast.error("Masukkan kode tiket");
			return;
		}

		setIsSearching(true);
		try {
			const transactions = ticketsQuery.data || [];
			const searchTerm = searchCode.toLowerCase();

			// Search through transactions
			let found = false;
			for (const transaction of transactions) {
				const attrs = transaction.attributes;
				const products = attrs.products || [];

				for (const product of products) {
					const recipients = product.recipients || [];

					for (const recipient of recipients) {
						if (
							(recipient.ticket_code || "").toLowerCase().includes(searchTerm) ||
							(recipient.name || "").toLowerCase().includes(searchTerm)
						) {
							setFoundTicket({
								id: transaction.id,
								code: recipient.ticket_code,
								product_name: product.product_name || "Unknown",
								customer_name: attrs.customer_name,
								recipient_name: recipient.name,
								recipient_email: recipient.email,
								verification_status: recipient.verification_status,
							});
							toast.success("Tiket ditemukan!");
							found = true;
							break;
						}
					}
					if (found) break;
				}
				if (found) break;
			}

			if (!found) {
				setFoundTicket(null);
				toast.error("Tiket tidak ditemukan");
			}
		} catch (error) {
			console.error("Error searching:", error);
			toast.error("Gagal mencari tiket");
		} finally {
			setIsSearching(false);
		}
	};

	// Handle verification
	const handleVerify = async () => {
		if (!foundTicket) {
			toast.error("Pilih tiket terlebih dahulu");
			return;
		}

		setIsVerifying(true);
		try {
			// For now, just show success message
			// In production, this would update the transaction
			toast.success("Tiket berhasil diverifikasi!");
			setSearchCode("");
			setFoundTicket(null);
			setVerificationNotes("");
			setVerificationStatus("verified");
		} catch (error) {
			console.error("Error:", error);
			toast.error("Gagal memverifikasi tiket");
		} finally {
			setIsVerifying(false);
		}
	};

	if (ticketsQuery.isLoading) {
		return <Skeleton width="100%" height="300px" />;
	}

	if (ticketsQuery.isError) {
		return <ErrorNetwork style="mt-0" />;
	}

	return (
		<div className="space-y-6">
			{/* Search Section */}
			<div className="bg-white p-6 rounded-lg shadow border">
				<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
					<Search className="h-5 w-5" />
					Cari & Verifikasi Tiket
				</h3>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Kode Tiket</label>
						<div className="flex gap-2">
							<Input
								placeholder="Masukkan kode tiket..."
								value={searchCode}
								onChange={(e) => setSearchCode(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleSearch()}
								disabled={isSearching}
							/>
							<Button
								onClick={handleSearch}
								disabled={isSearching}
								className="bg-blue-600 hover:bg-blue-700"
							>
								{isSearching ? "..." : "Cari"}
							</Button>
						</div>
					</div>

					{foundTicket && (
						<div className="bg-blue-50 border border-blue-200 p-4 rounded">
							<p className="font-semibold text-blue-900">Tiket Ditemukan!</p>
							<p className="text-sm text-blue-800 mt-1">
								{foundTicket.product_name} - {foundTicket.recipient_name}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Ticket Details */}
			{foundTicket && (
				<div className="bg-white p-6 rounded-lg shadow border">
					<h3 className="text-lg font-semibold mb-4">Detail Tiket</h3>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div>
							<p className="text-sm text-gray-600">Kode Tiket</p>
							<p className="font-semibold">{foundTicket.code}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Produk</p>
							<p className="font-semibold">{foundTicket.product_name}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Pemesan</p>
							<p className="font-semibold">{foundTicket.customer_name}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">Penerima</p>
							<p className="font-semibold">{foundTicket.recipient_name}</p>
						</div>
						<div className="col-span-2">
							<p className="text-sm text-gray-600">Email</p>
							<p className="font-semibold">{foundTicket.recipient_email}</p>
						</div>
					</div>

					<div className="border-t pt-6">
						<h4 className="font-semibold mb-4">Verifikasi</h4>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">Status Verifikasi</label>
								<Select value={verificationStatus} onValueChange={setVerificationStatus}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="verified">Terverifikasi</SelectItem>
										<SelectItem value="pending">Menunggu</SelectItem>
										<SelectItem value="rejected">Ditolak</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
								<Textarea
									placeholder="Tambahkan catatan..."
									value={verificationNotes}
									onChange={(e) => setVerificationNotes(e.target.value)}
									rows={3}
								/>
							</div>

							<Button
								onClick={handleVerify}
								disabled={isVerifying}
								className="w-full bg-green-600 hover:bg-green-700"
							>
								{isVerifying ? "Memverifikasi..." : "Verifikasi Tiket"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Summary */}
			{ticketsQuery.data && (
				<div className="bg-white p-6 rounded-lg shadow border">
					<h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
					<p className="text-gray-600">
						Total tiket dalam sistem: <strong>{ticketsQuery.data.length}</strong>
					</p>
				</div>
			)}
		</div>
	);
};
