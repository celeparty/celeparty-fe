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
		if (!session?.jwt || !session?.user?.documentId) {
			console.warn("TicketDashboard - Missing session or documentId");
			return [];
		}
		try {
			// 1. Fetch all ticket transactions using transaction-tickets endpoint
			console.log("TicketDashboard - Fetching vendor's ticket transactions...");
			const filterParam = `filters[vendor_id][$eq]=${session.user.documentId}`;
			const url = `/api/transaction-tickets-proxy?${filterParam}&sort=createdAt:desc&pagination[pageSize]=1000`;
			console.log("TicketDashboard - Request URL:", url);
			
			const transactionsResponse = await axiosUser(
				"GET",
				url,
				session.jwt
			);
			
			const transactions = transactionsResponse.data?.data || [];
			console.log("TicketDashboard - Vendor's ticket transactions received:", {
				count: transactions.length,
				data: transactions
			});

			// 2. Initialize productsMap to aggregate data by product
			// Each transaction is ONE ticket product (not an array of products)
			const productsMap = new Map<string, any>();

			// 3. Process each transaction to aggregate sales data
			transactions.forEach((transaction: any) => {
				const attrs = transaction.attributes;

				// Get product info - either from product relation or direct fields
				const productId = attrs.product?.data?.id || attrs.product_name;
				const productData = attrs.product?.data?.attributes || {};
				const productTitle = productData.title || attrs.product_name || "Tiket Tanpa Nama";
				const productImage = productData.image_url || "";

				// Initialize product entry if not exists
				if (!productsMap.has(productId)) {
					productsMap.set(productId, {
						id: productId,
						title: productTitle,
						image: productImage,
						variants: new Map<string, any>(),
						totalSold: 0,
						totalRevenue: 0,
					});
				}

				const currentProduct = productsMap.get(productId);

				// Get transaction details from direct attributes (not from products array)
				const variantId = attrs.variant || "default";
				const quantity = parseInt(attrs.quantity) || 1;
				const price = parseFloat(attrs.price) || 0;
				const payment_status = attrs.payment_status || "pending";

				// Only count paid transactions
				if (payment_status !== "paid" && payment_status !== "settlement") {
					console.log("TicketDashboard - Skipping non-paid transaction:", {
						order_id: attrs.order_id,
						payment_status: payment_status
					});
					return;
				}

				// Initialize variant entry if not exists
				if (!currentProduct.variants.has(variantId)) {
					currentProduct.variants.set(variantId, {
						id: variantId,
						name: variantId,
						price: price,
						quota: 0, // Not available in transaction data
						sold: 0,
						verified: 0,
					});
				}

				// Update variant sales
				const variant = currentProduct.variants.get(variantId);
				variant.sold += quantity;
				currentProduct.totalSold += quantity;

				// Calculate revenue
				const systemFeePercentage = 10; // 10%
				const netIncome = price * quantity * (1 - systemFeePercentage / 100);
				currentProduct.totalRevenue += netIncome;

				// Count verified tickets from recipients array (direct in transaction, not in products)
				const recipients = attrs.recipients || [];
				let verifiedCount = 0;
				recipients.forEach((recipient: any) => {
					if (recipient.status === 'verified' || recipient.verification_status === 'verified' || recipient.verification_status === 'Verified') {
						verifiedCount += 1;
						variant.verified += 1;
					}
				});

				console.log("TicketDashboard - Processing transaction:", {
					order_id: attrs.order_id,
					product_name: attrs.product_name,
					variant: variantId,
					quantity: quantity,
					recipients_count: recipients.length,
					verified_count: verifiedCount
				});
			});

			// 4. Format the final data structure
			const finalTicketData = Array.from(productsMap.values()).map((product: any) => {
				const variants: iVariantSummary[] = Array.from(product.variants.values()).map((variant: any) => {
					const systemFeePercentage = 10;
					const netIncome = variant.price * variant.sold * (1 - systemFeePercentage / 100);

					return {
						variant_id: variant.id,
						variant_name: variant.name || "Default",
						price: variant.price,
						quota: variant.quota || 0,
						sold: variant.sold,
						verified: variant.verified,
						remaining: Math.max(0, (variant.quota || 0) - variant.sold),
						soldPercentage: (variant.quota || 0) > 0 ? (variant.sold / (variant.quota || 1)) * 100 : 0,
						netIncome: netIncome,
						systemFeePercentage: systemFeePercentage,
					};
				});

				return {
					product_id: product.id,
					product_title: product.title || "Tiket Tanpa Nama",
					product_image: product.image || "",
					variants: variants,
					totalRevenue: product.totalRevenue,
					totalTicketsSold: product.totalSold,
				};
			});

			console.log("TicketDashboard - Final ticket data:", finalTicketData);
			return finalTicketData;

		} catch (error: any) {
			console.error("TicketDashboard - Error fetching ticket summary:", {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data,
				url: error.config?.url
			});
			// Return empty instead of throwing to show "Belum ada tiket" message
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
		console.log("TicketDashboard - Error state detected");
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600 font-semibold">Error memuat data tiket</p>
				<p className="text-sm text-red-500 mt-1">Silakan refresh halaman atau hubungi support</p>
				<details className="mt-2 text-xs text-red-500">
					<summary className="cursor-pointer">Detail error</summary>
					<pre className="mt-1 p-2 bg-red-100 rounded text-red-700 overflow-auto">
						{JSON.stringify(summaryQuery.error, null, 2)}
					</pre>
				</details>
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
