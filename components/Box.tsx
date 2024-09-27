import { cn } from "@/lib/utils";
import type React from "react";
import { Children } from "react";

interface iBox {
	children: React.ReactNode;
	title?: string;
	rounded?: boolean;
	className?: string;
}

export default function Box(props: iBox) {
	return (
		<div
			className={cn(
				`relative bg-white w-full shadow-lg  py-7 px-9 mt-7 ${!props.rounded ? "rounded-lg" : null}`,
				props.className,
			)}
		>
			{props.title ? <h4 className="font-semibold text-[16px] text-c-blue mb-1">{props.title}</h4> : null}
			{props.children}
		</div>
	);
}
