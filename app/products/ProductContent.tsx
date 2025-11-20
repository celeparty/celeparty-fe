"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { LocationFilterBar } from "@/components/product/LocationFilterBar";
import ProductFilters from "@/components/product/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { axiosData } from "@/lib/services";
import { formatNumberWithDots, formatRupiah } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import _ from "lodash";
import { Bookmark, LucideX, LucideXCircle, Search, Filter } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCategory, ItemInfo } from "./ItemCategory";

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
	const [statusValue, setStatusValue] = useState<boolean>(true);
	const [statusSortBy, setStatusSortBy] = useState<boolean>(true);
	const [sortBy, setSortBy] = useState<string>("updatedAt:desc");
	const [price, setPrice] = useState<{ min: any; max: any }>({
		min: 0,
		max: 0,
	});
	const [mainData, setMainData] = useState<any>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [pageSize] = useState<number>(15); // Number of items per page
	const router = useRouter();
	const params = useSearchParams();
	const getType = params.get("type") || "";
	const getSearch = params.get("search");
	const getCategory = params.get("cat");
	const [cat, setCat] = useState(`${getCategory ? getCategory : ""}`);

	const [eventDate, setEventDate] = useState<string>("");
	const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [minimalOrder, setMinimalOrder] = useState<string>("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	// const {activeButton, setActiveButton} = useButtonStore()
	const [activeButton, setActiveButton] = useState<string | null>(null);

	const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);
	const [searchInput, setSearchInput] = useState<string>(getSearch || "");
	const [showFilters, setShowFilters] = useState<boolean>(false);
	const [eventTypes, setEventTypes] = useState<iSelectOption[]>([]);
	const [selectedEventType, setSelectedEventType] = useState<string>("");

	// Debounced search handler
	const handleSearchChange = useCallback(
		_.debounce((value: string) => {
			setSearchInput(value);
			setCurrentPage(1); // Reset to first page when searching
		}, 500),
		[]
	);

	const getCombinedQuery = async () => {
		try {
			const formattedDate = eventDate ? format(new Date(eventDate), "yyyy-MM-dd") : null;

			let queryString = `/api/products?populate=*&sort=${sortBy}&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;

			if (getType && getType.trim()) {
				queryString += `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType.trim())}`;
			}
			if (searchInput && searchInput.trim()) {
				queryString += `&filters[title][$containsi]=${encodeURIComponent(searchInput.trim())}`;
			}
			if (getCategory && cat && cat.trim()) {
				queryString += `&filters[category][title][$eq]=${encodeURIComponent(cat.trim())}`;
			}
			if (selectedLocation && selectedLocation.trim()) {
				queryString += `&filters[region][$eq]=${encodeURIComponent(selectedLocation.trim())}`;
			}
			if (formattedDate) {
				queryString += `&filters[minimal_order_date][$eq]=${formattedDate}`;
			}
			if (minimalOrder && minimalOrder.trim()) {
				queryString += `&filters[minimal_order][$eq]=${minimalOrder.trim()}`;
			}
			if (selectedEventType && selectedEventType.trim()) {
				queryString += `&filters[user_event_type][name][$eq]=${encodeURIComponent(selectedEventType.trim())}`;
			}

			console.log('API Query:', queryString); // Debug log

			return await axiosData("GET", queryString);
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	};

	const query = useQuery({
		queryKey: [
			"qProducts",
			getType,
			searchInput || getSearch,
			getCategory,
			selectedLocation,
			eventDate,
			minimalOrder,
			selectedEventType,
			currentPage,
			sortBy,
		],
		queryFn: getCombinedQuery,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2, // Allow 2 retries before showing error
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
	});

	useEffect(() => {
		if (query.isSuccess) {
			setMainData(query.data.data);
			// Set total pages from pagination metadata
			if (query.data.meta?.pagination) {
				setTotalPages(query.data.meta.pagination.pageCount);
			}
		}
	}, [query.isSuccess, query.data]);

	// Reset to first page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [getType, getSearch, getCategory, selectedLocation, eventDate, minimalOrder]);

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

	const getEventTypesQuery = async () => {
		return await axiosData("GET", "/api/user-event-types");
	};

	const eventTypesQuery = useQuery({
		queryKey: ["qEventTypes"],
		queryFn: getEventTypesQuery,
	});

	useEffect(() => {
		if (filterCatsQuery.isSuccess) {
			const { data } = filterCatsQuery.data;
			if (data) {
				if (data.length === 0) {
					return setFilterCategories([]);
				}
				const { categories } = data[0];
				setFilterCategories(categories);
			}
		}
	}, [filterCatsQuery.isSuccess, filterCatsQuery.data]);

	useEffect(() => {
		if (price?.min && price?.max) {
			const dataSort: any = _.filter(dataContent, (item: any) => {
				return item.main_price >= price.min && item.main_price <= price.max;
			});
			setMainData(dataSort);
		} else if (price?.min && !price?.max) {
			const dataSort: any = _.filter(dataContent, (item: any) => {
				return item.main_price >= price.min;
			});
			setMainData(dataSort);
		} else if (!price?.min && price?.max) {
			const dataSort: any = _.filter(dataContent, (item: any) => {
				return item.main_price <= price.max;
			});
			setMainData(dataSort);
		} else null;
	}, [price]);

	useEffect(() => {
		const cleanMin = price?.min ? parseInt(price.min.replace(/\./g, ""), 10) : null;
		const cleanMax = price?.max ? parseInt(price.max.replace(/\./g, ""), 10) : null;

		let dataSort: any[] = [];

		if (cleanMin !== null && cleanMax !== null) {
			dataSort = _.filter(dataContent, (item: any) => {
				return item.main_price >= cleanMin && item.main_price <= cleanMax;
			});
		} else if (cleanMin !== null) {
			dataSort = _.filter(dataContent, (item: any) => {
				return item.main_price >= cleanMin;
			});
		} else if (cleanMax !== null) {
			dataSort = _.filter(dataContent, (item: any) => {
				return item.main_price <= cleanMax;
			});
		}

		if (dataSort.length || cleanMin !== null || cleanMax !== null) {
			setMainData(dataSort);
		}
	}, [price]);

	useEffect(() => {
		if (mainData.length === 0) return;

		const uniqueRegions = new Set<string>();
		mainData.forEach((data: any) => {
			if (data.region) {
				uniqueRegions.add(data.region);
			}
		});

		const capitalizeFirstLetter = (str: string) => {
			return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		};

		const newLocations = Array.from(uniqueRegions).map((region) => ({
			label: capitalizeFirstLetter(region),
			value: region.toLowerCase().replace(/\s+/g, "-"),
		}));

		setEventLocations((prevLocations) => {
			const combined = [...prevLocations, ...newLocations];
			return combined.filter(
				(location, index, self) => index === self.findIndex((t) => t.value === location.value),
			);
		});
	}, [mainData]);

	if (query.isLoading) {
		return (
			<div className="flex justify-center py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-c-blue mx-auto mb-4"></div>
					<p>Loading produk...</p>
				</div>
			</div>
		);
	}

	const getSort = params.get("sort");
	const getMin = params.get("min");
	const getMax = params.get("max");
	const dataContent = query?.data?.data || [];

	const [variantPrice, setVariantPrice] = useState<number | null>(null);
	//   (
	//   dataContent?.variant[0]?.price
	// );

	useEffect(() => {
		// if (query.isSuccess) {
		//   const { variant } = dataContent;
		//   const lowestPrice = getLowestVariantPrice(variant);
		//   if (lowestPrice) {
		//     setVariantPrice(lowestPrice);
		if (query.isSuccess && Array.isArray(dataContent) && dataContent.length > 0) {
			const firstItem = dataContent[0];
			const lowestPrice = firstItem?.variant ? getLowestVariantPrice(firstItem.variant) : null;
			setVariantPrice(lowestPrice);
		}
	}, [query.isSuccess, dataContent]);
	// }, [dataContent]);

	const handleSort = (sortValue: string) => {
		setSortBy(sortValue);
		setCurrentPage(1); // Reset to first page when sorting
		// No need to manually refetch, query will automatically refetch when sortBy changes
	};

	const handleFilter = (category: string) => {
		const filterCategory: any = _.filter(dataContent, (item) => {
			if (category === "Lainnya") {
				return true;
			} else {
				return category ? item?.category?.title === category : item;
			}
		});
		setMainData(filterCategory);
		setCurrentPage(1); // Reset to first page when filtering
	};

	const toggleDropdown = (): void => {
		setSortDesc(!sortDesc);
		setShowOptions(!showOptions);
	};

	const resetFilters = () => {
		if (selectedLocation) setSelectedLocation("");
		if (eventDate) setEventDate("");
		if (minimalOrder) setMinimalOrder("");
		if (activeCategory) setActiveCategory("");
		if (selectedEventType) setSelectedEventType("");
		setCurrentPage(1); // Reset to first page when filters change
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top when page changes
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const isFilterCatsAvailable: boolean = filterCategories.length > 0;

	if (!dataContent || dataContent.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600">Tidak ada produk untuk kategori ini.</p>
			</div>
		);
	}

	// ✅ kalau semua aman, render produk

return (
<div className="grid grid-cols-12 gap-6">
{isFilterCatsAvailable && (
<div className={`col-span-12 ${showFilters ? "md:col-span-3" : "md:hidden"}`}>
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
isMobile={true}
/>
</div>
)}
<div className={`col-span-12 ${isFilterCatsAvailable && showFilters ? "md:col-span-9" : "md:col-span-12"}`}>
<div className="grid grid-cols-12 gap-6">
{/* Search Bar - Always visible */}
<div className="col-span-12">
<Box className="bg-gradient-to-r from-c-blue to-c-blue-light text-white shadow-lg p-4">
<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
<div className="flex items-center gap-4 flex-1">
<Search className="w-5 h-5 text-c-green" />
<Input
type="text"
placeholder="Cari produk..."
value={searchInput}
onChange={(e) => handleSearchChange(e.target.value)}
className="bg-white text-black border-0 flex-1 max-w-md"
/>
</div>
<div className="flex items-center gap-2">
<span className="text-sm font-medium">Urutkan:</span>
<Select value={sortBy} onValueChange={handleSort}>
<SelectTrigger className="bg-white text-black border-0 w-48">
<SelectValue placeholder="Pilih urutan" />
</SelectTrigger>
<SelectContent>
<SelectItem value="updatedAt:desc">Terbaru</SelectItem>
<SelectItem value="updatedAt:asc">Terlama</SelectItem>
<SelectItem value="title:asc">Nama A-Z</SelectItem>
<SelectItem value="title:desc">Nama Z-A</SelectItem>
<SelectItem value="sold_count:desc">Terlaris</SelectItem>
</SelectContent>
</Select>
</div>
<div className="flex items-center gap-2">
<Button
variant="outline"
className="bg-white text-c-blue border-white hover:bg-gray-50 md:hidden"
onClick={() => setShowFilters(!showFilters)}
>
<Filter className="w-4 h-4 mr-2" />
Filter
</Button>
</div>
</div>
</Box>
</div>
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
		<Suspense>
			<ProductContent />
		</Suspense>
	);
}
