import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const populate = searchParams.get("populate") || "*";

		let url = `${process.env.BASE_API}/api/user-event-types?populate=${populate}`;

		const response = await axios.get(url);
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error("Error fetching user event types:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
