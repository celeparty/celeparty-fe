"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import moment from "moment";
import Basecontent from "@/components/Basecontent";
import ItemProduct from "@/components/product/ItemProduct";
import { useRouter, notFound } from "next/navigation";

interface iRecomended {
	slug: string;
}

function RecomendedList(props: iRecomended) {
	const router = useRouter();

	const getQuery = async () => {
		return await getData(`/blogs/${props.slug}/relateds?search&limit=10`);
	};
	const query = useQuery({
		queryKey: ["qRecomendedListxxx"],
		queryFn: getQuery,
	});
	if (query.isLoading) {
		return (
			<div className=" relative flex justify-center ">
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
			</div>
		);
	}

	if (query.isError) {
		return notFound();
	}
	const dataContent = query?.data?.data.data;
	return (
		<div>
			<h4 className="font-semibold text-[16px] text-black">Untuk Anda</h4>
			<div className="flex flex-wrap  lg:-mx-2">
				{dataContent?.map((item: any, i: number) => {
					return (
						<ItemProduct
							url={`/blog/${item.id}`}
							key={item.id}
							title={item.title}
							image_url={
								item.thumbnail
									? item.thumbnail
									: "/images/noimage.png"
							}
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
		</div>
	);
}

export default function Recomended(props: iRecomended) {
	return (
		<div>
			<Basecontent>
				<RecomendedList slug={props.slug} />
			</Basecontent>
		</div>
	);
}
