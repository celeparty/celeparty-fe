export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const populate = searchParams.get("populate") || "*";

		let url = `${process.env.BASE_API}/api/event-categories?populate=${populate}`;

		const response = await axios.get(url);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching event categories:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
