import Basecontent from "@/components/Basecontent";
import React from "react";
import ProductContent from "./ProductContent_";

export const metadata = {
	title: "Produk Terbaik Kami", // hasil akhir = "Beranda | Celeparty"
	description: "Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional ",
};

export default function ProductPage() {
	return (
		<div className="relative wrapper-main lg:py-7 py-0 lg:px-9 px-[10px]">
			<Basecontent>
				<ProductContent />
			</Basecontent>
		</div>
	);
}
