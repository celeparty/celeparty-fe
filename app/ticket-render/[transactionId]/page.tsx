/**
 * Server Component page for rendering a single e-ticket.
 * This page is intended to be used by Puppeteer for PDF generation.
 * It fetches the complete ticket data and renders the TicketTemplate.
 */

import { TicketTemplate } from '@/components/ticket-templates/TicketTemplate';
import { iTicketTemplateData } from '@/components/ticket-templates/interfaces';
import { axiosUser } from '@/lib/services';
import { notFound } from 'next/navigation';
import React from 'react';

// Helper function to get the base URL for server-side fetching
function getBaseUrl() {
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	// Assume localhost for local development
	return 'http://localhost:3000';
}

// This function fetches the data for a single transaction ticket
async function getTicketData(transactionId: string): Promise<iTicketTemplateData | null> {
	try {
		const baseUrl = getBaseUrl();
		
		// The new unified endpoint for transactions.
		// We populate all nested fields required for the ticket template.
		const populateString = "populate[order_items][populate][product]=*&populate[order_items][populate][variant]=*&populate=recipients";
		const response = await fetch(`${baseUrl}/api/transactions/${transactionId}?${populateString}`, {
			cache: 'no-store', // Ensure fresh data for every PDF generation
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch transaction data: ${response.statusText}`);
		}

		const result = await response.json();
		
		const transaction = result.data;

		if (!transaction) {
			return null;
		}
		
		const attributes = transaction.attributes;
		const orderItem = attributes.order_items?.data?.[0]?.attributes;
		const product = orderItem?.product?.data?.attributes;
		const variant = orderItem?.variant?.data?.attributes;
		const recipient = attributes.recipients?.[0]; // Assuming the first recipient is the primary for the ticket

		if (!product || !variant || !recipient) {
			console.error("Incomplete data for ticket rendering:", { product, variant, recipient });
			return null;
		}

		// Normalize the data to match the iTicketTemplateData interface
		const normalizedData: iTicketTemplateData = {
			product_title: product.title,
			ticket_code: recipient.ticket_code || attributes.order_id,
			variant_name: variant.name,
			event_date: product.event_date,
			event_location: product.lokasi_event,
			product_description: product.description,
			recipient_name: recipient.name || attributes.customer_name,
			recipient_email: recipient.email || attributes.email,
			recipient_phone: recipient.phone || attributes.telp,
			recipient_identity_type: recipient.identity_type,
			recipient_identity_number: recipient.identity_number,
			qr_code_data: recipient.ticket_code || attributes.order_id, // The QR code should contain the unique ticket code
			generated_date: new Date(),
		};

		return normalizedData;
	} catch (error) {
		console.error('Error in getTicketData:', error);
		return null;
	}
}

interface PageProps {
	params: {
		transactionId: string;
	};
}

export default async function TicketRenderPage({ params }: PageProps) {
	const { transactionId } = params;
	const ticketData = await getTicketData(transactionId);

	if (!ticketData) {
		return notFound();
	}

	return (
		<main>
			<TicketTemplate
				data={ticketData}
				config={{
					primary_color: '#3E2882',
					accent_color: '#DA7E01',
					company_name: 'Celeparty',
					logo_url: `${getBaseUrl()}/images/logo.png`,
					company_phone: '+62 812 3456 7890',
					contact_info: {
						phone: '+62 812 3456 7890',
						email: 'support@celeparty.com',
						instagram: 'celeparty.id',
					},
					show_qr_code: true,
					show_footer_line: true,
					show_social_media: true,
				}}
			/>
		</main>
	);
}
