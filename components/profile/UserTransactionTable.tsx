import { iOrderItem } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { axiosUser } from "@/lib/services";
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

export const UserTransactionTable: React.FC<iTableDataProps> = ({ isVendor, activeTab, orderTypeFilter = 'all' }) => {
	const { data: session, status } = useSession();

	const documentId = session?.user?.documentId;

	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

	const getEquipmentQuery = async () => {
		const response = await axiosUser(
			"GET",
			`/api/transactions?filters${
				isVendor ? `[vendor_doc_id][$eq]=${session?.user?.documentId}` : `[email][$eq]=${session?.user?.email}`
			}&sort=createdAt:desc`,
			`${session && session?.jwt}`,
		);

		return response;
	};

	const getTicketQuery = async () => {
		// Use the local proxy which handles authentication and population securely
		const filterKey = isVendor ? 'vendor_id' : 'customer_mail';
		const filterValue = isVendor ? session?.user?.documentId : session?.user?.email;
		
		const response = await axios.get(
			`/api/transaction-tickets-proxy?filters[${filterKey}][$eq]=${filterValue}&sort=createdAt:desc`
		);

		return response.data; // axios wraps the response in a `data` object
	};

	const equipmentQuery = useQuery({
		queryKey: ["qUserEquipmentOrder", activeTab],
		queryFn: getEquipmentQuery,
		staleTime: 5000,
		enabled: !!session?.jwt,
		retry: 3,
	});

	const ticketQuery = useQuery({
		queryKey: ["qUserTicketOrder", activeTab],
		queryFn: getTicketQuery,
		staleTime: 5000,
		enabled: !!session?.jwt,
		retry: 3,
	});

	if (equipmentQuery.isLoading || ticketQuery.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (equipmentQuery.isError && ticketQuery.isError) {
		return <ErrorNetwork style="mt-0" />;
	}

	// Combine and normalize data from both queries
	const equipmentData = equipmentQuery?.data?.data || [];
	const ticketData = ticketQuery?.data?.data || [];

	// Normalize ticket data to match equipment data structure
	const normalizedTicketData = ticketData.map((ticket: any) => ({
		id: ticket.id,
		createdAt: ticket.createdAt,
		payment_status: ticket.payment_status,
		order_id: ticket.order_id,
		customer_name: ticket.customer_name,
		telp: ticket.telp,
		email: ticket.customer_mail,
		shipping_location: null, // Tickets don't have shipping
		event_date: ticket.event_date, // This is the transaction's event_date
		loading_date: null, // Tickets don't have loading
		loading_time: null, // Tickets don't have loading
		note: ticket.note,
		quantity: ticket.quantity,
		// Extract product details
		product: {
			id: ticket.product?.id,
			title: ticket.product?.title,
			image: ticket.product?.image?.url, // Assuming image is directly under product
			event_date: ticket.product?.event_date, // Product's event date
			event_end_date: ticket.product?.event_end_date, // Product's event end date
			event_time: ticket.product?.event_time, // Product's event time
			location: ticket.product?.location, // Product's event location
			city: ticket.product?.city, // Product's event city
		},
		// Extract variant details
		variant: {
			id: ticket.variant?.id,
			name: ticket.variant?.name,
			price: ticket.variant?.price,
		},
		// Extract recipient details (assuming it's an array of recipients)
		recipients: ticket.recipients?.map((rec: any) => ({
			id: rec.id,
			name: rec.name,
			email: rec.email,
			phone: rec.phone,
			identity_type: rec.identity_type,
			identity_number: rec.identity_number,
			ticket_code: rec.ticket_code,
			verification_status: rec.verification_status,
		})),
		unit_price: ticket.unit_price, // Assuming unit_price is available directly on transaction-ticket
		total_payment: ticket.total_payment, // Assuming total_payment is available directly on transaction-ticket
		payment_date: ticket.payment_date, // Assuming payment_date is available directly on transaction-ticket
		products: [{ // Keep for compatibility with existing table rendering
			id: ticket.product?.id,
			title: ticket.product?.title
		}],
		transaction_type: 'ticket'
	}));

	// Add transaction type to equipment data
	const normalizedEquipmentData = equipmentData.map((equipment: any) => ({
		...equipment,
		transaction_type: 'equipment'
	}));

	// Combine all transactions and sort by created date
	let dataContent = [...normalizedTicketData, ...normalizedEquipmentData]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Filter based on orderTypeFilter
	if (orderTypeFilter === 'equipment') {
		dataContent = dataContent.filter(item => item.transaction_type === 'equipment');
	} else if (orderTypeFilter === 'ticket') {
		dataContent = dataContent.filter(item => item.transaction_type === 'ticket');
	}
	// If 'all', no filtering needed

	const toggleRow = (id: number) => {
		setExpandedRows((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const handleStatusAction = async (orderId: number, action: "process" | "cancel" | "complete") => {
		// Implement your API call here
		// await updateOrderStatus(orderId, action);
		// refetchOrders();
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
						<>
							{dataContent?.map((item, i) => {
								const statusConfig = getStatusConfig(item.payment_status);
								return (
									<React.Fragment key={item.id}>
										<TableRow className={i % 2 === 0 ? "bg-slate-100" : "bg-white"}>
											<TableCell className="font-medium">{formatDate(item.createdAt)}</TableCell>
											<TableCell>
												<ul className="list-disc pl-5 space-y-1">
													{item?.products?.map((prod: any) => (
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
													{isVendor && (
														<>
															{statusConfig.actions.map(({ label, action, variant }) => (
																<Button
																	key={action}
																	size="sm"
																	variant={variant as "default" | "destructive"}
																	onClick={() =>
																		handleStatusAction(
																			item.id,
																			action as "process" | "cancel" | "complete",
																		)
																	}
																>
																	{label}
																</Button>
															))}
														</>
													)}
													{!isVendor && item.payment_status === "settlement" && (
														<div className="flex gap-2">
															<InvoiceViewer invoiceId={item.id} orderId={item.order_id}>
																<Button
																	size="sm"
																	variant="outline"
																	className="flex items-center gap-2"
																>
																	<Eye className="h-4 w-4" />
																	View Invoice
																</Button>
															</InvoiceViewer>
															<Button
																size="sm"
																variant="outline"
																onClick={async () => {
																	try {
																		const endpoint = item.transaction_type === 'ticket'
																			? `/api/transaction-tickets/generateInvoice/${item.id}`
																			: `/api/transactions/generateInvoice/${item.id}`;

																		const link = document.createElement("a");
																		link.href = `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`;
																		link.download = `invoice-${item.transaction_type}-${item.order_id || item.id}.pdf`;
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
															<>
																Sembunyikan <ChevronUp className="h-4 w-4" />
															</>
														) : (
															<>
																Lihat Detail
																<ChevronDown className="h-4 w-4" />
															</>
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
																	<img
																		src={item.product.image}
																		alt={item.product.title || "Ticket Image"}
																		className="w-full h-32 object-cover rounded-md mb-2"
																	/>
																)}
																<p>
																	<span className="font-medium">Nama Produk:</span>{" "}
																	{item.product.title}
																</p>
																<p>
																	<span className="font-medium">Tanggal Acara:</span>{" "}
																	{formatDate(item.product.event_date)}
																</p>
																{item.product.event_end_date && item.product.event_end_date !== item.product.event_date && (
																	<p>
																		<span className="font-medium">Tanggal Selesai:</span>{" "}
																		{formatDate(item.product.event_end_date)}
																	</p>
																)}
																<p>
																	<span className="font-medium">Waktu Acara:</span>{" "}
																	{item.product.event_time}
																</p>
																<p>
																	<span className="font-medium">Lokasi Acara:</span>{" "}
																	{item.product.location}
																</p>
																<p>
																	<span className="font-medium">Kota Acara:</span>{" "}
																	{item.product.city}
																</p>
															</div>
														)}

														{/* Detail Transaksi */}
														<div className="md:col-span-6 lg:col-span-4">
															<h4 className="font-semibold mb-2">Detail Transaksi</h4>
															<p>
																<span className="font-medium">Kode Transaksi:</span>{" "}
																{item.order_id}
															</p>
															<p>
																<span className="font-medium">Nama Pemesan:</span>{" "}
																{item.customer_name}
															</p>
															<p>
																<span className="font-medium">Email Pemesan:</span>{" "}
																{item.email}
															</p>
															{item.transaction_type === 'ticket' && item.variant && (
																<p>
																	<span className="font-medium">Varian Tiket:</span>{" "}
																	{item.variant.name}
																</p>
															)}
															<p>
																<span className="font-medium">Quantity:</span>{" "}
																{item.quantity}
															</p>
															{item.unit_price && (
																<p>
																	<span className="font-medium">Harga Satuan:</span>{" "}
																	Rp {item.unit_price.toLocaleString('id-ID')}
																</p>
															)}
															{item.total_payment && (
																<p>
																	<span className="font-medium">Jumlah Pembayaran:</span>{" "}
																	Rp {item.total_payment.toLocaleString('id-ID')}
																</p>
															)}
															<p>
																<span className="font-medium">Tanggal Pembayaran:</span>{" "}
																{formatDate(item.createdAt)}
															</p>
															<p>
																<span className="font-medium">Status Pembayaran:</span>{" "}
																<span
																	className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(item.payment_status).bgColor} ${getStatusConfig(item.payment_status).textColor}`}
																>
																	{getStatusConfig(item.payment_status).text}
																</span>
															</p>
														</div>

														{/* Informasi Penerima Tiket */}
														{item.transaction_type === 'ticket' && item.recipients && item.recipients.length > 0 && (
															<div className="md:col-span-12 lg:col-span-4">
																<h4 className="font-semibold mb-2">Informasi Penerima Tiket</h4>
																{item.recipients.map((recipient: any, recIdx: number) => (
																	<div key={recIdx} className="mb-4 p-3 border rounded-md bg-white">
																		<p>
																			<span className="font-medium">Nama:</span>{" "}
																			{recipient.name}
																		</p>
																		<p>
																			<span className="font-medium">Email:</span>{" "}
																			{recipient.email}
																		</p>
																		<p>
																			<span className="font-medium">No. WhatsApp:</span>{" "}
																			{recipient.phone}
																		</p>
																		<p>
																			<span className="font-medium">Tipe Identitas:</span>{" "}
																			{recipient.identity_type}
																		</p>
																		<p>
																			<span className="font-medium">No. Identitas:</span>{" "}
																			{recipient.identity_number}
																		</p>
																		<p>
																			<span className="font-medium">Kode Tiket:</span>{" "}
																			{recipient.ticket_code}
																		</p>
																		<p>
																			<span className="font-medium">Status Verifikasi:</span>{" "}
																			<span
																				className={`px-2 py-0.5 rounded-full text-xs font-medium ${recipient.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
																			>
																				{recipient.verification_status || 'pending'}
																			</span>
																		</p>
																	</div>
																))}
															</div>
														)}

														{/* Fallback for Equipment or if ticket details are missing */}
														{item.transaction_type === 'equipment' && (
															<div className="md:col-span-12">
																<h4 className="font-semibold mb-2">Detail Customer</h4>
																<p>
																	<span className="font-medium">Nama:</span>{" "}
																	{item.customer_name}
																</p>
																<p>
																	<span className="font-medium">Telepon:</span>{" "}
																	{item.telp}
																</p>
																<p>
																	<span className="font-medium">Email:</span> {item.email}
																</p>
																<h4 className="font-semibold mb-2 mt-4">Info Pengiriman</h4>
																<p>
																	<span className="font-medium">Alamat:</span>{" "}
																	{item.shipping_location}
																</p>
																<p>
																	<span className="font-medium">Tanggal Event:</span>{" "}
																	{item.event_date}
																</p>
																<p>
																	<span className="font-medium">Tanggal Loading:</span>{" "}
																	{item.loading_date} at {item.loading_time}
																</p>
																<p>
																	<span className="font-semibold">Produk:</span>{" "}
																</p>
																<ul className="list-disc pl-5 space-y-1">
																	{item.products?.map((prod: any) => (
																		<li key={prod.id}>{prod.title}</li>
																	))}
																</ul>
																<span>Total Qty: {item.quantity}</span>
																<p>
																	<span className="font-semibold">Catatan:</span>{" "}
																	{item.note || "-"}
																</p>
															</div>
														)}
													</div>
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								);
							})}
						</>
					) : (
						<>
							<TableRow className="bg-gray-50">
								<TableCell colSpan={4}>
									<div className="text-center">Anda belum memiliki pesanan</div>
								</TableCell>
							</TableRow>
						</>
					)}
				</TableBody>
			</Table>
		</>
	);
};
