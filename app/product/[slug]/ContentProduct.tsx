import Box from "@/components/Box";
import { getData } from "@/lib/services";
import parse from "html-react-parser";
import Image from "next/image";
import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";

export default function ContentProduct({
	params,
}: {
	params: { slug: string };
}) {
	return <div>ContentProduct</div>;
}
