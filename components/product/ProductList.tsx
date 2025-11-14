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
		return await axiosData("GET", `/api/products?populate=*&pagination[pageSize]=5&sort[0]=updatedAt%3Adesc`);
	};
	const query = useQuery({
		queryKey: [queryKey],
		queryFn: getQuery,
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
						<ProductListBox posts={dataContent}></ProductListBox>
						{showAllBtn && (
							<>
								<div className="flex justify-center mt-7 border-c-green border border-solid py-2 lg:border-none lg:py-2  rounded-lg">
									<Link
										href="/products"
										className="border border-solid lg:border-c-green rounded-lg lg:px-5 lg:py-3 text-c-green font-semibold lg:hover:bg-c-green lg:hover:text-white"
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
					<ProductListBox posts={dataContent}></ProductListBox>
				</>
			)}
		</>
	);
};
