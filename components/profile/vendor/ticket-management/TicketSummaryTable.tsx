"use client";

import React from "react";
import { iTicketSummary, iVariantSummary } from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatNumberWithDots } from "@/lib/utils";

interface iTicketSummaryTableProps {
	data: iTicketSummary[];
	onDetailClick: (product: iTicketSummary) => void;
}

export const TicketSummaryTable: React.FC<iTicketSummaryTableProps> = ({
	data,
	onDetailClick,
}) => {
	if (data.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				<p>Belum ada data penjualan tiket</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-100 border-b border-gray-300">
						<th className="px-4 py-3 text-left text-sm font-semibold">Nama Produk Tiket</th>
						<th className="px-4 py-3 text-left text-sm font-semibold">Varian Tiket</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Jumlah Tiket</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Terjual</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Sisa Stok</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">% Terjual</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Terverifikasi</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Harga Jual</th>
						<th className="px-4 py-3 text-right text-sm font-semibold">Total Income Bersih</th>
						<th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{data.map((product) =>
						product.variants.map((variant, idx) => (
							<tr
								key={`${product.product_id}-${variant.variant_id}`}
								className="border-b border-gray-200 hover:bg-gray-50"
							>
								{idx === 0 && (
									<td
										rowSpan={product.variants.length}
										className="px-4 py-3 text-sm font-medium"
									>
										{product.product_title}
									</td>
								)}
								<td className="px-4 py-3 text-sm">{variant.variant_name}</td>
								<td className="px-4 py-3 text-center text-sm">{variant.quota}</td>
								<td className="px-4 py-3 text-center text-sm font-medium text-green-600">
									{variant.sold}
								</td>
								<td className="px-4 py-3 text-center text-sm">
									{variant.remaining}
								</td>
								<td className="px-4 py-3 text-center text-sm font-medium">
									{variant.soldPercentage.toFixed(1)}%
								</td>
								<td className="px-4 py-3 text-center text-sm text-blue-600 font-medium">
									{variant.verified}
								</td>
								<td className="px-4 py-3 text-center text-sm">
									Rp {formatNumberWithDots(variant.price)}
								</td>
								<td className="px-4 py-3 text-right text-sm font-semibold text-green-700">
									Rp {formatNumberWithDots(variant.netIncome)}
								</td>
								{idx === 0 && (
									<td
										rowSpan={product.variants.length}
										className="px-4 py-3 text-center"
									>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDetailClick(product)}
											className="flex items-center gap-2 w-full justify-center"
										>
											<Eye className="w-4 h-4" />
											Detail
										</Button>
									</td>
								)}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};
