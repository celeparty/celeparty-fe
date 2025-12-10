import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Box from "../Box";
import { UserTicketTransactionTable } from "./UserTicketTransactionTable";
import { UserTransactionTable } from "./UserTransactionTable";
import { EquipmentDashboard } from "./vendor/equipment-management/EquipmentDashboard";

interface iOrdersBaseContentProps {
	isVendor: boolean;
}
export const OrdersBaseContent: React.FC<iOrdersBaseContentProps> = ({ isVendor }) => {
	const [activeTab, setActiveTab] = useState<string>("general");

	return (
		<>
			<Box>
				<Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
					{isVendor && (
						<div className="mb-8">
							<EquipmentDashboard />
						</div>
					)}
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold">Data Pesanan</h4>
						{isVendor && (
							<TabsList className="grid w-[400px] grid-cols-2">
								<TabsTrigger value="general">Pesanan Umum</TabsTrigger>
								<TabsTrigger value="tickets">Pesanan Tiket</TabsTrigger>
							</TabsList>
						)}
					</div>

					<TabsContent value="general">
						<UserTransactionTable isVendor={isVendor} activeTab={activeTab} orderTypeFilter="equipment" />
					</TabsContent>

					{isVendor && (
						<TabsContent value="tickets">
							<UserTicketTransactionTable isVendor={isVendor} activeTab={activeTab} />
						</TabsContent>
					)}
				</Tabs>
			</Box>
		</>
	);
};
