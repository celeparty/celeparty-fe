"use client"
import { useQuery } from "@tanstack/react-query"
import Skeleton from "@/components/Skeleton";
import { getData } from "@/lib/services";
import ErrorNetwork from "@/components/ErrorNetwork";
import Link from "next/link";
import Image from "next/image";
import Box from "./Box";


export default function EventList() {
    const getQuery = async () => {
        return await getData(`/user-event-types`)
    }
    const query = useQuery({
        queryKey: ["qEventList"],
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
    const dataContent = query?.data?.data.data
    console.log(dataContent)
    return (
        <Box title="Pilih Acara">
            <div className="flex flex-wrap justify-around gap-2 align-top">
                {
                    dataContent?.map((item: any, i: number) => {
                        return (
                            <Link href="/" className="text-center max-w-[120px]" key={item.id}>
                                <div className="relative w-[47px] h-[47px] text-center mx-auto mb-1" >
                                    <Image src={item.icon_url} fill alt="" className="left-0 right-0 mx-auto" />
                                </div>
                                <div className="text-[10px] text-c-blue font-semibold">{item.name}</div>
                            </Link>
                        )
                    })
                }
            </div>
        </Box>
    )
}
