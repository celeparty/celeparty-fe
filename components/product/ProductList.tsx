"use client";

import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosData, getData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import Box from "../Box";
import ItemProduct from "./ItemProduct";
import { formatRupiah } from "@/lib/utils";

export default function ProductList() {
	const getQuery = async () => {
		return await axiosData("GET", `/api/products?populate=*&pagination[pageSize]=5&sort[0]=updatedAt%3Adesc`);
	};
	const query = useQuery({
		queryKey: ["qProductHome"],
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
		<Box title="Untuk Anda" className="lg:px-9 px-2">
			<div className="flex flex-wrap -mx-2">
				{dataContent?.map((item: any, i: number) => {
					return (
						<ItemProduct
							url={`/products/${item.documentId}`}
							key={item.id}
							title={item.title}
							image_url={item.main_image ?process.env.BASE_API+item.main_image.url : "/images/noimage.png"}
							price={ item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
							rate={item.rate ? `${item.rate}` : "1"}
							sold={item.sold_count}
							location={item.vendor_region ? item.vendor_region : null}
						/>
					);
				})}
			</div>
			<div className="flex justify-center mt-7 border-c-green border border-solid py-2 lg:border-none lg:py-2  rounded-lg">
				<Link
					href="/products"
					className="border border-solid lg:border-c-green rounded-lg lg:px-5 lg:py-3 text-c-green font-semibold lg:hover:bg-c-green lg:hover:text-white"
				>
					Tampilkan Semua Produk
				</Link>
			</div>
		</Box>
	);
}
