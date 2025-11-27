"use client";
import Box from "@/components/Box";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AiFillCustomerService } from "react-icons/ai";
import dynamic from "next/dynamic";

const ProductAdd = dynamic(() => import("./ProductAdd"), { ssr: false });
const TicketAdd = dynamic(() => import("./TicketAdd"), { ssr: false });

export default function AddProductPage() {
	const [productType, setProductType] = useState<string>("product");
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<>
			{/* Tab Product & Ticket */}
			<div className="flex justify-stretch mt-7 rounded-t-lg overflow-hidden">
				<button
					className={`${productType === "product" ? "bg-c-green text-white" : "bg-slate-300 "} flex-1 py-2`}
					onClick={() => setProductType("product")}
				>
					Produk
				</button>
				<button
					className={`${productType === "ticket" ? "bg-c-green text-white" : "bg-slate-300 "} flex-1 py-2`}
					onClick={() => setProductType("ticket")}
				>
					Tiket
				</button>
			</div>
			{productType === "product" ? <ProductAdd /> : <TicketAdd />}
			<Box className="w-full">
				<div className="flex justify-center items-center w-full">
					<Link href="/" className="flex gap-2 items-center">
						<AiFillCustomerService className="lg:text-3xl text-2xl" />
						<strong className="text-[14px] lg:text-[16px]">Bantuan Celeparty Care</strong>
					</Link>
				</div>
			</Box>
		</>
	);
}
