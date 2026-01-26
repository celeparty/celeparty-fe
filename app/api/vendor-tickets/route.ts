import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.documentId) {
			console.error("[vendor-tickets GET] No session or documentId");
			return NextResponse.json(
				{ error: "Unauthorized - No session", statusCode: 401 },
				{ status: 401 }
			);
		}

		const vendorId = session.user.documentId;
		console.log("[vendor-tickets GET] Fetching tickets for vendor:", vendorId);

		const KEY_API = process.env.KEY_API;
		if (!KEY_API) {
			console.error("[vendor-tickets GET] KEY_API not set");
			return NextResponse.json(
				{ error: "API key not configured", statusCode: 500 },
				{ status: 500 }
			);
		}

		// Fetch ticket products for this vendor
		// Use filter to get products owned by this vendor AND with ticket category
		// Strapi endpoint: /api/products?filters[users_permissions_user][documentId][$eq]=vendorId&filters[category][name][$eq]=ticket
		const strapiUrl = `${process.env.BASE_API}/products?filters[users_permissions_user][documentId][$eq]=${vendorId}&filters[category][name][$eq]=ticket&populate[variants]=*&populate[main_image]=*&populate[category]=*&pagination[pageSize]=100`;

		console.log("[vendor-tickets GET] Strapi URL:", strapiUrl);

		const strapiRes = await fetch(strapiUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${KEY_API}`,
				"Content-Type": "application/json",
			},
		});

		const data = await strapiRes.json();

		console.log("[vendor-tickets GET] Strapi response status:", strapiRes.status);
		console.log("[vendor-tickets GET] Response data count:", data?.data?.length || 0);

		if (!strapiRes.ok) {
			console.error("[vendor-tickets GET] Strapi error response:", {
				status: strapiRes.status,
				error: data.error,
				message: data.message,
				details: data
			});
			return NextResponse.json(
				{
					error: data.error?.message || data.error || data.message || "Failed to fetch vendor tickets",
					details: data.error || data,
					statusCode: strapiRes.status,
				},
				{ status: strapiRes.status }
			);
		}

		// Ensure response structure is consistent
		if (!data.data) {
			console.warn("[vendor-tickets GET] Response missing data field");
			return NextResponse.json({
				data: [],
				meta: { pagination: { total: 0, page: 1, pageSize: 25, pageCount: 0 } },
			});
		}

		// Transform response to include proper variant structure
		const transformedData = data.data.map((product: any) => {
			const attrs = product.attributes || product;
			return {
				id: product.id,
				documentId: product.documentId || product.id,
				title: attrs.title,
				description: attrs.description,
				main_image: attrs.main_image || [],
				variants: attrs.variants || [],
				event_date: attrs.event_date,
				end_date: attrs.end_date,
				waktu_event: attrs.waktu_event,
				end_time: attrs.end_time,
				kota_event: attrs.kota_event,
				lokasi_event: attrs.lokasi_event,
				category: attrs.category,
				attributes: attrs, // Keep full attributes for backward compatibility
			};
		});

		return NextResponse.json({
			data: transformedData,
			meta: data.meta,
		});
	} catch (err: any) {
		console.error("[vendor-tickets GET] Exception:", err.message, err.stack);
		return NextResponse.json(
			{
				error: err.message || "Unknown error occurred",
				statusCode: 500,
			},
			{ status: 500 }
		);
	}
}
