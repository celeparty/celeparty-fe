"use client";

import { iBlogPost } from "@/lib/interfaces/iPost";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { formatRupiah } from "@/lib/utils";
import React from "react";
import ItemProduct from "./ItemProduct";

interface iProductListProps {
	posts: iBlogPost[];
}

export const ProductListBox: React.FC<iProductListProps> = ({ posts }) => {
	return (
		<div className="flex flex-wrap -mx-2">
			{posts?.map((item: any, i: number) => {
				// Determine the URL based on item type
				const isTicket = item.__type === 'ticket';
				const url = isTicket 
					? `/products/${item.documentId}?type=ticket` 
					: `/products/${item.documentId}`;
				
				return (
					<ItemProduct
						url={url}
						key={item.id}
						title={item.title}
						image_url={
							item.main_image ? process.env.BASE_API + item.main_image[0].url : "/images/noimage.png"
						}
						price={
							item?.variant && item.variant.length > 0
								? formatRupiah(getLowestVariantPrice(item.variant))
								: formatRupiah(item?.main_price || 0)
						}
						rate={item.rate ? `${item.rate}` : "1"}
						sold={item.sold_count}
						location={item.__productType === 'ticket' ? item.kota_event : item.vendor_region || null}
					/>
				);
			})}
		</div>
	);
};
