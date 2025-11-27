"use client";
import Box from "@/components/Box";
import { iProductImage, iTicketFormReq } from "@/lib/interfaces/iProduct";
import React from "react";
import { TicketForm } from "../../../../components/product/TicketForm";

export default function TicketAdd() {
	const initialState: iTicketFormReq = {
		title: "",
		description: "",
		minimal_order: 0,
		minimal_order_date: "",
		main_image: [{} as iProductImage],
		users_permissions_user: null,
		variant: [],
		lokasi_event: "",
		event_date: "",
		kota_event: "",
		waktu_event: "",
		end_date: "",
		end_time: "",
		documentId: "",
	};

	return (
		<div>
			<Box className="lg:mt-0 rounded-t-none w-full">
				<TicketForm isEdit={false} formDefaultData={initialState}></TicketForm>
			</Box>
		</div>
	);
}
