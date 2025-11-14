import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import React from "react";
import ListBlog from "./features/ListBlog";
import MainBlog from "./features/MainBlog";

export const metadata = {
	title: "Blog", // hasil akhir = "Beranda | Celeparty"
	description: "Artikel menarik mengenai Event dan Rahasia di balik kesuksesan Sebuah Acara / Event",
};

export default function BlogPage() {
	return (
		<div className="relative wrapper lg:py-7 py-0">
			<Box title="Artikel Terpopuler">
				<Basecontent>
					<MainBlog />
					<ListBlog />
				</Basecontent>
			</Box>
		</div>
	);
}
