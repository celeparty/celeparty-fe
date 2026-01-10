"use client";

import { useMemo } from "react";
import TransactionTicketCard from "./TransactionTicketCard";
import TransactionEquipmentCard from "./TransactionEquipmentCard";

interface Transaction {
	id: string;
	attributes?: {
		documentId?: string;
		event_type?: string;
		product_type?: string;
		products?: any[];
		createdAt?: string;
		updatedAt?: string;
		payment_status?: string;
		total_amount?: number;
		[key: string]: any;
	};
}

interface ProductGroup {
	productId: string;
	productName: string;
	productImage?: string;
	productType: string;
	transactions: Transaction[];
	totalRevenue: number;
	totalTransactions: number;
	paymentStatusBreakdown: {
		paid: number;
		pending: number;
		failed: number;
	};
}

interface TransactionProductListProps {
	transactions: Transaction[];
	productType: "tiket" | "umum";
}

export default function TransactionProductList({
	transactions,
	productType,
}: TransactionProductListProps) {
	// Group transactions by product
	const groupedProducts = useMemo(() => {
		const groups: Record<string, ProductGroup> = {};

		transactions.forEach((transaction) => {
			const products = transaction.attributes?.products || [];
			const paymentStatus = transaction.attributes?.payment_status || "pending";
			const totalAmount = transaction.attributes?.total_amount || 0;

			// Jika ada multiple products, split per product
			if (Array.isArray(products) && products.length > 0) {
				products.forEach((product: any) => {
					const productId = product.id || product.product_id || "unknown";
					const productName = product.name || product.product_name || "Unknown Product";
					const productImage = product.image?.url || product.thumbnail?.url || "";

					if (!groups[productId]) {
						groups[productId] = {
							productId,
							productName,
							productImage,
							productType: transaction.attributes?.product_type || productType,
							transactions: [],
							totalRevenue: 0,
							totalTransactions: 0,
							paymentStatusBreakdown: {
								paid: 0,
								pending: 0,
								failed: 0,
							},
						};
					}

					groups[productId].transactions.push(transaction);
					groups[productId].totalTransactions += 1;
					groups[productId].totalRevenue += totalAmount;

					// Count payment status
					const status = paymentStatus.toLowerCase();
					if (status === "paid" || status === "completed") {
						groups[productId].paymentStatusBreakdown.paid += 1;
					} else if (status === "pending") {
						groups[productId].paymentStatusBreakdown.pending += 1;
					} else {
						groups[productId].paymentStatusBreakdown.failed += 1;
					}
				});
			} else {
				// Jika tidak ada product detail, gunakan transaction itself
				const productId = `transaction-${transaction.id}`;
				const productName = `Transaksi ${new Date(transaction.attributes?.createdAt || "").toLocaleDateString("id-ID")}`;

				if (!groups[productId]) {
					groups[productId] = {
						productId,
						productName,
						productImage: "",
						productType: transaction.attributes?.product_type || productType,
						transactions: [],
						totalRevenue: 0,
						totalTransactions: 0,
						paymentStatusBreakdown: {
							paid: 0,
							pending: 0,
							failed: 0,
						},
					};
				}

				groups[productId].transactions.push(transaction);
				groups[productId].totalTransactions += 1;
				groups[productId].totalRevenue += totalAmount;

				const status = paymentStatus.toLowerCase();
				if (status === "paid" || status === "completed") {
					groups[productId].paymentStatusBreakdown.paid += 1;
				} else if (status === "pending") {
					groups[productId].paymentStatusBreakdown.pending += 1;
				} else {
					groups[productId].paymentStatusBreakdown.failed += 1;
				}
			}
		});

		return Object.values(groups).sort(
			(a, b) => b.totalRevenue - a.totalRevenue
		);
	}, [transactions]);

	if (groupedProducts.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 text-lg">Tidak ada data transaksi</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{groupedProducts.map((productGroup) =>
				productType === "tiket" ? (
					<TransactionTicketCard
						key={productGroup.productId}
						productGroup={productGroup}
					/>
				) : (
					<TransactionEquipmentCard
						key={productGroup.productId}
						productGroup={productGroup}
					/>
				)
			)}
		</div>
	);
}
