"use client";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { axiosData, getData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import Image from "next/image";
import Link from "next/link";
import Box from "./Box";

export default function EventList() {
	const getQuery = async () => {
		return await axiosData("GET", `/api/user-event-types?populate=*`);
	};
	const query = useQuery({
		queryKey: ["qEventList"],
		queryFn: getQuery,
	});
	if (query.isLoading) {
		return (
			<div className=" relative flex justify-center ">
				<Skeleton width="100%" height="150px" spaceBottom={"10px"} />
			</div>
		);
	}

	if (query.isError) {
		return <ErrorNetwork />;
	}
	const dataContent = query?.data.data;
	const dataGroup = _.groupBy(dataContent, (item) => {
		const categoryRecs = item?.categories?.length > 0
		if (categoryRecs) {
			return "event";
		} else {
			return "product";
		}
	});

	return (
		<Box className="lg:px-9 px-2 lg:py-7 py-2">

			<div className="flex flex-wrap justify-around gap-5 align-top">
				<div className="relative flex-1">
					<h4 className="font-semibold text-[16px] text-c-blue mb-2">Event</h4>
					<div className="flex justify-around border-solid h-fit lg:min-h-[123px] border-gray-300 border-[1px] p-2 lg:p-5 rounded-lg bg-gray-50">
						{dataGroup?.event?.map((item: any, i: number) => {
							return (
								<Link href={`/products?type=${item.name}`} className="text-center max-w-[120px]" key={item.id}>
									<div className="relative w-[47px] h-[47px] text-center mx-auto mb-1">
										<Image
											src={item.image ? process.env.BASE_API+item.image.url : "/images/pic.png"}
											fill
											alt=""
											className="left-0 right-0 mx-auto"
										/>
									</div>
									<div className="text-[10px] text-c-blue font-semibold">{item.name}</div>
								</Link>
							);
						})}
					</div>
				</div>
				<div className="relative flex-1">
					<h4 className="font-semibold text-[16px] text-c-blue mb-2">Produk</h4>
					<div className="flex justify-around border-solid h-fit lg:min-h-[123px] border-gray-300 border-[1px]  p-2 lg:px-5 lg:py-5 rounded-lg bg-gray-50">
						{dataGroup?.product?.map((item: any, i: number) => {
							return (
								<Link href={`/products?type=${item.name}`} className="text-center max-w-[120px]" key={item.id}>
									<div className="relative w-[47px] h-[47px] text-center mx-auto mb-1">
										<Image
											src={item.image ? process.env.BASE_API+item.image.url : "/images/pic.png"}
											fill
											alt=""
											className="left-0 right-0 mx-auto"
										/>
									</div>
									<div className="text-[10px] text-c-blue font-semibold">{item.name}</div>
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</Box>
	);
}
