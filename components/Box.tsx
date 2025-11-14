import { cn } from "@/lib/utils";
import type React from "react";

interface iBox {
	children: React.ReactNode;
	title?: string;
	rounded?: boolean;
	className?: string;
	variant?: "default" | "elevated" | "bordered";
	size?: "sm" | "md" | "lg";
}

export default function Box(props: iBox) {
	const {
		variant = "default",
		size = "md",
		rounded = true,
		...rest
	} = props;

	const baseClasses = "relative bg-white w-full";

	const variantClasses = {
		default: "shadow-soft",
		elevated: "shadow-medium",
		bordered: "border border-c-gray-200 shadow-soft",
	};

	const sizeClasses = {
		sm: "py-3 px-4",
		md: "py-6 px-6",
		lg: "py-8 px-8",
	};

	const roundedClass = rounded ? "rounded-lg" : "";

	return (
		<div
			className={cn(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				roundedClass,
				props.className,
			)}
			{...rest}
		>
			{props.title ? (
				<h4 className="font-semibold text-lg text-c-blue mb-4">
					{props.title}
				</h4>
			) : null}
			{props.children}
		</div>
	);
}
