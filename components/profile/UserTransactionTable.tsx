import { iOrderItem } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronDown, ChevronUp, Download, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import ErrorNetwork from "../ErrorNetwork";
import { InvoiceViewer } from "../InvoiceViewer";
import Skeleton from "../Skeleton";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface iTableDataProps {
	isVendor: boolean;
	activeTab: string;
	orderTypeFilter?: 'equipment' | 'ticket' | 'all';
}

interface TransactionItem {
	id: string;
	createdAt: string;
	payment_status: string;
	order_id: string;
	customer_name: string;
	telp?: string;
	email?: string;
	shipping_location?: string;
	event_date?: string;
	loading_date?: string;
	loading_time?: string;
	note?: string;
	quantity?: number;
	unit_price?: number;
	total_payment: number;
	payment_date?: string;
	products: Array<{ id: string; title: string; }>;
	recipients?: any[]; // Consider defining a more specific interface for recipients if needed
	transaction_type: 'ticket' | 'equipment';
	product?: {
		id: string;
		title: string;
		image?: string;
		event_date?: string;
		event_end_date?: string;
		event_time?: string;
		location?: string;
		city?: string;
	} | null;
	variant?: {
		id: string;
		name: string;
		price: number;
	} | null;
}

export const UserTransactionTable: React.FC<iTableDataProps> = ({ isVendor, activeTab, orderTypeFilter = 'all' }) => {
	const { data: session, status } = useSession();
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

	const getTransactionsQuery = async () => {
		if (!session) return [];

		try {
			// Build URL with proper filters
			let url = `/api/transaction-proxy?sort=createdAt:desc&pagination[pageSize]=100`;
			
			// Add filter based on order type
			if (orderTypeFilter === 'equipment') {
				url += `&filters[event_type][$eq]=equipment`;
			} else if (orderTypeFilter === 'ticket') {
				url += `&filters[event_type][$eq]=ticket`;
			}
			// if 'all', don't add event_type filter
			
			// Add vendor filter if vendor
			if (isVendor && session.user?.documentId) {
				url += `&filters[vendor_doc_id][$eq]=${session.user.documentId}`;
			} else if (!isVendor && session.user?.email) {
				// For customer, filter by email
				url += `&filters[email][$eq]=${session.user.email}`;
			}
			
			console.log("UserTransactionTable - Fetching URL:", url);
			const response = await axios.get(url);
			console.log("UserTransactionTable - Response data:", response.data);
			
			if (!response.data.data) {
				console.warn("UserTransactionTable - No data field in response:", response.data);
				return [];
			}
			
			return response.data.data;
		} catch (error: any) {
			console.error("UserTransactionTable - Fetch error:", {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
			});
			throw error;
		}
	};

	const transactionsQuery = useQuery({
		queryKey: ["qUserTransactions", activeTab, isVendor, session?.user?.documentId, session?.user?.email],
		queryFn: getTransactionsQuery,
		staleTime: 5000,
		enabled: !!session,
		retry: 3,
	});

	const toggleRow = (id: string) => {
		setExpandedRows((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	if (transactionsQuery.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (transactionsQuery.isError) {
		return <ErrorNetwork style="mt-0" />;
	}

	const allTransactions = transactionsQuery.data || [];
	let dataContent: TransactionItem[] = allTransactions.map((transaction: any) => {
		// Handle both new flat structure and old nested structure
		const attrs = transaction.attributes;
		
		// NEW STRUCTURE: products is a JSON field with array of product objects
		const productsData = attrs.products || [];
		const isTicket = attrs.event_type === 'ticket' || productsData.some((p: any) => p.product_type === 'ticket');
		
		// Reconstruct products list for display
		const productsList = productsData.map((item: any) => ({
			id: item.product_id || item.id,
			title: item.product_name || item.name,
		})) || [];
		
		// Get first product for details
		const mainProduct = productsData?.[0];

		return {
			id: transaction.id,
			createdAt: attrs.createdAt,
			payment_status: attrs.payment_status,
			order_id: attrs.order_id,
			customer_name: attrs.customer_name,
			telp: attrs.telp,
			email: attrs.email,
			shipping_location: attrs.shipping_location,
			event_date: attrs.event_date,
			loading_date: attrs.loading_date,
			loading_time: attrs.loading_time,
			note: attrs.note,
			quantity: mainProduct?.quantity || 1,
			unit_price: mainProduct?.price || 0,
			total_payment: attrs.total || 0,
			payment_date: attrs.payment_date,
			products: productsList,
			recipients: mainProduct?.recipients || attrs.recipients || [], // Recipients from products data
			transaction_type: isTicket ? 'ticket' : 'equipment',
			// Detailed product info for expansion (simplified since we don't have full product details in flat structure)
			product: isTicket ? {
				id: mainProduct?.product_id,
				title: mainProduct?.product_name,
				image: mainProduct?.image, // Assuming image URL is stored
				event_date: attrs.event_date,
				event_end_date: attrs.event_date, // May need to get from full product data
				event_time: '', // Data not in flat structure
				location: '', // Data not in flat structure
				city: '', // Data not in flat structure
			} : null,
			variant: isTicket ? {
				id: mainProduct?.variant || '',
				name: mainProduct?.variant || '',
				price: mainProduct?.price || 0,
			} : null,
		};
	});

	// Filter based on orderTypeFilter
	if (orderTypeFilter === 'equipment') {
		dataContent = dataContent.filter((item: TransactionItem) => item.transaction_type === 'equipment');
	} else if (orderTypeFilter === 'ticket') {
		dataContent = dataContent.filter((item: TransactionItem) => item.transaction_type === 'ticket');
	}

	
	const handleStatusAction = async (orderId: number, action: "process" | "cancel" | "complete") => {
		// Implement your API call here
	};

	return (
		<>
			<Table>
				<TableHeader className="bg-white">
					<TableRow>
						<TableHead className="w-[150px]">Tanggal Pesanan</TableHead>
						<TableHead>Daftar Pesanan</TableHead>
						<TableHead>Status Pembayaran</TableHead>
						<TableHead>Detail</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{dataContent?.length > 0 ? (
						dataContent.map((item: any, i: number) => {
							const statusConfig = getStatusConfig(item.payment_status);
							return (
								<React.Fragment key={item.id}>
									<TableRow className={i % 2 === 0 ? "bg-slate-100" : "bg-white"}>
										<TableCell className="font-medium">{formatDate(item.createdAt)}</TableCell>
										<TableCell>
											<ul className="list-disc pl-5 space-y-1">
												{item.products?.map((prod: any) => (
													<li key={prod.id}>{prod.title}</li>
												))}
											</ul>
										</TableCell>
										<TableCell>
											<span
												className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
											>
												{statusConfig.text}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												{!isVendor && item.payment_status === "settlement" && (
													<div className="flex gap-2">
														<InvoiceViewer invoiceId={item.id} orderId={item.order_id}>
															<Button size="sm" variant="outline" className="flex items-center gap-2">
																<Eye className="h-4 w-4" />
																View Invoice
															</Button>
														</InvoiceViewer>
														<Button
															size="sm"
															variant="outline"
															onClick={async () => {
																try {
																	// The endpoint is now the same for all transaction types
																	const endpoint = `/api/transactions/generateInvoice/${item.id}`;
																	const link = document.createElement("a");
																	link.href = `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`;
																	link.download = `invoice-${item.order_id || item.id}.pdf`;
																	link.click();
																} catch (error) {
																	console.error("Error downloading invoice:", error);
																	alert("Gagal mengunduh invoice. Silakan coba lagi.");
																}
															}}
															className="flex items-center gap-2"
														>
															<Download className="h-4 w-4" />
															Download
														</Button>
													</div>
												)}
												<Button size="sm" variant="link" onClick={() => toggleRow(item.id)}>
													{expandedRows[item.id] ? (
														<>Sembunyikan <ChevronUp className="h-4 w-4" /></>
													) : (
														<>Lihat Detail <ChevronDown className="h-4 w-4" /></>
													)}
												</Button>
											</div>
										</TableCell>
									</TableRow>

									{expandedRows[item.id] && (
										<TableRow className="bg-gray-50">
											<TableCell colSpan={4}>
												<div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
													{/* Detail Tiket */}
													{item.transaction_type === 'ticket' && item.product && (
														<div className="md:col-span-6 lg:col-span-4">
															<h4 className="font-semibold mb-2">Detail Tiket</h4>
															{item.product.image && (
																<img src={item.product.image} alt={item.product.title || "Ticket Image"} className="w-full h-32 object-cover rounded-md mb-2" />
															)}
															<p><span className="font-medium">Nama Produk:</span> {item.product.title}</p>
															<p><span className="font-medium">Tanggal Acara:</span> {formatDate(item.product.event_date)}</p>
															{item.product.event_end_date && item.product.event_end_date !== item.product.event_date && (
																<p><span className="font-medium">Tanggal Selesai:</span> {formatDate(item.product.event_end_date)}</p>
															)}
															<p><span className="font-medium">Waktu Acara:</span> {item.product.event_time}</p>
															<p><span className="font-medium">Lokasi Acara:</span> {item.product.location}</p>
															<p><span className="font-medium">Kota Acara:</span> {item.product.city}</p>
														</div>
													)}

													{/* Detail Transaksi */}
													<div className="md:col-span-6 lg:col-span-4">
														<h4 className="font-semibold mb-2">Detail Transaksi</h4>
														<p><span className="font-medium">Kode Transaksi:</span> {item.order_id}</p>
														<p><span className="font-medium">Nama Pemesan:</span> {item.customer_name}</p>
														<p><span className="font-medium">Email Pemesan:</span> {item.email}</p>
														{item.transaction_type === 'ticket' && item.variant && (
															<p><span className="font-medium">Varian Tiket:</span> {item.variant.name}</p>
														)}
														<p><span className="font-medium">Quantity:</span> {item.quantity}</p>
														{item.unit_price && <p><span className="font-medium">Harga Satuan:</span> Rp {item.unit_price.toLocaleString('id-ID')}</p>}
														{item.total_payment && <p><span className="font-medium">Jumlah Pembayaran:</span> Rp {item.total_payment.toLocaleString('id-ID')}</p>}
														<p><span className="font-medium">Tanggal Pembayaran:</span> {formatDate(item.createdAt)}</p>
														<p>
															<span className="font-medium">Status Pembayaran:</span>{" "}
															<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
																{statusConfig.text}
															</span>
														</p>
													</div>

													{/* Informasi Penerima Tiket (Contingent on backend providing data) */}
													{item.transaction_type === 'ticket' && item.recipients && item.recipients.length > 0 && (
														<div className="md:col-span-12 lg:col-span-4">
															<h4 className="font-semibold mb-2">Informasi Penerima Tiket</h4>
															{item.recipients.map((recipient: any, recIdx: number) => (
																<div key={recIdx} className="mb-4 p-3 border rounded-md bg-white">
																	<p><span className="font-medium">Nama:</span> {recipient.name}</p>
																	<p><span className="font-medium">Email:</span> {recipient.email}</p>
																	<p><span className="font-medium">No. WhatsApp:</span> {recipient.phone}</p>
																	<p><span className="font-medium">Tipe Identitas:</span> {recipient.identity_type}</p>
																	<p><span className="font-medium">No. Identitas:</span> {recipient.identity_number}</p>
																	<p><span className="font-medium">Kode Tiket:</span> {recipient.ticket_code}</p>
																	<p>
																		<span className="font-medium">Status Verifikasi:</span>{" "}
																		<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recipient.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
																			{recipient.verification_status || 'pending'}
																		</span>
																	</p>
																</div>
															))}
														</div>
													)}

													{/* Fallback for Equipment */}
													{item.transaction_type === 'equipment' && (
														<div className="md:col-span-12">
															<h4 className="font-semibold mb-2">Detail Customer</h4>
															<p><span className="font-medium">Nama:</span> {item.customer_name}</p>
															<p><span className="font-medium">Telepon:</span> {item.telp}</p>
															<p><span className="font-medium">Email:</span> {item.email}</p>
															<h4 className="font-semibold mb-2 mt-4">Info Pengiriman</h4>
															<p><span className="font-medium">Alamat:</span> {item.shipping_location}</p>
															<p><span className="font-medium">Tanggal Event:</span> {item.event_date}</p>
															<p><span className="font-medium">Tanggal Loading:</span> {item.loading_date} at {item.loading_time}</p>
															<p><span className="font-semibold">Produk:</span></p>
															<ul className="list-disc pl-5 space-y-1">
																{item.products?.map((prod: any) => (
																	<li key={prod.id}>{prod.title}</li>
																))}
															</ul>
															<span>Total Qty: {item.quantity}</span>
															<p><span className="font-semibold">Catatan:</span> {item.note || "-"}</p>
														</div>
													)}
												</div>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
							);
						})
					) : (
						<TableRow className="bg-gray-50">
							<TableCell colSpan={4}>
								<div className="text-center">Anda belum memiliki pesanan</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
};
