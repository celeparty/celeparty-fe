import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json(
				{
					error: "KEY_API not set in environment",
					debug: {
						BASE_API: process.env.BASE_API,
						KEY_API: "NOT SET",
					},
				},
				{ status: 500 },
			);
		}

		// Test basic connection
		const strapiRes = await fetch(STRAPI_URL, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const data = await strapiRes.json();

		return NextResponse.json({
			status: strapiRes.status,
			ok: strapiRes.ok,
			data: data,
			debug: {
				BASE_API: process.env.BASE_API,
				KEY_API: "SET",
				STRAPI_URL,
			},
		});
	} catch (err: any) {
		console.error("Error in debug transaction-tickets-proxy:", err);
		return NextResponse.json(
			{
				error: err.message || "Unknown error",
				debug: {
					BASE_API: process.env.BASE_API,
					KEY_API: process.env.KEY_API ? "SET" : "NOT SET",
				},
			},
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json(
				{
					error: "KEY_API not set in environment",
					debug: {
						BASE_API: process.env.BASE_API,
						KEY_API: "NOT SET",
					},
				},
				{ status: 500 },
			);
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

		return NextResponse.json({
			status: strapiRes.status,
			ok: strapiRes.ok,
			data: data,
			debug: {
				BASE_API: process.env.BASE_API,
				KEY_API: "SET",
				STRAPI_URL,
				requestBody: body,
			},
		});
	} catch (err: any) {
		console.error("Error in debug POST transaction-tickets-proxy:", err);
		return NextResponse.json(
			{
				error: err.message || "Unknown error",
				debug: {
					BASE_API: process.env.BASE_API,
					KEY_API: process.env.KEY_API ? "SET" : "NOT SET",
				},
			},
			{ status: 500 },
		);
	}
}
