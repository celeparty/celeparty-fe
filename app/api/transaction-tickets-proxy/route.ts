import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		// BASE_API already includes /api, so don't add it again
		const STRAPI_URL = `${process.env.BASE_API}/transaction-tickets`;
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
		// BASE_API already includes /api, so don't add it again
		const STRAPI_URL = `${process.env.BASE_API}/transaction-tickets/${id}`;
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

		// Support simplified params and Strapi-style params
		const vendorDocId = searchParams.get('vendor_doc_id') || searchParams.get('filters[vendor_doc_id][$eq]');
		const pageSize = searchParams.get('pageSize') || searchParams.get('pagination[pageSize]') || '100';
		const page = searchParams.get('page') || searchParams.get('pagination[page]') || '1';
		const sort = searchParams.get('sort') || 'createdAt:desc';

		console.log("[transaction-tickets-proxy GET] Extracted params:", { vendorDocId, pageSize, page, sort });

		// If client sent Strapi-style query, forward as-is (but require vendor_doc_id)
		const hasStrapiFilters = Array.from(searchParams.keys()).some((k) => k.startsWith('filters[') || k.startsWith('pagination['));

		if (hasStrapiFilters) {
			if (!vendorDocId) {
				console.error("[transaction-tickets-proxy GET] Missing vendor_doc_id in provided filters");
				return NextResponse.json({ error: "Missing vendor_doc_id parameter in filters", statusCode: 400 }, { status: 400 });
			}
			const queryString = url.searchParams.toString();
			var strapiUrl = `${process.env.BASE_API}/transaction-tickets?${queryString}&populate[product][populate]=*&populate=variant&populate=recipients`;
		} else {
			// Validate vendor_doc_id is provided
			if (!vendorDocId) {
				console.error("[transaction-tickets-proxy GET] Missing vendor_doc_id parameter");
				return NextResponse.json(
					{
						error: "Missing vendor_doc_id parameter",
						statusCode: 400,
					},
					{ status: 400 }
				);
			}

			// Build proper Strapi URL for transaction-tickets
			let strapiUrlLocal = `${process.env.BASE_API}/transaction-tickets?`;
			// Add filters
			strapiUrlLocal += `filters[vendor_doc_id][$eq]=${encodeURIComponent(vendorDocId)}&`;
			// Add pagination and sort
			strapiUrlLocal += `pagination[pageSize]=${encodeURIComponent(pageSize)}&`;
			strapiUrlLocal += `pagination[page]=${encodeURIComponent(page)}&`;
			strapiUrlLocal += `sort=${encodeURIComponent(sort)}&`;
			// Add populate for deep relations
			strapiUrlLocal += `populate[product][populate]=*&populate=variant&populate=recipients`;
			var strapiUrl = strapiUrlLocal;
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
