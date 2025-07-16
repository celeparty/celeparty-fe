"use client";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import ItemFeature from "../features/ItemFeature";

export default function NewArticles() {

		const getQuery = async () => {
			return await axiosData("GET", "/api/blogs?populate=*");
		};
		const query = useQuery({
			queryKey: ["qEventList"],
			queryFn: getQuery,
		});
		if (query.isLoading) {
			return (
				<div className=" relative flex justify-center ">
					<Skeleton width="100%" height="400px" spaceBottom={"10px"} />
				</div>
			);
		}
	
		if (query.isError) {
			return <ErrorNetwork />;
		}
	
		const dataContent = query?.data?.data;
	return (
		<div>
			{dataContent?.map((item: any, index: number) => {
				return (
					<ItemFeature
						small={true}
						slug={`/blog/${item?.documentId}`}
						key={index}
						title={item?.title}
						date={moment(item?.publish_at).format("DD MMM YYYY")}
						image={item.image?.url ? `${process.env.BASE_API+item.image?.url}` : "/images/noimage.png"}
					/>
				);
			})}
		</div>
	);
}
