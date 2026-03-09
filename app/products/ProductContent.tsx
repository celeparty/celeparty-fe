"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import ProductFilters from "@/components/product/ProductFilters";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import _ from "lodash";
import { Search } from "lucide-react";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
	const params = useSearchParams();

	// URL params
	const getType = params.get("type") || "";
	const getSearch = params.get("search") || "";
	const getCategory = params.get("cat") || "";
	const getSort = params.get("sort") || "updatedAt:desc";

	// Component state
	const [selectedEventType, setSelectedEventType] = useState<string>(getType);
	const [searchInput, setSearchInput] = useState<string>(getSearch);
	const [sortOption, setSortOption] = useState<string>(getSort);
	const [price, setPrice] = useState<{ min: any; max: any }>({ min: "", max: "" });

	const [mainData, setMainData] = useState<any>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [pageSize] = useState<number>(15);

	const [eventDate, setEventDate] = useState<string>("");
	const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);
	const [eventTypes, setEventTypes] = useState<iSelectOption[]>([]);

	// Debounced search handler
	const handleSearchChange = useCallback(
		_.debounce((value: string) => {
			setSearchInput(value);
			setCurrentPage(1); // Reset to first page when searching
		}, 500),
		[]
	);

	const getCombinedQuery = async () => {
		const formattedDate = eventDate ? format(new Date(eventDate), "yyyy-MM-dd") : null;
		const isPriceSort = sortOption === "price:asc" || sortOption === "price:desc";

		const productSort = isPriceSort ? "updatedAt:desc" : sortOption;
		const ticketSort = isPriceSort ? "updatedAt:desc" : sortOption;

		let baseParams = `populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;
		if (productSort) {
			baseParams += `&sort[0]=${encodeURIComponent(productSort)}`;
		}

		let ticketBaseParams = `populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;
		if (ticketSort) {
			ticketBaseParams += `&sort[0]=${encodeURIComponent(ticketSort)}`;
		}

		if (searchInput) {
			baseParams += `&filters[title][$containsi]=${encodeURIComponent(searchInput)}`;
			ticketBaseParams += `&filters[title][$containsi]=${encodeURIComponent(searchInput)}`;
		}

		if (getCategory) {
			baseParams += `&filters[category][title][$eq]=${encodeURIComponent(getCategory)}`;
			ticketBaseParams += `&filters[category][title][$eq]=${encodeURIComponent(getCategory)}`;
		}

		if (formattedDate) {
			baseParams += `&filters[event_date][$gte]=${formattedDate}`;
			ticketBaseParams += `&filters[event_date][$gte]=${formattedDate}`;
		}

		try {
			const productsParams =
				baseParams +
				(selectedEventType
					? `&filters[user_event_type][name][$eq]=${encodeURIComponent(selectedEventType)}`
					: "");

			const productsRes: any = await axiosData(
				"GET",
				`/api/products?${productsParams}&filters[state][$eq]=approved`,
			);

			let ticketsRes: any = { data: [], meta: { pagination: { total: 0 } } };
			if (!selectedEventType) {
				try {
					ticketsRes = await axiosData(
						"GET",
						`/api/tickets?${ticketBaseParams}&filters[state][$eq]=approved`,
					);
				} catch (error) {
					console.error("Error fetching tickets:", error);
				}
			}

			let allItems = [
				...(productsRes?.data || []).map((p: any) => ({ ...p, __productType: "equipment" })),
				...(ticketsRes?.data || []).map((t: any) => ({ ...t, __productType: "ticket" })),
			];

			if (selectedLocation) {
				allItems = allItems.filter((item: any) => {
					const vendor = item.users_permissions_user;
					const locations = vendor?.serviceLocation || [];
					if (Array.isArray(locations) && locations.length > 0) {
						return locations.some((loc: any) => loc.subregion === selectedLocation);
					}
					return item.region === selectedLocation;
				});
			}

			if (isPriceSort) {
				const getItemPrice = (item: any) => {
					if (item.variant && item.variant.length > 0) {
						return getLowestVariantPrice(item.variant);
					}
					return item.main_price || 0;
				};

				allItems.sort((a: any, b: any) => {
					const priceA = getItemPrice(a);
					const priceB = getItemPrice(b);
					return sortOption === "price:asc" ? priceA - priceB : priceB - priceA;
				});
			}

			const totalItems =
				(productsRes?.meta?.pagination?.total || 0) +
				(ticketsRes?.meta?.pagination?.total || 0);
			const totalPages = Math.ceil(totalItems / pageSize);

			return {
				data: allItems,
				meta: {
					pagination: {
						page: currentPage,
						pageSize,
						pageCount: totalPages,
						total: totalItems,
					},
				},
			};
		} catch (error) {
			console.error("Error fetching products:", error);
			try {
				const fallbackUrl =
					`/api/products?${baseParams}$
						${
							selectedEventType
								? `&filters[user_event_type][name][$eq]=${encodeURIComponent(
									selectedEventType,
								)}`
								: ""
							}&filters[state][$eq]=approved`;
				const fallback = await axiosData("GET", fallbackUrl);
				return {
					data: fallback?.data || [],
					meta: fallback?.meta || { pagination: {} },
				};
			} catch (inner) {
				console.error("Fallback query also failed:", inner);
				return { data: [], meta: { pagination: { page: currentPage, pageSize, pageCount: 0, total: 0 } } };
			}
		}
	};

	const query = useQuery({
		queryKey: [
			"qProducts",
			selectedEventType,
			searchInput,
			getCategory,
			selectedLocation,
			eventDate,
			sortOption,
			currentPage,
		],
		queryFn: getCombinedQuery,
		refetchOnWindowFocus: false,
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
	}, [selectedEventType, searchInput, getCategory, selectedLocation, eventDate, sortOption]);

	const getFilterCatsQuery = async () => {
		return await axiosData("GET", "/api/user-event-types?populate=*");
	};

	const filterCatsQuery = useQuery({
		queryKey: ["qFilterCats"],
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
			const data = filterCatsQuery.data?.data || [];

			// Get categories from NON-TICKET event types only (equipment products)
			const allCategories = new Map<string, any>();

			data.forEach((eventType: any) => {
				if (!eventType.is_ticket) {
					const categories = eventType.categories || [];
					categories.forEach((cat: any) => {
						if (!allCategories.has(cat.title)) {
							allCategories.set(cat.title, cat);
						}
					});
				}
			});

			const categoriesArray = Array.from(allCategories.values());
			setFilterCategories(categoriesArray);
		}
	}, [filterCatsQuery.isSuccess, filterCatsQuery.data]);

	useEffect(() => {
		if (eventTypesQuery.isSuccess) {
			const data = eventTypesQuery.data?.data || [];
			const options = data.map((item: any) => ({
				label: item.name,
				value: item.name,
			}));
			setEventTypes(options);
		}
	}, [eventTypesQuery.isSuccess, eventTypesQuery.data]);

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const res: any = await axiosData(
					"GET",
					"/api/products?pagination[pageSize]=1000&filters[state][$eq]=approved&populate[users_permissions_user]=serviceLocation"
				);
				const products = res.data || [];
				const subregions = Array.from(
					new Set(
						products
							.flatMap((p: any) => {
								const vendor = p.users_permissions_user;
								return (vendor?.serviceLocation || []).map((loc: any) => loc.subregion);
							})
							.filter(Boolean),
					),
				) as string[];
				const options = subregions.map((sr) => ({
					label: sr,
					value: sr,
				}));
				setEventLocations(options);
			} catch (error) {
				console.error("Error fetching vendor locations from products:", error);
				setEventLocations([]);
			}
		};

		fetchLocations();
	}, []);

	useEffect(() => {
		const cleanMin = price?.min ? parseInt(price.min.replace(/\./g, ""), 10) : null;
		const cleanMax = price?.max ? parseInt(price.max.replace(/\./g, ""), 10) : null;

		let dataSort: any[] = [];

		if (cleanMin !== null && cleanMax !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price >= cleanMin && item.main_price <= cleanMax;
			});
		} else if (cleanMin !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price >= cleanMin;
			});
		} else if (cleanMax !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price <= cleanMax;
			});
		}

		if (dataSort.length || cleanMin !== null || cleanMax !== null) {
			setMainData(dataSort);
		}
	}, [price]);

	useEffect(() => {
		const cleanMin = price?.min ? parseInt(price.min.replace(/\./g, ""), 10) : null;
		const cleanMax = price?.max ? parseInt(price.max.replace(/\./g, ""), 10) : null;

		let dataSort: any[] = [];

		if (cleanMin !== null && cleanMax !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price >= cleanMin && item.main_price <= cleanMax;
			});
		} else if (cleanMin !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price >= cleanMin;
			});
		} else if (cleanMax !== null) {
			dataSort = _.filter(mainData, (item: any) => {
				return item.main_price <= cleanMax;
			});
		}

		if (dataSort.length || cleanMin !== null || cleanMax !== null) {
			setMainData(dataSort);
		}
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


	const dataContent = query.data?.data || [];

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

	const resetFilters = () => {
		setSelectedEventType("");
		setSelectedLocation("");
		setEventDate("");
		setActiveCategory(null);
		setSortOption("updatedAt:desc");
		setCurrentPage(1);
		query.refetch();
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top when page changes
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const isFilterCatsAvailable: boolean = true;

	// ✅ kalau semua aman, render produk

return (
<div className="grid grid-cols-12 gap-6">
<div className="col-span-12 md:col-span-3">
<ProductFilters
selectedLocation={selectedLocation}
setSelectedLocation={setSelectedLocation}
eventDate={eventDate}
setEventDate={setEventDate}
eventLocations={eventLocations}
price={price}
setPrice={setPrice}
resetFilters={resetFilters}
activeCategory={activeCategory}
setActiveCategory={setActiveCategory}
filterCategories={filterCategories}
handleFilter={handleFilter}
isFilterCatsAvailable={isFilterCatsAvailable}
selectedEventType={selectedEventType}
setSelectedEventType={setSelectedEventType}
eventTypes={eventTypes}
selectedCategory={activeCategory || ""}
setSelectedCategory={setActiveCategory}
/>
</div>
<div className="col-span-12 md:col-span-9">
<div className="grid grid-cols-12 gap-6">
{/* Search Bar - Always visible */}
<div className="col-span-12">
<Box className="bg-gradient-to-r from-c-blue to-c-blue-light text-white shadow-lg p-4">
<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
<div className="flex items-center gap-4 w-full md:w-auto">
<Search className="w-5 h-5 text-c-green" />
<Input
type="text"
placeholder="Cari produk..."
defaultValue={searchInput}
onChange={(e) => handleSearchChange(e.target.value)}
className="bg-white text-black border-0 flex-1 max-w-md"
/>
</div>
<div className="flex items-center gap-2 w-full md:w-auto">
<label className="text-white/80 text-sm">Urutkan:</label>
<Select value={sortOption} onValueChange={setSortOption}>
<SelectTrigger className="bg-white text-black border-0 h-10 rounded-lg">
<SelectValue placeholder="Terbaru" />
</SelectTrigger>
<SelectContent>
<SelectItem value="updatedAt:desc">Terbaru</SelectItem>
<SelectItem value="price:asc">Harga terendah - tertinggi</SelectItem>
<SelectItem value="price:desc">Harga tertinggi - terendah</SelectItem>
</SelectContent>
</Select>
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
