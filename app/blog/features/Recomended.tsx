"use client";
import Basecontent from "@/components/Basecontent";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { getData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { notFound, useRouter } from "next/navigation";
import React from "react";

interface iRecomended {
	slug: string;
}

interface Iitem {
	id: string | number;
	title: string;
	thumbnail: string | null;
	price: number;
	average_rating: string | number;
	sold_count: number;
	vendor_region: string | null;
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
	const dataContent: Iitem[] = query?.data?.data.data;
	return (
		<div>
			<h4 className="font-semibold text-[16px] text-black">Untuk Anda</h4>
			<div className="flex flex-wrap  lg:-mx-2">
				{dataContent?.map((item, i: number) => {
					return (
						<ItemProduct
							url={`/blog/${item.id}`}
							key={item.id}
							title={item.title}
							image_url={item.thumbnail ? item.thumbnail : "/images/noimage.png"}
							price={item.price}
							rate={Number.parseInt(`${item.average_rating}`).toFixed(1)}
							sold={`${item.sold_count}`}
							location={item.vendor_region ? item.vendor_region : "unknown"}
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
