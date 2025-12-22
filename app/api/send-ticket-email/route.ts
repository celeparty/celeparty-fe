import { NextRequest, NextResponse } from "next/server";

// Helper function to get the base URL for server-side fetching
function getBaseUrl() {
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT || 3000}`;
}

export async function POST(req: NextRequest) {
	try {
		const { ticketDetailId } = await req.json();

		if (!ticketDetailId) {
			return NextResponse.json({ error: "ticketDetailId is required" }, { status: 400 });
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;
        const NEXTAUTH_URL = getBaseUrl();

		if (!BASE_API || !KEY_API) {
			console.error("Missing Strapi environment variables");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// 1. Fetch ticket details to get recipient email and ticket code
		const detailResponse = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}?populate=ticket_product`, {
			headers: { Authorization: `Bearer ${KEY_API}` },
            cache: 'no-store',
		});

		if (!detailResponse.ok) {
			throw new Error("Failed to fetch ticket details from Strapi");
		}
		const ticketDetail = await detailResponse.json();
		const { recipient_email, ticket_code, ticket_product } = ticketDetail.data.attributes;
		const eventName = ticket_product.data.attributes.name;

		// 2. Fetch the generated PDF from our own API route
        // NOTE: The PDF generation route expects a `transactionId`. We are using `ticketDetailId` as the
        // transactionId here based on the previous logic. This might need adjustment if they are different.
		const pdfResponse = await fetch(`${NEXTAUTH_URL}/api/generate-ticket-pdf`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ transactionId: ticketDetailId }),
		});

		if (!pdfResponse.ok) {
			throw new Error("Failed to generate PDF from internal API");
		}
		const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

		// 3. Construct email content
		const subject = `E-Ticket Anda untuk Acara: ${eventName}`;
		const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Konfirmasi E-Ticket Celeparty</h2>
          <p>Yth. Bapak/Ibu,</p>
          <p>Terima kasih telah melakukan transaksi di Celeparty.com. Bersama email ini, kami lampirkan e-ticket Anda yang sah untuk acara:</p>
          <p><strong>${eventName}</strong></p>
          <p>E-ticket ini adalah bukti sah Anda untuk memasuki area acara. Mohon simpan baik-baik dan tunjukkan kepada petugas di lokasi.</p>
          <p>Detail lengkap acara dan data Anda tertera pada file PDF yang kami lampirkan.</p>
          <br>
          <p>Hormat kami,</p>
          <p><strong>Tim Celeparty</strong></p>
        </div>
      `;

        // 4. Prepare the payload for Strapi's email service
        const strapiPayload = {
            to: recipient_email,
            subject: subject,
            html: html,
            attachments: [
                {
                    filename: `e-ticket-${ticket_code}.pdf`,
                    content: pdfBase64,
                    encoding: 'base64',
                    contentType: "application/pdf",
                }
            ],
        };

		// 5. Send the email via Strapi's email endpoint
        // This presumes Strapi has an endpoint like `/api/email/send` that accepts this payload.
		const strapiEmailResponse = await fetch(`${BASE_API}/api/email`, {
			method: 'POST',
			headers: {
                'Content-Type': 'application/json',
				'Authorization': `Bearer ${KEY_API}`,
			},
			body: JSON.stringify(strapiPayload),
		});

		if (!strapiEmailResponse.ok) {
            const errorBody = await strapiEmailResponse.text();
			throw new Error(`Failed to send email via Strapi: ${strapiEmailResponse.statusText} - ${errorBody}`);
		}

		return NextResponse.json({ success: true, message: "Email sent successfully via Strapi" });

	} catch (error) {
		console.error("Error sending ticket email:", error);
		const errorMessage = error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
