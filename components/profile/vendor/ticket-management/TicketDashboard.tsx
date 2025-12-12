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

			// 1. Fetch all ticket products for the vendor
			const productResponse = await axiosUser(
				"GET",
				`/api/products?filters[users_permissions_user][id][$eq]=${session.user.id}&filters[user_event_type][is_ticket][$eq]=true&populate[main_image][populate]=*&populate[variant][populate]=*`,
				session.jwt
			);
			const vendorTicketProducts = productResponse.data;
			console.log("Vendor's ticket products:", vendorTicketProducts);

			// 2. Fetch all tickets for the vendor to get sales data
			const ticketResponse = await axiosUser(
				"GET",
				`/api/tickets?filters[product][users_permissions_user][id][$eq]=${session.user.id}&populate=*`,
				session.jwt
			);
			const strapiTickets = ticketResponse.data;
			console.log("All tickets for vendor:", strapiTickets);

			// 3. Process and combine the data
			const finalTicketData = vendorTicketProducts.map((product: any) => {
				const productId = product.id;
				const productTitle = product.attributes.title;
				const productImage = product.attributes.main_image?.data?.[0]?.attributes?.url || "";
	
				const productTickets = strapiTickets.filter(
					(ticket: any) => ticket.attributes.product.data?.id === productId
				);
	
				const variantsMap = new Map<string, any>();
	
				// Initialize variants from the product itself
				if (Array.isArray(product.attributes.variant)) {
					product.attributes.variant.forEach((variant: any) => {
						variantsMap.set(variant.id.toString(), {
							id: variant.id,
							name: variant.name,
							quota: parseInt(variant.quota) || 0,
							price: parseFloat(variant.price) || 0,
							sold: 0,
							verified: 0,
						});
					});
				}
	
				// Update sold and verified counts from tickets
				productTickets.forEach((ticket: any) => {
					const variantId = ticket.attributes.variant.data?.id;
					if (variantId && variantsMap.has(variantId.toString())) {
						const currentVariant = variantsMap.get(variantId.toString());
						currentVariant.sold += 1;
						if (ticket.attributes.verification_status === "verified") {
							currentVariant.verified += 1;
						}
					}
				});
	
				const variants: iVariantSummary[] = Array.from(variantsMap.values()).map((variant: any) => {
					const quota = variant.quota;
					const sold = variant.sold;
					const price = variant.price;
					const verified = variant.verified;
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
					product_id: productId,
					product_title: productTitle || "Tiket Tanpa Nama",
					product_image: productImage,
					variants: variants,
					totalRevenue: totalRevenue,
					totalTicketsSold: totalTicketsSold,
				};
			});
	
			console.log("Final ticket data:", finalTicketData);
			return finalTicketData;
	
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
