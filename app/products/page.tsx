import Basecontent from "@/components/Basecontent";
import React from "react";
import ProductContent from "./ProductContent_";

export const metadata = {
	title: "Produk Terbaik Kami",
	description: "Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional",
};

export default function ProductPage() {
	return (
		<div className="relative wrapper-main py-8 lg:py-12">
			<Basecontent>
				<div className="mb-6 lg:mb-8">
					<h1 className="text-2xl lg:text-3xl font-bold text-c-blue mb-2">
						Produk Terbaik Kami
					</h1>
					<p className="text-c-gray-600 text-sm lg:text-base">
						Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional
					</p>
				</div>
				<ProductContent />
			</Basecontent>
		</div>
	);
}
