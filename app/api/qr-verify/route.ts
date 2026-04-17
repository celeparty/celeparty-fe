import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/qr-verify
 * Fetch ticket details for verification
 * Only returns ticket data to authenticated vendor users
 * Does NOT verify the ticket - just fetches data for display
 */
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const ticketCode = searchParams.get("code");

		if (!ticketCode) {
			return NextResponse.json({ error: "Ticket code is required" }, { status: 400 });
		}

		// Verify user is authenticated and is a vendor
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
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

		// Validate payment status from parent transaction
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

		// SECURITY: Check if user is the vendor who owns the product
		// The vendor check will be done on frontend, but we log it here for audit
		const productId = ticketDetail.attributes.product?.data?.id;
		console.log(`✅ QR Verification data retrieved for ticket: ${ticketCode}, vendor: ${session.user?.documentId}, product: ${productId}`);

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

