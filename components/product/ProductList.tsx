"use client"

import React from 'react'
import Box from "../Box"
import ItemProduct from "./ItemProduct"
import { useQuery } from "@tanstack/react-query"
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";

export default function ProductList() {
    const getQuery = async () => {
        return await getData(`/products`)
    }
    const query = useQuery({
        queryKey: ["qProductHome"],
        queryFn: getQuery
    })
    if (query.isLoading) {
        return (
            <div className="wrapper relative flex justify-center gap-5 overflow-hidden">
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
                <Skeleton width="100%" height="150px" spaceBottom={"10px"} />
            </div>
        )
    }

    if (query.isError) {
        return (
            <ErrorNetwork />
        )
    }

    const dataContent = query?.data?.data.data

    return (
        <Box title="Untuk Anda">
            <div className="flex flex-wrap justify-between -mx-2">
                {
                    dataContent?.map((item: any, i: number) => {
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
    )
}
