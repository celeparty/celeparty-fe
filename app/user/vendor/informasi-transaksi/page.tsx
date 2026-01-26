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
		if (!session?.user?.documentId || !session?.jwt) {
			console.warn("[fetchTransactionData] No documentId or JWT available");
			return { tiket: [], umum: [] };
		}

		try {
			const vendorId = session.user.documentId;
			const jwt = session.jwt;
			
			console.log("[fetchTransactionData] Fetching transactions for vendor:", vendorId);
			
			// Build URL untuk transaksi umum - use axios directly untuk next.js API endpoints
			const umumParams = new URLSearchParams();
			umumParams.append('vendor_doc_id', vendorId);
			umumParams.append('pageSize', '100');
			umumParams.append('page', '1');
			umumParams.append('sort', 'createdAt:desc');
			
			const umumUrl = `/api/transaction-proxy?${umumParams.toString()}`;
			console.log("[fetchTransactionData] Umum URL:", umumUrl);
			
			const umumResponse = await axios.get(umumUrl, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});
			const umumTransactions = umumResponse?.data?.data || [];
			console.log("[fetchTransactionData] Got", umumTransactions.length, 'umum transactions');

			// Filter untuk hanya produk umum (event_type bukan ticket/tiket)
			const umumFiltered = umumTransactions.filter(
				(t: any) => {
					const eventType = t.attributes?.event_type?.toLowerCase();
					return eventType !== "ticket" && eventType !== "tiket";
				}
			);
			
			// Build URL untuk transaksi tiket
			const tiketParams = new URLSearchParams();
			tiketParams.append('vendor_doc_id', vendorId);
			tiketParams.append('pageSize', '100');
			tiketParams.append('page', '1');
			tiketParams.append('sort', 'createdAt:desc');
			
			const tiketUrl = `/api/transaction-tickets-proxy?${tiketParams.toString()}`;
			console.log("[fetchTransactionData] Tiket URL:", tiketUrl);
			
			const tiketResponse = await axios.get(tiketUrl, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});
			const tiketTransactions = tiketResponse?.data?.data || [];
			console.log("[fetchTransactionData] Got", tiketTransactions.length, "ticket transactions");

			console.log("[fetchTransactionData] Summary:", {
				umum: umumFiltered.length,
				tiket: tiketTransactions.length,
			});

			return {
				tiket: tiketTransactions,
				umum: umumFiltered,
			};
		} catch (error: any) {
			console.error("[fetchTransactionData] Error:", {
				status: error.response?.status,
				message: error.message,
				url: error.config?.url,
				data: error.response?.data
			});
			if (error.response?.status === 404) {
				console.error("[fetchTransactionData] 404 - endpoint not found or responding with error");
			}
			if (error.response?.status === 401) {
				console.error("[fetchTransactionData] 401 - Authorization failed. Check JWT or API key");
			}
			throw error;
		}
	};

	const { data, isLoading, isError } = useQuery({
		queryKey: ["vendorTransactions", session?.user?.documentId, session?.jwt],
		queryFn: fetchTransactionData,
		enabled: !!session?.user?.documentId && !!session?.jwt,
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
