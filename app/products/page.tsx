import Basecontent from "@/components/Basecontent";
import React from "react";
import ProductContentNew from "./ProductContentNew";

export const metadata = {
	title: "Produk Terbaik Kami",
	description: "Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional",
};

export default function ProductPage() {
	return (
		<div className="relative wrapper-main py-8 lg:py-12">
			<ProductContentNew />
		</div>
	);
}
