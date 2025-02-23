"use client"
import { axiosData } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";

export default function ContentProductEdit(props: any) {
    const getQuery = async () => {
		return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
	};
	const query = useQuery({
		queryKey: ["qProductDetail"],
		queryFn: getQuery,
	});

	const dataContent = query?.data?.data;

    console.log(dataContent)
    return (
        <div>
            CONTENTPRODUCTEDIT HERE
            <h1>your id {props.slug}</h1>
        </div>
    )
}