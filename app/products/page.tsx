import Basecontent from "@/components/Basecontent";
import React, { Suspense } from "react";
import ProductContentNew from "./ProductContentNew";

export const metadata = {
	title: "Produk Terbaik Kami",
	description: "Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional",
};

export default function ProductPage() {
	return (
		<div className="relative wrapper-main py-8 lg:py-12">
			<Suspense fallback={<div className="text-center py-8">Memuat produk...</div>}>
				<ProductContentNew />
			</Suspense>
		</div>
	);
}
