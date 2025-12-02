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
			
			// Debug log
			console.log("Ticket Summary Response:", response);
			
			// Transform API response to match iTicketSummary interface
			// Backend returns: { success: true, data: [...] }
			let summaryData = response?.data || [];
			
			// Handle if response is wrapped in success object
			if (response?.success && Array.isArray(response?.data)) {
				summaryData = response.data;
			} else if (Array.isArray(response)) {
				summaryData = response;
			}
			
			console.log("Transformed Summary Data:", summaryData);
			
			return summaryData.map((ticket: any) => {
				// Get variants from ticket.variant array (these are components with name, price, quota, etc)
				const ticketVariants = Array.isArray(ticket.variant) ? ticket.variant : [];
				const variantStats = ticket.variants || {}; // This is the stats object from backend
				
				// Map variant components to iVariantSummary format
				const variants = ticketVariants.map((variant: any) => {
					const variantName = variant.name || "Default";
					const stats = variantStats[variantName] || {};
					
					return {
						variant_id: variant.id || variantName,
						variant_name: variantName,
						price: variant.price || 0,
						quota: variant.quota || stats.total || 0,
						sold: stats.total || 0, // Backend doesn't separate sold count, use total
						verified: stats.verified || 0,
						remaining: (variant.quota || stats.total || 0) - (stats.total || 0),
						soldPercentage: variant.quota ? ((stats.total || 0) / variant.quota) * 100 : 0,
						netIncome: stats.revenue || 0,
						systemFeePercentage: 10, // Default system fee percentage
					};
				});
				
				// If no variants, create default variant from ticket stats
				if (variants.length === 0) {
					variants.push({
						variant_id: "default",
						variant_name: "Default",
						price: ticket.totalSold ? 0 : 0,
						quota: ticket.totalTickets || 0,
						sold: ticket.totalSold || 0,
						verified: ticket.verifiedTickets || 0,
						remaining: (ticket.totalTickets || 0) - (ticket.totalSold || 0),
						soldPercentage: ticket.totalTickets ? ((ticket.totalSold || 0) / ticket.totalTickets) * 100 : 0,
						netIncome: 0,
						systemFeePercentage: 10,
					});
				}
				
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
