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
    const [sortDataBy, setSortDataBy] = useState("updated_at")
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
    const dataContent = query?.data?.data.data
    const dataSort = _.orderBy(dataContent, [`${getSort}`], [`${sortDesc ? "desc" : "asc"}`]);

    const handleSort = ({ sortBy }: { sortBy: string }) => {
        router.push(`?sort=${sortBy}`)
        sortBy === "price" && setSortDesc(!sortDesc)
        setSortDataBy(sortBy)
    }
    return (
        <div className="flex justify-between items-start gap-7">
            <Box className="bg-c-blue text-white max-w-[280px]">
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
                    <Box className="w-auto py-3">
                        <div className="flex  items-center gap-4">
                            <label className="mr-3">Urutkan</label>
                            <Button variant={`${getSort === "updated_at" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "updated_at" }) }}>Terbaru</Button>
                            <Button variant={`${getSort === "sold_count" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "sold_count" }) }}>Terlaris</Button>
                            <Button variant={`${getSort === "price" ? "default" : "outline"}`} onClick={() => { handleSort({ sortBy: "price" }) }} className="flex gap-1 items-center">Harga {sortDesc ? <IoIosArrowDown /> : <IoIosArrowUp />}</Button>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Minimum" />
                            </div>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Maximum" />
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
                                        price={item.price}
                                        rate={parseInt(item.average_rating).toFixed(1)}
                                        sold={item.sold_count}
                                        location={item.vendor_region ? item.vendor_region : "unknown"}
                                    />
                                )
                            })
                        }

                    </div>
                </Box>
            </div>
        </div>

    )
}
