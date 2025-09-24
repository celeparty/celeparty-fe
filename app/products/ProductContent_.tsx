"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import ItemProduct from "@/components/product/ItemProduct";
import { LocationFilterBar } from "@/components/product/LocationFilterBar";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { axiosData } from "@/lib/services";
import { formatNumberWithDots, formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import _ from "lodash";
import { Bookmark, LucideXCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ItemCategory, ItemInfo } from "./ItemCategory";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getLowestVariantPrice } from "@/lib/productUtils";

export function ProductContent() {
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [statusValue, setStatusValue] = useState<boolean>(true);
  const [statusSortBy, setStatusSortBy] = useState<boolean>(true);
  const [price, setPrice] = useState<{ min: any; max: any }>({
    min: 0,
    max: 0,
  });
  const [mainData, setMainData] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(15); // items per page
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
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);

  const getCombinedQuery = async () => {
    const formattedDate = eventDate
      ? format(new Date(eventDate), "yyyy-MM-dd")
      : null;

    return await axiosData(
      "GET",
      `/api/products?populate=*&sort=updatedAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}${
        getType
          ? `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType)}`
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
      }${
        formattedDate
          ? `&filters[minimal_order_date][$eq]=${formattedDate}`
          : ""
      }${minimalOrder ? `&filters[minimal_order][$eq]=${minimalOrder}` : ""}`
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
  }, [getType, getSearch, getCategory, selectedLocation, eventDate, minimalOrder]);

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

  useEffect(() => {
    if (filterCatsQuery.isSuccess) {
      const data = filterCatsQuery.data?.data || [];
      const categories = data?.[0]?.categories || [];
      setFilterCategories(categories);
    }
  }, [filterCatsQuery.isSuccess, filterCatsQuery.data]);

  const dataContent = query?.data?.data || [];

  const [variantPrice, setVariantPrice] = useState<number | null>(null);

  useEffect(() => {
    if (query.isSuccess && Array.isArray(dataContent) && dataContent.length > 0) {
      const firstItem = dataContent[0];
      const lowestPrice = firstItem?.variant
        ? getLowestVariantPrice(firstItem.variant)
        : null;
      setVariantPrice(lowestPrice);
    }
  }, [query.isSuccess, dataContent]);

  const handleSort = (sort: any) => {
    const dataSort: any = _.sortBy(dataContent, (item) => {
      return sort.sortBy === "sold_count"
        ? item.sold_count
        : sort.sortBy === "main_price"
        ? item.main_price
        : sort.sortBy === "price_min"
        ? item.price_min
        : sort.sortBy === "price_max"
        ? item.price_max
        : item.updatedAt;
    });
    setMainData(dataSort);
    setCurrentPage(1);
  };

  const handleFilter = (category: string) => {
    const filterCategory: any = _.filter(dataContent, (item) => {
      if (category === "Lainnya") return true;
      return category ? item?.category?.title === category : item;
    });
    setMainData(filterCategory);
    setCurrentPage(1);
  };

  const toggleDropdown = (): void => {
    setSortDesc(!sortDesc);
    setShowOptions(!showOptions);
  };

  const resetFilters = () => {
    setSelectedLocation("");
    setEventDate("");
    setMinimalOrder("");
    setActiveCategory(null);
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
            <Box className="bg-c-blue text-white mt-0">
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Informasi Acara</h4>
                <hr className="mb-4 mt-2" />
                <LocationFilterBar
                  options={eventLocations}
                  setSelectedLocation={setSelectedLocation}
                  selectedLocation={selectedLocation}
                />
              </div>
              <div className="relative mb-7 [&_h4]:mb-3">
                <h4 className="font-bold">Pilih Kategori Produk</h4>
                <hr className="mb-4" />
                <div className="flex flex-col gap-3">
                  {filterCategories.map((cat, index) => (
                    <ItemInfo
                      key={index}
                      icon={Bookmark}
                      activeClass={`${
                        activeCategory === cat.title && "bg-c-green text-c-white"
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
                      activeCategory === "Lainnya" &&
                      "bg-c-green text-c-white"
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
              {(eventDate || selectedLocation || minimalOrder) && (
                <div className="py-2 text-right">
                  <Button variant={"green"} onClick={resetFilters}>
                    Reset Filter
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
                      image_url={
                        /* item?.main_image?.[0]?.url
                          ? process.env.NEXT_PUBLIC_BASE_API +
                            item.main_image[0].url
                          : "/images/noimage.png" */
                        item.main_image
                            ? process.env.NEXT_PUBLIC_BASE_API + item.main_image[0].url
                            : "/images/noimage.png"
                      }
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
                    Product Tidak Ditemukan
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
