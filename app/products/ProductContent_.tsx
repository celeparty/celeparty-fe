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
  const getType = params.get("type") || "";
  const getSearch = params.get("search");
  const getCategory = params.get("cat");
  const [cat, setCat] = useState(`${getCategory ? getCategory : ""}`);

  const [eventDate, setEventDate] = useState<string>("");
  const [eventLocations, setEventLocations] = useState<iSelectOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<iEventCategory[]>([]);

  // New states for event type filter
  const [selectedEventType, setSelectedEventType] = useState<string>(getType);
  const [eventTypes, setEventTypes] = useState<iSelectOption[]>([]);

  // New states for price range filter
  // New state for apply filter
  const [applyFilters, setApplyFilters] = useState<boolean>(false);

  const getCombinedQuery = async () => {
    const formattedDate = eventDate
      ? format(new Date(eventDate), "yyyy-MM-dd")
      : null;


    // determine whether we're sorting by price (client-side) or letting the API sort
    const isPriceSort =
      sortOption === "price:asc" || sortOption === "price:desc";

    // decide sort parameters separately for products and tickets
    // If we're sorting by price we must not send that field to Strapi (it doesn't exist),
    // otherwise the API returns 400. Tickets don't have variants either so we always
    // fall back to updatedAt for them.
    let productSort = "";
    let ticketSort = "";
    if (!isPriceSort) {
      productSort = sortOption;
      ticketSort = sortOption;
      // ticketSort override is only relevant when the non-price sort happens to be price,
      // but since price sorts are disabled server-side, we never send them here.
      if (
        sortOption === "price:asc" ||
        sortOption === "price:desc"
      ) {
        ticketSort = "updatedAt:desc";
      }
    } else {
      // for price-sorting we still want tickets ordered by newest
      ticketSort = "updatedAt:desc";
    }

    // Build base query parameters; we will copy these to create ticketParams later
    let baseParams = `populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;
    if (productSort) {
      baseParams += `&sort[0]=${productSort}`;
    }
    let ticketBaseParams = `populate=*&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;
    if (ticketSort) {
      ticketBaseParams += `&sort[0]=${ticketSort}`;
    }

    // Add search filter
    if (getSearch) {
      baseParams += `&filters[title][$containsi]=${encodeURIComponent(getSearch)}`;
      ticketBaseParams += `&filters[title][$containsi]=${encodeURIComponent(getSearch)}`;
    }

    // Add category filter
    if (getCategory) {
      baseParams += `&filters[category][title][$eq]=${encodeURIComponent(getCategory)}`;
      ticketBaseParams += `&filters[category][title][$eq]=${encodeURIComponent(getCategory)}`;
    }

    // location filtering will be performed on the combined result set based on
    // the vendor's serviceLocation.subregion value; the API cannot filter this JSON
    // field reliably, so we apply it after fetching items.
    // (we leave `baseParams` untouched here)

    // Add event date filter (for tickets)
    if (formattedDate) {
      baseParams += `&filters[event_date][$gte]=${formattedDate}`;
      ticketBaseParams += `&filters[event_date][$gte]=${formattedDate}`;
    }


    try {
      // Build query parameters for products and tickets separately
      const productsParams = baseParams +
        (selectedEventType
          ? `&filters[user_event_type][name][$eq]=${encodeURIComponent(selectedEventType)}`
          : "");

      let productsRes: any;
      let ticketsRes: any = { data: [], meta: { pagination: { total: 0 } } };

      // always fetch products (event type filter applied here)
      productsRes = await axiosData(
        "GET",
        `/api/products?${productsParams}&filters[state][$eq]=approved`
      );

      // only attempt tickets request when no event type filter is set
      if (!selectedEventType) {
        try {
          ticketsRes = await axiosData(
            "GET",
            `/api/tickets?${ticketBaseParams}&filters[state][$eq]=approved`
          );
        } catch (error) {
          console.error("Error fetching tickets:", error);
        }
      }

      const products = productsRes?.data || [];
      const tickets = ticketsRes?.data || [];

      // combine and tag
      let allItems = [
        ...products.map((p: any) => ({ ...p, __productType: "equipment" })),
        ...tickets.map((t: any) => ({ ...t, __productType: "ticket" })),
      ];

      // vendor location filter (subregion) applied after combination
      if (selectedLocation) {
        allItems = allItems.filter((item: any) => {
          const vendor = item.users_permissions_user;
          const locations = vendor?.serviceLocation || [];
          return locations.some((loc: any) => loc.subregion === selectedLocation);
        });
      }

      // if we're sorting by price, do it locally using the lowest variant price
      if (isPriceSort) {
        const getItemPrice = (item: any) => {
          if (item.variant && item.variant.length > 0) {
            return getLowestVariantPrice(item.variant);
          }
          // no price information available
          return 0;
        };

        allItems.sort((a: any, b: any) => {
          const priceA = getItemPrice(a);
          const priceB = getItemPrice(b);
          if (sortOption === "price:asc") {
            return priceA - priceB;
          }
          return priceB - priceA;
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
            pageSize: pageSize,
            pageCount: totalPages,
            total: totalItems,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      // fallback attempt using same parameters (without invalid sort)
      try {
        const fallbackUrl =
          `/api/products?${baseParams}${
            selectedEventType
              ? `&filters[user_event_type][name][$eq]=${encodeURIComponent(
                  selectedEventType
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
      getSearch,
      getCategory,
      selectedLocation,
      eventDate,
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
    selectedEventType,
    getSearch,
    getCategory,
    selectedLocation,
    eventDate,
    sortOption,
  ]);

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
        // Only include categories from event types that are NOT for tickets
        if (!eventType.is_ticket) {
          const categories = eventType.categories || [];
          categories.forEach((cat: any) => {
            // Use title as unique key to avoid duplicates
            if (!allCategories.has(cat.title)) {
              allCategories.set(cat.title, cat);
            }
          });
        }
      });

      // Convert back to array
      const categoriesArray = Array.from(allCategories.values());
      console.log("Loaded Equipment Categories (excluding ticket categories):", categoriesArray);
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

  // Fetch vendor serviceLocation subregions to populate location dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // fetch all vendor users; serviceLocation is stored as JSON on the user
        // get all users; we'll ignore ones without serviceLocation.  role-based
        // filtering proved brittle (role name might not be "Vendor"), so keep it broad.
        const res: any = await axiosData(
          "GET",
          "/api/users?pagination[pageSize]=1000&fields=serviceLocation"
        );
        const vendors = res.data || [];
        const subregions = Array.from(
          new Set(
            vendors
              .flatMap((u: any) => (u.serviceLocation || []).map((loc: any) => loc.subregion))
              .filter(Boolean)
          )
        ) as string[];
        const options = subregions.map((sr) => ({ label: sr, value: sr }));
        setEventLocations(options);
      } catch (error) {
        console.error("Error fetching vendor locations:", error);
        setEventLocations([]);
      }
    };

    fetchLocations();
  }, []);

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
    // wipe all filter state values back to their defaults
    setSelectedEventType("");
    setSelectedLocation("");
    setEventDate("");
    setActiveCategory(null);
    setSortOption("updatedAt:desc");
    setCurrentPage(1);
    // force the query to run again so mainData contains every product
    query.refetch();
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
    !!selectedEventType ||
    !!eventDate ||
    !!selectedLocation ||
    !!activeCategory ||
    sortOption !== "updatedAt:desc";

  if (query.isLoading) return <div>Loading produk...</div>;
  if (query.isError) return <ErrorNetwork />;

  // always render layout so filter box stays visible, even if there are no items
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Product Filter Sidebar */}
      <ProductFilter
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
                          : formatRupiah(0)
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

