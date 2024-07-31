"use client"
import React from 'react'
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/Skeleton";
import { getDataToken } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import { useSession } from "next-auth/react";
import _ from "lodash";
import Box from "@/components/Box";
import ItemProduct from "@/components/product/ItemProduct";


interface iItemStatus {
    status: string
    value: number | string
    color: string
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
    return <div className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px]`} style={{ backgroundColor: `${color}` }}>
        <h4>{status}</h4>
        <strong>{value}</strong>
    </div>
}
export default function Products() {
    const session = useSession();
    const dataSession = session?.data as any;

    const getQuery = async () => {
        if (!dataSession?.user?.accessToken) {
            throw new Error("Access token is undefined");
        }
        return await getDataToken(`/products/vendor`, `${dataSession?.user?.accessToken}`);
    };
    const query = useQuery({
        queryKey: ["qProductsVendor"],
        queryFn: getQuery,
        enabled: !!dataSession?.user?.accessToken,
    });

    if (query.isLoading) {
        return <Skeleton width="100%" height="150px" />
    }
    if (query.isError) {
        return <ErrorNetwork style="mt-0" />
    }
    const dataContent = query?.data?.data.data

    return (
        <div>
            <Box className="mt-0" >
                <div className="flex flex-wrap -mx-2">
                    {dataContent?.map((item: any) => {
                        return (
                            <ItemProduct
                                url={`/product/${item.id}`}
                                key={item.id}
                                title={item.name}
                                image_url={item.photos[0].image_url}
                                price={`Rp. ${parseInt(`${item.default_variant_price}`).toLocaleString("id-ID")}`}
                                rate={parseInt(item.average_rating).toFixed(1)}
                                sold={item.sold_count}
                                location={false}
                            ></ItemProduct>
                        );
                    })}
                </div>
            </Box>
        </div>

    )
}
