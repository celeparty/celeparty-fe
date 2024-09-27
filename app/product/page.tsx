import React from "react";
import ProductContent from "./ProductContent";
import Basecontent from "@/components/Basecontent";

export default function ProductPage() {
	return (
		<div className="relative wrapper-main lg:py-7 py-0 lg:px-9 px-[10px]">
			<Basecontent>
				<ProductContent />
			</Basecontent>
		</div>
	);
}
