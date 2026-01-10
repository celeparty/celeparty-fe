"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Box from "@/components/Box";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionProductList from "@/components/vendor/transaction/TransactionProductList";
import { useQuery } from "@tanstack/react-query";

export default function VendorInformasiTransaksiPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("tiket");

	// Redirect jika tidak vendor
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/login");
		}
		if (status === "authenticated" && !session?.user?.isVendor) {
			router.push("/user/profile/orders");
		}
	}, [status, session, router]);

	const fetchTransactionData = async () => {
		if (!session?.user?.documentId) return { tiket: [], umum: [] };

		try {
			// Fetch semua transaksi vendor
			const response = await axios.get(
				`/api/transaction-proxy?filters[vendor_doc_id][$eq]=${session.user.documentId}&populate=*&pagination[pageSize]=1000&sort=createdAt:desc`
			);

			const allTransactions = response.data.data || [];

			// Pisahkan tiket dan non-tiket
			const tiketTransactions = allTransactions.filter(
				(t: any) => t.attributes?.event_type === "ticket" || t.attributes?.event_type === "tiket"
			);
			const umumTransactions = allTransactions.filter(
				(t: any) => t.attributes?.event_type !== "ticket" && t.attributes?.event_type !== "tiket"
			);

			console.log("Transaction Data:", {
				total: allTransactions.length,
				tiket: tiketTransactions.length,
				umum: umumTransactions.length,
			});

			return {
				tiket: tiketTransactions,
				umum: umumTransactions,
			};
		} catch (error) {
			console.error("Error fetching transactions:", error);
			throw error;
		}
	};

	const { data, isLoading, isError } = useQuery({
		queryKey: ["vendorTransactions", session?.user?.documentId],
		queryFn: fetchTransactionData,
		enabled: !!session?.user?.documentId,
		staleTime: 5000,
		retry: 2,
	});

	if (status === "loading") {
		return <Skeleton width="100%" height="300px" />;
	}

	if (!session?.user?.isVendor) {
		return null;
	}

	return (
		<div className="wrapper-big py-8 lg:py-12">
			<Box>
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-c-blue mb-2">Informasi Transaksi</h1>
					<p className="text-gray-600">
						Lihat semua transaksi produk Anda berdasarkan kategori tiket dan umum
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="tiket" className="text-base">
							Produk Tiket
						</TabsTrigger>
						<TabsTrigger value="umum" className="text-base">
							Produk Umum
						</TabsTrigger>
					</TabsList>

					<TabsContent value="tiket" className="space-y-6">
						{isLoading ? (
							<Skeleton width="100%" height="200px" />
						) : isError ? (
							<ErrorNetwork style="mt-0" />
						) : data?.tiket && data.tiket.length > 0 ? (
							<TransactionProductList transactions={data.tiket} productType="tiket" />
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">Tidak ada transaksi tiket</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="umum" className="space-y-6">
						{isLoading ? (
							<Skeleton width="100%" height="200px" />
						) : isError ? (
							<ErrorNetwork style="mt-0" />
						) : data?.umum && data.umum.length > 0 ? (
							<TransactionProductList transactions={data.umum} productType="umum" />
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">Tidak ada transaksi produk umum</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</Box>
		</div>
	);
}
