"use client"
import React, { useState } from 'react'
import Box from "@/components/Box"
import { ItemCategory, ItemInfo } from "./ItemCategory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ItemProduct from "@/components/product/ItemProduct"
import { useQuery } from "@tanstack/react-query"
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation"


export default function ProductContent() {
    const [sortDesc, setSortDesc] = useState(true)
    const router = useRouter()
    const params = useSearchParams()
    const getQuery = async () => {
        return await getData(`/products`)
    }
    const query = useQuery({
        queryKey: ["qProducts"],
        queryFn: getQuery
    })
    if (query.isLoading) {
        return (
            <div className=" relative flex justify-center ">
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
            </div>
        )
    }

    if (query.isError) {
        return (
            <ErrorNetwork />
        )
    }
    const getSort = params.get("sort")
    const getMin = params.get("min")
    const getMax = params.get("max")
    const dataContent = query?.data?.data.data
    const newDataContent = dataContent?.map((item: any) => {
        const price = item.price;
        const priceRange = _.split(price, '-');
        const priceMin = priceRange.length === 2 ? parseInt(priceRange[0].replace(/[^0-9]/g, '')) : parseInt(price.replace(/[^0-9]/g, ''));
        const priceMax = priceRange.length === 2 ? parseInt(priceRange[1].replace(/[^0-9]/g, '')) : null;

        return {
            ...item,
            price: priceMin,
            price_min: priceMin,
            price_max: priceMax
        }
    })

    console.log(newDataContent)



    // const dataSort = _.orderBy(newDataContent, [`${getSort}`], [`${sortDesc ? "desc" : "asc"}`]);
    const dataSort =
        getMin || getMax ?
            _.orderBy(
                _.filter(newDataContent, (item) => {
                    const priceMin = parseFloat(item.price_min);
                    const priceMax = item.price_max ? parseFloat(item.price_max) : null;

                    return (getMin === null || getMin === "" || priceMin >= parseFloat(getMin)) &&
                        (getMax === null || getMax === "" || (priceMax !== null && priceMax <= parseFloat(getMax)));
                }),
                [`${getSort}`],
                [`${sortDesc ? "desc" : "asc"}`]
            ) : _.orderBy(newDataContent, [`${getSort}`], [`${sortDesc ? "desc" : "asc"}`]);

    const handleSort = ({ sortBy }: { sortBy: string }) => {
        // router.push(`?sort=${sortBy}`)
        getMin && getMin ? router.push(`?sort=${sortBy}&min=${getMin}&max=${getMax}`) : getMin ? router.push(`?sort=${sortBy}&min=${getMin}`) : router.push(`?sort=${sortBy}`)
        sortBy === "price" && setSortDesc(!sortDesc)
    }
    const priceMin = (e: any) => {
        getSort ? router.push(`?sort=${getSort}&min=${e.target.value}`) : router.push(`?min=${e.target.value}`)
    }
    const priceMax = (e: any) => {
        getSort ? router.push(`?sort=${getSort}&min=${getMin}&max=${e.target.value}`) : router.push(`?min=${getMin}&max=${e.target.value}`)

    }
    return (
        <div className="flex justify-between items-start gap-7">
            <Box className="bg-c-blue text-white max-w-[280px] mt-0">
                <div className="relative mb-7 [&_h4]:mb-3">
                    <h4>Informasi Acara</h4>
                    <div className="flex flex-col gap-3">
                        <ItemInfo image="/images/date.svg">
                            <Input placeholder="Tanggal Acara" />
                        </ItemInfo>
                        <ItemInfo image="/images/group.svg">
                            <Input placeholder="Jumlah Tamu/ Pax" />
                        </ItemInfo>
                        <ItemInfo image="/images/location.svg">
                            <Input placeholder="Lokasi Acara" />
                        </ItemInfo>
                    </div>
                </div>
                <div className="relative mb-7 [&_h4]:mb-3">
                    <h4>Pilih Kategori Produk</h4>
                    <div className="flex flex-col gap-3">
                        <ItemInfo image="/images/food.svg">
                            <ItemCategory title="Makanan"
                                onClick={() => { console.log("Makanan") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/decoration.svg">
                            <ItemCategory title="Dekorasi"
                                onClick={() => { console.log("Dekorasi") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/cake.svg">
                            <ItemCategory title="Kue"
                                onClick={() => { console.log("Kue") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/hampers.svg">
                            <ItemCategory title="Hampers"
                                onClick={() => { console.log("Hampers") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/others.svg">
                            <ItemCategory title="Lainnya"
                                onClick={() => { console.log("lain nya") }}
                            />
                        </ItemInfo>
                    </div>
                </div>
            </Box>
            <div className="flex-1">
                <div className="w-auto inline-block">
                    <Box className="w-auto py-3 mt-0">
                        <div className="flex  items-center gap-4">
                            <label className="mr-3">Urutkan</label>
                            <Button variant={`${getSort === "updated_at" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "updated_at" }) }}>Terbaru</Button>
                            <Button variant={`${getSort === "sold_count" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "sold_count" }) }}>Terlaris</Button>
                            <Button variant={`${getSort === "price" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "price" }) }} className="flex gap-1 items-center">Harga {sortDesc ? <IoIosArrowDown /> : <IoIosArrowUp />}</Button>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Minimum" onChange={(e) => priceMin(e)} />
                            </div>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Maximum" onChange={(e) => priceMax(e)} />
                            </div>
                        </div>
                    </Box>
                </div>
                <Box className="mt-3">
                    <div className="flex flex-wrap  -mx-2">
                        {
                            dataSort?.map((item: any) => {
                                return (
                                    <ItemProduct
                                        url={`/product/${item.id}`}
                                        key={item.id}
                                        title={item.name}
                                        image_url={item.photos[0].image_url}
                                        price={
                                            item.price_max ?
                                                `Rp. ${parseInt(`${item.price_min}`).toLocaleString("id-ID")} - Rp. ${parseInt(`${item.price_max}`).toLocaleString("id-ID")}`
                                                : "Rp. " +
                                                parseInt(`${item.price}`).toLocaleString("id-ID")
                                        }
                                        rate={parseInt(item.average_rating).toFixed(1)}
                                        sold={item.sold_count}
                                        location={item.vendor_region ? item.vendor_region : "unknown"}
                                    >
                                    </ItemProduct>
                                )
                            })
                        }

                    </div>
                </Box>
            </div>
        </div>

    )
}
