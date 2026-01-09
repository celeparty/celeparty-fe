import { NextRequest, NextResponse } from "next/server";

/**
 * API Route to resend verification email
 * POST /api/resend-verification-email
 */
export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ success: false, message: "Email is required" },
				{ status: 400 }
			);
		}

		// Get Strapi backend URL and API key from environment
		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			return NextResponse.json(
				{ success: false, message: "Server configuration error" },
				{ status: 500 }
			);
		}

		// Call Strapi API to send confirmation email
		// Strapi's users-permissions plugin has a sendConfirmationEmail method
		const response = await fetch(`${BASE_API}/api/auth/send-email-confirmation`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{
					success: false,
					message:
						errorData.message ||
						"Gagal mengirim email verifikasi. Silakan coba lagi.",
				},
				{ status: response.status }
			);
		}

		const data = await response.json();

		return NextResponse.json({
			success: true,
			message: "Email verifikasi telah dikirim. Silakan periksa email Anda.",
			data,
		});
	} catch (error: any) {
		console.error("Error resending verification email:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					error.message ||
					"Terjadi kesalahan saat mengirim email verifikasi",
			},
			{ status: 500 }
		);
	}
}
