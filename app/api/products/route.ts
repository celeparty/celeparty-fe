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

		const response = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${process.env.KEY_API}`,
			},
		});
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching products:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
