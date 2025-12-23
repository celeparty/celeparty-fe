/**
 * Komponen Ticket Preview dengan fungsi download/email
 * Digunakan untuk menampilkan preview tiket sebelum dikirim
 */

'use client';

import React, { useRef, useState } from 'react';
import { TicketTemplate } from '@/components/ticket-templates';
import type { TicketData }from '@/components/ticket-templates';
import type { iTicketTemplateConfig } from '@/components/ticket-templates/interfaces';
import { downloadTicketPDF, getTicketPDFAsBase64 } from '@/lib/utils/ticket-template';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template/configTemplate';
import toast from 'react-hot-toast';
import { Download, Mail, Eye, X } from 'lucide-react';

interface TicketPreviewProps {
	ticketData: TicketData;
	templateConfig?: Partial<iTicketTemplateConfig>;
	onDownload?: (filename: string) => void;
	onEmail?: (pdfBase64: string) => void;
	showActions?: boolean;
	className?: string;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({
	ticketData,
	templateConfig,
	onDownload,
	onEmail,
	showActions = true,
	className = '',
}) => {
	const ticketRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const config = {
		...getDefaultTemplateConfig(),
		...(templateConfig || {}),
	};

	const handleDownload = async () => {
		if (!ticketRef.current) {
			toast.error('Ticket element not found');
			return;
		}

		setIsLoading(true);
		try {
			const filename = `tiket-${ticketData.ticket_code}.pdf`;
			await downloadTicketPDF(ticketRef.current, ticketData, filename);
			toast.success('Tiket berhasil diunduh!');
			onDownload?.(filename);
		} catch (error) {
			console.error('Error downloading ticket:', error);
			toast.error('Gagal mengunduh tiket');
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmail = async () => {
		if (!ticketRef.current) {
			toast.error('Ticket element not found');
			return;
		}

		setIsLoading(true);
		try {
			const pdfBase64 = await getTicketPDFAsBase64(ticketRef.current, ticketData);
			toast.success('Tiket siap dikirim via email!');
			onEmail?.(pdfBase64);
		} catch (error) {
			console.error('Error preparing ticket for email:', error);
			toast.error('Gagal menyiapkan tiket untuk email');
		} finally {
			setIsLoading(false);
		}
	};

	// Fullscreen modal
	if (isFullscreen) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4">
				<div className="mb-4 flex justify-end">
					<button
						onClick={() => setIsFullscreen(false)}
						className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
					>
						<X size={24} />
					</button>
				</div>
				<div className="flex-1 overflow-auto">
					<div className="mx-auto flex justify-center py-8">
						<div ref={ticketRef} className="print:w-full">
							<TicketTemplate ticket={ticketData} config={config} />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			{/* Ticket Preview */}
			<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
				<div ref={ticketRef} className="mx-auto max-w-[800px]">
					<TicketTemplate ticket={ticketData} config={config} />
				</div>
			</div>

			{/* Action Buttons */}
			{showActions && (
				<div className="flex flex-wrap gap-3">
					{/* Fullscreen Button */}
					<button
						onClick={() => setIsFullscreen(true)}
						disabled={isLoading}
						className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
					>
						<Eye size={18} />
						<span>Fullscreen</span>
					</button>

					{/* Download Button */}
					<button
						onClick={handleDownload}
						disabled={isLoading}
						className="flex items-center gap-2 rounded-lg bg-c-blue px-4 py-2 font-medium text-white hover:bg-c-blue-dark disabled:opacity-50"
					>
						<Download size={18} />
						<span>{isLoading ? 'Mengunduh...' : 'Unduh PDF'}</span>
					</button>

					{/* Email Button */}
					<button
						onClick={handleEmail}
						disabled={isLoading}
						className="flex items-center gap-2 rounded-lg bg-c-orange px-4 py-2 font-medium text-white hover:bg-c-orange-dark disabled:opacity-50"
					>
						<Mail size={18} />
						<span>{isLoading ? 'Menyiapkan...' : 'Kirim Email'}</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default TicketPreview;
