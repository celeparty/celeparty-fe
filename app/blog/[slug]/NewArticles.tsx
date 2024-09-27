"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import moment from "moment";
import ItemFeature from "../features/ItemFeature";

export default function NewArticles() {
	const getQuery = async () => {
		return await getData(`/blogs/news?search=&limit=4&page=1`);
	};
	const query = useQuery({
		queryKey: ["qEventList"],
		queryFn: getQuery,
	});
	if (query.isLoading) {
		return (
			<div className=" relative flex flex-col justify-center ">
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
				<Skeleton width="100%" height="50px" spaceBottom={"0"} />
			</div>
		);
	}

	if (query.isError) {
		return <ErrorNetwork />;
	}

	const dataContent = query?.data?.data.data;
	return (
		<div>
			{dataContent?.map((item: any, index: number) => {
				return (
					<ItemFeature
						small={true}
						slug={`/blog/${item.slug}`}
						key={index}
						title={item?.title}
						date={moment(item?.publish_at).format("DD MMM YYYY")}
						image={
							item.thumbnail
								? item.thumbnail
								: "/images/no-image.png"
						}
					/>
				);
			})}
		</div>
	);
}
