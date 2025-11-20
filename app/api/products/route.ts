import { NextRequest, NextResponse } from "next/server";
import { axiosData } from "@/lib/services";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const populate = searchParams.get("populate") || "*";
		const pageSize = searchParams.get("pagination[pageSize]") || "1000";
		const fields = searchParams.get("fields") || "";
		const sort = searchParams.get("sort[0]") || "";

		let url = `/api/products?populate=${populate}&pagination[pageSize]=${pageSize}`;
		if (fields) url += `&fields=${fields}`;
		if (sort) url += `&sort[0]=${sort}`;

		const data = await axiosData("GET", url);
		return NextResponse.json(data);
	} catch (error: any) {
		console.error("Error fetching products:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
