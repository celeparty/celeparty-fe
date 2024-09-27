"use client";

import React from "react";
import Box from "../Box";
import ItemProduct from "./ItemProduct";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import Link from "next/link";

export default function ProductList() {
	const getQuery = async () => {
		return await getData(`/products`);
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

	const dataContent = query?.data?.data.data;

	return (
		<Box title="Untuk Anda" className="lg:px-9 px-2">
			<div className="flex flex-wrap -mx-2">
				{dataContent?.map((item: any, i: number) => {
					return (
						<ItemProduct
							url={`/product/${item.id}`}
							key={item.id}
							title={item.name}
							image_url={item.photos[0].image_url}
							price={item.price}
							rate={parseInt(item.average_rating).toFixed(1)}
							sold={item.sold_count}
							location={
								item.vendor_region
									? item.vendor_region
									: "unknown"
							}
						/>
					);
				})}
			</div>
			<div className="flex justify-center mt-7 border-c-green border border-solid py-2 lg:border-none lg:py-2  rounded-lg">
				<Link
					href="/product"
					className="border border-solid lg:border-c-green rounded-lg lg:px-5 lg:py-3 text-c-green font-semibold lg:hover:bg-c-green lg:hover:text-white"
				>
					Tampilkan Semua Produk
				</Link>
			</div>
		</Box>
	);
}
