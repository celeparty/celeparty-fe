"use client";
import useButtonStore from "@/lib/store/useButtonStore";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import ItemProduct from "@/components/product/ItemProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosData, getData } from "@/lib/services";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ItemCategory, ItemInfo } from "./ItemCategory";
import { formatRupiah } from "@/lib/utils";

export function ProductContent() {
	const [sortDesc, setSortDesc] = useState(true);
	const [price, setPrice] = useState<{ min: any; max: any }>({ min: 0, max: 0 });
	const [mainData, setMainData] = useState([]);
	const router = useRouter();
	const params = useSearchParams();
	const getType = params.get("type");
	const getSearch = params.get("search");
	const getCategory = params.get("cat");
	const [cat, setCat] = useState(`${getCategory ? getCategory : ""}`);
	const {activeButton, setActiveButton} = useButtonStore()

	const getQuery = async () => {
		return await axiosData("GET", `/api/products?populate=*
			${getType ? `&filters[user_event_type][name][$eq]=${getType}` : ""}
			${getSearch ? `&filters[title][$containsi]=${getSearch}` : ""}
			${getCategory ? `&filters[category][title][$eq]=${cat}` : ""}
			`);
	};
	const query = useQuery({
		queryKey: ["qProducts"],
		queryFn: getQuery,
	});
	useEffect(() => {
		if (query.isSuccess) {
			setMainData(query.data.data); // Isi state mainData dengan dataContent
		}
	}, [query.isSuccess, query.data]);

	useEffect(() => {
		if (price?.min  && price?.max ) {
			const dataSort: any = _.filter(dataContent, (item:any) => {
				return item.main_price >= price.min && item.main_price <= price.max;
			});
			setMainData(dataSort);
		}
		else if (price?.min  && price.max === 0 && price.max === "") {
			const dataSort: any = _.filter(dataContent, (item:any) => {
				return item.main_price >= price.min && item.main_price <= price.max;
			});
			setMainData(dataSort);
		}
		else if (!price?.min  && price?.max ) {
			const dataSort: any = _.filter(dataContent, (item:any) => {
				return item.main_price <= price.max;
			});
			setMainData(dataSort);
		}
		else null
	}, [price]);

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

	const handleSort = (sort:any) => {
		const dataSort: any = _.sortBy(dataContent, (item)=> {			
			return sort.sortBy === "sold_count" ?  item.sold_count : 
				sort.sortBy === "main_price" ?  item.main_price : 
					item.updatedAt
		});
		setMainData(dataSort);
	};
	return (
		<div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7">
			<Box className="bg-c-blue text-white w-full lg:max-w-[280px] mt-0 hidden lg:block">
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
									handleSort({ sortBy: "updatedAt" });
									setActiveButton("btn1")
								}}
								className={`w-full lg:w-auto border-2 border-black border-solid lg:border-none ${ activeButton === "btn1" ? "bg-c-blue text-white" : null}`}
							>
								Terbaru
							</Button>
							<Button
								variant={`${getSort === "sold_count" ? "default" : "outline"}`}
								onClick={() => {
									handleSort({ sortBy: "sold_count" });
									setActiveButton("btn2")
								}}
								className={`w-full lg:w-auto  border-2 border-black border-solid lg:border-none ${ activeButton === "btn2" ? "bg-c-blue text-white" : null}`}
							>
								Terlaris
							</Button>
							<Button
								variant={`${getSort === "price" ? "default" : "outline"}`}
								onClick={() => {
									handleSort({ sortBy: "main_price" });
									setActiveButton("btn3")
								}}
								className={`flex gap-1 items-center w-full lg:w-auto border-2 border-black border-solid lg:border-none ${ activeButton === "btn3" ? "bg-c-blue text-white" : null}`}
							>
								Harga {sortDesc ? <IoIosArrowDown /> : <IoIosArrowUp />}
							</Button>
							<div className="flex items-center gap-2 w-full lg:w-auto">
								Rp{" "}
								<Input
									className="border-2 border-black border-solid lg:border-none"
									placeholder="Harga Minimum"
									onChange={(e) => setPrice({ ...price, min: e.target.value })}
								/>
							</div>
							<div className="flex items-center gap-2 w-full lg:w-auto">
								Rp{" "}
								<Input
									className="border-2 border-black border-solid lg:border-none"
									placeholder="Harga Maximum"
									onChange={(e) => setPrice({ ...price, max: e.target.value })}
								/>
							</div>
						</div>
					</Box>
				</div>
				<Box className="mt-3 px-[10px] lg:px-9">
					<div className="flex flex-wrap -mx-2">
						{ mainData.length >0 ? mainData?.map((item: any) => {
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
						}) : <div className="text-center w-full">Product Tidak Ditemukan</div> }
					</div>
				</Box>
			</div>
		</div>
	);
}

export default function SectionProductContent() {
	return (
		<Suspense>
			<ProductContent />
		</Suspense>
	)
}