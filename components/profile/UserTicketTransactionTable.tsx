import { iOrderItem, iOrderTicket } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { axiosUser } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import ErrorNetwork from "../ErrorNetwork";
import Skeleton from "../Skeleton";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import ProductDetails from "./ticket-order-details/ProductDetails";
import TransactionDetails from "./ticket-order-details/TransactionDetails";
import TicketRecipientDetails from "./ticket-order-details/TicketRecipientDetails";

interface iTableDataProps {
	isVendor: boolean;
	activeTab: string;
}

export const UserTicketTransactionTable: React.FC<iTableDataProps> = ({ isVendor, activeTab }) => {
	const { data: session, status } = useSession();

	const documentId = session?.user?.documentId;

	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

	const getQuery = async () => {
		try {
			// Validate session first
			if (!session?.jwt) {
				console.warn("UserTicketTransactionTable - No JWT token in session");
				return { data: [] };
			}

			// Use unified transaction-proxy endpoint with proper filters
			let filterParam = '';
			
			if (isVendor && session?.user?.documentId) {
				// For vendor, filter by vendor_doc_id and event_type=ticket
				filterParam = `filters[vendor_doc_id][$eq]=${session.user.documentId}&filters[event_type][$eq]=ticket`;
			} else if (!isVendor && session?.user?.email) {
				// For customer, filter by email and event_type=ticket
				filterParam = `filters[email][$eq]=${session.user.email}&filters[event_type][$eq]=ticket`;
			} else {
				// No valid filter, return empty
				console.warn("UserTicketTransactionTable - No valid filter params");
				return { data: [] };
			}
			
			const url = `/api/transaction-proxy?${filterParam}&sort=createdAt:desc&pagination[pageSize]=100`;
			console.log("UserTicketTransactionTable - Fetching URL:", url);
			
			// Use axiosUser with JWT token instead of plain axios
			const response = await axiosUser("GET", url, session.jwt);
			console.log("UserTicketTransactionTable - Response data:", response.data);
			
			if (!response.data?.data) {
				console.warn("UserTicketTransactionTable - No data field in response:", response.data);
				return { data: [] };
			}
			
			return response.data;
		} catch (error: any) {
			console.error("UserTicketTransactionTable - Fetch error:", {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
			});
			// Return empty data on error instead of throwing
			return { data: [] };
		}
	};

	const query = useQuery({
		queryKey: ["qUserTicketOrder", activeTab, isVendor, session?.user?.documentId, session?.user?.email, session?.jwt],
		queryFn: getQuery,
		staleTime: 5000,
		enabled: !!session?.jwt && (isVendor ? !!session?.user?.documentId : !!session?.user?.email),
		retry: 1,
	});

	const dataContent: iOrderTicket[] = React.useMemo(() => {
		if (!query.data?.data || query.data.data.length === 0) {
			console.log("UserTicketTransactionTable - No data to display");
			return [];
		}

		const mappedItems: iOrderTicket[] = query.data.data.map((item: any): iOrderTicket => {
			const attr = item.attributes;
			
			// NEW STRUCTURE: products is a JSON field with array
			const productsData = attr.products || [];
			const mainProduct = productsData?.[0];
			
			console.log("UserTicketTransactionTable - Processing item:", {
				id: item.id,
				product: mainProduct?.product_name,
				recipients: mainProduct?.recipients?.length || 0
			});
			
			// Extract recipients from main product
			const recipients = (mainProduct?.recipients || []).map((recipient: any) => ({
				id: recipient.id || Math.random().toString(),
				name: recipient.name || '',
				email: recipient.email || '',
				telp: recipient.whatsapp_number || recipient.phone || recipient.telp || '',
				identity_type: recipient.identity_type || '',
				identity_number: recipient.identity_number || '',
				ticket_code: recipient.ticket_code || '',
				status: recipient.status || 'pending',
			})) || [];

			return {
				id: item.id,
				documentId: item.id.toString(),
				createdAt: attr.createdAt,
				updatedAt: attr.updatedAt,
				publishedAt: attr.createdAt, // Use createdAt as publishedAt for new structure
				product_name: mainProduct?.product_name || attr.product_name || '',
				price: mainProduct?.price || 0,
				quantity: mainProduct?.quantity || 1,
				variant: mainProduct?.variant || '',
				customer_name: attr.customer_name || '',
				telp: attr.telp || '',
				total_price: attr.total || 0,
				payment_status: attr.payment_status || 'pending',
				event_date: attr.event_date || '',
				note: attr.note || '',
				order_id: attr.order_id || '',
				customer_mail: attr.email || '',
				verification: attr.verification || false,
				vendor_id: attr.vendor_doc_id || '',
				event_type: attr.event_type || 'ticket',
				waktu_event: mainProduct?.event_time || '',
				transaction_type: "ticket",

				// Event/Product details
				event_city: mainProduct?.city || '',
				event_location: mainProduct?.location || '',
				event_end_date: attr.event_date, // New structure doesn't have separate end_date
				event_end_time: mainProduct?.event_end_time || '',
				
				// Recipients from products data
				recipients: recipients,
			};
		});

		return mappedItems;
	}, [query.data]);

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (query.isError) {
		console.error("UserTicketTransactionTable - Query error:", query.error);
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600 font-semibold">Error memuat data pesanan tiket</p>
				<p className="text-sm text-red-500 mt-1">Silakan coba refresh halaman atau hubungi support</p>
				<details className="mt-2 text-xs text-red-500">
					<summary className="cursor-pointer">Detail error</summary>
					<pre className="mt-1 p-2 bg-red-100 rounded text-red-700 overflow-auto">
						{JSON.stringify(query.error, null, 2)}
					</pre>
				</details>
			</div>
		);
	}

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
								return (
									<React.Fragment key={item.id}>
										<TableRow className={i % 2 === 0 ? "bg-slate-100" : "bg-white"}>
											<TableCell className="font-medium">{formatDate(item.createdAt)}</TableCell>
											<TableCell>
												<ul className="list-disc pl-5 space-y-1">
													<li>{item.product_name}</li>
													<li>Qty: {item.quantity}</li>
												</ul>
											</TableCell>
											<TableCell>
												<span className="font-bold capitalize">{item.payment_status}</span>
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button size="sm" variant="link" onClick={() => {
														console.log(item.recipients);
														toggleRow(item.id);
													}}>
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
													<div className="p-4">
														<ProductDetails item={item} />
														<TransactionDetails item={item} />
														<TicketRecipientDetails item={item} />
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