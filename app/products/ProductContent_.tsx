"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import ItemProduct from "@/components/product/ItemProduct";
import ProductFilters from "@/components/product/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

// === Helper untuk handle URL gambar ===
const getImageUrl = (image: any): string => {
	if (!image) return "/images/noimage.png";

	const url = image?.data?.[0]?.attributes?.url || image?.[0]?.url || image?.url || null;

	if (!url) return "/images/noimage.png";

	// kalau sudah absolute URL
	if (url.startsWith("http")) return url;

	const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "https://papi.celeparty.com";

	return `${baseUrl}${url}`;
};

export function ProductContent() {
	const [sortDesc, setSortDesc] = useState<boolean>(true);
	const [showOptions, setShowOptions] = useState<boolean>(false);
	const [mainData, setMainData] = useState<any>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [pageSize] = useState<number>(15);

	const router = useRouter();
	const params = useSearchParams();
	const getType = params.get("type") || "";
	const getSearch = params.get("search");
	const getCategory = params.get("cat");
	const [cat, setCat] = useState(`${getCategory ? getCategory : ""}`);
	const [searchQuery, setSearchQuery] = useState(getSearch || "");

	const [eventDate, setEventDate] = useState<string>("");
	const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [minimalOrder, setMinimalOrder] = useState<string>("");
	const [price, setPrice] = useState<{ min: any; max: any }>({ min: 0, max: 0 });
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);

	const getCombinedQuery = async () => {
		const formattedDate = eventDate ? format(new Date(eventDate), "yyyy-MM-dd") : null;

		let queryString = `/api/products?populate=*&sort=updatedAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;

		if (getType) {
			queryString += `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType)}`;
		}

		if (searchQuery) {
			const searchFields = [
				'title',
				'description',
				'category.title',
				'region',
				'kabupaten',
				'lokasi_event',
				'kota_event'
			];
			const orConditions = searchFields.map(field => `filters[${field}][$containsi]=${encodeURIComponent(searchQuery)}`).join('&');
			queryString += `&${orConditions}`;
		}

		if (getCategory) {
			queryString += `&filters[category][title][$eq]=${encodeURIComponent(cat)}`;
		}

		if (selectedLocation) {
			queryString += `&filters[region][$eq]=${encodeURIComponent(selectedLocation)}`;
		}

		if (formattedDate) {
			queryString += `&filters[minimal_order_date][$eq]=${formattedDate}`;
		}

		if (minimalOrder) {
			queryString += `&filters[minimal_order][$eq]=${minimalOrder}`;
		}

		return await axiosData("GET", queryString);
	};

	const query = useQuery({
		queryKey: [
			"qProducts",
			getType,
			searchQuery,
			getCategory,
			selectedLocation,
			eventDate,
			minimalOrder,
			currentPage,
		],
		queryFn: getCombinedQuery,
	});

	useEffect(() => {
		if (query.isSuccess) {
			setMainData(query.data?.data || []);
			if (query.data?.meta?.pagination) {
				setTotalPages(query.data.meta.pagination.pageCount);
			}
		}
	}, [query.isSuccess, query.data]);

	useEffect(() => {
		setCurrentPage(1);
	}, [getType, searchQuery, getCategory, selectedLocation, eventDate, minimalOrder]);

	const getFilterCatsQuery = async () => {
		return await axiosData(
			"GET",
			`/api/user-event-types?populate=*${getType ? `&filters[name]=${encodeURIComponent(getType)}` : ""}`,
		);
	};

	const filterCatsQuery = useQuery({
		queryKey: ["qFilterCats", getType],
		queryFn: getFilterCatsQuery,
	});

	useEffect(() => {
		if (filterCatsQuery.isSuccess) {
			const data = filterCatsQuery.data?.data || [];
			const categories = data?.[0]?.categories || [];
			setFilterCategories(categories);
		}
	}, [filterCatsQuery.isSuccess, filterCatsQuery.data]);

	const dataContent = query?.data?.data || [];

	const handleFilter = (category: string) => {
		const filterCategory: any = _.filter(dataContent, (item) => {
			if (category === "Lainnya") return true;
			return category ? item?.category?.title === category : item;
		});
		setMainData(filterCategory);
		setCurrentPage(1);
	};

	const resetFilters = () => {
		setSelectedLocation("");
		setEventDate("");
		setMinimalOrder("");
		setActiveCategory(null);
		setSearchQuery("");
		setCurrentPage(1);
		router.replace("/products", { scroll: false });
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const isFilterCatsAvailable: boolean = filterCategories.length > 0;

	if (query.isLoading) return <div>Loading produk...</div>;
	if (query.isError) return <ErrorNetwork />;
	if (!dataContent || dataContent.length === 0) {
		return <div>Tidak ada produk untuk kategori ini.</div>;
	}

	return (
		<div className="grid grid-cols-12 gap-6">
			{isFilterCatsAvailable && (
				<div className="col-span-12 md:col-span-3">
					<ProductFilters
						selectedLocation={selectedLocation}
						setSelectedLocation={setSelectedLocation}
						eventDate={eventDate}
						setEventDate={setEventDate}
						minimalOrder={minimalOrder}
						setMinimalOrder={setMinimalOrder}
						eventLocations={eventLocations}
						price={price}
						setPrice={setPrice}
						resetFilters={resetFilters}
						activeCategory={activeCategory}
						setActiveCategory={setActiveCategory}
						filterCategories={filterCategories}
						handleFilter={handleFilter}
						isFilterCatsAvailable={isFilterCatsAvailable}
					/>
				</div>
			)}
			<div className={`col-span-12 ${isFilterCatsAvailable ? "md:col-span-9" : "md:col-span-12"}`}>
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-12">
						<Box className="lg:mt-0 px-[10px] lg:px-9">
							<div className="flex flex-wrap -mx-2">
								{mainData?.length > 0 ? (
									mainData?.map((item: any) => (
										<ItemProduct
											url={`/products/${item.documentId}`}
											key={item.id}
											title={item.title}
											image_url={getImageUrl(item.main_image)}
											price={
												item?.variant && item.variant.length > 0
													? formatRupiah(getLowestVariantPrice(item.variant))
													: formatRupiah(item?.main_price || 0)
											}
											rate={item.rate ? `${item.rate}` : "1"}
											sold={item.sold_count}
											location={item.region || null}
										/>
									))
								) : (
									<div className="text-center w-full">Produk Tidak Ditemukan</div>
								)}
							</div>

							{mainData?.length > 0 && totalPages > 1 && (
								<div className="mt-8">
									<div className="text-center mb-4 text-sm text-slate-600">
										Halaman {currentPage} dari {totalPages}
										{query.data?.meta?.pagination?.total && (
											<span className="ml-2">({query.data.meta.pagination.total} produk)</span>
										)}
									</div>
									<div className="flex justify-center">
										<PaginationControls
											currentPage={currentPage}
											totalPages={totalPages}
											onPageChange={handlePageChange}
											className="mb-4"
										/>
									</div>
								</div>
							)}
						</Box>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SectionProductContent() {
	return (
		<Suspense fallback={<div>Loading produk...</div>}>
			<ProductContent />
		</Suspense>
	);
}
