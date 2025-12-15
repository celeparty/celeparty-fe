export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
	try {
		const { slug } = params;
		const authHeader = request.headers.get("authorization");

		const token = authHeader?.replace("Bearer ", "") || process.env.KEY_API;

		// First, find the ticket by documentId (slug)
		const findUrl = `${process.env.BASE_API}/api/products?filters[documentId][$eq]=${slug}&filters[category][name][$eq]=ticket&populate=*`;
		console.log(`Finding ticket by documentId: ${findUrl}`);

		const findResponse = await axios.get(findUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!findResponse.data?.data || findResponse.data.data.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Ticket not found" },
				{ status: 404 }
			);
		}

		const ticket = findResponse.data.data[0];
		console.log(`Found ticket with ID: ${ticket.id}, documentId: ${ticket.documentId}`);

		return NextResponse.json({ data: ticket });
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

		const url = `${process.env.BASE_API}/api/products/${slug}`;
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
