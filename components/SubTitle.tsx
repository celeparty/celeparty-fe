import { cn } from "@/lib/utils";
import React from "react";

interface iSUbtitle {
	title?: string;
	className?: string;
}

export default function SubTitle({ title, className }: iSUbtitle) {
	return <h4 className={cn(`font-semibold text-[16px] mb-1`, className)}>{title}</h4>;
}
