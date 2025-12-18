import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
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
		console.error("Error in POST transaction-tickets-proxy:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { id, data } = body;
		if (!id) {
			return NextResponse.json({ error: "Missing transaction-ticket id." }, { status: 400 });
		}
		const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets/${id}`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}

		const strapiRes = await fetch(STRAPI_URL, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({ data }),
		});

		const resData = await strapiRes.json();

		if (!strapiRes.ok) {
			return NextResponse.json(
				{
					error: resData.error || resData,
					status: strapiRes.status,
					details: resData,
				},
				{ status: strapiRes.status },
			);
		}
		return NextResponse.json(resData);
	} catch (err: any) {
		console.error("Error in PUT transaction-tickets-proxy:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		// Revert to a simpler populate to test the connection.
		searchParams.set('populate', '*');

		const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets?${searchParams.toString()}`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}

		const strapiRes = await fetch(STRAPI_URL, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const data = await strapiRes.json();
		console.log("Raw data from Strapi (transaction-tickets-proxy):", JSON.stringify(data, null, 2)); // Log raw data

		if (!strapiRes.ok) {
			return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("Error in GET transaction-tickets-proxy:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}
