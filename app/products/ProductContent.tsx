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

	// Helper to extract fields from Strapi responses (supports {id, attributes: {...}} and flat objects)
	const getStrapiField = (item: any, key: string) => {
		if (!item) return undefined;
		if (item[key] !== undefined) return item[key];
		if (item.attributes?.[key] !== undefined) return item.attributes[key];
		if (item.data?.attributes?.[key] !== undefined) return item.data.attributes[key];
		return undefined;
	};

	// URL params
	const getType = params.get("type") || "";
	const getSearch = params.get("search") || "";
	const getCategory = params.get("cat") || "";
	const getSort = params.get("sort") || "updatedAt:desc";

	// Component state
	const [selectedEventType, setSelectedEventType] = useState<string>(getType);
	const [searchInput, setSearchInput] = useState<string>(getSearch);
	const [sortOption, setSortOption] = useState<string>(getSort);

	const [mainData, setMainData] = useState<any>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [pageSize] = useState<number>(15);

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

	// Helper to safely extract category ID dari berbagai struktur Strapi
	const extractCategoryId = (category: any): number | null => {
		if (!category) return null;
		
		// Cek berbagai format id yang mungkin
		const id =
			category?.id ||
			category?.data?.id ||
			category?.attributes?.id ||
			parseInt(category?.data?.documentId?.split('-')[0]) ||
			parseInt(category?.documentId?.split('-')[0]);

		return id ? parseInt(String(id)) : null;
	};

	const getCombinedQuery = async () => {
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

		// Kategori dari URL atau pilihan UI
		const effectiveCategory = activeCategory && activeCategory !== "Lainnya" ? activeCategory : getCategory;
		if (effectiveCategory) {
			baseParams += `&filters[category][title][$eq]=${encodeURIComponent(effectiveCategory)}`;
			ticketBaseParams += `&filters[category][title][$eq]=${encodeURIComponent(effectiveCategory)}`;
		} else if (filterCategories.length > 0) {
			const categoryIds = filterCategories
				.map((cat: any) => extractCategoryId(cat))
				.filter((id) => id !== null);
			if (categoryIds.length > 0) {
				baseParams += `&filters[category][id][$in]=${categoryIds.join(",")}`;
				ticketBaseParams += `&filters[category][id][$in]=${categoryIds.join(",")}`;
			}
		}

		// Build event type filter: gunakan kategori dari relasi event -> categories saja
		let eventTypeCategoryFilter = "";

		if (selectedEventType) {
			const selectedTypeNormalized = selectedEventType.toString().trim().toLowerCase();
			// Pertimbangkan filterCategories yang sudah disiapkan berdasarkan selectedEventType
			if (filterCategories.length > 0) {
				const categoryIds = filterCategories
					.map((cat: any) => extractCategoryId(cat))
					.filter((id) => id !== null);

				if (categoryIds.length > 0) {
					eventTypeCategoryFilter = `&filters[category][id][$in]=${categoryIds.join(",")}`;
					console.log(
						`[ProductContent] Event type filter applied: ${selectedEventType} -> category IDs: [${categoryIds.join(", ")}]`,
					);
				} else {
					console.warn(
						`[ProductContent] filterCategories available but no valid IDs extracted for event type: ${selectedEventType}`,
						filterCategories,
					);
				}
			} else if (filterCatsQuery.data?.data) {
				// Fallback: cari kategori dari filterCatsQuery jika filterCategories masih kosong
				const matchedEventType = (filterCatsQuery.data.data || []).find((raw: any) => {
					const item = raw?.attributes ? { id: raw.id, ...raw.attributes } : raw;
					const name = item?.name?.toString?.().trim().toLowerCase();
					return name === selectedTypeNormalized;
				});

				const categories =
					matchedEventType?.categories?.data ??
					matchedEventType?.categories ??
					[];

				const matchedCategoryIds = Array.isArray(categories)
					? categories
						.map((cat: any) => extractCategoryId(cat))
						.filter((id) => id !== null)
					: [];

				if (matchedCategoryIds.length > 0) {
					eventTypeCategoryFilter = `&filters[category][id][$in]=${matchedCategoryIds.join(",")}`;
					console.log(
						`[ProductContent] Event type filter applied (fallback): ${selectedEventType} -> category IDs: [${matchedCategoryIds.join(", ")}]`,
					);
				} else {
					console.warn(
						`[ProductContent] No categories found for event type: ${selectedEventType}`,
						matchedEventType,
					);
				}
			}

			if (!eventTypeCategoryFilter && selectedEventType) {
				// Jika benar2 tidak ada kategori, set empty filter untuk menghindari menampilkan semua produk
				eventTypeCategoryFilter = `&filters[category][id][$in]=0`;
				console.warn(
					`[ProductContent] No categories for event type "${selectedEventType}", applying empty filter`,
				);
			}
		}


		if (!effectiveCategory && eventTypeCategoryFilter) {
			baseParams += eventTypeCategoryFilter;
			ticketBaseParams += eventTypeCategoryFilter;
		}

		try {
			const productsParams = baseParams;
			const productsUrl = `/api/products?${productsParams}&filters[state][$eq]=approved`;
			console.log(`[ProductContent] Fetching products from: ${productsUrl}`);

			const productsRes: any = await axiosData(
				"GET",
				productsUrl,
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
					const vendor = getStrapiField(item, "users_permissions_user");
					const locations =
						vendor?.serviceLocation ??
						vendor?.attributes?.serviceLocation ??
						vendor?.data?.attributes?.serviceLocation ??
						[];
					if (Array.isArray(locations) && locations.length > 0) {
						return locations.some((loc: any) => loc.subregion === selectedLocation);
					}
					return getStrapiField(item, "region") === selectedLocation;
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
				const fallbackUrl = `/api/products?${baseParams}&filters[state][$eq]=approved`;

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
			sortOption,
			activeCategory,
			currentPage,
			filterCategories,
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
	}, [selectedEventType, searchInput, getCategory, selectedLocation, sortOption, activeCategory, filterCategories]);

	const getFilterCatsQuery = async () => {
		return await axiosData("GET", "/api/user-event-types?populate=*");
	};

	const filterCatsQuery = useQuery({
		queryKey: ["qFilterCats"],
		queryFn: getFilterCatsQuery,
	});

	useEffect(() => {
		if (selectedEventType && filterCatsQuery.isSuccess) {
			query.refetch();
		}
	}, [selectedEventType, filterCatsQuery.isSuccess, query]);

	const getEventTypesQuery = async () => {
		return await axiosData("GET", "/api/user-event-types");
	};

	const eventTypesQuery = useQuery({
		queryKey: ["qEventTypes"],
		queryFn: getEventTypesQuery,
	});

	useEffect(() => {
		if (!filterCatsQuery.isSuccess) return;

		const data = filterCatsQuery.data?.data || [];

		const normalizeEventType = (raw: any) => {
			if (!raw) return null;
			if (raw.attributes) return { id: raw.id, ...raw.attributes };
			return raw;
		};

		const normalizeCategory = (raw: any) => {
			if (!raw) return null;
			if (raw.attributes) return { id: raw.id, ...raw.attributes };
			return raw;
		};

		const addCategories = (categories: any[]) => {
			return (categories || [])
				.map((cat: any) => normalizeCategory(cat))
				.filter((cat: any) => cat && cat.title);
		};

		if (selectedEventType) {
			const selectedTypeNormalized = selectedEventType.toString().trim().toLowerCase();
			const matchedEventType = (data || []).find((raw: any) => {
				const item = raw?.attributes ? { id: raw.id, ...raw.attributes } : raw;
				const name = item?.name?.toString?.().trim().toLowerCase();
				return name === selectedTypeNormalized;
			});

			console.log(
				`[FilterCategories] Matched event type for "${selectedEventType}":`,
				matchedEventType,
			);

			const categories =
				matchedEventType?.categories?.data ??
				matchedEventType?.categories ??
				[];

			console.log(
				`[FilterCategories] Raw categories structure:`,
				categories,
			);

			const finalCategories = addCategories(categories);
			const categoryIds = finalCategories.map((cat: any) => extractCategoryId(cat));
			
			console.log(
				`[FilterCategories] Event type: ${selectedEventType}, categories count: ${finalCategories.length}, IDs: [${categoryIds.join(", ")}]`,
			);
			setFilterCategories(finalCategories);
			return;
		}

		// default: all non-ticket event types categories
		const allCategories = new Map<string, any>();
		(data || []).forEach((rawEventType: any) => {
			const eventType = normalizeEventType(rawEventType);
			if (!eventType) return;
			if (eventType.is_ticket) return;

			const categories =
				eventType.categories?.data ??
				eventType.categories ??
				[];

			addCategories(categories).forEach((cat: any) => {
				if (!allCategories.has(cat.title)) {
					allCategories.set(cat.title, cat);
				}
			});
		});

		const finalCategories = Array.from(allCategories.values());
		console.log(
			`[FilterCategories] Default categories (no event type selected), count: ${finalCategories.length}`,
		);
		setFilterCategories(finalCategories);
	}, [filterCatsQuery.isSuccess, filterCatsQuery.data, selectedEventType]);

	useEffect(() => {
		if (eventTypesQuery.isSuccess) {
			const data = eventTypesQuery.data?.data || [];
			const options = data
				.map((raw: any) => {
					const item = raw?.attributes ? { id: raw.id, ...raw.attributes } : raw;
					const name = item?.name;
					return name ? { label: name, value: name } : null;
				})
				.filter(Boolean);
			setEventTypes(options as iSelectOption[]);
		}
	}, [eventTypesQuery.isSuccess, eventTypesQuery.data]);

	useEffect(() => {
		const items = query.data?.data || [];
		const seen = new Set<string>();
		const locations: iSelectOption[] = [];

		const addLocation = (subregion?: string) => {
			if (!subregion) return;
			const normalized = subregion.toString().trim();
			if (!normalized) return;
			if (!seen.has(normalized)) {
				seen.add(normalized);
				locations.push({ label: normalized, value: normalized });
			}
		};

		items.forEach((item: any) => {
			// region field (legacy)
			addLocation(getStrapiField(item, "region"));

			// vendor serviceLocation (may be nested under attributes/data)
			const vendor = getStrapiField(item, "users_permissions_user");
			const serviceLocation =
				vendor?.serviceLocation ??
				vendor?.attributes?.serviceLocation ??
				vendor?.data?.attributes?.serviceLocation;

			if (Array.isArray(serviceLocation)) {
				serviceLocation.forEach((loc: any) => {
					addLocation(loc?.subregion || loc?.region || loc?.idSubRegion || loc?.id);
				});
			}
		});

		setEventLocations(locations);
	}, [query.data]);


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
		if (category === "Lainnya") {
			setActiveCategory(null);
		} else {
			setActiveCategory(category);
		}
		setCurrentPage(1); // Reset to first page when filtering
	};

	const resetFilters = () => {
		setSelectedEventType("");
		setSelectedLocation("");
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
			eventLocations={eventLocations}
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
			filteredCount={query.data?.meta?.pagination?.total ?? 0}
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
