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
		if (!session?.jwt) return null;
		try {
			const response = await axiosUser(
				"GET",
				"/api/tickets/summary",
				session.jwt
			);
			
			// Transform API response to match iTicketSummary interface
			// Backend returns variants as object {variantName: stats}, convert to array
			const summaryData = response?.data || [];
			return summaryData.map((ticket: any) => {
				const variants = Array.isArray(ticket.variants)
					? ticket.variants
					: Object.entries(ticket.variants || {}).map(([variantName, stats]: [string, any]) => ({
							variant_id: variantName,
							variant_name: variantName,
							price: stats.price || 0,
							quota: stats.quota || stats.total || 0,
							sold: stats.sold || stats.total || 0,
							verified: stats.verified || 0,
							remaining: (stats.quota || stats.total || 0) - (stats.sold || stats.total || 0),
							soldPercentage: stats.soldPercentage || ((stats.sold || 0) / (stats.quota || stats.total || 1)) * 100,
							netIncome: stats.netIncome || 0,
							systemFeePercentage: stats.systemFeePercentage || 10,
						}));
				
				return {
					product_id: ticket.id,
					product_title: ticket.title,
					product_image: ticket.product_image || "",
					variants: variants,
					totalRevenue: variants.reduce((sum: number, v: any) => sum + (v.netIncome || 0), 0),
					totalTicketsSold: variants.reduce((sum: number, v: any) => sum + (v.sold || 0), 0),
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
				data={summaryQuery.data || []}
				onDetailClick={setSelectedProduct}
			/>
		</div>
	);
};
