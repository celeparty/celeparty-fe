import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const searchParams = url.searchParams;

		console.log("[DEBUG] Full incoming URL:", req.url);
		console.log("[DEBUG] searchParams entries:", Array.from(searchParams.entries()));

		const vendorDocId = searchParams.get('vendor_doc_id');
		const pageSize = searchParams.get('pageSize');
		const page = searchParams.get('page');
		const sort = searchParams.get('sort');

		return NextResponse.json({
			success: true,
			received: {
				vendor_doc_id: vendorDocId,
				pageSize: pageSize,
				page: page,
				sort: sort,
			},
			rawUrl: req.url,
			allParams: Object.fromEntries(searchParams),
		});
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message },
			{ status: 500 }
		);
	}
}
