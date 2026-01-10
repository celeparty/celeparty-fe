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
		if (!session?.user?.documentId) {
			console.warn("[fetchTransactionData] No documentId available");
			return { tiket: [], umum: [] };
		}

		try {
			const vendorId = session.user.documentId;
			
			// Simplified URL - remove complex filters
			const url = `/api/transaction-proxy?pagination[pageSize]=100&sort=createdAt:desc`;
			
			console.log("[fetchTransactionData] Fetching from:", url);
			console.log("[fetchTransactionData] Vendor ID:", vendorId);
			
			const response = await axios.get(url);

			const allTransactions = response.data.data || [];
			console.log("[fetchTransactionData] Got", allTransactions.length, 'total transactions');

			// Filter by vendor ID and event type on client side
			const vendorTransactions = allTransactions.filter((t: any) => {
				const txVendorId = t.attributes?.vendor_doc_id;
				return txVendorId === vendorId;
			});

			console.log("[fetchTransactionData] Filtered to", vendorTransactions.length, 'vendor transactions');

			// Pisahkan tiket dan non-tiket (case-insensitive)
			const tiketTransactions = vendorTransactions.filter(
				(t: any) => {
					const eventType = t.attributes?.event_type?.toLowerCase();
					return eventType === "ticket" || eventType === "tiket";
				}
			);
			const umumTransactions = vendorTransactions.filter(
				(t: any) => {
					const eventType = t.attributes?.event_type?.toLowerCase();
					return eventType !== "ticket" && eventType !== "tiket";
				}
			);

			console.log("[fetchTransactionData] Summary:", {
				total: allTransactions.length,
				vendor: vendorTransactions.length,
				tiket: tiketTransactions.length,
				umum: umumTransactions.length,
				eventTypes: vendorTransactions.map((t: any) => t.attributes?.event_type).slice(0, 5),
			});

			return {
				tiket: tiketTransactions,
				umum: umumTransactions,
			};
		} catch (error: any) {
			console.error("[fetchTransactionData] Error:", {
				status: error.response?.status,
				message: error.message,
				data: error.response?.data
			});
			if (error.response?.status === 404) {
				console.error("[fetchTransactionData] 404 - transaction-proxy endpoint not found or responding with error");
			}
			if (error.response?.status === 401) {
				console.error("[fetchTransactionData] 401 - Authorization failed. Check KEY_API");
			}
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

	// Debug logging
	if (!session?.user?.documentId) {
		console.warn("[InformasiTransaksi] No vendor documentId found in session:", session?.user);
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

				{!session?.user?.documentId && (
					<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
						⚠️ Vendor ID tidak ditemukan. Silakan logout dan login kembali.
					</div>
				)}

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
