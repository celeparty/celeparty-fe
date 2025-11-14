import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const order_id = searchParams.get("order_id");

		if (!order_id) {
			return NextResponse.json({ error: "Order ID is required", status: 400 });
		}

		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment", status: 500 });
		}

		// Try to find in transactions table first
		const TRANSACTIONS_URL = `${process.env.BASE_API}/api/transactions`;

		const transactionsRes = await fetch(`${TRANSACTIONS_URL}?filters[order_id]=${order_id}`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const transactionsData = await transactionsRes.json();

		if (transactionsRes.ok && transactionsData?.data?.length > 0) {
			const transaction = transactionsData.data[0];

			return NextResponse.json({
				success: true,
				data: transaction,
			});
		}

		// If not found in transactions, try transaction-tickets table
		const TICKETS_URL = `${process.env.BASE_API}/api/transaction-tickets`;

		const ticketsRes = await fetch(`${TICKETS_URL}?filters[order_id]=${order_id}`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const ticketsData = await ticketsRes.json();

		if (ticketsRes.ok && ticketsData?.data?.length > 0) {
			const ticket = ticketsData.data[0];

			return NextResponse.json({
				success: true,
				data: ticket,
			});
		}

		// If not found in both tables
		return NextResponse.json({ error: "Transaction not found in both tables", status: 404 });
	} catch (err: any) {
		console.error("Error in QR verification GET:", err);
		return NextResponse.json({
			error: err.message || "Unknown error",
			status: 500,
		});
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { ticket_code } = body;

		if (!ticket_code) {
			return NextResponse.json({ error: "Ticket code is required", status: 400 });
		}

		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment", status: 500 });
		}

		// Try to find in transaction-tickets table using unique_token
		const TICKETS_URL = `${process.env.BASE_API}/api/transaction-tickets`;
		const ticketsRes = await fetch(`${TICKETS_URL}?filters[unique_token][$eq]=${ticket_code}&populate=*`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const ticketsData = await ticketsRes.json();

		if (!ticketsRes.ok || !ticketsData?.data || ticketsData.data.length === 0) {
			return NextResponse.json({ error: "Ticket not found", status: 404 });
		}

		const ticket = ticketsData.data[0];

		// Check payment status
		if (ticket.payment_status !== "settlement" && ticket.payment_status !== "paid") {
			return NextResponse.json({
				error: `Payment status is not settlement/paid. Current status: ${ticket.payment_status}`,
				status: 400,
			});
		}

		// Check if already verified
		if (ticket.verification) {
			return NextResponse.json({
				error: "Ticket already verified",
				status: 400,
			});
		}

		// Update verification status
		const updateRes = await fetch(`${TICKETS_URL}/${ticket.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({
				data: { verification: true },
			}),
		});

		const updateData = await updateRes.json();

		if (!updateRes.ok) {
			console.error("Update failed with status:", updateRes.status);
			console.error("Update error details:", updateData);
			return NextResponse.json(
				{
					error: "Failed to update verification",
					status: updateRes.status,
					details: updateData,
				},
				{ status: updateRes.status },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Ticket verified successfully",
			data: updateData.data,
		});
	} catch (err: any) {
		console.error("Error in QR verification POST:", err);
		return NextResponse.json({
			error: err.message || "Unknown error",
			status: 500,
		});
	}
}
