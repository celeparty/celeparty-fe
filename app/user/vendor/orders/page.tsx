"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Box from "@/components/Box";
import Skeleton from "@/components/Skeleton";
import ErrorNetwork from "@/components/ErrorNetwork";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { UserTransactionTable } from "@/components/profile/UserTransactionTable";
import { UserTicketTransactionTable } from "@/components/profile/UserTicketTransactionTable";

export default function OrderPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("general");

	// Redirect jika tidak vendor
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/login");
		}
		if (status === "authenticated" && !session?.user?.isVendor) {
			router.push("/user/profile/orders");
		}
	}, [status, session, router]);

	if (status === "loading") {
		return <Skeleton width="100%" height="300px" />;
	}

	if (!session?.user?.isVendor) {
		return null;
	}

	return (
		<div className="w-full">
			<Box>
				<div className="mb-6">
					<h1 className="text-2xl lg:text-3xl font-bold text-c-blue mb-2">Informasi Transaksi</h1>
					<p className="text-gray-600 text-sm lg:text-base">
						Kelola pesanan produk Anda berdasarkan kategori tiket dan umum
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="general" className="text-base">
							Pesanan Umum
						</TabsTrigger>
						<TabsTrigger value="tickets" className="text-base">
							Pesanan Tiket
						</TabsTrigger>
					</TabsList>

					<TabsContent value="general" className="mt-6">
						<UserTransactionTable isVendor={true} activeTab={activeTab} orderTypeFilter="equipment" />
					</TabsContent>

					<TabsContent value="tickets" className="mt-6">
						<UserTicketTransactionTable isVendor={true} activeTab={activeTab} />
					</TabsContent>
				</Tabs>
			</Box>
		</div>
	);
}
