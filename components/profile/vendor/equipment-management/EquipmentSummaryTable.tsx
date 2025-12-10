"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface iSummaryData {
    product_id: string;
    product_title: string;
    total_orders: number;
    total_revenue: number;
}

interface iEquipmentSummaryTableProps {
    data: iSummaryData[];
    onDetailClick: (product: iSummaryData) => void;
}

export const EquipmentSummaryTable: React.FC<iEquipmentSummaryTableProps> = ({ data, onDetailClick }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Total Pesanan</TableHead>
                    <TableHead>Total Pendapatan</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item) => (
                    <TableRow key={item.product_id}>
                        <TableCell>{item.product_title}</TableCell>
                        <TableCell>{item.total_orders}</TableCell>
                        <TableCell>Rp {item.total_revenue.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                            <Button variant="outline" size="sm" onClick={() => onDetailClick(item)}>
                                Lihat Detail
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
