"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import ItemProduct from "@/components/product/ItemProduct";
import { LocationFilterBar } from "@/components/product/LocationFilterBar";
import { Button } from "@/components/ui/button";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import _ from "lodash";
import { Bookmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { ItemCategory, ItemInfo } from "./ItemCategory";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getLowestVariantPrice } from "@/lib/productUtils";

// === Helper untuk handle URL gambar ===
const getImageUrl = (image: any): string => {
  if (!image) return "/images/noimage.png";

  const url =
    image?.data?.[0]?.attributes?.url ||
    image?.[0]?.url ||
    image?.url ||
    null;

  if (!url) return "/images/noimage.png";

  // kalau sudah absolute URL
  if (url.startsWith("http")) return url;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_API || "https://papi.celeparty.com";

  return `${baseUrl}${url}`;
};

export function ProductContent() {
  const [sortOption, setSortOption] = useState<string>("updatedAt:desc");
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

  const [eventDate, setEventDate] = useState<string>("");
  const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [minimalOrder, setMinimalOrder] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);

  // New states for event type filter
  const [selectedEventType, setSelectedEventType] = useState<string>(getType);
  const [eventTypes, setEventTypes] = useState<iSelectOption[]>([]);

  // New states for price range filter
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const getCombinedQuery = async () => {
    const formattedDate = eventDate
      ? format(new Date(eventDate), "yyyy-MM-dd")
      : null;

    // Prepare price range filter strings for API query
    let priceFilterString = "";
    if (minPrice) {
      // Remove non-digit chars
      const rawMin = minPrice.replace(/\D/g, "");
      if (rawMin) priceFilterString += `&filters[main_price][$gte]=${rawMin}`;
    }
    if (maxPrice) {
      const rawMax = maxPrice.replace(/\D/g, "");
      if (rawMax) priceFilterString += `&filters[main_price][$lte]=${rawMax}`;
    }

    return await axiosData(
      "GET",
      `/api/products?populate=*&sort=${sortOption}&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}${
        selectedEventType
          ? `&filters[user_event_type][name][$eq]=${encodeURIComponent(selectedEventType)}`
          : ""
      }${
        getSearch
          ? `&filters[title][$containsi]=${encodeURIComponent(getSearch)}`
          : ""
      }${
        getCategory
          ? `&filters[category][title][$eq]=${encodeURIComponent(cat)}`
          : ""
      }${
        selectedLocation
          ? `&filters[region][$eq]=${encodeURIComponent(selectedLocation)}`
          : ""
      }${formattedDate ? `&filters[minimal_order_date][$eq]=${formattedDate}` : ""}${
        minimalOrder ? `&filters[minimal_order][$eq]=${minimalOrder}` : ""
      }${priceFilterString}`
    );
  };

  
  const query = useQuery({
    queryKey: [
      "qProducts",
      getType,
      getSearch,
      getCategory,
      selectedLocation,
      eventDate,
      minimalOrder,
      minPrice,
      maxPrice,
      sortOption,
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
  }, [
    selectedEventType,
    getSearch,
    getCategory,
    selectedLocation,
    eventDate,
    minimalOrder,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  const getFilterCatsQuery = async () => {
    return await axiosData(
      "GET",
      `/api/user-event-types?populate=*${
        getType ? `&filters[name]=${encodeURIComponent(getType)}` : ""
      }`
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
      const data = filterCatsQuery.data?.data || [];
      const categories = data?.[0]?.categories || [];
      setFilterCategories(categories);
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
    setMinPrice("");
    setMaxPrice("");
    setSortOption("updatedAt:desc");
    setCurrentPage(1);
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
          <div className="sidebar">
            <Box variant="bordered" size="lg" className="bg-c-blue text-white mt-0">
              {/* Filter: Event Type */}
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Jenis Event</h4>
                <hr className="mb-4 mt-2" />
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-black"
                >
                  <option value="">Semua Jenis Event</option>
                  {eventTypes.map((eventType, index) => (
                    <option key={index} value={eventType.value}>
                      {eventType.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Event Info */}
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Informasi Acara</h4>
                <hr className="mb-4 mt-2" />
                <LocationFilterBar
                  options={eventLocations}
                  setSelectedLocation={setSelectedLocation}
                  selectedLocation={selectedLocation}
                />
              </div>

              {/* Filter: Product Categories */}
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Pilih Kategori Produk</h4>
                <hr className="mb-4" />
                <div className="flex flex-col gap-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {filterCategories.map((cat, index) => (
                    <ItemInfo
                      key={index}
                      icon={Bookmark}
                      activeClass={`${
                        activeCategory === cat.title ? "bg-c-green text-white" : ""
                      }`}
                      onClick={() => {
                        const isActive = activeCategory === cat.title;
                        setActiveCategory(isActive ? null : cat.title);
                        handleFilter(isActive ? "" : cat.title);
                      }}
                    >
                      <ItemCategory title={cat.title} />
                    </ItemInfo>
                  ))}
                  <ItemInfo
                    icon={Bookmark}
                    activeClass={`${
                      activeCategory === "Lainnya" ? "bg-c-green text-white" : ""
                    }`}
                    onClick={() => {
                      const isActive = activeCategory === "Lainnya";
                      setActiveCategory(isActive ? null : "Lainnya");
                      handleFilter(isActive ? "" : "Lainnya");
                    }}
                  >
                    <ItemCategory title={"Lainnya"} />
                  </ItemInfo>
                </div>
              </div>

              {/* Filter: Price Range */}
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Kisaran Harga (Rp)</h4>
                <hr className="mb-4" />
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setMinPrice(val ? formatRupiah(Number(val)) : "");
                    }}
                    className="flex-1 rounded-md px-3 py-2 text-black"
                  />
                  <input
                    type="text"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setMaxPrice(val ? formatRupiah(Number(val)) : "");
                    }}
                    className="flex-1 rounded-md px-3 py-2 text-black"
                  />
                </div>
              </div>

              {/* Filter: Sort By */}
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Urutkan Berdasarkan</h4>
                <hr className="mb-4" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-black"
                >
                  <option value="updatedAt:desc">Terbaru</option>
                  <option value="main_price:asc">Harga: Rendah ke Tinggi</option>
                  <option value="main_price:desc">Harga: Tinggi ke Rendah</option>
                </select>
              </div>

              {/* Reset All Filters Button */}
              {(selectedEventType ||
                eventDate ||
                selectedLocation ||
                minimalOrder ||
                activeCategory ||
                minPrice ||
                maxPrice ||
                sortOption !== "updatedAt:desc") && (
                <div className="py-2 text-right">
                  <Button variant={"green"} onClick={resetFilters}>
                    Reset Semua Filter
                  </Button>
                </div>
              )}
            </Box>
          </div>
        </div>
      )}
      <div
        className={`col-span-12 ${
          isFilterCatsAvailable ? "md:col-span-9" : "md:col-span-12"
        }`}
      >
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
                  <div className="text-center w-full">
                    Produk Tidak Ditemukan
                  </div>
                )}
              </div>

              {mainData?.length > 0 && totalPages > 1 && (
                <div className="mt-8">
                  <div className="text-center mb-4 text-sm text-slate-600">
                    Halaman {currentPage} dari {totalPages}
                    {query.data?.meta?.pagination?.total && (
                      <span className="ml-2">
                        ({query.data.meta.pagination.total} produk)
                      </span>
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

