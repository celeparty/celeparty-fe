import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		// Ensure populate=* is included to get all relations
		if (!searchParams.has('populate')) {
			searchParams.set('populate', '*');
		}

		// Add filter for approved state (public endpoint - no JWT needed)
		if (!searchParams.has('filters[state]')) {
			searchParams.set('filters[state][$eq]', 'approved');
		}

		const STRAPI_URL = `${process.env.BASE_API}/api/tickets?${searchParams.toString()}`;
		console.log("Constructed Strapi URL for tickets:", STRAPI_URL);
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

		if (!strapiRes.ok) {
			return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("Error in GET tickets:", err);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}
