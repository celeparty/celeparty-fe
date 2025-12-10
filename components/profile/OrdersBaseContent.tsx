import React, { useState } from "react";
import Box from "../Box";
import { UserTicketTransactionTable } from "./UserTicketTransactionTable";
import { UserTransactionTable } from "./UserTransactionTable";
import { EquipmentDashboard } from "./vendor/equipment-management/EquipmentDashboard";

interface iOrdersBaseContentProps {
	isVendor: boolean;
}
export const OrdersBaseContent: React.FC<iOrdersBaseContentProps> = ({ isVendor }) => {
	const [activeTab, setActiveTab] = useState<string>("events");

	return (
		<>
			<Box>
				{isVendor && (
					<div className="mb-8">
						<EquipmentDashboard />
					</div>
				)}
				<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">Data Pesanan</h4>
			<UserTransactionTable isVendor={isVendor} activeTab="events" orderTypeFilter="equipment" />
			</Box>
		</>
	);
};
