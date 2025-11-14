import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
		}

		// Test 1: Basic connection to Strapi

		const basicResponse = await fetch(`${BASE_API}/api/transaction-tickets`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const basicData = await basicResponse.json();

		// Test 2: Try to get a specific transaction
		if (basicData.data && basicData.data.length > 0) {
			const firstTransaction = basicData.data[0];

			const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${firstTransaction.id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${KEY_API}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: {
						payment_status: firstTransaction.payment_status, // Keep same status
					},
				}),
			});

			const updateData = await updateResponse.json();

			return NextResponse.json({
				success: true,
				basic_test: {
					status: basicResponse.status,
					data: basicData,
				},
				update_test: {
					status: updateResponse.status,
					data: updateData,
					transaction_id: firstTransaction.id,
				},
			});
		}

		return NextResponse.json({
			success: true,
			basic_test: {
				status: basicResponse.status,
				data: basicData,
			},
			message: "No transactions found to test update",
		});
	} catch (error: any) {
		console.error("Test Strapi connection error:", error);
		return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
	}
}
