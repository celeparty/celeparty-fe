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
import { Bookmark, LucideX, LucideXCircle } from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // const {activeButton, setActiveButton} = useButtonStore()
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const [filterCategories, setFilterCategories] = useState<iEventCategory[]>(
    []
  );
  const [variantPrice, setVariantPrice] = useState<number | null>(null);

  const getCombinedQuery = async () => {
    const formattedDate = eventDate
      ? format(new Date(eventDate), "yyyy-MM-dd")
      : null;

    // Build filter string for products
    let productFilters = "";
    
    if (getType) {
      productFilters += `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType)}`;
    }
    if (getSearch) {
      productFilters += `&filters[title][$containsi]=${encodeURIComponent(getSearch)}`;
    }
    if (getCategory) {
      productFilters += `&filters[category][title][$eq]=${encodeURIComponent(cat)}`;
    }
    if (formattedDate) {
      productFilters += `&filters[minimal_order_date][$eq]=${formattedDate}`;
    }

    try {
      // Fetch both products (equipment) and tickets in parallel
      const [productsRes, ticketsRes] = await Promise.all([
        axiosData("GET", `/api/products?populate=*&filters[state][$eq]=approved&sort=updatedAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=${Math.ceil(pageSize * 0.7)}${productFilters}`),
        axiosData("GET", `/api/tickets?populate=*&filters[state][$eq]=approved&sort=updatedAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=${Math.ceil(pageSize * 0.3)}${
          getSearch ? `&filters[title][$containsi]=${encodeURIComponent(getSearch)}` : ''
        }${
          getType && (getType === 'ticket' || getType === 'Tiket') ? '' : `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType || '')}`
        }`)
      ]);

      // Combine products and tickets
      let allProducts = [
        ...(productsRes?.data || []).map((p: any) => ({ ...p, __productType: 'equipment' })),
        ...(ticketsRes?.data || []).map((t: any) => ({ ...t, __productType: 'ticket' }))
      ];

      // Apply location filter
      if (selectedLocation) {
        allProducts = allProducts.filter((item: any) => {
          let locationValue = "";
          if (item.__productType === 'ticket') {
            locationValue = item.kota_event;
          } else {
            locationValue = item.kabupaten || item.region;
          }
          return locationValue?.toLowerCase().replace(/\s+/g, "-") === selectedLocation.toLowerCase().replace(/\s+/g, "-");
        });
      }

      // Sort by updatedAt descending
      allProducts.sort((a: any, b: any) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });

      // Calculate total pages (approximate)
      const totalItems = (productsRes?.meta?.pagination?.total || 0) + (ticketsRes?.meta?.pagination?.total || 0);
      const totalPageCount = Math.ceil(totalItems / pageSize);

      return {
        data: allProducts.slice(0, pageSize),
        meta: {
          pagination: {
            pageCount: totalPageCount,
            total: totalItems
          }
        }
      };
    } catch (error) {
      console.error('Error fetching products and tickets:', error);
      return { data: [], meta: { pagination: { pageCount: 0, total: 0 } } };
    }
  };

  const query = useQuery({
    queryKey: [
      "qProducts",
      getType,
      getSearch,
      getCategory,
      selectedLocation,
      eventDate,
      currentPage,
      pageSize,
    ],
    queryFn: getCombinedQuery,
    staleTime: 60 * 1000, // 1 minute
  });

  useEffect(() => {
    if (query.isSuccess) {
      let data = query.data.data;
      
      // Apply location filter on the frontend
      if (selectedLocation) {
        data = data.filter((item: any) => {
          let locationValue = "";
          if (item.user_event_type?.name === "Tiket" || item.user_event_type?.name === "ticket") {
            locationValue = item.kota_event;
          } else {
            locationValue = item.kabupaten || item.region;
          }
          return locationValue?.toLowerCase().replace(/\s+/g, "-") === selectedLocation.toLowerCase().replace(/\s+/g, "-");
        });
      }
      
      setMainData(data);
      // Set total pages from pagination metadata
      if (query.data.meta?.pagination) {
        setTotalPages(query.data.meta.pagination.pageCount);
      }
    }
  }, [query.isSuccess, query.data, selectedLocation]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [getType, getSearch, getCategory, selectedLocation, eventDate]);
  
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
    const cleanMin = price?.min
      ? parseInt(price.min.replace(/\./g, ""), 10)
      : null;
    const cleanMax = price?.max
      ? parseInt(price.max.replace(/\./g, ""), 10)
      : null;

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

    const uniqueLocations = new Set<string>();
    mainData.forEach((data: any) => {
      // Use kota_event for ticket products, kabupaten for non-ticket products
      let locationValue = "";
      if (data.user_event_type?.name === "Tiket" || data.user_event_type?.name === "ticket") {
        locationValue = data.kota_event;
      } else {
        locationValue = data.kabupaten || data.region;
      }
      
      if (locationValue) {
        uniqueLocations.add(locationValue);
      }
    });

    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const newLocations = Array.from(uniqueLocations).map((location) => ({
      label: capitalizeFirstLetter(location),
      value: location.toLowerCase().replace(/\s+/g, "-"),
    }));

    setEventLocations((prevLocations) => {
      const combined = [...prevLocations, ...newLocations];
      return combined.filter(
        (location, index, self) =>
          index === self.findIndex((t) => t.value === location.value)
      );
    });
  }, [mainData]);

  useEffect(() => {
    if (query.isSuccess && Array.isArray(mainData) && mainData.length > 0) {
      const firstItem = mainData[0];
      const lowestPrice = firstItem?.variant ? getLowestVariantPrice(firstItem.variant) : null;
      setVariantPrice(lowestPrice);
    }
  }, [query.isSuccess, mainData]);

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
  const dataContent = query?.data?.data || [];

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
    setCurrentPage(1); // Reset to first page when sorting
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
    if (activeCategory) setActiveCategory("");
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFilterCatsAvailable: boolean = filterCategories.length > 0;

    // ✅ fallback UI
  if (query.isLoading) {
    return <div>Loading produk...</div>;
  }

  if (query.isError) {
    return <div>Terjadi kesalahan jaringan. Silakan coba lagi.</div>;
  }

  if (!dataContent || dataContent.length === 0) {
    return <div>Tidak ada produk untuk kategori ini.</div>;
  }

  // ✅ kalau semua aman, render produk
  
  return (
    <div className="grid grid-cols-12 gap-6">
      {isFilterCatsAvailable && (
        <>
          <div className="col-span-12 md:col-span-3">
            <div className="sidebar">
              <Box className="bg-c-blue text-white mt-0">
                <div
                  className={`relative ${
                    isFilterCatsAvailable && "mb-7 [&_h4]:mb-3"
                  }`}
                >
                  <h4 className="font-bold">Informasi Acara</h4>
                  <hr className="mb-4 mt-2" />
                  <LocationFilterBar
                    options={eventLocations}
                    setSelectedLocation={setSelectedLocation}
                    selectedLocation={selectedLocation}
                  />
                </div>
                {isFilterCatsAvailable && (
                  <div className="relative mb-7 [&_h4]:mb-3">
                    <h4 className="font-bold">Pilih Kategori Produk</h4>
                    <hr className="mb-4" />
                    <div className="flex flex-col gap-3">
                      {filterCategories.map((cat, index) => (
                        <React.Fragment key={index}>
                          <ItemInfo
                            icon={Bookmark}
                            activeClass={`${
                              activeCategory === cat.title &&
                              "bg-c-green text-c-white"
                            }`}
                            onClick={() => {
                              const isActive = activeCategory === cat.title;
                              setActiveCategory(isActive ? null : cat.title);
                              handleFilter(isActive ? "" : cat.title);
                            }}
                          >
                            <ItemCategory title={cat.title} />
                          </ItemInfo>
                        </React.Fragment>
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
                )}
                {(eventDate || selectedLocation) && (
                  <>
                    <div className="py-2 text-right">
                      <Button variant={"green"} onClick={resetFilters}>
                        Reset Filter
                      </Button>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </div>
        </>
      )}
      <div
        className={`col-span-12 ${
          isFilterCatsAvailable ? "md:col-span-9" : "md:col-span-12"
        }`}
      >
        <div className="grid grid-cols-12 gap-4">
          {!isFilterCatsAvailable && (
            <>
              <div className="col-span-12 md:col-span-3">
                <Box className="bg-c-blue text-white mt-0 flex gap-2 items-center lg:px-6">
                  <div className={!selectedLocation ? "w-full" : "flex-1"}>
                    <LocationFilterBar
                      options={eventLocations}
                      setSelectedLocation={setSelectedLocation}
                      selectedLocation={selectedLocation}
                    />
                  </div>
                  {selectedLocation && (
                    <>
                      <LucideXCircle
                        className="cursor-pointer"
                        onClick={resetFilters}
                      />
                    </>
                  )}
                </Box>
              </div>
            </>
          )}
          <div
            className={`col-span-12 ${
              !isFilterCatsAvailable ? "md:col-span-9" : "md:col-span-12"
            }`}
          >
            <div className="w-full lg:inline-block">
              <Box className="w-auto py-3 mt-0">
                <div className="flex lg:flex-row flex-col items-center gap-4 ">
                  <label className="mr-3 text-[15px] pb-1 lg:pb-0 border-b-2 border-solid border-black lg:border-none">
                    Urutkan
                  </label>
                  <Button
                    variant={`${
                      getSort === "updated_at" ? "default" : "outline"
                    }`}
                    onClick={() => {
                      handleSort({ sortBy: "updatedAt" });
                      setActiveButton("btn1");
                      setShowOptions(false);
                    }}
                    className={`w-full lg:w-auto border-2 border-black border-solid lg:border-none ${
                      activeButton === "btn1" ? "bg-c-blue text-white" : null
                    }`}
                  >
                    Terbaru
                  </Button>
                  <Button
                    variant={`${
                      getSort === "sold_count" ? "default" : "outline"
                    }`}
                    onClick={() => {
                      handleSort({ sortBy: "sold_count" });
                      setActiveButton("btn2");
                      setShowOptions(false);
                    }}
                    className={`w-full lg:w-auto  border-2 border-black border-solid lg:border-none ${
                      activeButton === "btn2" ? "bg-c-blue text-white" : null
                    }`}
                  >
                    Terlaris
                  </Button>
                  <div className="relative flex items-center gap-4">
                    <div className="lg:order-1 order-2">
                      <Button
                        variant={`${
                          getSort === "price" ? "default" : "outline"
                        }`}
                        onClick={() => {
                          setActiveButton("btn3");
                          toggleDropdown();
                          setStatusValue(!statusValue);
                          setStatusSortBy(!statusSortBy);
                          handleSort({
                            sortBy: statusSortBy ? "price_min" : "price_max",
                          });
                        }}
                        className={`flex gap-1 items-center w-full lg:w-auto border-2 border-black border-solid lg:border-none ${
                          activeButton === "btn3"
                            ? "bg-c-blue text-white"
                            : null
                        }`}
                      >
                        {statusValue ? "Harga Temurah" : "Harga Termahal"}{" "}
                        {sortDesc ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </Button>
                    </div>
                    {/* <div className="flex lg:flex-row flex-col gap-2 lg:order-2 order-1">
                      <div className="flex items-center gap-2 w-full lg:w-auto">
                        Rp{" "}
                        <Input
                          className="border-2 border-black border-solid lg:border-none"
                          placeholder="Harga Minimum"
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, ""); // Only digits
                            const formatted = formatNumberWithDots(rawValue);
                            setPrice((prev) => ({ ...prev, min: formatted }));
                          }}
                          value={price.min > 0 ? price.min : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full lg:w-auto">
                        Rp{" "}
                        <Input
                          className="border-2 border-black border-solid lg:border-none"
                          placeholder="Harga Maximum"
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, ""); // Only digits
                            const formatted = formatNumberWithDots(rawValue);
                            setPrice((prev) => ({ ...prev, max: formatted }));
                          }}
                          value={price.max > 0 ? price.max : ""}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </Box>
            </div>
          </div>
          <div className="col-span-12">
            <Box className="lg:mt-0 px-[10px] lg:px-9">
              <div className="flex flex-wrap -mx-2">
                {mainData?.length > 0 ? (
                  mainData?.map((item: any) => {
                    // Determine the correct URL based on product type
                    const isTicket = item.__productType === 'ticket';
                    const productUrl = isTicket 
                      ? `/products/${item.documentId}?type=ticket` 
                      : `/products/${item.documentId}`;
                    
                    return (
                      <ItemProduct
                        url={productUrl}
                        key={item.id}
                        title={item.title}
                        image_url={
                          item.main_image
                            ? process.env.NEXT_PUBLIC_BASE_API + item.main_image[0].url
                            : "/images/noimage.png"
                        }
                        // image_url="/images/noimage.png"
                        price={getLowestVariantPrice(item.variant) 
                             ? formatRupiah(getLowestVariantPrice(item.variant)) 
                             : formatRupiah(item.main_price)}
                        rate={item.rate ? `${item.rate}` : "1"}
                        sold={item.sold_count}
                        location={item.region ? item.region : null}
                        status={isTicket ? (item.publishedAt ? 'published' : 'unpublished') : undefined}
                      ></ItemProduct>
                    );
                  })
                ) : (
                  <div className="text-center w-full">
                    Product Tidak Ditemukan
                  </div>
                )}
              </div>
              
              {/* Pagination Info and Controls */}
              {mainData?.length > 0 && totalPages > 1 && (
                <div className="mt-8">
                  {/* Page Info */}
                  <div className="text-center mb-4 text-sm text-slate-600">
                    Halaman {currentPage} dari {totalPages} 
                    {query.data?.meta?.pagination?.total && (
                      <span className="ml-2">
                        ({query.data.meta.pagination.total} produk)
                      </span>
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
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
