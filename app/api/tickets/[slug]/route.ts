export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
	try {
		const { slug } = params;
		const authHeader = request.headers.get("authorization");

		const token = authHeader?.replace("Bearer ", "") || process.env.KEY_API;

		const url = `${process.env.BASE_API}/api/tickets/${slug}?populate=*`;
		console.log(`Proxying ticket GET request to backend: ${url}`);

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log(`Backend response status: ${response.status}`);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching ticket:", error.response?.data || error.message || error);
		return NextResponse.json(
			{ success: false, error: error.response?.data || error.message || "Unknown error" },
			{ status: error.response?.status || 500 }
		);
	}
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
	try {
		const { slug } = params;
		const body = await request.json();
		const authHeader = request.headers.get("authorization");

		const token = authHeader?.replace("Bearer ", "") || process.env.KEY_API;

		const url = `${process.env.BASE_API}/api/tickets/${slug}`;
		console.log(`Proxying ticket update request to backend: ${url}`);

		const response = await axios.put(url, body, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		console.log(`Backend response status: ${response.status}`);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error updating ticket:", error.response?.data || error.message || error);
		return NextResponse.json(
			{ success: false, error: error.response?.data || error.message || "Unknown error" },
			{ status: error.response?.status || 500 }
		);
	}
}
