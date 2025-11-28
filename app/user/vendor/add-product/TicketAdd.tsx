"use client";
import Box from "@/components/Box";
import { iProductImage, iTicketFormReq } from "@/lib/interfaces/iProduct";
import React from "react";
import { TicketForm } from "../../../../components/product/TicketForm";

export default function TicketAdd() {
	const initialState: iTicketFormReq = {
		title: "",
		description: "",
		main_image: [{} as iProductImage],
		variant: [],
		lokasi_event: "",
		event_date: "",
		kota_event: "",
		waktu_event: "",
		end_date: "",
		end_time: "",
	};

	return (
		<div>
			<Box className="lg:mt-0 rounded-t-none w-full">
				<TicketForm isEdit={false} formDefaultData={initialState}></TicketForm>
			</Box>
		</div>
	);
}
