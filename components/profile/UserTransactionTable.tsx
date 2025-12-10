import { iOrderItem } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { axiosUser } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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
		const response = await axiosUser(
			"GET",
			`/api/transaction-tickets?filters${
				isVendor ? `[vendor_id][$eq]=${session?.user?.documentId}` : `[customer_mail][$eq]=${session?.user?.email}`
			}&sort=createdAt:desc`,
			`${session && session?.jwt}`,
		);

		return response;
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
		event_date: ticket.event_date,
		loading_date: null, // Tickets don't have loading
		loading_time: null, // Tickets don't have loading
		note: ticket.note,
		quantity: ticket.quantity,
		products: [{
			id: ticket.product_id,
			title: ticket.product_name
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
														<div className="md:col-span-6">
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
														</div>
														<div className="md:col-span-6">
															<h4 className="font-semibold mb-2">Info Pengiriman</h4>
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
														</div>
														<div className="md:col-span-6">
															<p>
																<span className="font-semibold">Produk:</span>{" "}
															</p>
															<ul className="list-disc pl-5 space-y-1">
																{item.products?.map((prod: any) => (
																	<li key={prod.id}>{prod.title}</li>
																))}
															</ul>
															<span>Total Qty: {item.quantity}</span>
														</div>
														<div className="md:col-span-2">
															<p>
																<span className="font-semibold">Catatan:</span>{" "}
																{item.note || "-"}
															</p>
														</div>
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
