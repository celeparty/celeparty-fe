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
			const response = await axiosUser(
				"GET",
				"/api/tickets/summary",
				session.jwt
			);
			
			// Debug log
			console.log("Ticket Summary Response:", response);
			
			// Extract data from response
			let summaryData: any[] = [];
			
			if (response?.success && Array.isArray(response?.data)) {
				summaryData = response.data;
			} else if (Array.isArray(response?.data)) {
				summaryData = response.data;
			} else if (Array.isArray(response)) {
				summaryData = response;
			}
			
			if (!Array.isArray(summaryData) || summaryData.length === 0) {
				console.warn("No ticket data available");
				return [];
			}
			
			console.log("Transformed Summary Data:", summaryData);
			
			return summaryData.map((ticket: any) => {
				// Get variants from ticket.variant array
				const ticketVariants = Array.isArray(ticket.variant) ? ticket.variant : [];
				
				// Map variant components to iVariantSummary format
				const variants = ticketVariants.map((variant: any) => {
					const variantName = variant.name || "Default";
					const quota = parseInt(variant.quota) || 0;
					const sold = parseInt(variant.sold) || 0;
					const verified = parseInt(variant.verified) || 0;
					const price = parseFloat(variant.price) || 0;
					
					return {
						variant_id: variant.id || variant.documentId || variantName,
						variant_name: variantName,
						price: price,
						quota: quota,
						sold: sold,
						verified: verified,
						remaining: Math.max(0, quota - sold),
						soldPercentage: quota > 0 ? (sold / quota) * 100 : 0,
						netIncome: price * sold * 0.9, // Assume 10% system fee
						systemFeePercentage: 10,
					};
				});
				
				// If no variants, create default placeholder
				if (variants.length === 0) {
					variants.push({
						variant_id: "default",
						variant_name: "Standar",
						price: 0,
						quota: 0,
						sold: 0,
						verified: 0,
						remaining: 0,
						soldPercentage: 0,
						netIncome: 0,
						systemFeePercentage: 10,
					});
				}
				
				return {
					product_id: ticket.id || ticket.documentId,
					product_title: ticket.title || ticket.name || "Tiket Tanpa Nama",
					product_image: ticket.image?.url || ticket.product_image || "",
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
