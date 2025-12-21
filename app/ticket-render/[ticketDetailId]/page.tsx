import TicketTemplate from "@/components/ticket-templates/TicketTemplate";

async function getTicketData(ticketDetailId: string) {
  const BASE_API = process.env.BASE_API;
  const KEY_API = process.env.KEY_API;

  if (!BASE_API || !KEY_API) {
    throw new Error("Missing environment variables for Strapi");
  }

  const response = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}?populate=deep`, {
    headers: {
      Authorization: `Bearer ${KEY_API}`,
    },
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ticket details");
  }

  const ticketDetail = await response.json();
  return ticketDetail.data;
}

export default async function TicketRenderPage({ params }: { params: { ticketDetailId: string } }) {
  try {
    const ticketData = await getTicketData(params.ticketDetailId);

    if (!ticketData) {
      return <div>Ticket not found</div>;
    }

    return <TicketTemplate ticket={ticketData.attributes} />;
  } catch (error) {
    console.error("Error rendering ticket:", error);
    return <div>Error rendering ticket</div>;
  }
}