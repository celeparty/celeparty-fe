"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Transaction {
	id: string;
	attributes?: {
		documentId?: string;
		event_type?: string;
		product_type?: string;
		products?: any[];
		createdAt?: string;
		payment_status?: string;
		total_amount?: number;
		buyer_name?: string;
		buyer_email?: string;
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

interface TransactionEquipmentCardProps {
	productGroup: ProductGroup;
}

export default function TransactionEquipmentCard({
	productGroup,
}: TransactionEquipmentCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const getStatusColor = (status: string) => {
		const lowerStatus = status.toLowerCase();
		if (lowerStatus === "paid" || lowerStatus === "completed") {
			return "bg-green-100 text-green-800";
		} else if (lowerStatus === "pending") {
			return "bg-yellow-100 text-yellow-800";
		}
		return "bg-red-100 text-red-800";
	};

	const getStatusLabel = (status: string) => {
		const lowerStatus = status.toLowerCase();
		if (lowerStatus === "paid" || lowerStatus === "completed") {
			return "Terbayar";
		} else if (lowerStatus === "pending") {
			return "Menunggu";
		}
		return "Gagal";
	};

	const paidPercentage =
		productGroup.totalTransactions > 0
			? Math.round(
					(productGroup.paymentStatusBreakdown.paid /
						productGroup.totalTransactions) *
						100
			  )
			: 0;

	// Calculate average transaction value
	const avgTransactionValue =
		productGroup.totalTransactions > 0
			? Math.round(productGroup.totalRevenue / productGroup.totalTransactions)
			: 0;

	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
			{/* Header dengan gambar */}
			<div className="relative h-40 bg-gray-200 overflow-hidden group">
				{productGroup.productImage ? (
					<Image
						src={productGroup.productImage}
						alt={productGroup.productName}
						fill
						className="object-cover group-hover:scale-105 transition-transform"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
						<div className="text-gray-400 text-center px-4">
							<Package className="w-8 h-8 mx-auto mb-2" />
							<p className="text-sm font-medium">Produk Umum</p>
						</div>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 flex-1 flex flex-col">
				{/* Title */}
				<h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
					{productGroup.productName}
				</h3>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3 mb-4">
					{/* Total Transactions */}
					<div className="bg-orange-50 rounded-lg p-3">
						<p className="text-xs text-gray-600 mb-1">Total Penjualan</p>
						<p className="text-2xl font-bold text-orange-600">
							{productGroup.totalTransactions}
						</p>
					</div>

					{/* Total Revenue */}
					<div className="bg-green-50 rounded-lg p-3">
						<p className="text-xs text-gray-600 mb-1">Total Pendapatan</p>
						<p className="text-xl font-bold text-green-600">
							Rp {productGroup.totalRevenue.toLocaleString("id-ID")}
						</p>
					</div>
				</div>

				{/* Additional Stats */}
				<div className="bg-gray-100 rounded-lg p-3 mb-4">
					<p className="text-xs text-gray-600 mb-1">Rata-rata Transaksi</p>
					<p className="text-lg font-bold text-gray-900">
						Rp {avgTransactionValue.toLocaleString("id-ID")}
					</p>
				</div>

				{/* Payment Status Breakdown */}
				<div className="mb-4">
					<div className="flex justify-between items-center mb-2">
						<p className="text-xs font-semibold text-gray-700">Status Pembayaran</p>
						<span className="text-xs font-bold text-green-600">
							{paidPercentage}% Terbayar
						</span>
					</div>
					<div className="flex gap-1 h-2 rounded-full bg-gray-200 overflow-hidden">
						<div
							className="bg-green-500 transition-all"
							style={{
								width: `${paidPercentage}%`,
							}}
						/>
						<div
							className="bg-yellow-500"
							style={{
								width: `${
									productGroup.totalTransactions > 0
										? Math.round(
												(productGroup.paymentStatusBreakdown
													.pending /
													productGroup.totalTransactions) *
													100
										  )
										: 0
								}%`,
							}}
						/>
						<div className="bg-red-500 flex-1" />
					</div>
					<div className="flex gap-4 mt-2 text-xs">
						<span className="text-green-600">
							✓ {productGroup.paymentStatusBreakdown.paid}
						</span>
						<span className="text-yellow-600">
							⏳ {productGroup.paymentStatusBreakdown.pending}
						</span>
						<span className="text-red-600">
							✗ {productGroup.paymentStatusBreakdown.failed}
						</span>
					</div>
				</div>

				{/* Expand Button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full mt-auto"
				>
					{isExpanded ? (
						<>
							<ChevronUp className="w-4 h-4 mr-2" />
							Sembunyikan Detail
						</>
					) : (
						<>
							<ChevronDown className="w-4 h-4 mr-2" />
							Lihat Detail
						</>
					)}
				</Button>
			</div>

			{/* Expandable Details */}
			{isExpanded && (
				<div className="bg-gray-50 border-t border-gray-200">
					<div className="p-4 space-y-3 max-h-80 overflow-y-auto">
						<h4 className="font-semibold text-sm text-gray-900 mb-3">
							Transaksi Terbaru
						</h4>
						{productGroup.transactions.slice(0, 5).map((transaction) => (
							<div
								key={transaction.id}
								className="bg-white rounded-lg p-3 border border-gray-200"
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex-1">
										<p className="text-sm font-medium text-gray-900">
											{transaction.attributes?.buyer_name ||
												"Pembeli"}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											{transaction.attributes?.createdAt
												? formatDate(
														transaction.attributes.createdAt
													)
												: "Tanggal tidak diketahui"}
										</p>
									</div>
									<Badge
										className={getStatusColor(
											transaction.attributes?.payment_status || ""
										)}
										variant="outline"
									>
										{getStatusLabel(
											transaction.attributes?.payment_status || ""
										)}
									</Badge>
								</div>
								<p className="text-sm font-bold text-gray-900">
									Rp {(transaction.attributes?.total_amount || 0).toLocaleString("id-ID")}
								</p>
							</div>
						))}
						{productGroup.transactions.length > 5 && (
							<p className="text-xs text-gray-500 text-center py-2">
								+{productGroup.transactions.length - 5} transaksi lainnya
							</p>
						)}
					</div>
				</div>
			)}
		</Card>
	);
}
