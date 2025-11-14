import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { documentId } = body;

		if (!documentId) {
			return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
		}

		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}

		// Try to find the document in transactions table first
		const TRANSACTIONS_URL = `${process.env.BASE_API}/api/transactions/${documentId}`;

		const transactionsRes = await fetch(TRANSACTIONS_URL, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		if (transactionsRes.ok) {
			// Document found in transactions table

			const updateRes = await fetch(TRANSACTIONS_URL, {
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
				return NextResponse.json(
					{
						error: "Failed to update verification in transactions",
						status: updateRes.status,
						details: updateData,
					},
					{ status: updateRes.status },
				);
			}

			return NextResponse.json({
				success: true,
				message: "Verification updated successfully in transactions",
				data: updateData.data,
			});
		}

		// If not found in transactions, try transaction-tickets table
		const TICKETS_URL = `${process.env.BASE_API}/api/transaction-tickets/${documentId}`;

		const ticketsRes = await fetch(TICKETS_URL, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		if (ticketsRes.ok) {
			// Document found in transaction-tickets table

			const updateRes = await fetch(TICKETS_URL, {
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
				return NextResponse.json(
					{
						error: "Failed to update verification in transaction-tickets",
						status: updateRes.status,
						details: updateData,
					},
					{ status: updateRes.status },
				);
			}

			return NextResponse.json({
				success: true,
				message: "Verification updated successfully in transaction-tickets",
				data: updateData.data,
			});
		}

		// If not found in both tables
		return NextResponse.json(
			{
				error: "Document not found in both transactions and transaction-tickets tables",
				status: 404,
			},
			{ status: 404 },
		);
	} catch (err: any) {
		console.error("Error updating verification:", err);
		return NextResponse.json({
			error: err.message || "Unknown error",
			status: 500,
		});
	}
}
