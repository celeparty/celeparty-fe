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
			}&sort=createdAt:desc`,
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
	const dataContent: iOrderTicket[] = query?.data?.data;

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
															<h4 className="font-semibold mb-2">Detail Tiket</h4>
															<p>
																<span className="font-medium">Nama Tiket:</span>{" "}
																{item.product_name}
															</p>
															<p>
																<span className="font-medium">Jenis Tiket:</span>{" "}
																{item.variant}
															</p>
															<p>
																<span className="font-medium">Nama:</span>{" "}
																{item.customer_name}
															</p>
															<p>
																<span className="font-medium">Telepon:</span>{" "}
																{item.telp}
															</p>
														</div>
														<div className="md:col-span-6">
															<h4 className="font-semibold mb-2">Info Acara</h4>
															<p>
																<span className="font-medium">Tanggal Acara:</span>{" "}
																{item.event_date}
															</p>
															<p>
																<span className="font-medium">Waktu Acara:</span>{" "}
																{item.waktu_event}
															</p>
														</div>
														<div className="md:col-span-6">
															<p>
																<span className="font-semibold">Catatan:</span>{" "}
																{item.note || "-"}
															</p>
														</div>
														<div className="md:col-span-6">
															<p>
																<span className="font-semibold">
																	Status verifikasi:
																</span>{" "}
																{`${
																	item.verification ? "Sudah" : "Belum"
																} terverifikasi`}
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
