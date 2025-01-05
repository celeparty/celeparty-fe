"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosData, getData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ItemCategory, ItemInfo } from "./ItemCategory";
import { formatRupiah } from "@/lib/utils";

export default function ProductContent() {
	const [sortDesc, setSortDesc] = useState(true);
	const router = useRouter();
	const params = useSearchParams();
	const getQuery = async () => {
		return await axiosData("GET", `/api/products?populate=*`);
	};
	const query = useQuery({
		queryKey: ["qProducts"],
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
	const getSort = params.get("sort");
	const getMin = params.get("min");
	const getMax = params.get("max");
	const dataContent = query?.data.data;


	const newDataContent = dataContent?.map((item: any) => {
		const price = item.main_price ? item.main_price : 0;
		const priceRange = _.split(price, "-");
		const priceMin = item.price_min ? item.price_min : null;
		const priceMax = item.price_max ? item.price_max : null;

		return {
			...item,
			price: priceMin,
			price_min: priceMin,
			price_max: priceMax,
		};
	});


	const dataSort =
		getMin || getMax
			? _.orderBy(
					_.filter(newDataContent, (item) => {
						const priceMin = Number.parseFloat(item.price_min);
						const priceMax = item.price_max ? Number.parseFloat(item.price_max) : null;

						return (
							(getMin === null || getMin === "" || priceMin >= Number.parseFloat(getMin)) &&
							(getMax === null ||
								getMax === "" ||
								(priceMax !== null && priceMax <= Number.parseFloat(getMax)))
						);
					}),
					[`${getSort}`],
					[`${sortDesc ? "desc" : "asc"}`],
				)
			: _.orderBy(newDataContent, [`${getSort}`], [`${sortDesc ? "desc" : "asc"}`]);

	const handleSort = ({ sortBy }: { sortBy: string }) => {
		// router.push(`?sort=${sortBy}`)
		getMin && getMin
			? router.push(`?sort=${sortBy}&min=${getMin}&max=${getMax}`)
			: getMin
				? router.push(`?sort[0]=${sortBy}&min=${getMin}`)
				: router.push(`?sort[0]=${sortBy}`);
		sortBy === "price" && setSortDesc(!sortDesc);
	};
	const priceMin = (e: any) => {
		getSort ? router.push(`?sort=${getSort}&min=${e.target.value}`) : router.push(`?min=${e.target.value}`);
	};
	const priceMax = (e: any) => {
		getSort
			? router.push(`?sort=${getSort}&min=${getMin}&max=${e.target.value}`)
			: router.push(`?min=${getMin}&max=${e.target.value}`);
	};
	return (
		<div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7">
			<Box className="bg-c-blue text-white w-full lg:max-w-[280px] mt-0">
				<div className="relative mb-7 [&_h4]:mb-3">
					<h4>Informasi Acara</h4>
					<div className="flex flex-col gap-3">
						<ItemInfo image="/images/date.svg">
							<Input placeholder="Tanggal Acara" />
						</ItemInfo>
						<ItemInfo image="/images/group.svg">
							<Input placeholder="Jumlah Tamu/ Pax" />
						</ItemInfo>
						<ItemInfo image="/images/location.svg">
							<Input placeholder="Lokasi Acara" />
						</ItemInfo>
					</div>
				</div>
				<div className="relative mb-7 [&_h4]:mb-3">
					<h4>Pilih Kategori Produk</h4>
					<div className="flex flex-col gap-3">
						<ItemInfo image="/images/food.svg">
							<ItemCategory
								title="Makanan"
								onClick={() => {
									console.log("Makanan");
								}}
							/>
						</ItemInfo>
						<ItemInfo image="/images/decoration.svg">
							<ItemCategory
								title="Dekorasi"
								onClick={() => {
									console.log("Dekorasi");
								}}
							/>
						</ItemInfo>
						<ItemInfo image="/images/cake.svg">
							<ItemCategory
								title="Kue"
								onClick={() => {
									console.log("Kue");
								}}
							/>
						</ItemInfo>
						<ItemInfo image="/images/hampers.svg">
							<ItemCategory
								title="Hampers"
								onClick={() => {
									console.log("Hampers");
								}}
							/>
						</ItemInfo>
						<ItemInfo image="/images/others.svg">
							<ItemCategory
								title="Lainnya"
								onClick={() => {
									console.log("lain nya");
								}}
							/>
						</ItemInfo>
					</div>
				</div>
			</Box>
			<div className="lg:flex-1 w-full">
				<div className="w-auto lg:inline-block">
					<Box className="w-auto py-3 mt-0">
						<div className="flex lg:flex-row flex-col items-center gap-4 ">
							<label className="mr-3 text-[15px] pb-1 lg:pb-0 border-b-2 border-solid border-black lg:border-none">
								Urutkan
							</label>
							<Button
								variant={`${getSort === "updated_at" ? "default" : "outline"}`}
								onClick={() => {
									handleSort({ sortBy: "updated_at" });
								}}
								className="w-full lg:w-auto border-2 border-black border-solid lg:border-none"
							>
								Terbaru
							</Button>
							<Button
								variant={`${getSort === "sold_count" ? "default" : "outline"}`}
								onClick={() => {
									handleSort({ sortBy: "sold_count" });
								}}
								className="w-full lg:w-auto  border-2 border-black border-solid lg:border-none"
							>
								Terlaris
							</Button>
							<Button
								variant={`${getSort === "price" ? "default" : "outline"}`}
								onClick={() => {
									handleSort({ sortBy: "price" });
								}}
								className="flex gap-1 items-center w-full lg:w-auto border-2 border-black border-solid lg:border-none"
							>
								Harga {sortDesc ? <IoIosArrowDown /> : <IoIosArrowUp />}
							</Button>
							<div className="flex items-center gap-2 w-full lg:w-auto">
								Rp{" "}
								<Input
									className="border-2 border-black border-solid lg:border-none"
									placeholder="Harga Minimum"
									onChange={(e) => priceMin(e)}
								/>
							</div>
							<div className="flex items-center gap-2 w-full lg:w-auto">
								Rp{" "}
								<Input
									className="border-2 border-black border-solid lg:border-none"
									placeholder="Harga Maximum"
									onChange={(e) => priceMax(e)}
								/>
							</div>
						</div>
					</Box>
				</div>
				<Box className="mt-3 px-[10px] lg:px-9">
					<div className="flex flex-wrap -mx-2">
						{dataSort?.map((item: any) => {
							return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									key={item.id}
									title={item.name}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={Number.parseInt(item.rate).toFixed(1)}
									sold={item.sold_count}
									location={item.region ? item.region : "unknown"}
								></ItemProduct>
							);
						})}
					</div>
				</Box>
			</div>
		</div>
	);
}
