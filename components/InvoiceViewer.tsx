"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface InvoiceViewerProps {
	invoiceId: number;
	orderId?: string;
	children?: React.ReactNode;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoiceId, orderId, children }) => {
	const invoiceUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/transaction-tickets/generateInvoice/${invoiceId}`;

	return (
		<Dialog>
			<DialogTrigger asChild>
				{children || (
					<Button size="sm" variant="outline" className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						View Invoice
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-4xl w-full h-[80vh]">
				<DialogHeader>
					<DialogTitle>Invoice {orderId ? `#${orderId}` : `ID: ${invoiceId}`}</DialogTitle>
				</DialogHeader>
				<div className="flex-1">
					<iframe
						src={invoiceUrl}
						className="w-full h-full border-0"
						title={`Invoice ${invoiceId}`}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};
