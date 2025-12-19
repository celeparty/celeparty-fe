import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
	try {
		const { ticketDetailId } = await req.json();

		if (!ticketDetailId) {
			return NextResponse.json({ error: "ticketDetailId is required" }, { status: 400 });
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;
		const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

		if (!BASE_API || !KEY_API) {
			console.error("Missing Strapi environment variables");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// 1. Fetch ticket details to get recipient email and ticket code
		const detailResponse = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}?populate=ticket_product`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		if (!detailResponse.ok) {
			throw new Error("Failed to fetch ticket details");
		}
		const ticketDetail = await detailResponse.json();
		const { recipient_email, ticket_code, ticket_product } = ticketDetail.data.attributes;
		const eventName = ticket_product.data.attributes.name;

		// 2. Fetch the generated PDF
		const pdfResponse = await fetch(`${NEXTAUTH_URL}/api/generate-ticket-pdf`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ticketDetailId }),
		});

		if (!pdfResponse.ok) {
			throw new Error("Failed to generate PDF");
		}
		const pdfBuffer = await pdfResponse.arrayBuffer();

		// 3. Set up Nodemailer transporter
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: Number(process.env.EMAIL_PORT) || 587,
			secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// 4. Email options
		const mailOptions = {
			from: `"Celeparty" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
			to: recipient_email,
			subject: `E-Ticket Anda untuk Acara: ${eventName}`,
			html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Konfirmasi E-Ticket Celeparty</h2>
          <p>Yth. Bapak/Ibu,</p>
          <p>Terima kasih telah melakukan transaksi di Celeparty.com. Bersama email ini, kami lampirkan e-ticket Anda yang sah untuk acara:</p>
          <p><strong>${eventName}</strong></p>
          <p>E-ticket ini adalah bukti sah Anda untuk memasuki area acara. Mohon simpan baik-baik dan tunjukkan kepada petugas di lokasi.</p>
          <p>Detail lengkap acara dan data Anda tertera pada file PDF yang kami lampirkan.</p>
          <br>
          <p>Hormat kami,</p>
          <p><strong>Tim Celeparty</strong></p>
        </div>
      `,
			attachments: [
				{
					filename: `e-ticket-${ticket_code}.pdf`,
					content: Buffer.from(pdfBuffer),
					contentType: "application/pdf",
				},
			],
		};

		// 5. Send email
		await transporter.sendMail(mailOptions);

		return NextResponse.json({ success: true, message: "Email sent successfully" });
	} catch (error) {
		console.error("Error sending ticket email:", error);
		const errorMessage = error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
