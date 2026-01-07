"use client";

import { OrdersBaseContent } from "@/components/profile/OrdersBaseContent";

export default function EquipmentOrdersPage() {
	return (
		<div className="w-full">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Manajemen Pesanan
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
					Kelola pesanan peralatan yang telah dijual
				</p>
			</div>
			<OrdersBaseContent
				isVendor={true}
				orderTypeFilter="equipment"
			/>
		</div>
	);
}
