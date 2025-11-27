"use client";
import Box from "@/components/Box";
import { iProductImage, iProductReq, iProductVariant } from "@/lib/interfaces/iProduct";
import dynamic from "next/dynamic";
import React from "react";

const ProductForm = dynamic(() => import("@/components/product/ProductForm").then(mod => mod.ProductForm), {
	ssr: false,
});

export default function ProductAdd() {
	const defaultFormData: iProductReq = {
		title: "",
		description: "",
		minimal_order: 0,
		main_image: [{} as iProductImage],
		category: {
			connect: 0,
		},
		kabupaten: "",
		rate: 0,
		minimal_order_date: "",
		users_permissions_user: {
			connect: {
				id: "",
			},
		},
		variant: [{} as iProductVariant],
		escrow: false,
	};

	return (
		<div>
			<Box className="lg:mt-0 rounded-t-none">
				<ProductForm isEdit={false} formDefaultData={defaultFormData}></ProductForm>
			</Box>
		</div>
	);
}
