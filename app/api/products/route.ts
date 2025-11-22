import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
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
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching products:", error.response?.data || error.message || error);
		return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
	}
}
