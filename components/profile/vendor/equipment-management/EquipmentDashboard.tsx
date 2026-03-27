"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import Skeleton from "@/components/Skeleton";
import { EquipmentSummaryTable } from "./EquipmentSummaryTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Placeholder for detail page
const EquipmentDetailPage = ({ product, onBack }: { product: any, onBack: () => void }) => (
    <div>
        <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="mb-4 flex items-center gap-2"
        >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Ringkasan
        </Button>
        <h3 className="text-lg font-semibold mb-4">Detail Pesanan untuk {product.product_title}</h3>
        <p>Details about the equipment orders will be shown here.</p>
    </div>
);

import { iEquipmentSummary } from "@/lib/interfaces/iEquipmentManagement";

export const EquipmentDashboard: React.FC = () => {
	const { data: session } = useSession();
    const [selectedProduct, setSelectedProduct] = useState<iEquipmentSummary | null>(null);

	// Fetch equipment summary
	const getEquipmentSummary = async (): Promise<iEquipmentSummary[]> => {
		if (!session?.jwt || !session?.user?.documentId) return [];
		try {
			// Call the transaction proxy to get equipment orders for this vendor
			const vendorId = session.user.documentId;
			const params = new URLSearchParams();
			params.append('vendor_doc_id', vendorId);
			params.append('sort', 'createdAt:desc');
			params.append('pageSize', '1000');

			const response = await axiosUser(
				"GET",
				`/api/transaction-proxy?${params.toString()}`,
				session.jwt
			);

            const transactions = response.data?.data || [];
            console.log("EquipmentDashboard - Vendor's equipment transactions received:", {
				count: transactions.length,
				data: transactions
			});

            const equipmentSummaryMap = new Map<string, iEquipmentSummary>();

            transactions.forEach((transaction: any) => {
                const attrs = transaction.attributes;
                const paymentStatus = attrs.payment_status;

                // Only count paid transactions
                if (paymentStatus !== "paid" && paymentStatus !== "settlement") {
                    return;
                }

                // Process products array from transaction
                const products = attrs.products || [];
                products.forEach((product: any) => {
                    if (product.product_type !== 'equipment') return;

                    const productId = product.product_id;
                    const productTitle = product.product_name || "Equipment Tanpa Nama";
                    const quantity = product.quantity || 1;
                    const price = product.price || 0;
                    const revenue = price * quantity;

                    if (!equipmentSummaryMap.has(productId)) {
                        equipmentSummaryMap.set(productId, {
                            product_id: productId,
                            product_title: productTitle,
                            total_orders: 0,
                            total_revenue: 0,
                        });
                    }

                    const currentSummary = equipmentSummaryMap.get(productId)!;
                    currentSummary.total_orders += quantity; // Count individual items
                    currentSummary.total_revenue += revenue;
                });
            });

            const result = Array.from(equipmentSummaryMap.values());
            console.log("EquipmentDashboard - Final equipment summary:", result);
            return result;

		} catch (error) {
			console.error("Error fetching equipment summary:", error);
			return [];
		}
	};

	const summaryQuery = useQuery({
		queryKey: ["equipmentSummary", session?.jwt],
		queryFn: getEquipmentSummary,
		enabled: !!session?.jwt,
		staleTime: 5 * 60 * 1000,
	});

	if (summaryQuery.isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton width="100%" height="200px" />
			</div>
		);
	}

	if (summaryQuery.isError) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-4">
				<p className="text-red-600 font-semibold">Error memuat data ringkasan pesanan</p>
				<p className="text-sm text-red-500 mt-1">Silakan refresh halaman atau hubungi support</p>
			</div>
		);
	}

	const summaryData = summaryQuery.data || [];
	
	if (summaryData.length === 0 && !selectedProduct) {
		return (
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
				<p className="text-blue-600 font-semibold">Belum ada pesanan</p>
				<p className="text-sm text-blue-500 mt-1">Anda belum memiliki pesanan untuk perlengkapan event.</p>
			</div>
		);
	}

    if (selectedProduct) {
        return <EquipmentDetailPage product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
    }

	return (
		<div>
			<h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan Perlengkapan</h3>
			<EquipmentSummaryTable data={summaryData} onDetailClick={setSelectedProduct} />
		</div>
	);
};