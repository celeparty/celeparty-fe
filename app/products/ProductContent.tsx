"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import { DatePickerInput } from "@/components/form-components/DatePicker";
import { SelectInput } from "@/components/form-components/SelectInput";
import ItemProduct from "@/components/product/ItemProduct";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { axiosData } from "@/lib/services";
import { productCategories } from "@/lib/static/categories";
import { formatNumberWithDots, formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format, isValid, parse } from "date-fns";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { ItemCategory, ItemInfo } from "./ItemCategory";

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
  const router = useRouter();
  const params = useSearchParams();
  const getType = params.get("type");
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

  const getCombinedQuery = async () => {
    const formattedDate = eventDate
      ? format(new Date(eventDate), "yyyy-MM-dd")
      : null;

    return await axiosData(
      "GET",
      `/api/products?populate=*${
        getType
          ? `&filters[user_event_type][name][$eq]=${encodeURIComponent(
              getType
            )}`
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
    ],
    queryFn: getCombinedQuery,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setMainData(query.data.data);
    }
  }, [query.isSuccess, query.data]);

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
        (location, index, self) =>
          index === self.findIndex((t) => t.value === location.value)
      );
    });
  }, [mainData]);

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
  const dataContent = query?.data?.data;

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
  };

  const handleFilter = (category: string) => {
    const filterCategory: any = _.filter(dataContent, (item) => {
      return category ? item?.category?.title === category : item;
    });
    setMainData(filterCategory);
  };

  const toggleDropdown = (): void => {
    setSortDesc(!sortDesc);
    setShowOptions(!showOptions);
  };

  const resetFilters = () => {
    if (selectedLocation) setSelectedLocation("");
    if (eventDate) setEventDate("");
    if (minimalOrder) setMinimalOrder("");
  };

  return (
    <div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7">
      <div className="sidebar">
        <Box className="bg-c-blue text-white w-full lg:max-w-[280px] mt-0 hidden lg:block">
          <div className="relative mb-7 [&_h4]:mb-3">
            <h4>Informasi Acara</h4>
            <div className="flex flex-col gap-3">
              <ItemInfo image="/images/date.svg">
                <DatePickerInput
                  onChange={(date) => {
                    if (date instanceof Date && isValid(date)) {
                      const formatted = format(date, "dd-MM-yyyy");
                      setEventDate(formatted);
                    }
                  }}
                  textLabel="Pilih Tanggal Acara"
                  value={
                    eventDate
                      ? parse(eventDate, "dd-MM-yyyy", new Date())
                      : null
                  }
                />
              </ItemInfo>
              <ItemInfo image="/images/group.svg">
                <Input
                  placeholder="Jumlah Tamu/ Pax"
                  className="text-c-black"
                  onChange={(e) => {
                    let value = e.target.value;
                    setMinimalOrder(value);
                  }}
                  value={minimalOrder}
                />
              </ItemInfo>
              <ItemInfo image="/images/location.svg">
                <SelectInput
                  options={eventLocations}
                  label="Pilih Lokasi Acara"
                  onChange={(value) => {
                    if (value) {
                      setSelectedLocation(value);
                    }
                  }}
                  value={selectedLocation}
                ></SelectInput>
              </ItemInfo>
            </div>
          </div>
          {[
            "Peralatan Event",
            "Ulang Tahun",
            "Tasyakuran",
            "Acara Korporasi",
          ].includes(getType ?? "") && (
            <div className="relative mb-7 [&_h4]:mb-3">
              <h4>Pilih Kategori Produk</h4>
              <div className="flex flex-col gap-3">
                {productCategories.map((cat, index) => (
                  <React.Fragment key={index}>
                    <ItemInfo image={cat.icon ?? ""}>
                      <ItemCategory
                        title={cat.label}
                        onClick={() => {
                          const isActive = activeCategory === cat.value;
                          setActiveCategory(isActive ? null : cat.value);
                          handleFilter(isActive ? "" : cat.value);
                        }}
                        className={`${
                          activeCategory === cat.value &&
                          "bg-c-green text-c-white"
                        }`}
                      />
                    </ItemInfo>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </Box>
        {(eventDate || selectedLocation || minimalOrder) && (
          <>
            <div className="py-2 text-right">
              <Button variant={"green"} onClick={resetFilters}>
                Reset Filter
              </Button>
            </div>
          </>
        )}
      </div>
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
                variant={`${getSort === "sold_count" ? "default" : "outline"}`}
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
                    variant={`${getSort === "price" ? "default" : "outline"}`}
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
                      activeButton === "btn3" ? "bg-c-blue text-white" : null
                    }`}
                  >
                    {statusValue ? "Harga Temurah" : "Harga Termahal"}{" "}
                    {sortDesc ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </Button>
                  {/* {
								showOptions && (
									<div className="absolute -right-[2px] top-[70px] lg:top-12 lg:right-[432px] w-40 bg-white border border-gray-300 rounded shadow-lg z-50">
										<div className="flex flex-col gap-2">
											<Button 
											onClick={() => {
												handleSort({ sortBy: "price_min" });
												setShowOptions(!showOptions)
												setStatusValue("Harga Termurah")
											}}>Harga Termurah</Button>

											<Button onClick={() => {
												handleSort({ sortBy: "price_max" });
												setShowOptions(!showOptions)
												setStatusValue("Harga Termahal")
											}}>Harga Termahal</Button>

											<Button onClick={() => {
												handleSort({ sortBy: "main_price" });
												setShowOptions(!showOptions)
												setStatusValue("Seluruh Harga")
											}}>Seluruh Harga</Button>
										</div>
									</div>
								)
							} */}
                </div>
                <div className="flex lg:flex-row flex-col gap-2 lg:order-2 order-1">
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
                </div>
              </div>
            </div>
          </Box>
        </div>
        <Box className="mt-3 px-[10px] lg:px-9">
          <div className="flex flex-wrap -mx-2">
            {mainData?.length > 0 ? (
              mainData?.map((item: any) => {
                return (
                  <ItemProduct
                    url={`/products/${item.documentId}`}
                    key={item.id}
                    title={item.title}
                    image_url={
                      item.main_image
                        ? process.env.BASE_API + item.main_image[0].url
                        : "/images/noimage.png"
                    }
                    // image_url="/images/noimage.png"
                    price={
                      item.main_price
                        ? formatRupiah(item.main_price)
                        : formatRupiah(0)
                    }
                    rate={item.rate ? `${item.rate}` : "1"}
                    sold={item.sold_count}
                    location={item.region ? item.region : null}
                  ></ItemProduct>
                );
              })
            ) : (
              <div className="text-center w-full">Product Tidak Ditemukan</div>
            )}
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
  );
}
