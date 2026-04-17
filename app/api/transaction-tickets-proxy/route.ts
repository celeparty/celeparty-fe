import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("🔵 [transaction-tickets-proxy] POST received");
		console.log("📦 [transaction-tickets-proxy] Payload:", JSON.stringify(body, null, 2));
		
		// Normalize BASE_API so it works whether env includes /api or not
		const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");
		const STRAPI_URL = `${baseApi}/api/transaction-tickets`;
		const KEY_API = process.env.KEY_API;

		console.log("🔗 [transaction-tickets-proxy] URL:", STRAPI_URL);

		// Ensure payload is wrapped in `data` (Strapi V4 expects that format)
		let forwardedBody: any = body;
		if (body && typeof body === "object" && !Object.prototype.hasOwnProperty.call(body, "data")) {
			console.warn("[transaction-tickets-proxy] ⚠️ Request missing data wrapper, wrapping automatically.");
			forwardedBody = { data: body };
		}

		console.log("[transaction-tickets-proxy] Payload after wrapping:", forwardedBody);

		if (!KEY_API) {
			console.error("❌ [transaction-tickets-proxy] ERROR: KEY_API not set");
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}
		console.log(`✅ [transaction-tickets-proxy] KEY_API present (length: ${KEY_API.length})`);
		console.log("📤 [transaction-tickets-proxy] Sending to Strapi...");


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
				data = await strapiRes.text();
			}
		} catch (parseErr) {
			try {
				data = await strapiRes.text();
			} catch (tErr) {
				data = `Failed to parse response body: ${String(parseErr)}`;
			}
		}

		console.log("[transaction-tickets-proxy] Strapi Response Status:", strapiRes.status);
		console.log("[transaction-tickets-proxy] Strapi Response Body:", JSON.stringify(data, null, 2));

		if (!strapiRes.ok) {
			console.error("❌ [transaction-tickets-proxy] FAILED - Status:", strapiRes.status);
			console.error("❌ [transaction-tickets-proxy] Error details:", data);
			return NextResponse.json(
				{
					error: typeof data === "object" ? data.error || data : String(data),
					status: strapiRes.status,
					details: data,
				},
				{ status: strapiRes.status },
			);
		}

		console.log("✅ [transaction-tickets-proxy] SUCCESS - Transaction created");
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
		// Normalize BASE_API so it works whether env includes /api or not
		const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");
		const STRAPI_URL = `${baseApi}/api/transaction-tickets/${id}`;
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

		console.log("[transaction-tickets-proxy GET] Full incoming URL:", req.url);
		console.log("[transaction-tickets-proxy GET] Incoming searchParams:", Array.from(searchParams.entries()));

		// Normalize BASE_API so it works whether env includes /api or not
		const baseApi = (process.env.BASE_API || "").replace(/\/api\/?$/, "");

		// Support simplified params and Strapi-style params
		const vendorDocId = searchParams.get('vendor_doc_id') || searchParams.get('filters[vendor_doc_id][$eq]');
		const customerEmail = searchParams.get('customer_mail') || searchParams.get('email') || searchParams.get('filters[customer_mail][$eq]');
		const pageSize = searchParams.get('pageSize') || searchParams.get('pagination[pageSize]') || '100';
		const page = searchParams.get('page') || searchParams.get('pagination[page]') || '1';
		const sort = searchParams.get('sort') || 'createdAt:desc';

		console.log("[transaction-tickets-proxy GET] Extracted params:", { vendorDocId, customerEmail, pageSize, page, sort });

		// If client sent Strapi-style query, forward as-is (but require vendor_doc_id or email)
		const hasStrapiFilters = Array.from(searchParams.keys()).some((k) => k.startsWith('filters[') || k.startsWith('pagination['));

		let strapiUrl = "";

		if (hasStrapiFilters) {
			// Forward Strapi-style query as-is, but ensure at least one filter is present
			if (!vendorDocId && !customerEmail) {
				console.error("[transaction-tickets-proxy GET] Missing both vendor_doc_id and customer_mail in provided filters");
				return NextResponse.json({ error: "Missing vendor_doc_id or customer_mail parameter", statusCode: 400 }, { status: 400 });
			}
			const queryString = url.searchParams.toString();
			strapiUrl = `${baseApi}/api/transaction-tickets?${queryString}&populate[product][populate]=*&populate=variant&populate=recipients`;
		} else {
			// Validate at least one filter is provided
			if (!vendorDocId && !customerEmail) {
				console.error("[transaction-tickets-proxy GET] Missing both vendor_doc_id and customer_mail parameters");
				return NextResponse.json(
					{
						error: "Missing vendor_doc_id or customer_mail parameter",
						statusCode: 400,
					},
					{ status: 400 }
				);
			}

			// Build proper Strapi URL for transaction-tickets
			let strapiUrlLocal = `${baseApi}/api/transaction-tickets?`;
			// Add filters - vendor OR customer
			if (vendorDocId) {
				strapiUrlLocal += `filters[vendor_doc_id][$eq]=${encodeURIComponent(vendorDocId)}&`;
			} else if (customerEmail) {
				// For customers, filter by customer_mail
				strapiUrlLocal += `filters[customer_mail][$eq]=${encodeURIComponent(customerEmail)}&`;
			}
			// Add pagination and sort
			strapiUrlLocal += `pagination[pageSize]=${encodeURIComponent(pageSize)}&`;
			strapiUrlLocal += `pagination[page]=${encodeURIComponent(page)}&`;
			strapiUrlLocal += `sort=${encodeURIComponent(sort)}&`;
			// Add populate for deep relations
			strapiUrlLocal += `populate[product][populate]=*&populate=variant&populate=recipients`;
			strapiUrl = strapiUrlLocal;
		}

		console.log("[transaction-tickets-proxy GET] Final Strapi URL:", strapiUrl);

		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			console.error("[transaction-tickets-proxy GET] KEY_API not set in environment");
			return NextResponse.json({ error: "KEY_API not set in environment" }, { status: 500 });
		}

		const strapiRes = await fetch(strapiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
				"Content-Type": "application/json",
			},
		});

		const data = await strapiRes.json();

		console.log("[transaction-tickets-proxy GET] Strapi response status:", strapiRes.status);
		console.log("[transaction-tickets-proxy GET] Response data count:", data?.data?.length || 0);

		if (!strapiRes.ok) {
			console.error("[transaction-tickets-proxy GET] Strapi error response:", {
				status: strapiRes.status,
				error: data.error,
				message: data.message,
				details: data
			});
			return NextResponse.json(
				{ 
					error: data.error?.message || data.error || data.message || "Failed to fetch transaction tickets",
					details: data.error || data,
					statusCode: strapiRes.status
				}, 
				{ status: strapiRes.status }
			);
		}

		// Ensure response structure is consistent
		if (!data.data) {
			console.warn("[transaction-tickets-proxy GET] Response missing data field, wrapping");
			return NextResponse.json({
				data: [],
				meta: { pagination: { total: 0, page: 1, pageSize: 25, pageCount: 0 } },
			});
		}

		return NextResponse.json(data);
	} catch (err: any) {
		console.error("[transaction-tickets-proxy GET] Exception:", err.message, err.stack);
		return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
	}
}
