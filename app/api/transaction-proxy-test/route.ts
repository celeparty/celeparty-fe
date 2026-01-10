import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	return NextResponse.json({
		message: "Transaction proxy is working",
		baseApi: process.env.BASE_API || "NOT SET",
		hasKeyApi: !!process.env.KEY_API,
		timestamp: new Date().toISOString(),
	});
}

export async function POST(req: NextRequest) {
	return NextResponse.json({
		message: "Transaction proxy POST is working",
		timestamp: new Date().toISOString(),
	});
}
