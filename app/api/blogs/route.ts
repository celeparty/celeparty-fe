import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const populate = searchParams.get("populate") || "*";
		const slug = searchParams.get("slug") || "";

		let url = `${process.env.BASE_API}/api/blogs?populate=${populate}`;
		if (slug) {
			url = `${process.env.BASE_API}/api/blogs/${slug}?populate=${populate}`;
		}

		const response = await axios.get(url);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching blogs:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
