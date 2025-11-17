"use client";
import Box from "@/components/Box";
import { useCart } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderSummaryPage() {
	const { getSelectedItems, selectedItems } = useCart();
	const selectedCartItems = getSelectedItems();
	const { data: session } = useSession();
	const router = useRouter();

	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		if (selectedCartItems.length === 0) {
			router.push('/cart');
		}
	}, [selectedCartItems, router]);

	const totalAmount = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

	const handleProceedToPayment = async () => {
		setIsProcessing(true);
		try {
			// Determine if all selected items are tickets or equipment
			const allTickets = selectedCartItems.every(item => item.product_type === 'ticket');
			const allEquipment = selectedCartItems.every(item => item.product_type !== 'ticket');

			if (allTickets) {
				// Handle ticket payment
				await handleTicketPayment();
			} else if (allEquipment) {
				// Handle equipment payment
				await handleEquipmentPayment();
			} else {
				alert('Tidak dapat mencampur produk tiket dan perlengkapan dalam satu checkout');
				return;
			}
		} catch (error) {
			console.error('Payment error:', error);
			alert('Terjadi kesalahan dalam proses pembayaran');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleTicketPayment = async () => {
		// Validate recipients for tickets
		const ticketItem = selectedCartItems[0];
		if (ticketItem.product_type === "ticket" && ticketItem.quantity >= 1) {
			const recipientsValid =
				ticketItem.recipients &&
				ticketItem.recipients.length === ticketItem.quantity &&
				ticketItem.recipients.every(
					(recipient: any) =>
						recipient.name &&
						recipient.identity_type &&
						recipient.identity_number &&
						recipient.whatsapp_number &&
						recipient.email &&
						/^\d+$/.test(recipient.identity_number) &&
						/^\d+$/.test(recipient.whatsapp_number),
				);

			if (!recipientsValid) {
				alert("Silakan lengkapi semua detail penerima tiket sebelum melanjutkan pembayaran.");
				return;
			}
		}

		try {
			// Generate order_id
			const order_id = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Prepare payload for Strapi transaction-tickets
			const transactionTicketPayload = {
				data: {
					product_name: ticketItem.product_name,
					price: ticketItem.price.toString(),
					quantity: ticketItem.quantity.toString(),
					variant: ticketItem.variant || "",
					customer_name: ticketItem.customer_name || "",
					telp: session?.user?.phone || "",
					total_price: (ticketItem.price * ticketItem.quantity).toString(),
					payment_status: "pending",
					event_date: ticketItem.event_date || "",
					event_type: ticketItem.user_event_type || "",
					note: ticketItem.note || "",
					order_id: order_id,
					customer_mail: session?.user?.email || "",
					verification: false,
					vendor_id: ticketItem.vendor_id || "",
					recipients: ticketItem.recipients,
				},
			};

			// Push data to Strapi transaction-tickets
			const strapiRes = await fetch("/api/transaction-tickets-proxy", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(transactionTicketPayload),
			});

			if (!strapiRes.ok) {
				throw new Error("Failed to create transaction in Strapi");
			}

			const strapiData = await strapiRes.json();

			// Prepare payment data for Midtrans
			const paymentData = selectedCartItems.map((item: any) => ({
				id: item.product_id,
				name: item.product_name,
				image: item.image,
				price: parseInt(item.price),
				quantity: item.quantity,
				note: item.note,
				totalPriceItem: item.price * item.quantity,
			}));

			// Send to Midtrans for payment
			const response = await fetch(`/api/payment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: session?.user?.email || "",
					items: paymentData,
					order_id: order_id,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to initiate payment");
			}

			const paymentResult = await response.json();
			const token = paymentResult.token;

			// Save transaction summary to sessionStorage
			sessionStorage.setItem(
				"transaction_summary",
				JSON.stringify({
					orderId: strapiData.data.id,
					products: selectedCartItems,
					total: totalAmount,
					customer_name: ticketItem.customer_name,
					telp: session?.user?.phone || "",
					order_id: order_id,
					email: session?.user?.email || "",
					recipients: ticketItem.recipients,
				}),
			);

			// Redirect to Midtrans payment
			window.snap.pay(token, {
				onSuccess: function (result: any) {
					window.location.href = "/cart/success";
				},
				onError: function (error: any) {
					console.error("Payment error:", error);
					alert("Pembayaran gagal. Silakan coba lagi.");
				},
				onClose: function () {
					console.log("Payment popup closed");
				},
			});
		} catch (error) {
			console.error("Error in ticket payment:", error);
			alert("Gagal memproses pembayaran tiket. Silakan coba lagi.");
		}
	};

	const handleEquipmentPayment = async () => {
		try {
			// Generate order_id
			const order_id = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Combine fields that can differ between products
			const variants = selectedCartItems
				.map((item: any) => item.variant)
				.filter((v: string) => v && v.trim() !== "")
				.join(",");
			const quantities = selectedCartItems.map((item: any) => item.quantity).join(",");
			const notes = selectedCartItems.map((item: any) => item.note).join("; ");

			// Get common fields from first product
			const firstItem = selectedCartItems[0];

			// Prepare transaction payload for Strapi
			const transactionPayload = {
				products: selectedCartItems.map((item: any) => ({
					id: item.product_id,
					title: item.product_name,
				})),
				payment_status: "pending",
				variant: variants,
				quantity: quantities,
				shipping_location: firstItem.shipping_location,
				event_date: firstItem.event_date,
				loading_date: firstItem.loading_date,
				loading_time: firstItem.loading_time,
				customer_name: firstItem.customer_name,
				telp: session?.user?.phone || "",
				note: notes,
				email: session?.user?.email || "",
				event_type: firstItem.user_event_type,
				vendor_doc_id: firstItem.vendor_id || "",
			};

			// Push data to Strapi
			const strapiRes = await fetch("/api/transaction-proxy", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ data: transactionPayload }),
			});

			if (!strapiRes.ok) {
				throw new Error("Failed to create transaction in Strapi");
			}

			const strapiData = await strapiRes.json();

			// Prepare payment data for Midtrans
			const paymentData = selectedCartItems.map((item: any) => ({
				id: item.product_id,
				name: item.product_name,
				image: item.image,
				price: parseInt(item.price),
				quantity: item.quantity,
				note: item.note,
				totalPriceItem: item.price * item.quantity,
			}));

			// Send to Midtrans for payment
			const response = await fetch(`/api/payment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: session?.user?.email || "",
					items: paymentData,
					order_id: order_id,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to initiate payment");
			}

			const paymentResult = await response.json();
			const token = paymentResult.token;

			// Save transaction summary to sessionStorage
			sessionStorage.setItem(
				"transaction_summary",
				JSON.stringify({
					orderId: strapiData.data.id,
					products: selectedCartItems,
					total: totalAmount,
					...firstItem,
					order_id: order_id,
					email: session?.user?.email || "",
				}),
			);

			// Redirect to Midtrans payment
			window.snap.pay(token, {
				onSuccess: function (result: any) {
					window.location.href = "/cart/success";
				},
				onError: function (error: any) {
					console.error("Payment error:", error);
					alert("Pembayaran gagal. Silakan coba lagi.");
				},
				onClose: function () {
					console.log("Payment popup closed");
				},
			});
		} catch (error) {
			console.error("Error in equipment payment:", error);
			alert("Gagal memproses pembayaran perlengkapan. Silakan coba lagi.");
		}
	};

	if (selectedCartItems.length === 0) {
		return (
			<div className="wrapper-big py-8 lg:py-12">
				<Box className="text-center py-20">
					<h2 className="text-2xl font-semibold mb-4">Tidak ada item yang dipilih</h2>
					<p className="text-gray-600 mb-6">Silakan kembali ke keranjang dan pilih item yang ingin dibeli.</p>
					<button
						onClick={() => router.push('/cart')}
						className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
					>
						Kembali ke Keranjang
					</button>
				</Box>
			</div>
		);
	}

	return (
		<div className="wrapper-big py-8 lg:py-12">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6 text-c-blue">Ringkasan Pesanan</h1>

				<div className="grid lg:grid-cols-3 gap-6">
					{/* Order Items */}
					<div className="lg:col-span-2">
						<Box className="mb-6">
							<h2 className="text-xl font-semibold mb-4 text-c-blue">Item yang Dipilih</h2>
							<div className="space-y-4">
								{selectedCartItems.map((item, index) => (
									<div key={index} className="flex items-center space-x-4 p-4 border border-c-gray-200 rounded-lg shadow-soft">
										<div className="relative w-16 h-16">
											<Image
												src={item.image ? process.env.BASE_API + item.image : "/images/noimage.png"}
												alt={item.product_name}
												fill
												className="object-cover rounded"
											/>
										</div>
										<div className="flex-1">
											<h3 className="font-semibold text-c-blue">{item.product_name}</h3>
											<p className="text-sm text-c-gray-600">
												Jumlah: {item.quantity} x {formatRupiah(item.price)}
											</p>
											<p className="text-sm text-c-gray-600">
												Tipe: {item.product_type === 'ticket' ? 'Tiket' : 'Perlengkapan'}
											</p>
											{item.variant && (
												<p className="text-sm text-c-gray-600">Varian: {item.variant}</p>
											)}
										</div>
										<div className="text-right">
											<p className="font-semibold text-c-orange">{formatRupiah(item.price * item.quantity)}</p>
										</div>
									</div>
								))}
							</div>
						</Box>

						{/* Customer Information */}
						<Box>
							<h2 className="text-xl font-semibold mb-4 text-c-blue">Informasi Pelanggan</h2>
							<div className="space-y-2">
								<p><strong>Nama:</strong> {session?.user?.name || 'Tidak tersedia'}</p>
								<p><strong>Email:</strong> {session?.user?.email || 'Tidak tersedia'}</p>
								<p><strong>Telepon:</strong> {session?.user?.phone || 'Tidak tersedia'}</p>
							</div>
						</Box>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Box className="sticky top-4">
							<h2 className="text-xl font-semibold mb-4 text-c-blue">Ringkasan Pembayaran</h2>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span>Subtotal:</span>
									<span className="font-semibold">{formatRupiah(totalAmount)}</span>
								</div>
								<div className="flex justify-between">
									<span>Biaya Admin:</span>
									<span className="font-semibold">{formatRupiah(0)}</span>
								</div>
								<hr className="my-3 border-c-gray-200" />
								<div className="flex justify-between font-bold text-lg">
									<span>Total:</span>
									<span className="text-c-orange">{formatRupiah(totalAmount)}</span>
								</div>
							</div>

							<div className="mt-6 space-y-3">
								<button
									onClick={handleProceedToPayment}
									disabled={isProcessing}
									className="w-full bg-c-green text-white py-3 px-4 rounded-lg hover:bg-c-green-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
								>
									{isProcessing ? 'Memproses...' : 'Lanjutkan Pembayaran'}
								</button>
								<button
									onClick={() => router.push('/cart')}
									className="w-full bg-c-gray-200 text-c-gray-700 py-3 px-4 rounded-lg hover:bg-c-gray-300 transition-colors duration-200 font-medium"
								>
									Kembali ke Keranjang
								</button>
							</div>
						</Box>
					</div>
				</div>
			</div>
		</div>
	);
}
