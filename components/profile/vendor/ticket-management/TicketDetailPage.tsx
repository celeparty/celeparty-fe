"use client";

import React from 'react';
import { iTicketSummary } from '@/lib/interfaces/iTicketManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { formatNumberWithDots } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SoldTicketsTable } from './SoldTicketsTable';

interface iTicketDetailPageProps {
    product: iTicketSummary;
}

// A component to display the summary of the product, similar to the main table row
const ProductSummaryHeader = ({ product }: { product: iTicketSummary }) => (
    <Card className="mb-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Image src={product.product_image || '/images/placeholder.png'} alt={product.product_title} width={60} height={60} className="rounded-lg object-cover" />
                <div>
                    <CardTitle>{product.product_title}</CardTitle>
                    <p className="text-sm text-gray-500">Ringkasan Penjualan</p>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Terjual</p>
                    <p className="text-2xl font-bold">{formatNumberWithDots(product.totalTicketsSold)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Income Bersih</p>
                    <p className="text-2xl font-bold text-green-700">Rp {formatNumberWithDots(product.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Varian</p>
                    <p className="text-2xl font-bold">{product.variants.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Rata-rata Terjual</p>
                     <Badge variant="secondary">{((product.totalTicketsSold / product.variants.reduce((acc, v) => acc + v.quota, 0)) * 100 || 0).toFixed(1)}%</Badge>
                </div>
            </div>
        </CardContent>
    </Card>
);

export const TicketDetailPage: React.FC<iTicketDetailPageProps> = ({ product }) => {
    return (
        <div>
            <ProductSummaryHeader product={product} />
            
            <Card>
                <CardHeader>
                    <CardTitle>Detail Tiket Terjual</CardTitle>
                    <p className="text-sm text-gray-500">Daftar semua tiket yang telah dibeli untuk produk ini.</p>
                </CardHeader>
                <CardContent>
                    <SoldTicketsTable productId={product.product_id} variants={product.variants} />
                </CardContent>
            </Card>
        </div>
    );
};