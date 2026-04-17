import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("🔵 [transaction-proxy] POST received");
		console.log("📦 [transaction-proxy] Payload:", JSON.stringify(body, null, 2));
		
		// Ensure we call the Strapi API path. Normalize BASE_API so it works whether it includes /api or not.
		const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");
		const STRAPI_URL = `${baseApi}/api/transactions`;
		console.log("🔗 [transaction-proxy] URL:", STRAPI_URL);
		
		// Ensure payload is wrapped in `data` (Strapi V4 expects that format)
		let forwardedBody: any = body;
		if (body && typeof body === "object" && !Object.prototype.hasOwnProperty.call(body, "data")) {
			console.warn("[transaction-proxy] ⚠️ Request missing data wrapper, wrapping automatically.");
			forwardedBody = { data: body };
		}

		const KEY_API = process.env.KEY_API;
		if (!KEY_API) {
			console.error("❌ [transaction-proxy] ERROR: KEY_API not set");
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}
		console.log(`✅ [transaction-proxy] KEY_API present (length: ${KEY_API.length})`);
		console.log("📤 [transaction-proxy] Sending to Strapi with Authorization header");

		const strapiRes = await fetch(STRAPI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify(forwardedBody),
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
	// Normalize BASE_API so it works whether env includes /api or not.
	const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");
	const STRAPI_URL = `${baseApi}/api/transactions/${id}`;
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

		// Normalize BASE_API so it works whether env includes /api or not
		const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");

		// Try to support multiple incoming shapes:
		// 1) Simplified params: vendor_doc_id, event_type, pageSize, page, sort OR email for customers
		// 2) Strapi-style params: filters[vendor_doc_id][$eq]=..., filters[email][$eq]=..., etc.
		const vendorDocId = searchParams.get('vendor_doc_id') || searchParams.get('filters[vendor_doc_id][$eq]');
		const customerEmail = searchParams.get('email') || searchParams.get('filters[email][$eq]');
		const eventType = searchParams.get('event_type') || searchParams.get('filters[event_type][$eq]');
		const pageSize = searchParams.get('pageSize') || searchParams.get('pagination[pageSize]') || '100';
		const page = searchParams.get('page') || searchParams.get('pagination[page]') || '1';
		const sort = searchParams.get('sort') || 'createdAt:desc';

		console.log("[TransactionProxy GET] Extracted params:", { vendorDocId, customerEmail, eventType, pageSize, page, sort });

		// Check if either vendor_doc_id or email (for customers) is provided
		if (!vendorDocId && !customerEmail) {
			console.error("[TransactionProxy GET] Missing both vendor_doc_id and email parameters");
			return NextResponse.json(
				{ error: "Missing vendor_doc_id or email parameter", statusCode: 400 },
				{ status: 400 }
			);
		}

		// If the client already sent Strapi-style filters/pagination, forward the query as-is.
		const hasStrapiFilters = Array.from(searchParams.keys()).some((k) => k.startsWith('filters[') || k.startsWith('pagination['));

		let strapiUrl = "";

		if (hasStrapiFilters) {
			// Forward Strapi-style query as-is
			const queryString = url.searchParams.toString();
			strapiUrl = `${baseApi}/api/transactions?${queryString}&populate=*`;
		} else {
			// Build proper Strapi URL with correct filter syntax
			let strapiUrlLocal = `${baseApi}/api/transactions?`;
			
			// Add filter for vendor or customer
			if (vendorDocId) {
				strapiUrlLocal += `filters[vendor_doc_id][$eq]=${encodeURIComponent(vendorDocId)}&`;
			} else if (customerEmail) {
				// For customers, filter by email
				strapiUrlLocal += `filters[email][$eq]=${encodeURIComponent(customerEmail)}&`;
			}
			
			if (eventType) {
				strapiUrlLocal += `filters[event_type][$eq]=${encodeURIComponent(eventType)}&`;
			}
			// Add pagination and sort
			strapiUrlLocal += `pagination[pageSize]=${encodeURIComponent(pageSize)}&`;
			strapiUrlLocal += `pagination[page]=${encodeURIComponent(page)}&`;
			strapiUrlLocal += `sort=${encodeURIComponent(sort)}&`;
			strapiUrlLocal += `populate=*`;
			strapiUrl = strapiUrlLocal;
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
