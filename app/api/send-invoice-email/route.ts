import { NextRequest, NextResponse } from "next/server";

// Helper function to format currency
function formatRupiah(amount: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
}

// Helper function to format invoice email template
function generateInvoiceEmailTemplate(
	customerName: string,
	orderId: string,
	transactionDate: string,
	items: any[],
	totalAmount: number,
	paymentMethod: string = "Midtrans",
): string {
	const itemsHtml = items
		.map(
			(item) => `
		<tr>
			<td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
			<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
			<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatRupiah(item.price)}</td>
			<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatRupiah(item.totalPriceItem)}</td>
		</tr>
	`,
		)
		.join("");

	return `
<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Invoice Pembayaran - Celeparty</title>
	<style>
		* { margin: 0; padding: 0; }
		body {
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			background-color: #f5f5f5;
			padding: 20px;
		}
		.container {
			max-width: 700px;
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
		.invoice-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 2px solid #eee;
		}
		.invoice-info {
			flex: 1;
		}
		.invoice-info h2 {
			color: #667eea;
			margin-bottom: 10px;
		}
		.invoice-details {
			background-color: #f9f9f9;
			padding: 15px;
			border-radius: 6px;
			margin-bottom: 20px;
		}
		.detail-row {
			display: flex;
			justify-content: space-between;
			padding: 5px 0;
		}
		.detail-label {
			font-weight: bold;
			color: #666;
		}
		.detail-value {
			color: #333;
		}
		.items-table {
			width: 100%;
			border-collapse: collapse;
			margin: 20px 0;
		}
		.items-table th {
			background-color: #667eea;
			color: white;
			padding: 12px;
			text-align: left;
		}
		.items-table th:last-child {
			text-align: right;
		}
		.total-section {
			background-color: #f9f9f9;
			padding: 20px;
			border-radius: 6px;
			margin-top: 20px;
		}
		.total-row {
			display: flex;
			justify-content: space-between;
			font-size: 18px;
			font-weight: bold;
			color: #667eea;
		}
		.footer {
			background-color: #f9f9f9;
			padding: 20px;
			text-align: center;
			font-size: 12px;
			color: #999;
			border-top: 1px solid #e0e0e0;
		}
		.status-badge {
			display: inline-block;
			background-color: #28a745;
			color: white;
			padding: 5px 15px;
			border-radius: 20px;
			font-size: 12px;
			font-weight: bold;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🧾 Invoice Pembayaran</h1>
			<p>Terima kasih telah berbelanja di Celeparty!</p>
		</div>

		<div class="content">
			<div class="invoice-header">
				<div class="invoice-info">
					<h2>Invoice #${orderId}</h2>
					<p>Tanggal: ${transactionDate}</p>
					<p>Pelanggan: ${customerName}</p>
				</div>
				<div>
					<span class="status-badge">LUNAS</span>
				</div>
			</div>

			<div class="invoice-details">
				<div class="detail-row">
					<span class="detail-label">Metode Pembayaran:</span>
					<span class="detail-value">${paymentMethod}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Status:</span>
					<span class="detail-value">Berhasil</span>
				</div>
			</div>

			<table class="items-table">
				<thead>
					<tr>
						<th>Produk</th>
						<th style="text-align: center;">Qty</th>
						<th style="text-align: right;">Harga</th>
						<th style="text-align: right;">Total</th>
					</tr>
				</thead>
				<tbody>
					${itemsHtml}
				</tbody>
			</table>

			<div class="total-section">
				<div class="total-row">
					<span>Total Pembayaran:</span>
					<span>${formatRupiah(totalAmount)}</span>
				</div>
			</div>

			<div style="margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 6px; border-left: 4px solid #28a745;">
				<h3 style="color: #28a745; margin-bottom: 10px;">✅ Pembayaran Berhasil!</h3>
				<p style="margin-bottom: 10px;">Pembayaran Anda telah berhasil diproses. Jika Anda memiliki pertanyaan tentang pesanan ini, silakan hubungi tim support kami.</p>
				<p><strong>Simpan invoice ini sebagai bukti pembayaran resmi.</strong></p>
			</div>
		</div>

		<div class="footer">
			<p><strong>Celeparty</strong> - Platform Pemesanan Tiket & Perlengkapan Acara</p>
			<p>Email: support@celeparty.com | WhatsApp: +62 812-3456-7890</p>
			<p>&copy; 2024 Celeparty. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
	`;
}

export async function POST(req: NextRequest) {
	try {
		const { customerEmail, customerName, orderId, items, totalAmount, transactionDate } = await req.json();

		if (!customerEmail || !orderId || !items || !totalAmount) {
			return NextResponse.json(
				{ error: "Missing required fields: customerEmail, orderId, items, totalAmount" },
				{ status: 400 },
			);
		}

		// Generate email HTML
		const emailHtml = generateInvoiceEmailTemplate(
			customerName || "Pelanggan",
			orderId,
			transactionDate || new Date().toLocaleDateString("id-ID"),
			items,
			totalAmount,
		);

		// Send email using your email service (replace with your actual email sending logic)
		// For now, we'll use a placeholder - you need to integrate with your email provider
		const emailResponse = await fetch(`${process.env.BASE_API}/api/email/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.KEY_API}`,
			},
			body: JSON.stringify({
				to: customerEmail,
				subject: `Invoice Pembayaran #${orderId} - Celeparty`,
				html: emailHtml,
			}),
		});

		if (!emailResponse.ok) {
			const errorData = await emailResponse.text();
			console.error("Failed to send invoice email:", errorData);
			return NextResponse.json(
				{ error: "Failed to send invoice email" },
				{ status: 500 },
			);
		}

		console.log(`Invoice email sent successfully to ${customerEmail} for order ${orderId}`);

		return NextResponse.json({
			success: true,
			message: "Invoice email sent successfully",
		});
	} catch (error) {
		console.error("Error sending invoice email:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}