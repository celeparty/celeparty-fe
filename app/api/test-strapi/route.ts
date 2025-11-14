import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const STRAPI_URL = `${process.env.BASE_API}/api/transactions`;
		const KEY_API = process.env.KEY_API;

		if (!KEY_API) {
			return NextResponse.json(
				{
					error: "KEY_API not set in environment",
					env: {
						BASE_API: process.env.BASE_API,
						KEY_API: "NOT SET",
					},
				},
				{ status: 500 },
			);
		}

		// Test connection to Strapi
		const testRes = await fetch(STRAPI_URL, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		const testData = await testRes.json();

		return NextResponse.json({
			success: true,
			strapi_status: testRes.status,
			strapi_data: testData,
			env: {
				BASE_API: process.env.BASE_API,
				KEY_API: KEY_API,
				STRAPI_URL,
			},
		});
	} catch (err: any) {
		console.error("Error testing Strapi connection:", err);
		return NextResponse.json(
			{
				error: err.message || "Unknown error",
				env: {
					BASE_API: process.env.BASE_API,
					KEY_API: process.env.KEY_API ? "SET" : "NOT SET",
				},
			},
			{ status: 500 },
		);
	}
}
