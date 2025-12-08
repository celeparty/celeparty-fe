"use client";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import Box from "../Box";
import { ProductListBox } from "./ProductListBox";

interface iProductListProps {
	boxStyle: boolean;
	title: string;
	queryKey: string;
	showAllBtn: boolean;
}

export const ProductList: React.FC<iProductListProps> = ({ boxStyle, title, queryKey, showAllBtn }) => {
	const getQuery = async () => {
		try {
			// Fetch both products and tickets in parallel
			const [productsRes, ticketsRes] = await Promise.all([
				axiosData("GET", "/api/products?populate=*&filters[state][$eq]=approved&pagination[pageSize]=5&sort[0]=updatedAt%3Adesc"),
				axiosData("GET", "/api/tickets?populate=*&filters[state][$eq]=approved&filters[publishedAt][$notnull]=true&pagination[pageSize]=5&sort[0]=updatedAt%3Adesc")
			]);

			// Merge products and tickets data
			const products = productsRes?.data || [];
			const tickets = ticketsRes?.data || [];

			// Mark items with type for ProductListBox to handle correctly
			const allItems = [
				...products.map((p: any) => ({ ...p, __productType: 'equipment' })),
				...tickets.map((t: any) => ({ ...t, __productType: 'ticket' }))
			];

			// Sort by updatedAt descending and take top 5
			allItems.sort((a: any, b: any) => {
				const dateA = new Date(a.updatedAt).getTime();
				const dateB = new Date(b.updatedAt).getTime();
				return dateB - dateA;
			});

			return { data: allItems.slice(0, 5) };
		} catch (error) {
			console.error("Error fetching products and tickets:", error);
			// Fallback to just products if error
			return await axiosData("GET", "/api/products?populate=*&filters[state][$eq]=approved&pagination[pageSize]=5&sort[0]=updatedAt%3Adesc");
		}
	};
	const query = useQuery({
		queryKey: [queryKey],
		queryFn: getQuery,
		staleTime: 60 * 1000, // 1 minute
	});
	if (query.isLoading) {
		return (
			<div className="wrapper relative flex justify-center gap-5 overflow-hidden">
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
			</div>
		);
	}

	if (query.isError) {
		return <ErrorNetwork />;
	}

	const dataContent = query?.data?.data;

	return (
		<>
			{boxStyle ? (
				<>
					<Box title={title} className="lg:px-9 px-2">
						<section aria-label={`${title} - daftar produk`} role="region">
							<ProductListBox posts={dataContent}></ProductListBox>
						</section>
						{showAllBtn && (
							<>
								<div className="flex justify-center mt-7 border-c-green border border-solid py-2 lg:border-none lg:py-2 rounded-lg">
									<Link
										href="/products"
										className="border border-solid lg:border-c-green rounded-lg lg:px-5 lg:py-3 text-c-green font-semibold lg:hover:bg-c-green lg:hover:text-white focus:outline-none focus:ring-2 focus:ring-c-green focus:ring-offset-2"
										aria-label="Lihat semua produk"
									>
										Tampilkan Semua Produk
									</Link>
								</div>
							</>
						)}
					</Box>
				</>
			) : (
				<>
					<section aria-label={`${title} - daftar produk`} role="region">
						<ProductListBox posts={dataContent}></ProductListBox>
					</section>
				</>
			)}
		</>
	);
};
