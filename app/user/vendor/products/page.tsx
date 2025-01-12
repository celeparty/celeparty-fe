"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { axiosUser, getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React from "react";
import { formatRupiah } from "@/lib/utils";

interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
	return (
		<div
			className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px]`}
			style={{ backgroundColor: `${color}` }}
		>
			<h4>{status}</h4>
			<strong>{value}</strong>
		</div>
	);
}
export default function Products() {
	const { data: session, status } = useSession();
	

	const getQuery = async () => {
		if (status === "authenticated") {
			return await axiosUser("GET",`/api/products?populate=*&filters[users_permissions_user][documentId]=${session?.user.documentId}`,`${session && session?.jwt}`);
		}
	};
	const query = useQuery({
		queryKey: ["qProductsVendor"],
		queryFn: getQuery,
		enabled: status === "authenticated"
	});

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}
	const dataContent = query?.data?.data;

	return (
		<div>
			<Box className="mt-0">
				<div className="flex flex-wrap -mx-2">
					{dataContent?.map((item: any) => {
						return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									key={item.id}
									title={item.title}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={item.rate ? `${item.rate}` : "1"}
									sold={item.sold_count}
									location={item.region ? item.region : null}
								></ItemProduct>

						);
					})}
				</div>
			</Box>
		</div>
	);
}
