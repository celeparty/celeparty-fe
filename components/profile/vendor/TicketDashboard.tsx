"use client";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { axiosUser } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import { Eye, AlertCircle, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface iTicketProduct {
	id: number;
	documentId: string;
	title: string;
	description: string;
	event_date: string;
	waktu_event: string;
	end_date: string;
	end_time: string;
	lokasi_event: string;
	kota_event: string;
	rate: number;
	sold_count: number;
	state: string;
	variant: Array<{
		id: number;
		variant_name: string;
		price: number;
		stock: number;
	}>;
	main_image: Array<{
		url: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

export const TicketDashboard: React.FC = () => {
	const { data: session } = useSession();

	const getTicketProducts = useCallback(async () => {
		if (!session?.user?.documentId) {
			throw new Error("Vendor ID is missing");
		}
		try {
			const response = await axiosUser(
				"GET",
				`/api/tickets?filters[vendor_id][$eq]=${encodeURIComponent(session.user.documentId)}&populate=variant,main_image&sort=createdAt:desc`,
				`${session?.jwt}`,
			);
			return response;
		} catch (error: any) {
			console.error("Error fetching ticket products:", error);
			throw new Error(error?.response?.data?.error?.message || "Failed to fetch ticket data");
		}
	}, [session?.user?.documentId, session?.jwt]);

	const query = useQuery({
		queryKey: ["ticketProducts", session?.user?.documentId],
		queryFn: getTicketProducts,
		enabled: !!session?.jwt && !!session?.user?.documentId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});

	if (query.isLoading) {
		return <Skeleton width="100%" height="200px" />;
	}

	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}

	const ticketProducts: iTicketProduct[] = query?.data?.data || [];

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h5 className="font-bold text-lg">Dashboard Ticket</h5>
				<Button onClick={() => query.refetch()} variant="outline" size="sm">
					Refresh
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Gambar</TableHead>
						<TableHead>Nama Tiket</TableHead>
						<TableHead>Tanggal Event</TableHead>
						<TableHead>Lokasi</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Varian</TableHead>
						<TableHead>Total Stok</TableHead>
						<TableHead>Terjual</TableHead>
						<TableHead>Aksi</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{ticketProducts.length > 0 ? (
						ticketProducts.map((ticket) => {
							const totalStock = ticket.variant?.reduce((sum, v) => sum + v.stock, 0) || 0;
							const variantsText = ticket.variant?.map(v => `${v.variant_name} (${v.stock})`).join(", ") || "Tidak ada varian";

							return (
								<TableRow key={ticket.id}>
									<TableCell>
										{ticket.main_image?.[0] ? (
											<img
												src={`${process.env.BASE_API}${ticket.main_image[0].url}`}
												alt={ticket.title}
												className="w-16 h-16 object-cover rounded"
											/>
										) : (
											<div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
												<span className="text-xs text-gray-500">No Image</span>
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">{ticket.title}</TableCell>
									<TableCell>
										{new Date(ticket.event_date).toLocaleDateString('id-ID')}
										{ticket.waktu_event && ` ${ticket.waktu_event}`}
									</TableCell>
									<TableCell>
										{ticket.lokasi_event}
										{ticket.kota_event && `, ${ticket.kota_event}`}
									</TableCell>
									<TableCell>
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											ticket.state === 'approved' ? 'bg-green-100 text-green-800' :
											ticket.state === 'pending' ? 'bg-yellow-100 text-yellow-800' :
											'bg-red-100 text-red-800'
										}`}>
											{ticket.state === 'approved' ? 'Disetujui' :
											 ticket.state === 'pending' ? 'Pending' : 'Ditolak'}
										</span>
									</TableCell>
									<TableCell className="text-sm">{variantsText}</TableCell>
									<TableCell>{totalStock}</TableCell>
									<TableCell>{ticket.sold_count || 0}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Link href={`/products/${ticket.documentId}`}>
												<Button size="sm" variant="outline">
													<Eye className="h-4 w-4" />
												</Button>
											</Link>
											<Link href={`/user/vendor/products/edit/${ticket.documentId}?type=ticket`}>
												<Button size="sm" variant="outline">
													<Edit className="h-4 w-4" />
												</Button>
											</Link>
										</div>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={9} className="text-center py-8">
								<div className="flex flex-col items-center gap-2">
									<AlertCircle className="h-8 w-8 text-gray-400" />
									<p className="text-gray-500">Belum ada tiket yang dibuat</p>
									<Link href="/user/vendor/add-product">
										<Button>Buat Tiket Pertama</Button>
									</Link>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
