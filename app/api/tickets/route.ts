import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.documentId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const KEY_API = process.env.KEY_API;
		if (!KEY_API) {
			return NextResponse.json({ error: "API key not configured" }, { status: 500 });
		}

		// Tickets stored as products with category="ticket"
		const strapiPayload = {
			...body.data,
			category: { connect: [{ name: "ticket" }] },
			users_permissions_user: { connect: [{ documentId: session.user.documentId }] },
		};

		const strapiUrl = `${process.env.BASE_API}/api/products`;
		const strapiRes = await fetch(strapiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({ data: strapiPayload }),
		});

		const data = await strapiRes.json();

		if (!strapiRes.ok) {
			console.error("[tickets POST] Strapi error:", data);
			return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
		}

		console.log("[tickets POST] Success:", data);
		return NextResponse.json(data, { status: 200 });
	} catch (err: any) {
		console.error("[tickets POST] Error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.documentId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const slug = searchParams.get("slug") || "";
		if (!slug) {
			return NextResponse.json({ error: "Slug required" }, { status: 400 });
		}

		const body = await req.json();
		const KEY_API = process.env.KEY_API;
		if (!KEY_API) {
			return NextResponse.json({ error: "API key not configured" }, { status: 500 });
		}

		// First get product to verify ownership
		const productUrl = `${process.env.BASE_API}/api/products/${slug}?populate=*`;
		const productRes = await fetch(productUrl, {
			headers: { Authorization: `Bearer ${KEY_API}` },
		});
		const productData = await productRes.json();

		if (!productRes.ok || productData.data?.attributes?.users_permissions_user?.data?.attributes?.documentId !== session.user.documentId) {
			return NextResponse.json({ error: "Not found or unauthorized" }, { status: 403 });
		}

		// Update
		const strapiUrl = `${process.env.BASE_API}/api/products/${slug}`;
		const strapiRes = await fetch(strapiUrl, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify(body),
		});

		const data = await strapiRes.json();

		if (!strapiRes.ok) {
			console.error("[tickets PUT] Strapi error:", data);
			return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
		}

		console.log("[tickets PUT] Success for slug:", slug);
		return NextResponse.json(data, { status: 200 });
	} catch (err: any) {
		console.error("[tickets PUT] Error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
