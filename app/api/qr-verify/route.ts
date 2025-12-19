import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const ticketCode = searchParams.get("code");

		if (!ticketCode) {
			return NextResponse.json({ error: "Ticket code is required" }, { status: 400 });
		}

		const KEY_API = process.env.KEY_API;
		const BASE_API = process.env.BASE_API;

		if (!KEY_API || !BASE_API) {
			return NextResponse.json({ error: "API configuration missing" }, { status: 500 });
		}

		// Find the ticket-detail by ticket_code, and populate all its relations deeply
		const response = await fetch(
			`${BASE_API}/api/ticket-details?filters[ticket_code][$eq]=${ticketCode}&populate=deep`,
			{
				headers: {
					Authorization: `Bearer ${KEY_API}`,
				},
				cache: 'no-store', // Ensure fresh data is fetched every time
			},
		);

		if (!response.ok) {
			throw new Error("Failed to communicate with Strapi");
		}

		const data = await response.json();

		if (!data.data || data.data.length === 0) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		const ticketDetail = data.data[0];

		// Additionally, check the payment status of the parent transaction ticket
		const transactionId = ticketDetail.attributes.transaction_ticket?.data?.id;
		if (transactionId) {
			const transactionResponse = await fetch(`${BASE_API}/api/transaction-tickets/${transactionId}`, {
				headers: { Authorization: `Bearer ${KEY_API}` },
			});
			const transactionData = await transactionResponse.json();
			const paymentStatus = transactionData.data?.attributes?.payment_status;
			
			if (paymentStatus !== 'success' && paymentStatus !== 'settlement') {
				return NextResponse.json({ error: `Payment not complete. Status: ${paymentStatus}` }, { status: 402 }); // 402 Payment Required
			}
		} else {
			return NextResponse.json({ error: "Associated transaction not found" }, { status: 404 });
		}


		return NextResponse.json({
			success: true,
			data: ticketDetail,
		});

	} catch (err: any) {
		console.error("Error in QR verification GET:", err);
		return NextResponse.json({
			error: err.message || "Unknown error",
		}, { status: 500 });
	}
}
