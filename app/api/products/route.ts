import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const populate = searchParams.get("populate") || "*";
		const pageSize = searchParams.get("pagination[pageSize]") || "1000";
		const fields = searchParams.get("fields") || "";
		const sort = searchParams.get("sort[0]") || "";
		let url = `${process.env.BASE_API}/api/products?populate=${populate}&pagination[pageSize]=${pageSize}`;
		if (fields) url += `&fields=${fields}`;
		if (sort) url += `&sort[0]=${sort}`;
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
