import React, { useState } from "react";
import Box from "../Box";
import { UserTicketTransactionTable } from "./UserTicketTransactionTable";
import { UserTransactionTable } from "./UserTransactionTable";

interface iOrdersBaseContentProps {
	isVendor: boolean;
}
export const OrdersBaseContent: React.FC<iOrdersBaseContentProps> = ({ isVendor }) => {
	const [activeTab, setActiveTab] = useState<string>("events");

	return (
		<>
			<Box>
				<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">Data Pesanan</h4>
				<UserTransactionTable isVendor={isVendor} activeTab="events" />
			</Box>
		</>
	);
};
