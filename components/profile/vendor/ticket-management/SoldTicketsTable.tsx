"use client";

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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
import { axiosUser } from '@/lib/services';


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
    const { data: session } = useSession();
    
    const [filters, setFilters] = useState({ variant: 'all', status: 'all' });
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const fetchSoldTickets = async (): Promise<iTicketDetail[]> => {
        if (!session?.jwt || !session?.user?.documentId) {
            console.warn("SoldTicketsTable - Missing session or documentId");
            return [];
        }

        try {
            // Fetch all ticket transactions for this vendor
            const filterParam = `filters[vendor_id][$eq]=${session.user.documentId}`;
            const url = `/api/transaction-tickets-proxy?${filterParam}&sort=createdAt:desc&pagination[pageSize]=1000`;
            
            const response = await axiosUser("GET", url, session.jwt);
            const transactions = response.data?.data || [];
            
            // Convert transactions to ticket details
            const ticketDetails: iTicketDetail[] = [];
            
            transactions.forEach((transaction: any) => {
                const attrs = transaction.attributes;
                
                // Only process transactions for this specific product
                const transactionProductId = attrs.product?.data?.id;
                if (transactionProductId !== productId && attrs.product_name !== productId) {
                    return;
                }
                
                // Get recipients array
                const recipients = attrs.recipients || [];
                
                // Each recipient is a separate ticket detail
                recipients.forEach((recipient: any, index: number) => {
                    ticketDetails.push({
                        id: `${transaction.id}_${index}`,
                        documentId: transaction.id.toString(),
                        ticket_code: recipient.ticket_code || `TIC-${transaction.id}-${index}`,
                        unique_token: recipient.unique_token || '',
                        product_title: attrs.product_name || '',
                        variant_name: attrs.variant || 'Default',
                        recipient_name: recipient.name || '',
                        recipient_email: recipient.email || '',
                        recipient_phone: recipient.whatsapp_number || recipient.phone || recipient.telp || '',
                        recipient_identity_type: recipient.identity_type || '',
                        recipient_identity_number: recipient.identity_number || '',
                        purchase_date: transaction.attributes.createdAt || '',
                        payment_status: attrs.payment_status || 'pending',
                        verification_status: recipient.status || recipient.verification_status || 'unverified',
                        verification_date: recipient.verification_date || undefined,
                    });
                });
            });
            
            console.log("SoldTicketsTable - Fetched ticket details:", {
                count: ticketDetails.length,
                data: ticketDetails
            });
            
            return ticketDetails;
        } catch (error: any) {
            console.error("SoldTicketsTable - Error fetching ticket details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return [];
        }
    };

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['soldTickets', productId, session?.jwt],
        queryFn: fetchSoldTickets,
        enabled: !!session?.jwt && !!session?.user?.documentId && !!productId,
        staleTime: 5 * 60 * 1000,
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
