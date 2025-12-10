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
		if (!session?.jwt) return [];
		try {
			// Call the general transaction proxy to get equipment orders
			// Assuming Strapi filters: filter by product type 'equipment' and populate product details
			const response = await axiosUser(
				"GET",
				"/api/transaction-proxy?filters[product][product_type][$eq]=equipment&populate=product",
				session.jwt
			);
            
            const strapiTransactions = response.data; // Assuming response.data is an array of transactions

            const equipmentSummaryMap = new Map<string, iEquipmentSummary>();

            strapiTransactions.forEach((transaction: any) => {
                const product = transaction.attributes.product?.data;
                if (!product) {
                    console.warn("Skipping transaction due to missing product data:", transaction);
                    return;
                }

                const productId = product.id;
                const productTitle = product.attributes.title;
                const price = parseFloat(transaction.attributes.amount) || 0; // Assuming amount is the price of the order

                if (!equipmentSummaryMap.has(productId)) {
                    equipmentSummaryMap.set(productId, {
                        product_id: productId,
                        product_title: productTitle,
                        total_orders: 0,
                        total_revenue: 0,
                    });
                }

                const currentSummary = equipmentSummaryMap.get(productId)!;
                currentSummary.total_orders += 1;
                currentSummary.total_revenue += price;
            });

            return Array.from(equipmentSummaryMap.values());

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