import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import React from "react";
import ListBlog from "./features/ListBlog";
import MainBlog from "./features/MainBlog";

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
