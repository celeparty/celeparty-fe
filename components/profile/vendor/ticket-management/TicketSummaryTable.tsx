"use client";

import React, { useState } from "react";
import { iTicketSummary } from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import { formatNumberWithDots } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface iTicketSummaryTableProps {
	data: iTicketSummary[];
	onDetailClick: (product: iTicketSummary) => void;
}

const VariantDetailsTable = ({ variants }: { variants: iTicketSummary['variants'] }) => (
    <div className="p-4 bg-gray-50">
        <h4 className="text-md font-semibold mb-3">Rincian Varian</h4>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Varian</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Kuota</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                    <TableHead className="text-right">Terverifikasi</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead className="text-right">% Terjual</TableHead>
                    <TableHead className="text-right">Income Bersih</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {variants.map(v => (
                    <TableRow key={v.variant_id}>
                        <TableCell className="font-medium">{v.variant_name}</TableCell>
                        <TableCell className="text-right">Rp {formatNumberWithDots(v.price)}</TableCell>
                        <TableCell className="text-right">{formatNumberWithDots(v.quota)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{formatNumberWithDots(v.sold)}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">{formatNumberWithDots(v.verified)}</TableCell>
                        <TableCell className="text-right">{formatNumberWithDots(v.remaining)}</TableCell>
                        <TableCell className="text-right">
                             <Badge variant={v.soldPercentage > 80 ? "destructive" : "default"}>{v.soldPercentage.toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">Rp {formatNumberWithDots(v.netIncome)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export const TicketSummaryTable: React.FC<iTicketSummaryTableProps> = ({ data, onDetailClick }) => {
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

	const toggleRow = (productId: string) => {
		setExpandedRows(prev => ({ ...prev, [productId]: !prev[productId] }));
	};

	if (data.length === 0) {
		return (
			<Card className="text-center py-8">
				<CardContent>
					<p className="text-gray-500">Belum ada data penjualan tiket</p>
				</CardContent>
			</Card>
		);
	}

	return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead className="text-right">Total Tiket Terjual</TableHead>
                            <TableHead className="text-right">Total Income Bersih</TableHead>
                            <TableHead className="text-center w-[120px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((product) => (
                            <React.Fragment key={product.product_id}>
                                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => toggleRow(product.product_id)}>
                                            {expandedRows[product.product_id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Image src={product.product_image || '/images/placeholder.png'} alt={product.product_title} width={40} height={40} className="rounded-md object-cover" />
                                            <span>{product.product_title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-lg">{formatNumberWithDots(product.totalTicketsSold)}</TableCell>
                                    <TableCell className="text-right font-semibold text-lg text-green-700">Rp {formatNumberWithDots(product.totalRevenue)}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDetailClick(product)}
                                            className="flex items-center gap-2 w-full justify-center"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Detail
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {expandedRows[product.product_id] && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <VariantDetailsTable variants={product.variants} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
	);
};
