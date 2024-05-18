"use client"
import React from 'react'
import ItemFeature from "./ItemFeature"
import { useQuery } from "@tanstack/react-query"
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import moment from "moment";

export default function ListBlog() {
    const getQuery = async () => {
        return await getData(`/blogs/news?search=&limit=50&page=1`)
    }
    const query = useQuery({
        queryKey: ["qEventList"],
        queryFn: getQuery
    })
    if (query.isLoading) {
        return (
            <div className=" relative flex justify-center ">
                <Skeleton width="100%" height="400px" spaceBottom={"10px"} />
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
        <div className="relative mt-7">
            <h4 className="font-semibold text-[16px] text-c-blue mb-5">Artikel Terbaru</h4>
            <div className="flex flex-wrap -mx-5">
                {
                    dataContent?.map((item: any, index: number) => {
                        return <ItemFeature
                            slug={`/blog/${item.slug}`}
                            key={index}
                            title={item?.title}
                            date={moment(item?.publish_at).format("DD MMM YYYY")}
                            image={item.thumbnail ? item.thumbnail : "/images/no-image.png"} />
                    })
                }
            </div>
        </div>
    )
}
