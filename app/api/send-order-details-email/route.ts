import { NextRequest, NextResponse } from "next/server";

// Helper function to format currency
function formatRupiah(amount: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
}

// Helper function to format order details email template
function generateOrderDetailsEmailTemplate(
	customerName: string,
	orderId: string,
	orderDate: string,
	items: any[],
	totalAmount: number,
	shippingInfo?: any,
): string {
	const itemsHtml = items
		.map(
			(item) => `
		<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #fafafa;">
			<div style="display: flex; align-items: center; margin-bottom: 10px;">
				${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px;">` : ''}
				<div>
					<h3 style="margin: 0; color: #333; font-size: 16px;">${item.name}</h3>
					<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${item.product_type === 'ticket' ? 'Tiket Acara' : 'Perlengkapan'}</p>
				</div>
			</div>
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<div>
					<p style="margin: 0; color: #666;">Jumlah: <strong>${item.quantity}</strong></p>
					${item.note ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Catatan: ${item.note}</p>` : ''}
				</div>
				<div style="text-align: right;">
					<p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${formatRupiah(item.totalPriceItem)}</p>
				</div>
			</div>
		</div>
	`,
		)
		.join("");

	const shippingHtml = shippingInfo ? `
		<div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
			<h3 style="color: #667eea; margin-bottom: 15px;">📍 Informasi Pengiriman</h3>
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
				<div><strong>Nama Pemesan:</strong> ${shippingInfo.customer_name || '-'}</div>
				<div><strong>No. WhatsApp:</strong> ${shippingInfo.telp || '-'}</div>
				<div><strong>Tanggal Acara:</strong> ${shippingInfo.event_date || '-'}</div>
				<div><strong>Tanggal Loading:</strong> ${shippingInfo.loading_date || '-'}</div>
				<div style="grid-column: span 2;"><strong>Alamat Lengkap:</strong> ${shippingInfo.shipping_location || '-'}</div>
				${shippingInfo.note ? `<div style="grid-column: span 2;"><strong>Catatan:</strong> ${shippingInfo.note}</div>` : ''}
			</div>
		</div>
	` : '';

	return `
<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Rincian Pesanan - Celeparty</title>
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
		.order-summary {
			background-color: #f9f9f9;
			padding: 20px;
			border-radius: 6px;
			margin-bottom: 30px;
		}
		.summary-row {
			display: flex;
			justify-content: space-between;
			padding: 8px 0;
			border-bottom: 1px solid #e0e0e0;
		}
		.summary-row:last-child {
			border-bottom: none;
			font-size: 18px;
			font-weight: bold;
			color: #667eea;
		}
		.items-section {
			margin: 30px 0;
		}
		.items-section h2 {
			color: #333;
			margin-bottom: 20px;
			font-size: 20px;
		}
		.total-section {
			background-color: #667eea;
			color: white;
			padding: 20px;
			border-radius: 6px;
			text-align: center;
			margin-top: 30px;
		}
		.total-amount {
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 10px;
		}
		.footer {
			background-color: #f9f9f9;
			padding: 20px;
			text-align: center;
			font-size: 12px;
			color: #999;
			border-top: 1px solid #e0e0e0;
		}
		.next-steps {
			background-color: #e8f5e8;
			border-left: 4px solid #28a745;
			padding: 20px;
			margin: 20px 0;
			border-radius: 6px;
		}
		.next-steps h3 {
			color: #28a745;
			margin-bottom: 10px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>📦 Rincian Pesanan Anda</h1>
			<p>Terima kasih telah berbelanja di Celeparty!</p>
		</div>

		<div class="content">
			<div class="order-summary">
				<h2 style="color: #667eea; margin-bottom: 15px;">Ringkasan Pesanan</h2>
				<div class="summary-row">
					<span>Nomor Pesanan:</span>
					<span><strong>${orderId}</strong></span>
				</div>
				<div class="summary-row">
					<span>Tanggal Pesanan:</span>
					<span>${orderDate}</span>
				</div>
				<div class="summary-row">
					<span>Pelanggan:</span>
					<span>${customerName}</span>
				</div>
				<div class="summary-row">
					<span>Status Pembayaran:</span>
					<span style="color: #28a745; font-weight: bold;">LUNAS</span>
				</div>
			</div>

			<div class="items-section">
				<h2>Detail Produk</h2>
				${itemsHtml}
			</div>

			${shippingHtml}

			<div class="total-section">
				<div class="total-amount">Total: ${formatRupiah(totalAmount)}</div>
				<p>Pembayaran telah diterima dengan baik</p>
			</div>

			<div class="next-steps">
				<h3>🎉 Selanjutnya:</h3>
				<ul style="margin-left: 20px;">
					<li>Simpan email ini sebagai bukti pesanan</li>
					<li>Untuk perlengkapan, tim kami akan menghubungi Anda untuk konfirmasi pengiriman</li>
					<li>Jika ada pertanyaan, hubungi support@celeparty.com</li>
				</ul>
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
		const { customerEmail, customerName, orderId, items, totalAmount, orderDate, shippingInfo } = await req.json();

		if (!customerEmail || !orderId || !items || !totalAmount) {
			return NextResponse.json(
				{ error: "Missing required fields: customerEmail, orderId, items, totalAmount" },
				{ status: 400 },
			);
		}

		// Generate email HTML
		const emailHtml = generateOrderDetailsEmailTemplate(
			customerName || "Pelanggan",
			orderId,
			orderDate || new Date().toLocaleDateString("id-ID"),
			items,
			totalAmount,
			shippingInfo,
		);

		// Send email using your email service (replace with your actual email sending logic)
		const emailResponse = await fetch(`${process.env.BASE_API}/api/email/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.KEY_API}`,
			},
			body: JSON.stringify({
				to: customerEmail,
				subject: `Rincian Pesanan #${orderId} - Celeparty`,
				html: emailHtml,
			}),
		});

		if (!emailResponse.ok) {
			const errorData = await emailResponse.text();
			console.error("Failed to send order details email:", errorData);
			return NextResponse.json(
				{ error: "Failed to send order details email" },
				{ status: 500 },
			);
		}

		console.log(`Order details email sent successfully to ${customerEmail} for order ${orderId}`);

		return NextResponse.json({
			success: true,
			message: "Order details email sent successfully",
		});
	} catch (error) {
		console.error("Error sending order details email:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}