import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("Transaction Proxy - Received payload:", JSON.stringify(body, null, 2));
		
		// BASE_API already includes /api, so don't add it again
		// Strapi collectionName for transactions is plural: /transactions
		const STRAPI_URL = `${process.env.BASE_API}/transactions`;
		console.log("Transaction Proxy - Posting to:", STRAPI_URL);
		
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
		console.log("Strapi Response Status:", strapiRes.status);
		console.log("Strapi Response Data:", JSON.stringify(data, null, 2));
		
		if (!strapiRes.ok) {
			console.error("Strapi Error Response:", {
				status: strapiRes.status,
				error: data.error,
				data: data
			});
			return NextResponse.json(
				{
					error: data.error?.message || data.message || data.error || "Failed to create transaction",
					details: data,
					statusCode: strapiRes.status
				},
				{ status: strapiRes.status }
			);
		}
		return NextResponse.json(data);
	} catch (err: any) {
		console.error("Transaction Proxy Error:", err);
		return NextResponse.json(
			{
				error: err.message || "Unknown error",
				details: err.stack || err
			},
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { id, data } = body;
		if (!id) {
			return NextResponse.json({ error: "Missing transaction id." }, { status: 400 });
		}
	// BASE_API already includes /api, so don't add it again
	// Strapi collectionName for transactions is plural: /transactions
	const STRAPI_URL = `${process.env.BASE_API}/transactions/${id}`;
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
		console.error("Error in PUT transaction-proxy:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		// Set populate to get all relations
		if (!searchParams.has('populate')) {
			searchParams.set('populate', '*');
		}

	// BASE_API already includes /api, so don't add it again
	// Strapi collectionName for transactions is plural: /transactions
	const strapiUrl = `${process.env.BASE_API}/transactions?${searchParams.toString()}`;
		console.log("[TransactionProxy GET] URL:", strapiUrl);

		const KEY_API = process.env.KEY_API;
		if (!KEY_API) {
			console.error("[TransactionProxy GET] KEY_API not set");
			return NextResponse.json(
				{ error: "API key not configured", statusCode: 500 },
				{ status: 500 }
			);
		}

		const strapiRes = await fetch(strapiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
				"Content-Type": "application/json",
			},
		});

		const data = await strapiRes.json();
		console.log("[TransactionProxy GET] Status:", strapiRes.status);
		console.log("[TransactionProxy GET] Response data count:", data?.data?.length || 0);

		if (!strapiRes.ok) {
			console.error("[TransactionProxy GET] Error response:", data);
			return NextResponse.json(
				{
					error: data.error?.message || data.message || "Failed to fetch transactions",
					details: data.error || data,
					statusCode: strapiRes.status,
				},
				{ status: strapiRes.status }
			);
		}

		// Ensure response has proper structure
		if (!data.data) {
			console.warn("[TransactionProxy GET] Response missing data field");
			return NextResponse.json({
				data: [],
				meta: { pagination: { total: 0, page: 1, pageSize: 25, pageCount: 0 } },
			});
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("[TransactionProxy GET] Exception:", err.message);
		return NextResponse.json(
			{
				error: err.message || "Unknown error occurred",
				statusCode: 500,
			},
			{ status: 500 }
		);
	}
}
