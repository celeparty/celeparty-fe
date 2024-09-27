import Box from "@/components/Box";
import { getData } from "@/lib/services";
import Image from "next/image";
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import parse from "html-react-parser";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";

export default function ContentProduct({
	params,
}: {
	params: { slug: string };
}) {
	return <div>ContentProduct</div>;
}
