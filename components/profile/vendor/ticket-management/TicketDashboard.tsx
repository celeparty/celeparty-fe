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
		if (!session?.jwt || !session?.user?.documentId) return [];
		try {
			// 1. Fetch all products for the vendor that are in the 'ticket' user_event_type
			console.log("Fetching vendor's ticket products...");
			const productsResponse = await axiosUser(
				"GET",
				`/api/products?filters[vendor][id][$eq]=${session.user.documentId}&filters[user_event_type][name][$in]=Ticket&filters[user_event_type][name][$in]=ticket&populate[main_image]=*&populate[variants]=*`,
				session.jwt
			);
			const vendorProducts = productsResponse.data.data;
			console.log("Vendor's ticket products:", vendorProducts);

			// 2. Fetch all transactions for the vendor to aggregate sales data
			console.log("Fetching transactions for ticket summary...");
			const transactionsResponse = await axiosUser(
				"GET",
				`/api/transactions?filters[vendor_doc_id][$eq]=${session.user.documentId}&populate[order_items][populate]=product,variant`,
				session.jwt
			);
			const transactions = transactionsResponse.data; // Assuming .data contains the array
			console.log("Raw API response for transactions:", transactions);

			// 3. Initialize productsMap with all ticket products from this vendor
			const productsMap = new Map<string, any>();
			vendorProducts.forEach((productData: any) => {
				const productId = productData.id;
				productsMap.set(productId.toString(), {
					id: productId,
					title: productData.attributes.title,
					image: productData.attributes.main_image?.data?.[0]?.attributes?.url || "",
					variants: new Map<string, any>(),
				});

				const productVariants = productData.attributes.variants?.data || [];
				productVariants.forEach((variantData: any) => {
					const variantId = variantData.id;
					const variantDetails = variantData.attributes;
					productsMap.get(productId.toString()).variants.set(variantId.toString(), {
						id: variantId,
						name: variantDetails.name,
						quota: parseInt(variantDetails.quota) || 0,
						price: parseFloat(variantDetails.price) || 0,
						sold: 0,
						verified: 0, // TODO: Cannot calculate verified status from /api/transactions yet.
					});
				});
			});

			// 4. Aggregate sales data from transactions
			if (transactions && Array.isArray(transactions)) {
				transactions.forEach((transaction: any) => {
					const orderItems = transaction.attributes.order_items?.data || [];
					orderItems.forEach((item: any) => {
						const product = item.attributes.product?.data;
						const variant = item.attributes.variant?.data;

						if (!product || !variant) {
							console.warn("Skipping order item due to missing product or variant data:", item);
							return;
						}

						const productId = product.id.toString();
						const variantId = variant.id.toString();

						const currentProduct = productsMap.get(productId);
						// Only aggregate for ticket products owned by the vendor
						if (!currentProduct) return;

						const currentVariant = currentProduct.variants.get(variantId);
						if (!currentVariant) return;

						currentVariant.sold += item.attributes.quantity || 0;
						
						// The 'verified' count cannot be calculated from the main transaction endpoint yet.
						// This will require backend changes to include recipient/verification status in the /api/transactions response.
					});
				});
			}

			console.log("productsMap after aggregation:", productsMap);

			// 5. Format the final data structure
			const finalTicketData = Array.from(productsMap.values()).map((product: any) => {
				const variants: iVariantSummary[] = Array.from(product.variants.values()).map((variant: any) => {
					const quota = variant.quota;
					const sold = variant.sold;
					const price = variant.price;
					const verified = variant.verified; // Will be 0 for now
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
					product_id: product.id,
					product_title: product.title || "Tiket Tanpa Nama",
					product_image: product.image || "",
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
		queryKey: ["ticketSummary", session?.jwt, session?.user?.documentId],
		queryFn: getTicketSummary,
		enabled: !!session?.jwt && !!session?.user?.documentId,
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
