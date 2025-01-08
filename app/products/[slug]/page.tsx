import Box from "@/components/Box";
import { axiosData, getData } from "@/lib/services";
import parse from "html-react-parser";
import Image from "next/image";
import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";
import ContentProduct from "./ContentProduct";
import Basecontent from "@/components/Basecontent";

export default async function ProductDetail({
	params,
}: {
	params: { slug: string };
}) {

	return (
		<div className="relative wrapper-big py-7">
			<Basecontent>
				<ContentProduct slug={`${params.slug}`}/>
			</Basecontent>
		</div>
	);
}
