"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import ItemProduct from "@/components/product/ItemProduct";
import { LocationFilterBar } from "@/components/product/LocationFilterBar";
import ProductFilter from "@/components/product/ProductFilter";
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
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true); // Default visible

  const router = useRouter();
  const params = useSearchParams();
  // raw parameter from URL, may represent either a product type or an event
  // type depending on context.
  const rawTypeParam = params.get("type") || "";
  const productType = rawTypeParam.toLowerCase();
  const isProductTypeTicket = productType === "ticket" || productType === "tiket";
  const isProductTypeEquipment = productType === "equipment";
  // when the `type` param does *not* correspond to one of the two known
  // product types, treat it as an event type filter and prefill the sidebar.
  const eventTypeParam = !isProductTypeTicket && !isProductTypeEquipment ? rawTypeParam : "";
  const getSearch = params.get("search");
  const getCategory = params.get("cat");
  const [cat, setCat] = useState(`${getCategory ? getCategory : ""}`);

  // When user selects a product type from filter UI, update URL params
  const handleProductTypeChange = (type: string) => {
    const searchParams = new URLSearchParams(params.toString());
    if (type) {
      searchParams.set("type", type);
    } else {
      searchParams.delete("type");
    }
    // AppRouterInstance does not expose pathname; use known route
    const base = "/products";
    router.push(`${base}?${searchParams.toString()}`);
  };

  const [eventDate, setEventDate] = useState<string>("");
  const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);

  // New states for event type filter (controlled by sidebar UI)
  const [selectedEventType, setSelectedEventType] = useState<string>(eventTypeParam);
  const [eventTypes, setEventTypes] = useState<iSelectOption[]>([]);

  // New states for price range filter
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  // New state for apply filter
  const [applyFilters, setApplyFilters] = useState<boolean>(false);

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

    // Use custom sort logic based on variant prices if sorting by price
    let sortParam = sortOption;

    // For now we'll keep main_price sorting, but this will be handled client-side
    // with variant price calculation
    if (sortOption === "main_price:asc" || sortOption === "main_price:desc") {
      sortParam = sortOption;
    }

    // Build base query parameters
    let baseParams = `populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}&sort[0]=${sortParam}`;

    // Add search filter
    if (getSearch) {
      baseParams += `&filters[title][$containsi]=${encodeURIComponent(getSearch)}`;
    }

    // Add category filter
    if (getCategory) {
      baseParams += `&filters[category][title][$eq]=${encodeURIComponent(getCategory)}`;
    }

    // Add location filter
    if (selectedLocation) {
      baseParams += `&filters[kota_event][$eq]=${encodeURIComponent(selectedLocation)}`;
    }

    // Add event date filter (for tickets)
    if (formattedDate) {
      baseParams += `&filters[event_date][$gte]=${formattedDate}`;
    }

    // Add price filters
    baseParams += priceFilterString;

    try {
      // Fetch products and tickets.  The `selectedEventType` filter should apply to
      // both collections – earlier code applied it only to products which meant the
      // sidebar dropdown didn’t work for ticket items.
      let productsParams = baseParams;
      let ticketsParams = baseParams;

      if (selectedEventType) {
        const evtFilter = `&filters[user_event_type][name][$eq]=${encodeURIComponent(selectedEventType)}`;
        productsParams += evtFilter;
        ticketsParams += evtFilter;
      }

      // if the caller has requested a specific product type, avoid requesting the
      // other collection entirely – it saves bandwidth and keeps pagination counts
      // accurate on the server side.
      const shouldFetchProducts = !isProductTypeTicket;
      const shouldFetchTickets = !isProductTypeEquipment;

      const productsPromise = shouldFetchProducts
        ? axiosData("GET", `/api/products?${productsParams}&filters[state][$eq]=approved`)
        : Promise.resolve({ data: [], meta: { pagination: { total: 0 } } });
      const ticketsPromise = shouldFetchTickets
        ? axiosData("GET", `/api/tickets?${ticketsParams}&filters[state][$eq]=approved`)
        : Promise.resolve({ data: [], meta: { pagination: { total: 0 } } });

      const [productsRes, ticketsRes] = await Promise.all([productsPromise, ticketsPromise]);

      // Extract data arrays
      const products = productsRes?.data || [];
      const tickets = ticketsRes?.data || [];

      // Mark items with type for proper handling
      let allItems: any[] = [
        ...products.map((p: any) => ({ ...p, __productType: 'equipment' })),
        ...tickets.map((t: any) => ({ ...t, __productType: 'ticket' }))
      ];

      // Apply optional product-type filter coming from the `type` query parameter
      if (productType) {
        if (isProductTypeTicket) {
          allItems = allItems.filter((i: any) => i.__productType === 'ticket');
        } else if (isProductTypeEquipment) {
          allItems = allItems.filter((i: any) => i.__productType === 'equipment');
        }
      }

      // Sort by updatedAt descending (most recent first)
      allItems.sort((a: any, b: any) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });

      // Calculate pagination info for combined results
      let totalItems = (productsRes?.meta?.pagination?.total || 0) + (ticketsRes?.meta?.pagination?.total || 0);
      // if the user is filtering by a specific product type, the helper promises
      // above already ensure the other side returned total=0, so this is still
      // correct; we leave the variable as-is for clarity.
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        data: allItems,
        meta: {
          pagination: {
            page: currentPage,
            pageSize: pageSize,
            pageCount: totalPages,
            total: totalItems
          }
        }
      };
    } catch (error) {
      console.error("Error fetching products and tickets:", error);
      // Fallback to just products if error
      return await axiosData("GET", `/api/products?${baseParams}&filters[state][$eq]=approved`);
    }
  };

  const query = useQuery({
    queryKey: [
      "qProducts",
      productType,
      selectedEventType,
      getSearch,
      getCategory,
      selectedLocation,
      eventDate,
      minPrice,
      maxPrice,
      sortOption,
      currentPage,
    ],
    queryFn: getCombinedQuery,
  });

  useEffect(() => {
    if (query.isSuccess) {
      const data = query.data?.data || [];
      setMainData(data);
      if (query.data?.meta?.pagination) {
        setTotalPages(query.data.meta.pagination.pageCount);
      }
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    productType,
    selectedEventType,
    getSearch,
    getCategory,
    selectedLocation,
    eventDate,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  const getFilterCatsQuery = async () => {
    // if URL carried a non-product type string, fetch only that event type so
    // the category extractor below can still operate.
    if (eventTypeParam) {
      return await axiosData(
        "GET",
        `/api/user-event-types?populate=*&filters[name]=${encodeURIComponent(eventTypeParam)}`
      );
    }
    return await axiosData("GET", "/api/user-event-types?populate=*");
  };

  const filterCatsQuery = useQuery({
    queryKey: ["qFilterCats", eventTypeParam, productType],
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

      const allCategories = new Map<string, any>();

      data.forEach((eventType: any) => {
        const shouldInclude = isProductTypeTicket
          ? eventType.is_ticket
          : !eventType.is_ticket;

        if (shouldInclude) {
          const categories = eventType.categories || [];
          categories.forEach((cat: any) => {
            if (!allCategories.has(cat.title)) {
              allCategories.set(cat.title, cat);
            }
          });
        }
      });

      const categoriesArray = Array.from(allCategories.values());
      console.log(
        `Loaded ${isProductTypeTicket ? "ticket" : "equipment"} categories:`,
        categoriesArray
      );
      setFilterCategories(categoriesArray);
    }
  }, [filterCatsQuery.isSuccess, filterCatsQuery.data, isProductTypeTicket]);

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

  // Fetch locations based on selected event type
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedEventType) {
        setEventLocations([]);
        return;
      }

      try {
        // Get event type details to check if it's a ticket or service
        const eventTypeDetails = await axiosData(
          "GET",
          `/api/user-event-types?filters[name][$eq]=${encodeURIComponent(selectedEventType)}&populate=*`
        );

        const eventTypeData = eventTypeDetails.data?.[0];
        if (!eventTypeData) return;

        // Determine which cities to use
        const citiesField = eventTypeData.is_ticket ? "event_cities" : "service_cities";
        const cities = eventTypeData[citiesField] || [];

        // Convert cities array to options format
        const cityOptions = cities.map((city: any) => ({
          label: typeof city === "string" ? city : city.name || city,
          value: typeof city === "string" ? city : city.name || city,
        }));

        setEventLocations(cityOptions);
        setSelectedLocation(""); // Reset selected location when event type changes
      } catch (error) {
        console.error("Error fetching locations:", error);
        setEventLocations([]);
      }
    };

    fetchLocations();
  }, [selectedEventType]);

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
    setActiveCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setSortOption("updatedAt:desc");
    // also clear product type filter from URL
    handleProductTypeChange("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    // Trigger the query to refetch with current filters
    setCurrentPage(1);
    query.refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if any filter is active
  const hasActiveFilters: boolean =
    !!productType ||
    !!selectedEventType ||
    !!eventDate ||
    !!selectedLocation ||
    !!activeCategory ||
    !!minPrice ||
    !!maxPrice ||
    sortOption !== "updatedAt:desc";

  if (query.isLoading) return <div>Loading produk...</div>;
  if (query.isError) return <ErrorNetwork />;
  if (!dataContent || dataContent.length === 0) {
    return <div>Tidak ada produk untuk kategori ini.</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Product Filter Sidebar */}
      <ProductFilter
        productType={productType}
        onProductTypeChange={handleProductTypeChange}
        eventTypes={eventTypes}
        selectedEventType={selectedEventType}
        onEventTypeChange={setSelectedEventType}
        locations={eventLocations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        categories={filterCategories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          handleFilter(cat ? cat : "");
        }}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onResetFilters={resetFilters}
        onApplyFilters={handleApplyFilters}
        hasActiveFilters={hasActiveFilters}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />
      <div
        className={`col-span-12 ${
          isFilterOpen ? "md:col-span-9" : "md:col-span-12"
        }`}
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Box className="lg:mt-0 px-[10px] lg:px-9">
              <div className="flex flex-wrap -mx-2">
                {mainData?.length > 0 ? (
                  mainData?.map((item: any) => (
                    <ItemProduct
                      url={`/products/${item.documentId}${item.__productType === 'ticket' ? '?type=ticket' : ''}`}
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
                      location={item.__productType === 'ticket' ? item.kota_event : item.region || null}
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

