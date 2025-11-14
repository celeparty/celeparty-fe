import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Test environment variables

		const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}

		const strapiRes = await fetch(STRAPI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify(body),
		});

		const data = await strapiRes.json();

		if (!strapiRes.ok) {
			return NextResponse.json(
				{
					error: data.error || data,
					status: strapiRes.status,
					details: data,
				},
				{ status: strapiRes.status },
			);
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("Error in test endpoint:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}
