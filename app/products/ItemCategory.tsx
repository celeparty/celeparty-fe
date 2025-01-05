"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type React from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface iItemInfo {
	image: string;
	children: React.ReactNode;
}
export function ItemCategory({
	title,
	children,
	className,
	onClick,
}: {
	title: string;
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<div
			className={cn(
				"relative w-full h-10 px-3 py-2 font-semibold rounded-lg border border-solid text-white hover:bg-c-green hover:border-c-green cursor-pointer",
				className,
			)}
			onClick={onClick}
		>
			{title}
		</div>
	);
}

export function ItemInfo({ image, children }: iItemInfo) {
	return (
		<div className="flex gap-3 items-center">
			<div className="w-[35px]">
				<Image src={`${image}`} width={27.5} height={30} alt="image" />
			</div>
			{children}
		</div>
	);
}
