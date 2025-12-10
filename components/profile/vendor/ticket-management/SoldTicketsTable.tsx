"use client";

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { iTicketDetail, iVariantSummary } from '@/lib/interfaces/iTicketManagement';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Skeleton from '@/components/Skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


interface iSoldTicketsTableProps {
    productId: string;
    variants: iVariantSummary[];
}

type SortConfig = {
    key: keyof iTicketDetail;
    direction: 'ascending' | 'descending';
} | null;


const getStatusBadge = (status: string) => {
    switch (status) {
        case 'verified': return <Badge variant="default">Verified</Badge>;
        case 'unverified': return <Badge variant="destructive">Unverified</Badge>;
        case 'bypass': return <Badge variant="secondary">Bypass</Badge>;
        default: return <Badge>{status}</Badge>;
    }
}

export const SoldTicketsTable: React.FC<iSoldTicketsTableProps> = ({ productId, variants }) => {
    
    const [filters, setFilters] = useState({ variant: 'all', status: 'all' });
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const fetchSoldTickets = async (): Promise<iTicketDetail[]> => {
        // MOCK DATA
        return [
            { id: 'tkt_001', documentId: 'tkt_001', ticket_code: 'KMA-REG-001', unique_token: 'xyz1', product_title: 'Konser Musik Akbar', variant_name: 'Reguler', recipient_name: 'Agus P', recipient_email: 'agus@test.com', recipient_phone: '08123456789', recipient_identity_type: 'KTP', recipient_identity_number: '1234567890123456', purchase_date: '2025-11-10T10:00:00Z', payment_status: 'paid', verification_status: 'verified', verification_date: '2025-12-10T10:00:00Z' },
            { id: 'tkt_002', documentId: 'tkt_002', ticket_code: 'KMA-REG-002', unique_token: 'xyz2', product_title: 'Konser Musik Akbar', variant_name: 'Reguler', recipient_name: 'Budi S', recipient_email: 'budi@test.com', recipient_phone: '08234567890', recipient_identity_type: 'KTP', recipient_identity_number: '2345678901234567', purchase_date: '2025-11-11T11:00:00Z', payment_status: 'paid', verification_status: 'unverified' },
            { id: 'tkt_003', documentId: 'tkt_003', ticket_code: 'KMA-VIP-001', unique_token: 'xyz3', product_title: 'Konser Musik Akbar', variant_name: 'VIP', recipient_name: 'Citra A', recipient_email: 'citra@test.com', recipient_phone: '08345678901', recipient_identity_type: 'KTP', recipient_identity_number: '3456789012345678', purchase_date: '2025-11-12T12:00:00Z', payment_status: 'paid', verification_status: 'unverified' },
            { id: 'tkt_004', documentId: 'tkt_004', ticket_code: 'KMA-VVIP-001', unique_token: 'xyz4', product_title: 'Konser Musik Akbar', variant_name: 'VVIP', recipient_name: 'Dani M', recipient_email: 'dani@test.com', recipient_phone: '08345678902', recipient_identity_type: 'KTP', recipient_identity_number: '4567890123456789', purchase_date: '2025-11-13T13:00:00Z', payment_status: 'bypass', verification_status: 'verified', verification_date: '2025-12-10T11:00:00Z' },
        ];
    };

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['soldTickets', productId],
        queryFn: fetchSoldTickets,
    });

    const sortedAndFilteredTickets = useMemo(() => {
        if (!tickets) return [];
        let filtered = [...tickets];

        // Filtering
        if (filters.variant !== 'all') {
            filtered = filtered.filter(t => t.variant_name === filters.variant);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(t => t.verification_status === filters.status);
        }

        // Sorting
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                // Handle undefined or null values
                if (valA === undefined || valA === null) {
                    if (valB === undefined || valB === null) return 0; // Both are undefined/null, consider equal
                    return sortConfig.direction === 'ascending' ? 1 : -1; // A is undefined/null, B is defined. A comes after B in ascending.
                }
                if (valB === undefined || valB === null) {
                    return sortConfig.direction === 'ascending' ? -1 : 1; // B is undefined/null, A is defined. B comes after A in ascending.
                }

                // Standard comparison for defined values
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [tickets, filters, sortConfig]);

    const requestSort = (key: keyof iTicketDetail) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
        const dataToExport = sortedAndFilteredTickets.map(t => ({
            'Nama': t.recipient_name,
            'Email': t.recipient_email,
            'Telepon': t.recipient_phone,
            'Varian': t.variant_name,
            'Tanggal Beli': formatDate(t.purchase_date),
            'Status': t.verification_status,
            'Tanggal Verifikasi': t.verification_date ? formatDate(t.verification_date) : '-',
        }));

        const filename = `${productId}_tickets`;

        if (format === 'csv') {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Tickets");
            const csvOutput = XLSX.utils.sheet_to_csv(ws);
            saveAs(new Blob([csvOutput], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
        } else if (format === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Tickets");
            XLSX.writeFile(wb, `${filename}.xlsx`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            autoTable(doc, {
                head: [Object.keys(dataToExport[0])],
                body: dataToExport.map(row => Object.values(row)),
            });
            doc.save(`${filename}.pdf`);
        }
    }


    if (isLoading) return <Skeleton width="100%" height="200px" />;
    if (isError) return <p className="text-red-500">Gagal memuat detail tiket.</p>;

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                    <Select value={filters.variant} onValueChange={(value) => setFilters(prev => ({ ...prev, variant: value }))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Varian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Varian</SelectItem>
                            {variants.map(v => <SelectItem key={v.variant_id} value={v.variant_name}>{v.variant_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40">
                        <div className="grid gap-2">
                            <Button variant="ghost" onClick={() => handleExport('csv')}>Export as CSV</Button>
                            <Button variant="ghost" onClick={() => handleExport('xlsx')}>Export as XLSX</Button>
                            <Button variant="ghost" onClick={() => handleExport('pdf')}>Export as PDF</Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('recipient_name')}>
                                    Nama Pembeli <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Varian</TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => requestSort('purchase_date')}>
                                    Tgl. Beli <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAndFilteredTickets?.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    <div className="font-medium">{ticket.recipient_name}</div>
                                    <div className="text-sm text-gray-500">{ticket.recipient_email}</div>
                                </TableCell>
                                <TableCell>{ticket.variant_name}</TableCell>
                                <TableCell>{formatDate(ticket.purchase_date)}</TableCell>
                                <TableCell>{getStatusBadge(ticket.verification_status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
