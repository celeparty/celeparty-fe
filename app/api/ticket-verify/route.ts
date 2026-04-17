import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/options";
import { authOptions } from "@/app/auth";

/**
 * POST /api/ticket-verify
 * Verify a ticket (mark as verified)
 * Only vendors who own the product can verify their own tickets
 */
export async function POST(req: NextRequest) {
	try {
		const { ticket_code } = await req.json();

		if (!ticket_code) {
			return NextResponse.json({ error: "ticket_code is required" }, { status: 400 });
		}

		// Verify user is authenticated
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			console.error("Missing Strapi environment variables");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// 1. Find the ticket-detail by ticket_code
		const findResponse = await fetch(
			`${BASE_API}/api/ticket-details?filters[ticket_code][$eq]=${ticket_code}&populate=deep`,
			{
				headers: {
					Authorization: `Bearer ${KEY_API}`,
				},
			},
		);

		if (!findResponse.ok) {
			throw new Error("Failed to search for ticket-detail");
		}

		const findData = await findResponse.json();

		if (!findData.data || findData.data.length === 0) {
			console.warn(`❌ Ticket not found: ${ticket_code}`);
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		const ticketDetail = findData.data[0];
		const ticketDetailId = ticketDetail.id;
		const currentStatus = ticketDetail.attributes;

		// ===== VENDOR OWNERSHIP VALIDATION =====
		// Check if user is the vendor who owns this product
		const productId = ticketDetail.attributes.product?.data?.id;
		const vendorId = session.user.documentId;

		if (!productId) {
			return NextResponse.json({ error: "Product information not found on ticket" }, { status: 400 });
		}

		// Fetch product to verify vendor ownership
		const productResponse = await fetch(`${BASE_API}/api/products/${productId}?populate=users_permissions_user`, {
			headers: { Authorization: `Bearer ${KEY_API}` },
		});

		if (!productResponse.ok) {
			return NextResponse.json({ error: "Failed to fetch product information" }, { status: 500 });
		}

		const productData = await productResponse.json();
		const productVendorId = productData.data?.attributes?.users_permissions_user?.data?.id;
		const productVendorDocId = productData.data?.attributes?.users_permissions_user?.data?.documentId;

		// Check if current user is the vendor
		const isVendorOwner = 
			productVendorDocId === vendorId || 
			productVendorId === vendorId;

		if (!isVendorOwner) {
			console.warn(`❌ Access denied: User ${vendorId} attempted to verify ticket for product owned by ${productVendorDocId}`);
			return NextResponse.json(
				{ 
					error: "Access denied - You are not the vendor for this product",
					message: "Hanya vendor pemilik produk yang dapat melakukan verifikasi tiket ini"
				}, 
				{ status: 403 }
			);
		}

		// Check if ticket already verified
		if (currentStatus.verification_status === 'verified' || currentStatus.is_verified) {
			return NextResponse.json(
				{ 
					success: false, 
					message: "Ticket has already been verified",
					alreadyVerified: true 
				},
				{ status: 409 }, // 409 Conflict
			);
		}

		// 2. Update the ticket-detail to set verification_status to verified
		const updateResponse = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({
				data: {
					is_verified: true,
					verification_status: 'verified',
					verified_at: new Date().toISOString(),
					verified_by: vendorId,
				},
			}),
		});

		if (!updateResponse.ok) {
			const errorData = await updateResponse.json();
			console.error("Failed to update ticket-detail:", errorData);
			throw new Error("Failed to update ticket status in Strapi");
		}

		console.log(`✅ Ticket verified successfully: ${ticket_code} by vendor ${vendorId}`);

		return NextResponse.json({ 
			success: true, 
			message: "Ticket verified successfully",
			verified: true,
			ticketCode: ticket_code,
			verifiedAt: new Date().toISOString(),
			verifiedBy: vendorId 
		});

	} catch (error) {
		console.error("Error in ticket verification:", error);
		const errorMessage = error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
