"use client"
import { useQuery } from "@tanstack/react-query"
import { axiosData } from "@/lib/services"

import Skeleton from "@/components/Skeleton"
import ErrorNetwork from "@/components/ErrorNetwork"

const TestPage = () => {
    const getQuery = async () => {
        return await axiosData("GET", "/blogs/jry1s1641uyxngzd17jwe38k?populate=*/blogs")
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
            );
        }
    
        if (query.isError) {
            return <ErrorNetwork />;
        }


    console.log("ini data blogs/slug :",query.data.data)
    return (
        <div>HELLO WORLD!</div>
    )
}

export default TestPage