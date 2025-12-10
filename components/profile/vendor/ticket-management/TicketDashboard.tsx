"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import { iTicketSummary, iVariantSummary } from "@/lib/interfaces/iTicketManagement";
import Skeleton from "@/components/Skeleton";
import { TicketSummaryTable } from "./TicketSummaryTable";
import { TicketDetailPage } from "./TicketDetailPage";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const TicketDashboard: React.FC = () => {
	const { data: session } = useSession();
	const [selectedProduct, setSelectedProduct] = useState<iTicketSummary | null>(null);

	// Fetch ticket summary
	const getTicketSummary = async () => {
		if (!session?.jwt) return [];
		try {
			// MOCK DATA IMPLEMENTATION
			const mockApiResponse = [
				{
					id: 'prod_1',
					title: 'Konser Musik Akbar',
					image: { url: '/images/placeholder-1.jpg' },
					variants: [
						{ id: 'var_1a', name: 'Reguler', quota: 1000, sold: 750, verified: 600, price: 150000 },
						{ id: 'var_1b', name: 'VIP', quota: 200, sold: 195, verified: 150, price: 450000 },
						{ id: 'var_1c', name: 'VVIP', quota: 50, sold: 50, verified: 48, price: 1200000 },
					]
				},
				{
					id: 'prod_2',
					title: 'Seminar Teknologi Masa Depan',
					image: { url: '/images/placeholder-2.jpg' },
					variants: [
						{ id: 'var_2a', name: 'Mahasiswa', quota: 300, sold: 290, verified: 250, price: 75000 },
						{ id: 'var_2b', name: 'Umum', quota: 500, sold: 450, verified: 400, price: 125000 },
					]
				}
			];

			return mockApiResponse.map((ticket: any) => {
				const variants: iVariantSummary[] = (ticket.variants || []).map((variant: any) => {
					const quota = parseInt(variant.quota) || 0;
					const sold = parseInt(variant.sold) || 0;
					const verified = parseInt(variant.verified) || 0;
					const price = parseFloat(variant.price) || 0;
					const systemFeePercentage = 10; // 10%
					const netIncome = price * sold * (1 - systemFeePercentage / 100);

					return {
						variant_id: variant.id,
						variant_name: variant.name || "Default",
						price: price,
						quota: quota,
						sold: sold,
						verified: verified,
						remaining: Math.max(0, quota - sold),
						soldPercentage: quota > 0 ? (sold / quota) * 100 : 0,
						netIncome: netIncome,
						systemFeePercentage: systemFeePercentage,
					};
				});

				const totalTicketsSold = variants.reduce((sum: number, v) => sum + v.sold, 0);
				const totalRevenue = variants.reduce((sum: number, v) => sum + v.netIncome, 0);

				return {
					product_id: ticket.id,
					product_title: ticket.title || "Tiket Tanpa Nama",
					product_image: ticket.image?.url || "",
					variants: variants,
					totalRevenue: totalRevenue,
					totalTicketsSold: totalTicketsSold,
				};
			});
		} catch (error) {
			console.error("Error fetching ticket summary:", error);
			return [];
		}
	};

	const summaryQuery = useQuery({
		queryKey: ["ticketSummary", session?.jwt],
		queryFn: getTicketSummary,
		enabled: !!session?.jwt,
		staleTime: 5 * 60 * 1000,
	});

	if (summaryQuery.isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton width="100%" height="200px" />
				<Skeleton width="100%" height="300px" />
			</div>
		);
	}

	if (summaryQuery.isError) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600 font-semibold">Error memuat data tiket</p>
				<p className="text-sm text-red-500 mt-1">Silakan refresh halaman atau hubungi support</p>
			</div>
		);
	}

	const ticketData = summaryQuery.data || [];
	
	if (ticketData.length === 0) {
		return (
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
				<p className="text-blue-600 font-semibold">Belum ada tiket</p>
				<p className="text-sm text-blue-500 mt-1">Anda belum memiliki produk tiket. Silakan tambahkan produk tiket terlebih dahulu di menu produk.</p>
			</div>
		);
	}

	if (selectedProduct) {
		return (
			<div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setSelectedProduct(null)}
					className="mb-4 flex items-center gap-2"
				>
					<ChevronLeft className="w-4 h-4" />
					Kembali ke Summary
				</Button>
				<TicketDetailPage product={selectedProduct} />
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mb-4">Ringkasan Penjualan Tiket</h3>
			<TicketSummaryTable
				data={ticketData}
				onDetailClick={setSelectedProduct}
			/>
		</div>
	);
};
