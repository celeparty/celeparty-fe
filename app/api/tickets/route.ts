import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const { search } = new URL(req.url);
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		// Extract JWT from Authorization header
		const authorizationHeader = req.headers.get("Authorization");
		if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Unauthorized: Missing or invalid Authorization header" }, { status: 401 });
		}
		const token = authorizationHeader.substring(7); // Remove "Bearer "

		// Decode JWT to get user ID
		let userId: string | undefined;
		try {
			const decodedToken: any = jwt.decode(token);
			console.log("Decoded JWT Payload:", decodedToken); // Log decoded token
			userId = decodedToken?.id || decodedToken?.user?.id; // Try 'id' or 'user.id'
			if (!userId) {
				return NextResponse.json({ error: "Unauthorized: User ID not found in token" }, { status: 401 });
			}
		} catch (decodeError) {
			console.error("Error decoding JWT:", decodeError);
			return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
		}

		// Ensure populate=* is included to get all relations including user_event_type
		if (!searchParams.has('populate')) {
			searchParams.set('populate', '*');
		}

		// Add filter for user ID
		// Assuming the ticket model in Strapi has a relation to 'user', 'vendor', 'owner', or 'users_permissions_user' with 'id' field
		searchParams.set('filters[user][id][$eq]', userId);
		searchParams.set('filters[vendor][id][$eq]', userId); // Add filter for 'vendor' relationship
		searchParams.set('filters[owner][id][$eq]', userId); // Add filter for 'owner' relationship
		searchParams.set('filters[users_permissions_user][id][$eq]', userId); // Add filter for 'users_permissions_user' relationship

		// Add filter for 'ticket' category to ensure only ticket products are fetched
		searchParams.set('filters[category][name][$eq]', 'ticket');

		const STRAPI_URL = `${process.env.BASE_API}/api/products?${searchParams.toString()}`;
		console.log("Constructed Strapi URL:", STRAPI_URL); // Log constructed URL
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
