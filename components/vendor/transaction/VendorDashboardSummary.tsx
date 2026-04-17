"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Box from "@/components/Box";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";

interface ProductSummary {
	product_id: string;
	product_name: string;
	total_sold: number;
	total_revenue: number;
	verified_tickets: number;
	pending_orders: number;
}

interface DashboardStats {
	total_sales: number;
	total_revenue: number;
	total_verified_tickets: number;
	products_summary: ProductSummary[];
}

export const VendorDashboardSummary: React.FC = () => {
	const { data: session } = useSession();

	const fetchDashboardData = async (): Promise<DashboardStats> => {
		if (!session?.jwt || !session?.user?.documentId) {
			throw new Error("No session or vendor ID");
		}

		try {
			// Fetch ticket transactions to calculate summary
			const tiketParams = new URLSearchParams();
			tiketParams.append('vendor_doc_id', session.user.documentId);
			tiketParams.append('pageSize', '100');
			tiketParams.append('sort', 'createdAt:desc');

			const tiketUrl = `/api/transaction-tickets-proxy?${tiketParams.toString()}`;
			const tiketResponse = await axios.get(tiketUrl, {
				headers: { Authorization: `Bearer ${session.jwt}` },
			});
			const ticketTransactions = tiketResponse?.data?.data || [];

			// Fetch equipment transactions
			const equipParams = new URLSearchParams();
			equipParams.append('vendor_doc_id', session.user.documentId);
			equipParams.append('filters[event_type][$eq]', 'equipment');
			equipParams.append('pageSize', '100');
			equipParams.append('sort', 'createdAt:desc');

			const equipUrl = `/api/transaction-proxy?${equipParams.toString()}`;
			const equipResponse = await axios.get(equipUrl, {
				headers: { Authorization: `Bearer ${session.jwt}` },
			});
			const equipmentTransactions = equipResponse?.data?.data || [];

			// Calculate summary by product
			const productMap = new Map<string, ProductSummary>();

			// Process ticket transactions
			ticketTransactions.forEach((txn: any) => {
				const attrs = txn.attributes;
				const productKey = attrs.product_name || 'Unknown Ticket';
				const current = productMap.get(productKey) || {
					product_id: attrs.id,
					product_name: productKey,
					total_sold: 0,
					total_revenue: 0,
					verified_tickets: 0,
					pending_orders: 0,
				};

				current.total_sold += parseInt(attrs.quantity || 0);
				current.total_revenue += parseInt(attrs.total_price || 0);
				if (attrs.payment_status === 'settlement' || attrs.payment_status === 'paid') {
					current.verified_tickets += parseInt(attrs.quantity || 0);
				}
				if (attrs.payment_status === 'pending') {
					current.pending_orders += 1;
				}

				productMap.set(productKey, current);
			});

			// Process equipment transactions
			equipmentTransactions.forEach((txn: any) => {
				const attrs = txn.attributes;
				if (attrs.products && Array.isArray(attrs.products)) {
					attrs.products.forEach((prod: any) => {
						const productKey = prod.product_name || 'Unknown Equipment';
						const current = productMap.get(productKey) || {
							product_id: prod.product_id,
							product_name: productKey,
							total_sold: 0,
							total_revenue: 0,
							verified_tickets: 0,
							pending_orders: 0,
						};

						current.total_sold += parseInt(prod.quantity || 0);
						current.total_revenue += parseInt(prod.price || 0) * (prod.quantity || 1);
						if (attrs.payment_status === 'settlement' || attrs.payment_status === 'paid') {
							current.verified_tickets += parseInt(prod.quantity || 0);
						}
						if (attrs.payment_status === 'pending') {
							current.pending_orders += 1;
						}

						productMap.set(productKey, current);
					});
				}
			});

			const products_summary = Array.from(productMap.values());
			const total_sales = products_summary.reduce((sum, p) => sum + p.total_sold, 0);
			const total_revenue = products_summary.reduce((sum, p) => sum + p.total_revenue, 0);
			const total_verified_tickets = products_summary.reduce((sum, p) => sum + p.verified_tickets, 0);

			return {
				total_sales,
				total_revenue,
				total_verified_tickets,
				products_summary: products_summary.sort((a, b) => b.total_revenue - a.total_revenue),
			};
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			throw error;
		}
	};

	const { data, isLoading, isError } = useQuery({
		queryKey: ["vendorDashboard", session?.user?.documentId],
		queryFn: fetchDashboardData,
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!session?.jwt && !!session?.user?.documentId,
	});

	if (isLoading) {
		return (
			<Box>
				<Skeleton width="100%" height="300px" />
			</Box>
		);
	}

	if (isError) {
		return <ErrorNetwork />;
	}

	if (!data) {
		return <Box>No data available</Box>;
	}

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-c-blue to-blue-600 p-6 rounded-lg shadow-lg">
					<h3 className="text-sm font-medium text-white/80">Total Penjualan</h3>
					<div className="text-3xl font-bold text-white mt-2">{data.total_sales}</div>
					<p className="text-xs text-white/80 mt-1">unit terjual</p>
				</div>

				<div className="bg-gradient-to-br from-c-orange to-orange-600 p-6 rounded-lg shadow-lg">
					<h3 className="text-sm font-medium text-white/80">Total Pendapatan</h3>
					<div className="text-2xl font-bold text-white mt-2 truncate">
						Rp {data.total_revenue.toLocaleString("id-ID")}
					</div>
					<p className="text-xs text-white/80 mt-1">dari semua produk</p>
				</div>

				<div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg">
					<h3 className="text-sm font-medium text-white/80">Tiket Terverifikasi</h3>
					<div className="text-3xl font-bold text-white mt-2">{data.total_verified_tickets}</div>
					<p className="text-xs text-white/80 mt-1">tiket terverifikasi</p>
				</div>

				<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg">
					<h3 className="text-sm font-medium text-white/80">Produk Aktif</h3>
					<div className="text-3xl font-bold text-white mt-2">{data.products_summary.length}</div>
					<p className="text-xs text-white/80 mt-1">produk dijual</p>
				</div>
			</div>

			{/* Product Details Table */}
			<Box>
				<h3 className="text-lg font-semibold mb-4 text-c-blue">📊 Detail Per Produk</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-100 border-b-2 border-c-blue">
							<tr>
								<th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Produk</th>
								<th className="px-4 py-3 text-right font-semibold text-gray-700">Total Terjual</th>
								<th className="px-4 py-3 text-right font-semibold text-gray-700">Terverifikasi</th>
								<th className="px-4 py-3 text-right font-semibold text-gray-700">Pending</th>
								<th className="px-4 py-3 text-right font-semibold text-gray-700">Pendapatan</th>
							</tr>
						</thead>
						<tbody>
							{data.products_summary.length > 0 ? (
								data.products_summary.map((product, idx) => (
									<tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
										<td className="px-4 py-3 font-medium max-w-md truncate">{product.product_name}</td>
										<td className="px-4 py-3 text-right">{product.total_sold}</td>
										<td className="px-4 py-3 text-right">
											<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
												{product.verified_tickets}
											</span>
										</td>
										<td className="px-4 py-3 text-right">
											<span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
												{product.pending_orders}
											</span>
										</td>
										<td className="px-4 py-3 text-right font-semibold text-c-blue">
											Rp {product.total_revenue.toLocaleString("id-ID")}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-gray-500">
										Belum ada data transaksi
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</Box>
		</div>
	);
};

export default VendorDashboardSummary;
