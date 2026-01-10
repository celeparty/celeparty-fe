import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure email transporter
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "localhost",
	port: parseInt(process.env.SMTP_PORT || "587"),
	secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

// Helper function to generate QR code URL
function generateQRCodeUrl(text: string): string {
	return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
}

// Helper function to format email template
function generateEmailTemplate(
	recipientName: string,
	ticketCode: string,
	eventDetails: any,
	qrCodeUrl: string,
): string {
	return `
<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>E-Tiket Acara</title>
	<style>
		* { margin: 0; padding: 0; }
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			background-color: #f5f5f5;
			padding: 20px;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: white;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			overflow: hidden;
		}
		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 30px;
			text-align: center;
		}
		.header h1 {
			font-size: 28px;
			margin-bottom: 10px;
		}
		.content {
			padding: 30px;
		}
		.greeting {
			font-size: 18px;
			color: #333;
			margin-bottom: 20px;
		}
		.ticket-box {
			border: 2px dashed #667eea;
			border-radius: 8px;
			padding: 20px;
			margin: 20px 0;
			background-color: #f9f9f9;
		}
		.ticket-code {
			text-align: center;
			font-size: 24px;
			font-weight: bold;
			color: #667eea;
			font-family: monospace;
			margin-bottom: 20px;
			letter-spacing: 2px;
		}
		.qr-code {
			text-align: center;
			margin: 20px 0;
		}
		.qr-code img {
			max-width: 300px;
			height: auto;
		}
		.event-details {
			background-color: white;
			border: 1px solid #e0e0e0;
			border-radius: 6px;
			padding: 15px;
			margin: 20px 0;
		}
		.detail-row {
			display: flex;
			padding: 8px 0;
			border-bottom: 1px solid #f0f0f0;
		}
		.detail-row:last-child {
			border-bottom: none;
		}
		.detail-label {
			font-weight: bold;
			color: #667eea;
			width: 150px;
			flex-shrink: 0;
		}
		.detail-value {
			color: #333;
			flex-grow: 1;
		}
		.important-note {
			background-color: #fff3cd;
			border-left: 4px solid #ffc107;
			padding: 12px;
			margin: 20px 0;
			border-radius: 4px;
			font-size: 14px;
			color: #856404;
		}
		.footer {
			background-color: #f9f9f9;
			padding: 20px;
			text-align: center;
			font-size: 12px;
			color: #999;
			border-top: 1px solid #e0e0e0;
		}
		.cta-button {
			display: inline-block;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 12px 30px;
			border-radius: 6px;
			text-decoration: none;
			margin-top: 20px;
			font-weight: bold;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🎫 E-Tiket Acara Anda</h1>
			<p>Terima kasih telah melakukan pembelian tiket bersama kami!</p>
		</div>

		<div class="content">
			<div class="greeting">
				Halo <strong>${recipientName}</strong>,
			</div>

			<p>Tiket Anda telah berhasil dibuat. Berikut adalah detail tiket Anda:</p>

			<div class="ticket-box">
				<div class="ticket-code">${ticketCode}</div>
				<div class="qr-code">
					<p style="font-size: 12px; color: #666; margin-bottom: 10px;">Scan QR Code untuk verifikasi:</p>
					<img src="${qrCodeUrl}" alt="QR Code untuk Tiket">
				</div>
			</div>

			<div class="event-details">
				${
					eventDetails.event_name
						? `
					<div class="detail-row">
						<div class="detail-label">Nama Acara:</div>
						<div class="detail-value">${eventDetails.event_name}</div>
					</div>
				`
						: ""
				}
				${
					eventDetails.event_date
						? `
					<div class="detail-row">
						<div class="detail-label">Tanggal Acara:</div>
						<div class="detail-value">${eventDetails.event_date}</div>
					</div>
				`
						: ""
				}
				${
					eventDetails.event_location
						? `
					<div class="detail-row">
						<div class="detail-label">Lokasi:</div>
						<div class="detail-value">${eventDetails.event_location}</div>
					</div>
				`
						: ""
				}
				${
					eventDetails.event_time
						? `
					<div class="detail-row">
						<div class="detail-label">Jam Acara:</div>
						<div class="detail-value">${eventDetails.event_time}</div>
					</div>
				`
						: ""
				}
			</div>

			<div class="important-note">
				<strong>⚠️ Penting:</strong>
				<ul style="margin-left: 20px; margin-top: 8px;">
					<li>Tunjukkan QR code atau kode tiket ini saat memasuki acara</li>
					<li>Jangan bagikan kode tiket ke orang lain</li>
					<li>Harap tiba 15 menit sebelum acara dimulai</li>
					<li>Bawa ID/kartu identitas untuk verifikasi</li>
				</ul>
			</div>

			<p style="margin-top: 20px; color: #666;">
				Jika Anda memiliki pertanyaan atau masalah, silakan hubungi customer service kami di 
				<a href="mailto:support@celeparty.com" style="color: #667eea;">support@celeparty.com</a>
			</p>
		</div>

		<div class="footer">
			<p>Email ini adalah otomatis. Jangan balas email ini.</p>
			<p>© 2024 CeleParty. Semua hak dilindungi.</p>
		</div>
	</div>
</body>
</html>
	`;
}

export async function POST(req: NextRequest) {
	console.log("[E-Ticket Email] Received request");

	try {
		const body = await req.json();
		const { ticketDetailId, recipientEmail, recipientName, ticketCode } = body;

		if (!ticketDetailId || !recipientEmail || !recipientName || !ticketCode) {
			console.error("[E-Ticket Email] Missing required parameters:", body);
			return NextResponse.json(
				{ error: "Missing required parameters" },
				{ status: 400 },
			);
		}

		console.log("[E-Ticket Email] Processing email for:", {
			ticketDetailId,
			recipientEmail,
			recipientName,
		});

		// For now, send a simple email with the QR code
		// In the future, you might want to:
		// 1. Fetch full event details from Strapi
		// 2. Generate a PDF with the ticket
		// 3. Attach the PDF to the email

		const qrCodeUrl = generateQRCodeUrl(ticketCode);
		const eventDetails = {
			event_name: "CeleParty Event",
			event_date: new Date().toLocaleDateString("id-ID"),
			event_location: "Venue TBA",
			event_time: "TBA",
		};

		const emailHtml = generateEmailTemplate(
			recipientName,
			ticketCode,
			eventDetails,
			qrCodeUrl,
		);

		const mailOptions = {
			from: process.env.SMTP_FROM || "noreply@celeparty.com",
			to: recipientEmail,
			subject: `🎫 E-Tiket Anda - ${ticketCode}`,
			html: emailHtml,
		};

		console.log("[E-Ticket Email] Sending email to:", recipientEmail);

		// Send email
		const info = await transporter.sendMail(mailOptions);
		console.log("[E-Ticket Email] Email sent successfully:", info.messageId);

		return NextResponse.json(
			{
				success: true,
				message: "E-ticket email sent successfully",
				messageId: info.messageId,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("[E-Ticket Email] Error:", error);
		return NextResponse.json(
			{
				error: "Failed to send e-ticket email",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "E-Ticket Email endpoint is working",
		timestamp: new Date().toISOString(),
		status: "ok",
	});
}
