
import TicketTemplate from '@/components/ticket-templates/TicketTemplate';
import { TicketData } from '@/components/ticket-templates/interfaces';
import { getDefaultTemplateConfig } from '@/lib/utils/ticket-template/configTemplate';
import { notFound } from 'next/navigation';

// Helper to get the base URL for server-side fetching
function getBaseUrl() {
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * --- FETCHER 1: For Transaction Based Tickets ---
 * Fetches data from the transaction endpoint and normalizes it for the template.
 */
async function getByTransactionId(transactionId: string): Promise<TicketData | null> {
	try {
		const baseUrl = getBaseUrl();
		const populateString = "populate[order_items][populate][product]=*&populate[order_items][populate][variant]=*&populate=recipients";
		const response = await fetch(`${baseUrl}/api/transactions/${transactionId}?${populateString}`, {
			cache: 'no-store', // Ensure fresh data for every generation
		});

		if (!response.ok) {
			console.error(`Failed to fetch transaction data: ${response.statusText}`);
			return null;
		}

		const result = await response.json();
		const transaction = result.data;

		if (!transaction) return null;

		const attributes = transaction.attributes;
		const orderItem = attributes.order_items?.data?.[0]?.attributes;
		const product = orderItem?.product?.data?.attributes;
		const variant = orderItem?.variant?.data?.attributes;
		const recipient = attributes.recipients?.[0];

		if (!product || !variant || !recipient) {
			console.error("Incomplete data from transaction for ticket rendering:", { product, variant, recipient });
			return null;
		}

		const normalizedData: TicketData = {
			ticket_code: recipient.ticket_code || attributes.order_id,
		    barcode_url: recipient.barcode_url,
		    recipient_name: recipient.name,
		    recipient_email: recipient.email,
		    createdAt: recipient.createdAt,
				  
		    ticket_product: {
		      id: product.id,
		      attributes: {
		        name: product.title,
		        description: product.description,
		        date: product.event_date,
		        location: product.location,
		      },
		    },
  	  
		    transaction_ticket: {
		      id: transaction.id,
		      attributes: {
		        order_id: attributes.order_id,
		        total_price: attributes.total_price,
		        payment_method: attributes.payment_method,
		      },
		    },
		  };

		return normalizedData;

	} catch (error) {
		console.error('Error in getByTransactionId:', error);
		return null;
	}
}

/**
 * --- FETCHER 2: For Ticket Detail Based Tickets (Preview) ---
 * Fetches data from the ticket-details endpoint and normalizes it for the template.
 */
async function getByTicketDetailId(ticketDetailId: string): Promise<TicketData | null> {
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;

    if (!BASE_API || !KEY_API) {
        throw new Error("Missing environment variables for Strapi API");
    }

	try {
		const response = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}?populate=deep`, {
			headers: { Authorization: `Bearer ${KEY_API}` },
			cache: 'no-store',
		});

		if (!response.ok) {
			console.error("Failed to fetch ticket details");
			return null;
		}

		const result = await response.json();
        const ticketDetail = result.data.attributes;

        if (!ticketDetail) return null;
        
        // Normalize the data to match the iTicketTemplateData interface
        const normalizedData: TicketData = {
            product_title: ticketDetail.ticket_product?.data?.attributes?.name || 'Nama Event',
            ticket_code: ticketDetail.ticket_code,
            variant_name: 'Regular', // Assuming default, as it's not in the ticket-details response
            event_date: ticketDetail.ticket_product?.data?.attributes?.date,
            event_location: ticketDetail.ticket_product?.data?.attributes?.location,
            product_description: ticketDetail.ticket_product?.data?.attributes?.description,
            recipient_name: ticketDetail.recipient_name,
            recipient_email: ticketDetail.recipient_email,
            recipient_phone: ticketDetail.recipient_whatsapp,
            recipient_identity_type: ticketDetail.id_type,
            recipient_identity_number: ticketDetail.id_number,
            qr_code_data: ticketDetail.ticket_code,
            generated_date: new Date(ticketDetail.createdAt),
        };

		return normalizedData;

	} catch (error) {
		console.error('Error in getByTicketDetailId:', error);
		return null;
	}
}


// --- The Unified Page Component ---
interface PageProps {
	params: { id: string };
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UnifiedTicketRenderPage({ params, searchParams }: PageProps) {
	const { id } = params;
	const type = searchParams.type;

	let ticketData: TicketData | null = null;

	if (type === 'transaction') {
		ticketData = await getByTransactionId(id);
	} else if (type === 'detail') {
		ticketData = await getByTicketDetailId(id);
	} else {
		return <div>Error: Invalid ticket render type specified. Please use ?type=transaction or ?type=detail.</div>;
	}

	if (!ticketData) {
		return notFound();
	}

    // Use a default config for consistent appearance
	const templateConfig: TicketData = {
		...getDefaultTemplateConfig(),
		logo_url: `${getBaseUrl()}/images/logo.png`, // Ensure logo URL is absolute
	};

	return (
		<main>
			<TicketTemplate data={ticketData} config={templateConfig} />
		</main>
	);
}
