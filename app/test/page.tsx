"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { axiosData } from "@/lib/services"

import Skeleton from "@/components/Skeleton"
import ErrorNetwork from "@/components/ErrorNetwork"

const TestPage = () => {
    const [activeButton, setActiveButton] = useState<string | null>(null)
    // const getQuery = async () => {
    //     return await axiosData("GET", "/blogs/jry1s1641uyxngzd17jwe38k?populate=*/blogs")
    // }

    // const query = useQuery({
    //     queryKey: ["qEventList"],
    //     queryFn: getQuery
    // })

    //     if (query.isLoading) {
    //         return (
    //             <div className=" relative flex justify-center ">
    //                 <Skeleton width="100%" height="400px" spaceBottom={"10px"} />
    //             </div>
    //         );
    //     }
    
    //     if (query.isError) {
    //         return <ErrorNetwork />;
    //     }
    return (
        <div>
            <h1>HELLO WORLD!</h1>
            <div className="flex gap-4">
            <button onClick={() => setActiveButton(activeButton === "btn1" ? null  : "btn1")} className={`border-1 border-black p-2 rounded-md ${ activeButton === "btn1" ? "bg-c-blue text-white" : null }`}>Change state value</button>
            <button onClick={() => setActiveButton(activeButton === "btn2" ? null  : "btn2")} className={`border-1 border-black p-2 rounded-md ${ activeButton === "btn2" ? "bg-c-blue text-white" : null }`}>Change state value 2</button>
            <button onClick={() => setActiveButton(activeButton === "btn3" ? null  : "btn3")} className={`border-1 border-black p-2 rounded-md ${ activeButton === "btn3" ? "bg-c-blue text-white" : null }`}>Change state value 3</button>
            </div>
        </div>
    )
}

export default TestPage