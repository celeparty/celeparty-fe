"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

interface iBase {
	children: ReactNode;
}

export default function Basecontent(props: iBase) {
	return (
		<QueryClientProvider client={queryClient}>
			<div className="text-[#262B35]">{props.children}</div>
		</QueryClientProvider>
	);
}
