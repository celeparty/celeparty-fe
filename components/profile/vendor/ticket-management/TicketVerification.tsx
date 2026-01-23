"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { formatDate } from "@/lib/utils";
import { Search, Check, AlertCircle, Clock } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TicketInfo {
	ticket_code: string;
	product_name: string;
	recipient_name: string;
	recipient_email: string;
	recipient_identity: string;
	verification_status: 'pending' | 'verified' | 'rejected';
	verified_date?: string;
	transaction_id: string;
}

interface VerificationHistory {
	ticket_code: string;
	verified_date: string;
	status: 'verified' | 'rejected';
	verified_by: string;
	notes?: string;
}

export const TicketVerification: React.FC = () => {
	const { data: session } = useSession();
	const { toast } = useToast();
	
	const [searchCode, setSearchCode] = useState("");
	const [foundTicket, setFoundTicket] = useState<TicketInfo | null>(null);
	const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected' | ''>('');
	const [verificationNotes, setVerificationNotes] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	// Fetch verification history
	const getVerificationHistory = async (): Promise<VerificationHistory[]> => {
		if (!session?.user?.documentId || !session?.jwt) return [];
		try {
			// Fetch ticket transactions for this vendor
			const { axiosUser } = await import('@/lib/services');
			const filterParam = `filters[vendor_id][$eq]=${session.user.documentId}`;
			const response = await axiosUser(
				"GET",
				`/api/transaction-tickets-proxy?${filterParam}&sort=createdAt:desc&pagination[pageSize]=1000`,
				session.jwt
			);
			
			// Extract verification history from transaction-tickets
			const history: VerificationHistory[] = [];
			(response.data?.data || []).forEach((transaction: any) => {
				const attrs = transaction.attributes;
				const recipients = attrs.recipients || [];
				
				recipients.forEach((recipient: any) => {
					if (recipient.ticket_code) {
						history.push({
							ticket_code: recipient.ticket_code,
							verified_date: attrs.createdAt || new Date().toISOString(),
							status: recipient.status === 'verified' || recipient.verification_status === 'verified' ? 'verified' : 'rejected',
							verified_by: 'vendor',
							notes: attrs.note || '',
						});
					}
				});
			});
			return history;
		} catch (error) {
			console.error("Error fetching verification history:", error);
			return [];
		}
	};

	const historyQuery = useQuery({
		queryKey: ["ticketVerificationHistory", session?.user?.documentId],
		queryFn: getVerificationHistory,
		enabled: !!session?.user?.documentId,
		staleTime: 5 * 60 * 1000,
	});

	// Search for ticket by code
	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!searchCode.trim()) {
			toast({
				title: "Error",
				description: "Masukkan kode tiket untuk mencari",
				className: eAlertType.FAILED,
			});
			return;
		}

		setHasSearched(true);

		try {
			// Search in all ticket transactions for this vendor with matching ticket code
			const { axiosUser } = await import('@/lib/services');
			if (!session?.jwt) {
				toast({
					title: "Error",
					description: "Session expired, please login again",
					className: eAlertType.FAILED,
				});
				return;
			}

			const filterParam = `filters[vendor_id][$eq]=${session?.user?.documentId}`;
			const response = await axiosUser(
				"GET",
				`/api/transaction-tickets-proxy?${filterParam}&sort=createdAt:desc&pagination[pageSize]=1000`,
				session.jwt
			);

			let ticketFound = false;
			const transactions = response.data?.data || [];

			for (const transaction of transactions) {
				const attrs = transaction.attributes;
				const recipients = attrs.recipients || [];
				
				for (const recipient of recipients) {
					if (recipient.ticket_code === searchCode.toUpperCase()) {
						setFoundTicket({
							ticket_code: recipient.ticket_code,
							product_name: attrs.product_name,
							recipient_name: recipient.name,
							recipient_email: recipient.email,
							recipient_identity: `${recipient.identity_type}: ${recipient.identity_number}`,
							verification_status: recipient.status || recipient.verification_status || 'pending',
							verified_date: attrs.createdAt,
							transaction_id: transaction.id,
						});
						ticketFound = true;
						setVerificationStatus(recipient.status || recipient.verification_status || '');
						break;
					}
				}
				if (ticketFound) break;
			}

			if (!ticketFound) {
				toast({
					title: "Tiket Tidak Ditemukan",
					description: `Kode tiket "${searchCode}" tidak ditemukan`,
					className: eAlertType.FAILED,
				});
				setFoundTicket(null);
			}
		} catch (error) {
			console.error("Error searching ticket:", error);
			toast({
				title: "Error",
				description: "Gagal mencari tiket. Silakan coba lagi.",
				className: eAlertType.FAILED,
			});
			setFoundTicket(null);
		}
	};

	// Verify ticket manually
	const handleVerify = async () => {
		if (!foundTicket || !verificationStatus) {
			toast({
				title: "Error",
				description: "Pilih status verifikasi",
				className: eAlertType.FAILED,
			});
			return;
		}

		setIsVerifying(true);
		try {
			// Update transaction-ticket with verification status
			const { axiosUser } = await import('@/lib/services');
			if (!session?.jwt) {
				toast({
					title: "Error",
					description: "Session expired, please login again",
					className: eAlertType.FAILED,
				});
				return;
			}

			const response = await axiosUser(
				"PUT",
				`/api/transaction-tickets-proxy`,
				session.jwt,
				{
					id: foundTicket.transaction_id,
					data: {
						// Update recipients array in the transaction
						// Note: This may need backend endpoint enhancement to properly update recipient verification status
						verification: verificationStatus === 'verified',
					},
				}
			);

			toast({
				title: "Verifikasi Berhasil",
				description: `Tiket ${foundTicket.ticket_code} telah diverifikasi sebagai ${verificationStatus === 'verified' ? 'Valid' : 'Ditolak'}`,
				className: eAlertType.SUCCESS,
			});

			// Refetch history
			historyQuery.refetch();

			// Reset
			setFoundTicket(null);
			setSearchCode("");
			setVerificationStatus("");
			setVerificationNotes("");
			setHasSearched(false);
		} catch (error) {
			console.error("Error verifying ticket:", error);
			toast({
				title: "Error",
				description: "Gagal memverifikasi tiket. Silakan coba lagi.",
				className: eAlertType.FAILED,
			});
		} finally {
			setIsVerifying(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'verified':
				return <Check className="h-5 w-5 text-green-600" />;
			case 'rejected':
				return <AlertCircle className="h-5 w-5 text-red-600" />;
			default:
				return <Clock className="h-5 w-5 text-yellow-600" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'verified':
				return 'bg-green-100 text-green-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-yellow-100 text-yellow-800';
		}
	};

	return (
		<div className="w-full space-y-6">
			{/* Search Section */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Cari Tiket</h3>
				<form onSubmit={handleSearch} className="flex gap-2 mb-4">
					<input
						type="text"
						placeholder="Masukkan kode tiket (cth: TKT001)"
						value={searchCode}
						onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-c-blue"
					/>
					<Button
						type="submit"
						className="bg-c-blue hover:bg-c-blue-light text-white flex items-center gap-2"
					>
						<Search className="h-4 w-4" />
						Cari
					</Button>
				</form>

				{/* Ticket Found Display */}
				{hasSearched && foundTicket && (
					<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<h4 className="font-semibold text-c-blue mb-3">Informasi Tiket</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-gray-600">Kode Tiket</p>
								<p className="font-semibold">{foundTicket.ticket_code}</p>
							</div>
							<div>
								<p className="text-gray-600">Nama Produk</p>
								<p className="font-semibold">{foundTicket.product_name}</p>
							</div>
							<div>
								<p className="text-gray-600">Nama Penerima</p>
								<p className="font-semibold">{foundTicket.recipient_name}</p>
							</div>
							<div>
								<p className="text-gray-600">Email</p>
								<p className="font-semibold">{foundTicket.recipient_email}</p>
							</div>
							<div className="md:col-span-2">
								<p className="text-gray-600">Identitas</p>
								<p className="font-semibold">{foundTicket.recipient_identity}</p>
							</div>
							<div>
								<p className="text-gray-600">Status Saat Ini</p>
								<span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(foundTicket.verification_status)}`}>
									{foundTicket.verification_status === 'verified' ? 'Terverifikasi' : foundTicket.verification_status === 'rejected' ? 'Ditolak' : 'Pending'}
								</span>
							</div>
						</div>

						{/* Verification Section */}
						<div className="mt-6 pt-6 border-t border-blue-200">
							<h4 className="font-semibold text-c-blue mb-3">Verifikasi Tiket</h4>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Status Verifikasi
									</label>
									<select
										value={verificationStatus}
										onChange={(e) => setVerificationStatus(e.target.value as any)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-c-blue"
									>
										<option value="">-- Pilih Status --</option>
										<option value="verified">✓ Terverifikasi</option>
										<option value="rejected">✗ Ditolak</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Catatan (Opsional)
									</label>
									<textarea
										value={verificationNotes}
										onChange={(e) => setVerificationNotes(e.target.value)}
										placeholder="Catatan verifikasi..."
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-c-blue"
										rows={3}
									/>
								</div>

								<div className="flex gap-2 pt-2">
									<Button
										onClick={handleVerify}
										disabled={isVerifying || !verificationStatus}
										className="bg-c-green hover:bg-c-green-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isVerifying ? "Memproses..." : "Verifikasi Tiket"}
									</Button>
									<Button
										onClick={() => {
											setFoundTicket(null);
											setSearchCode("");
											setVerificationStatus("");
											setVerificationNotes("");
											setHasSearched(false);
										}}
										variant="outline"
										className="text-gray-700"
									>
										Batal
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}

				{hasSearched && !foundTicket && (
					<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
						Kode tiket "{searchCode}" tidak ditemukan dalam transaksi Anda
					</div>
				)}
			</div>

			{/* Verification History */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h3 className="text-lg font-semibold mb-4">Riwayat Verifikasi</h3>
				
				{historyQuery.isLoading && <Skeleton width="100%" height="200px" />}
				
				{historyQuery.isError && (
					<div className="text-red-600 text-sm">
						Gagal memuat riwayat verifikasi
					</div>
				)}

				{historyQuery.data && historyQuery.data.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Kode Tiket</TableHead>
								<TableHead>Tanggal Verifikasi</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Catatan</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{historyQuery.data.map((item, idx) => (
								<TableRow key={idx} className={idx % 2 === 0 ? "bg-slate-100" : "bg-white"}>
									<TableCell className="font-medium">{item.ticket_code}</TableCell>
									<TableCell>{formatDate(item.verified_date)}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{getStatusIcon(item.status)}
											<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
												{item.status === 'verified' ? 'Terverifikasi' : 'Ditolak'}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-sm text-gray-600">{item.notes || '-'}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="text-center py-8 text-gray-500">
						Belum ada riwayat verifikasi
					</div>
				)}
			</div>
		</div>
	);
};
