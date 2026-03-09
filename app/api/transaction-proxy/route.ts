import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("Transaction Proxy - Received payload:", JSON.stringify(body, null, 2));
		
		// Ensure we call the Strapi API path. BASE_API is expected to be the host (e.g. https://celeparty.com)
		// so we append /api/transactions to reach the correct endpoint.
		const STRAPI_URL = `${process.env.BASE_API}/api/transactions`;
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

		const contentType = strapiRes.headers.get("content-type") || "";
		let data: any = null;
		try {
			if (contentType.includes("application/json")) {
				data = await strapiRes.json();
			} else {
				// Fallback to text for HTML/plain responses
				data = await strapiRes.text();
			}
		} catch (parseErr) {
			// If parsing fails, capture raw text
			try {
				data = await strapiRes.text();
			} catch (tErr) {
				data = `Failed to parse response body: ${String(parseErr)}`;
			}
		}

		console.log("Strapi Response Status:", strapiRes.status);
		console.log("Strapi Response Body:", contentType.includes("application/json") ? JSON.stringify(data, null, 2) : data);

		if (!strapiRes.ok) {
			console.error("Strapi Error Response:", {
				status: strapiRes.status,
				body: data,
			});
			return NextResponse.json(
				{
					error: typeof data === "object" ? data.error?.message || data.message || data.error : String(data || "Failed to create transaction"),
					details: data,
					statusCode: strapiRes.status,
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
	// Ensure we call the Strapi API path. BASE_API is expected to be the host (e.g. https://celeparty.com)
	// so we append /api/transactions to reach the correct endpoint.
	const STRAPI_URL = `${process.env.BASE_API}/api/transactions/${id}`;
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

		const contentType = strapiRes.headers.get("content-type") || "";
		let resData: any = null;
		try {
			if (contentType.includes("application/json")) {
				resData = await strapiRes.json();
			} else {
				resData = await strapiRes.text();
			}
		} catch (parseErr) {
			try {
				resData = await strapiRes.text();
			} catch (tErr) {
				resData = `Failed to parse response body: ${String(parseErr)}`;
			}
		}

		if (!strapiRes.ok) {
			return NextResponse.json(
				{
					error: typeof resData === "object" ? resData.error || resData : String(resData),
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

		console.log("[TransactionProxy GET] Full incoming URL:", req.url);
		console.log("[TransactionProxy GET] Incoming searchParams:", Array.from(searchParams.entries()));

		// Try to support two incoming shapes:
		// 1) Simplified params: vendor_doc_id, event_type, pageSize, page, sort
		// 2) Strapi-style params: filters[vendor_doc_id][$eq]=..., filters[event_type][$eq]=..., pagination[...], sort=...
		const vendorDocId = searchParams.get('vendor_doc_id') || searchParams.get('filters[vendor_doc_id][$eq]');
		const eventType = searchParams.get('event_type') || searchParams.get('filters[event_type][$eq]');
		const pageSize = searchParams.get('pageSize') || searchParams.get('pagination[pageSize]') || '100';
		const page = searchParams.get('page') || searchParams.get('pagination[page]') || '1';
		const sort = searchParams.get('sort') || 'createdAt:desc';

		console.log("[TransactionProxy GET] Extracted params:", { vendorDocId, eventType, pageSize, page, sort });

		// If the client already sent Strapi-style filters/pagination, forward the query as-is.
		const hasStrapiFilters = Array.from(searchParams.keys()).some((k) => k.startsWith('filters[') || k.startsWith('pagination['));

		if (hasStrapiFilters) {
			// Ensure vendor_doc_id exists in the provided filters
			if (!vendorDocId) {
				console.error("[TransactionProxy GET] Missing vendor_doc_id in provided filters");
				return NextResponse.json({ error: "Missing vendor_doc_id parameter in filters", statusCode: 400 }, { status: 400 });
			}

			const queryString = url.searchParams.toString();
			var strapiUrl = `${process.env.BASE_API}/api/transactions?${queryString}&populate=*`;
		} else {
			// Build proper Strapi URL with correct filter syntax
			if (!vendorDocId) {
				console.error("[TransactionProxy GET] Missing vendor_doc_id parameter");
				return NextResponse.json(
					{
						error: "Missing vendor_doc_id parameter",
						statusCode: 400,
					},
					{ status: 400 }
				);
			}

			let strapiUrlLocal = `${process.env.BASE_API}/api/transactions?`;
			// Add filters - Strapi expects: filters[field][operator]=value
			strapiUrlLocal += `filters[vendor_doc_id][$eq]=${encodeURIComponent(vendorDocId)}&`;
			if (eventType) {
				strapiUrlLocal += `filters[event_type][$eq]=${encodeURIComponent(eventType)}&`;
			}
			// Add pagination and sort
			strapiUrlLocal += `pagination[pageSize]=${encodeURIComponent(pageSize)}&`;
			strapiUrlLocal += `pagination[page]=${encodeURIComponent(page)}&`;
			strapiUrlLocal += `sort=${encodeURIComponent(sort)}&`;
			strapiUrlLocal += `populate=*`;
			var strapiUrl = strapiUrlLocal;
		}

		console.log("[TransactionProxy GET] Final Strapi URL:", strapiUrl);

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

		const contentType = strapiRes.headers.get("content-type") || "";
		let data: any = null;
		try {
			if (contentType.includes("application/json")) {
				data = await strapiRes.json();
			} else {
				data = await strapiRes.text();
			}
		} catch (parseErr) {
			try {
				data = await strapiRes.text();
			} catch (tErr) {
				data = `Failed to parse response body: ${String(parseErr)}`;
			}
		}

		console.log("[TransactionProxy GET] Status:", strapiRes.status);
		console.log("[TransactionProxy GET] Response data count:", typeof data === "object" ? data?.data?.length || 0 : 0);

		if (!strapiRes.ok) {
			console.error("[TransactionProxy GET] Error response:", {
				status: strapiRes.status,
				body: data,
			});
			return NextResponse.json(
				{
					error: typeof data === "object" ? data.error?.message || data.message || "Failed to fetch transactions" : String(data),
					details: data,
					statusCode: strapiRes.status,
				},
				{ status: strapiRes.status }
			);
		}

		// Ensure response has proper structure
		if (typeof data !== "object" || !data.data) {
			console.warn("[TransactionProxy GET] Response missing data field or not JSON");
			return NextResponse.json({
				data: [],
				meta: { pagination: { total: 0, page: 1, pageSize: 25, pageCount: 0 } },
			});
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("[TransactionProxy GET] Exception:", err.message, err.stack);
		return NextResponse.json(
			{
				error: err.message || "Unknown error occurred",
				statusCode: 500,
			},
			{ status: 500 }
		);
	}
}
