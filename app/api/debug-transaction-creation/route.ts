import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to test transaction creation with full error logging
 * This helps identify permission or payload issues
 */
export async function POST(req: NextRequest) {
	try {
		const { transaction_type, ...payload } = await req.json();

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			return NextResponse.json(
				{ error: "Missing environment variables", missing: { BASE_API: !BASE_API, KEY_API: !KEY_API } },
				{ status: 500 }
			);
		}

		// Construct the endpoint
		const endpoint = transaction_type === "ticket" ? "transaction-tickets" : "transactions";
		const STRAPI_URL = `${BASE_API.replace(/\/api\/?$/, "")}/api/${endpoint}`;

		console.log("=== DEBUG TRANSACTION CREATION ===");
		console.log("Type:", transaction_type);
		console.log("Endpoint:", STRAPI_URL);
		console.log("Payload:", JSON.stringify({ data: payload }, null, 2));

		// Attempt to create
		const response = await fetch(STRAPI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({ data: payload }),
		});

		const contentType = response.headers.get("content-type") || "";
		let responseData: any = null;

		try {
			if (contentType.includes("application/json")) {
				responseData = await response.json();
			} else {
				responseData = await response.text();
			}
		} catch (err) {
			responseData = "Failed to parse response";
		}

		console.log("Response Status:", response.status);
		console.log("Response Headers:", {
			contentType: response.headers.get("content-type"),
			contentLength: response.headers.get("content-length"),
		});
		console.log("Response Body:", JSON.stringify(responseData, null, 2));

		if (!response.ok) {
			console.error("❌ FAILED - Status:", response.status);
			return NextResponse.json(
				{
					success: false,
					status: response.status,
					error: typeof responseData === "object" ? responseData.error : responseData,
					fullResponse: responseData,
					debugInfo: {
						endpoint: STRAPI_URL,
						hasKeyApi: !!KEY_API,
						keyApiLength: KEY_API?.length || 0,
						payload: payload,
					},
				},
				{ status: response.status }
			);
		}

		console.log("✅ SUCCESS - Transaction created");
		return NextResponse.json({
			success: true,
			status: response.status,
			data: responseData,
		});
	} catch (error: any) {
		console.error("❌ ERROR:", error);
		return NextResponse.json(
			{
				success: false,
				error: error.message,
				stack: error.stack,
			},
			{ status: 500 }
		);
	}
}
