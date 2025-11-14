"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import type React from "react";

interface iItemInfo {
	icon: LucideIcon;
	children: React.ReactNode;
	activeClass?: string;
	onClick?: () => void;
}

export function ItemCategory({
	title,
	children,
}: {
	title: string;
	children?: React.ReactNode;
}) {
	return <div className={cn("relative w-full font-semibold text-white ")}>{title}</div>;
}

export function ItemInfo({ icon: Icon, children, activeClass, onClick }: iItemInfo) {
	return (
		<div
			className={`flex gap-3 items-center border border-solid hover:bg-c-green hover:border-c-green cursor-pointer px-3 py-2 rounded-lg ${activeClass}`}
			onClick={onClick}
		>
			<div className="w-[35px]">
				<Icon className="w-5 h-5" /> {/* Lucide icons are SVG-based */}
			</div>
			{children}
		</div>
	);
}
