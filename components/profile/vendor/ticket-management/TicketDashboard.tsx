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
			console.log("Fetching ticket summary...");
			const response = await axiosUser("GET", `/api/tickets?filters[product][users_permissions_user][id][$eq]=${session.user.id}&populate=*`, session.jwt);
			console.log("Raw API response for tickets:", response);
			const strapiTickets = response.data;
			console.log("strapiTickets (response.data):", strapiTickets);

			// Group tickets by product_id to aggregate variants
			const productsMap = new Map<string, any>();

			strapiTickets.forEach((ticket: any) => {
				const product = ticket.attributes.product.data;
				const variant = ticket.attributes.variant.data;
				
				console.log("Processing ticket:", ticket);
				console.log("Extracted product:", product);
				console.log("Extracted variant:", variant);

				if (!product || !variant) {
					console.warn("Skipping ticket due to missing product or variant data:", ticket);
					return;
				}

				const productId = product.id;
				const variantId = variant.id;

				if (!productsMap.has(productId)) {
					productsMap.set(productId, {
						id: productId,
						title: product.attributes.title,
						image: { url: product.attributes.image?.data?.attributes?.url || "" },
						variants: new Map<string, any>()
					});
				}

				const currentProduct = productsMap.get(productId);
				if (!currentProduct.variants.has(variantId)) {
					currentProduct.variants.set(variantId, {
						id: variantId,
						name: variant.attributes.name,
						quota: parseInt(variant.attributes.quota) || 0,
						price: parseFloat(variant.attributes.price) || 0,
						sold: 0,
						verified: 0
					});
				}

				const currentVariant = currentProduct.variants.get(variantId);
				currentVariant.sold += 1; // Each ticket in the response means one sold ticket
				if (ticket.attributes.verification_status === "verified") {
					currentVariant.verified += 1;
				}
			});
			console.log("productsMap after aggregation:", productsMap);

			const finalTicketData = Array.from(productsMap.values()).map((product: any) => {
				const variants: iVariantSummary[] = Array.from(product.variants.values()).map((variant: any) => {
					const quota = variant.quota;
					const sold = variant.sold;
					const price = variant.price;
					const verified = variant.verified;
					const systemFeePercentage = 10; // 10% - Assuming this is a constant
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
					product_id: product.id,
					product_title: product.title || "Tiket Tanpa Nama",
					product_image: product.image?.url || "",
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
