import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		// Build full query string from all parameters
		const paramsArray: string[] = [];
		searchParams.forEach((value, key) => {
			paramsArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
		});
		const queryString = paramsArray.join("&");
		const url = `${process.env.BASE_API}/api/products?${queryString}`;
		console.log(`Proxying product API request to backend: ${url}`);

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${process.env.KEY_API}`,
			},
		});
		console.log(`Backend response status: ${response.status}`);
		console.log(`Backend response data keys: ${Object.keys(response.data)}`);
		if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
			console.error("Invalid product data format received:", response.data);
			return NextResponse.json({ success: false, error: "Invalid product data format from backend" }, { status: 500 });
		}
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching products:", error.response?.data || error.message || error);
		return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
	}
}
