/**
 * Utility untuk Generate PDF dari Ticket Template
 * Menggunakan html2canvas dan jsPDF untuk konversi ke PDF
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { iPDFGenerateOptions, iTicketTemplateData } from '@/components/ticket-templates/interfaces';

/**
 * Generate PDF dari elemen HTML
 * @param element - HTML element yang akan di-convert ke PDF
 * @param options - Opsi untuk generate PDF
 * @returns Promise dengan hasil PDF (base64 atau download)
 */
export const generateTicketPDF = async (
	element: HTMLElement,
	ticketData: iTicketTemplateData,
	options: iPDFGenerateOptions = {}
): Promise<string | void> => {
	try {
		const {
			filename = `tiket-${ticketData.ticket_code}.pdf`,
			scale = 2,
			quality = 100,
			format = 'A4',
			orientation = 'portrait',
			download = true,
			returnBase64 = false,
		} = options;

		// Convert HTML to Canvas
		const canvas = await html2canvas(element, {
			scale,
			logging: false,
			useCORS: true,
			allowTaint: true,
			backgroundColor: '#ffffff',
		});

		// Get canvas dimensions
		const imgWidth = orientation === 'landscape' ? 297 : 210; // A4 width in mm
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		// Create PDF
		const pdf = new jsPDF({
			orientation,
			unit: 'mm',
			format,
		});

		// Add image to PDF
		const pageHeight = pdf.internal.pageSize.getHeight();
		const pageWidth = pdf.internal.pageSize.getWidth();
		const margin = 10;
		const availableWidth = pageWidth - margin * 2;

		const imgData = canvas.toDataURL('image/png');
		const scaledImgHeight = (availableWidth * canvas.height) / canvas.width;

		let heightLeft = scaledImgHeight;
		let position = margin;

		// Add first page
		pdf.addImage(imgData, 'PNG', margin, position, availableWidth, scaledImgHeight);
		heightLeft -= pageHeight - margin * 2;

		// Add additional pages if needed
		while (heightLeft > 0) {
			position = heightLeft - scaledImgHeight;
			pdf.addPage();
			pdf.addImage(imgData, 'PNG', margin, position, availableWidth, scaledImgHeight);
			heightLeft -= pageHeight;
		}

		// Download atau return base64
		if (returnBase64) {
			return pdf.output('datauristring');
		} else if (download) {
			pdf.save(filename);
		}

		return undefined;
	} catch (error) {
		console.error('Error generating PDF:', error);
		throw error;
	}
};

/**
 * Generate multiple ticket PDFs
 * @param elements - Array of HTML elements
 * @param ticketsData - Array of ticket data
 * @param options - PDF options
 * @returns Promise dengan array dari base64 strings
 */
export const generateMultipleTicketPDFs = async (
	elements: HTMLElement[],
	ticketsData: iTicketTemplateData[],
	options: iPDFGenerateOptions = {}
): Promise<string[]> => {
	try {
		const results: string[] = [];

		for (let i = 0; i < elements.length; i++) {
			const result = await generateTicketPDF(
				elements[i],
				ticketsData[i],
				{
					...options,
					download: false,
					returnBase64: true,
				}
			);

			if (result && typeof result === 'string') {
				results.push(result);
			}
		}

		return results;
	} catch (error) {
		console.error('Error generating multiple PDFs:', error);
		throw error;
	}
};

/**
 * Download ticket PDF
 * @param element - HTML element
 * @param ticketData - Ticket data
 * @param filename - Nama file PDF
 */
export const downloadTicketPDF = async (
	element: HTMLElement,
	ticketData: iTicketTemplateData,
	filename?: string
): Promise<void> => {
	await generateTicketPDF(element, ticketData, {
		filename,
		download: true,
		returnBase64: false,
	});
};

/**
 * Get ticket PDF as base64
 * @param element - HTML element
 * @param ticketData - Ticket data
 * @returns Base64 string dari PDF
 */
export const getTicketPDFAsBase64 = async (
	element: HTMLElement,
	ticketData: iTicketTemplateData
): Promise<string> => {
	const result = await generateTicketPDF(element, ticketData, {
		download: false,
		returnBase64: true,
	});

	return result || '';
};

/**
 * Get ticket PDF as Blob
 * @param element - HTML element
 * @param ticketData - Ticket data
 * @returns Blob dari PDF
 */
export const getTicketPDFAsBlob = async (
	element: HTMLElement,
	ticketData: iTicketTemplateData
): Promise<Blob> => {
	try {
		const canvas = await html2canvas(element, {
			scale: 2,
			logging: false,
			useCORS: true,
			backgroundColor: '#ffffff',
		});

		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'A4',
		});

		const imgWidth = 210; // A4 width in mm
		const pageHeight = pdf.internal.pageSize.getHeight();
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		const margin = 10;

		const imgData = canvas.toDataURL('image/png');
		const scaledImgHeight = imgHeight - margin * 2;

		pdf.addImage(imgData, 'PNG', margin, margin, imgWidth - margin * 2, scaledImgHeight);

		return pdf.output('blob') as Blob;
	} catch (error) {
		console.error('Error generating PDF blob:', error);
		throw error;
	}
};
