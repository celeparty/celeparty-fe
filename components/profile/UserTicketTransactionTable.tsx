import { iOrderItem, iOrderTicket } from "@/lib/interfaces/iOrder";
import { getStatusConfig } from "@/lib/orderStatusUtils";
import { axiosUser } from "@/lib/services";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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
		const response = await axiosUser(
			"GET",
			`/api/transaction-tickets?filters${
				isVendor
					? `[vendor_id][$eq]=${session?.user?.documentId}`
					: `[customer_mail][$eq]=${session?.user?.email}`
			}&sort=createdAt:desc&populate=*`,
			`${session && session?.jwt}`,
		);

		return response;
	};

	const query = useQuery({
		queryKey: ["qUserOrder", activeTab],
		queryFn: getQuery,
		staleTime: 5000,
		enabled: !!session?.jwt,
		retry: 3,
	});

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}
	const dataContent: iOrderTicket[] = React.useMemo(() => {
		if (!query.data?.data) return [];

		return query.data.data.map((item: any): iOrderTicket => {
			const attr = item.attributes;
			// Safely access nested product and event type attributes
			const productAttr = attr.product?.data?.attributes;
			const eventTypeAttr = productAttr?.user_event_type?.data?.attributes;

			const recipients = attr.recipients?.data?.map((recipient: any) => ({
				id: recipient.id,
				name: recipient.attributes.name,
				email: recipient.attributes.email,
				telp: recipient.attributes.telp,
				identity_type: recipient.attributes.identity_type,
				identity_number: recipient.attributes.identity_number,
				ticket_code: recipient.attributes.ticket_code,
				status: recipient.attributes.status,
			})) || [];

			return {
				id: item.id,
				documentId: item.id.toString(),
				createdAt: attr.createdAt,
				updatedAt: attr.updatedAt,
				publishedAt: attr.publishedAt,
				product_name: attr.product_name,
				price: attr.price,
				quantity: attr.quantity,
				variant: attr.variant,
				customer_name: attr.customer_name,
				telp: attr.telp,
				total_price: attr.total_price,
				payment_status: attr.payment_status,
				event_date: attr.event_date,
				note: attr.note,
				order_id: attr.order_id,
				customer_mail: attr.customer_mail,
				verification: attr.verification,
				vendor_id: attr.vendor_id,
				event_type: attr.event_type,
				waktu_event: attr.waktu_event,
				transaction_type: "ticket",

				// Flattened from related product/event type
				event_city: eventTypeAttr?.event_city,
				event_location: eventTypeAttr?.event_location,
				event_end_date: eventTypeAttr?.event_end_date,
				event_end_time: eventTypeAttr?.event_end_time,
				
				// Mapped recipients
				recipients: recipients,
			};
		});
	}, [query.data]);

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