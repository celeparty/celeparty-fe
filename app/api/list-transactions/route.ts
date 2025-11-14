import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
		}

		// Get all transactions
		const response = await fetch(`${BASE_API}/api/transaction-tickets`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{
					error: "Failed to fetch transactions",
					status: response.status,
					data: data,
				},
				{ status: response.status },
			);
		}

		// Filter only pending transactions for testing
		const pendingTransactions = data.data?.filter((t: any) => t.payment_status === "pending") || [];

		return NextResponse.json({
			success: true,
			total_transactions: data.data?.length || 0,
			pending_transactions: pendingTransactions.length,
			all_transactions:
				data.data?.map((t: any) => ({
					id: t.id,
					order_id: t.order_id,
					payment_status: t.payment_status,
					customer_name: t.customer_name,
					customer_mail: t.customer_mail,
					product_name: t.product_name,
				})) || [],
			pending_list: pendingTransactions.map((t: any) => ({
				id: t.id,
				order_id: t.order_id,
				payment_status: t.payment_status,
				customer_name: t.customer_name,
				customer_mail: t.customer_mail,
				product_name: t.product_name,
			})),
		});
	} catch (error: any) {
		console.error("List transactions error:", error);
		return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
	}
}
