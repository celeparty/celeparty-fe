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
		
		// The proxy route will handle populating the necessary fields.
		// We just need to filter by the specific transaction ID.
		const response = await fetch(`${baseUrl}/api/transaction-tickets-proxy?filters[id][$eq]=${transactionId}`, {
			cache: 'no-store', // Ensure fresh data for every PDF generation
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ticket data: ${response.statusText}`);
		}

		const result = await response.json();
		
		// The API returns an array, so we take the first element
		const ticket = result.data?.[0];

		if (!ticket) {
			return null;
		}

		// Normalize the data to match the iTicketTemplateData interface
		const normalizedData: iTicketTemplateData = {
			product_title: ticket.attributes.product?.data?.attributes.title,
			ticket_code: ticket.attributes.recipients?.[0]?.ticket_code || ticket.attributes.order_id, // Use first recipient's code or order_id
			variant_name: ticket.attributes.variant?.data?.attributes.name,
			event_date: ticket.attributes.product?.data?.attributes.event_date,
			event_location: ticket.attributes.product?.data?.attributes.location,
			product_description: ticket.attributes.product?.data?.attributes.description,
			recipient_name: ticket.attributes.recipients?.[0]?.name || ticket.attributes.customer_name,
			recipient_email: ticket.attributes.recipients?.[0]?.email || ticket.attributes.customer_mail,
			recipient_phone: ticket.attributes.recipients?.[0]?.phone || ticket.attributes.telp,
			recipient_identity_type: ticket.attributes.recipients?.[0]?.identity_type,
			recipient_identity_number: ticket.attributes.recipients?.[0]?.identity_number,
			qr_code_data: ticket.attributes.recipients?.[0]?.ticket_code || ticket.attributes.order_id,
			generated_date: new Date().toISOString(),
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
				}}
			/>
		</main>
	);
}
