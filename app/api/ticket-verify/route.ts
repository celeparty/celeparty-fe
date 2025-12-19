import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { ticket_code } = await req.json();

		if (!ticket_code) {
			return NextResponse.json({ error: "ticket_code is required" }, { status: 400 });
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			console.error("Missing Strapi environment variables");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// 1. Find the ticket-detail by ticket_code
		const findResponse = await fetch(
			`${BASE_API}/api/ticket-details?filters[ticket_code][$eq]=${ticket_code}`,
			{
				headers: {
					Authorization: `Bearer ${KEY_API}`,
				},
			},
		);

		if (!findResponse.ok) {
			throw new Error("Failed to search for ticket-detail");
		}

		const findData = await findResponse.json();

		if (!findData.data || findData.data.length === 0) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		const ticketDetailId = findData.data[0].id;
		const currentStatus = findData.data[0].attributes;

		if (currentStatus.is_verified) {
			return NextResponse.json(
				{ success: false, message: "Ticket has already been verified" },
				{ status: 409 }, // 409 Conflict
			);
		}

		// 2. Update the ticket-detail to set is_verified to true
		const updateResponse = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({
				data: {
					is_verified: true,
					verified_at: new Date().toISOString(),
				},
			}),
		});

		if (!updateResponse.ok) {
			const errorData = await updateResponse.json();
			console.error("Failed to update ticket-detail:", errorData);
			throw new Error("Failed to update ticket status in Strapi");
		}

		return NextResponse.json({ success: true, message: "Ticket verified successfully" });
	} catch (error) {
		console.error("Error in ticket verification:", error);
		const errorMessage = error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
