"use client";

import Box from "@/components/Box";
import { TicketDashboard } from "@/components/profile/vendor/TicketDashboard";
import { TicketScan } from "@/components/profile/vendor/TicketScan";
import { TicketSend } from "@/components/profile/vendor/TicketSend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";

export default function TicketManagementPage() {
	const [activeTab, setActiveTab] = useState("dashboard");

	return (
		<Box>
			<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mb-4">Management Tiket</h4>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="dashboard">Dashboard Ticket</TabsTrigger>
					<TabsTrigger value="scan">Scan Tiket</TabsTrigger>
					<TabsTrigger value="send">Kirim Undangan Tiket</TabsTrigger>
				</TabsList>
				<TabsContent value="dashboard" className="mt-6">
					<TicketDashboard />
				</TabsContent>
				<TabsContent value="scan" className="mt-6">
					<TicketScan />
				</TabsContent>
				<TabsContent value="send" className="mt-6">
					<TicketSend />
				</TabsContent>
			</Tabs>
		</Box>
	);
}
