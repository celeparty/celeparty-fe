"use client";
import Box from "@/components/Box";
import { useCart } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils";
import { formatDateIndonesia, formatTimeWithWIB } from "@/lib/dateFormatIndonesia";
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
			router.push("/cart");
		}
	}, [selectedCartItems, router]);

	const totalAmount = selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);

	const handleProceedToPayment = async () => {
		setIsProcessing(true);
		try {
			// Handle unified payment for mixed carts
			await handleUnifiedPayment();
		} catch (error) {
			console.error("Payment error:", error);
			alert("Terjadi kesalahan dalam proses pembayaran");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleUnifiedPayment = async () => {
		console.log("Starting unified payment process...");
		console.log("Selected cart items:", selectedCartItems);

		// Validate recipients for all ticket items
		const ticketItems = selectedCartItems.filter((item) => item.product_type === "ticket");
		for (const ticketItem of ticketItems) {
			if (ticketItem.quantity >= 1) {
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
					alert(`Silakan lengkapi semua detail penerima tiket untuk ${ticketItem.product_name} sebelum melanjutkan pembayaran.`);
					console.error("Recipient validation failed for item:", ticketItem);
					return;
				}
			}
		}

		try {
			// Generate order_id
			const order_id = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			console.log("Generated order_id:", order_id);

			// Separate tickets and equipment
			const ticketItems = selectedCartItems.filter((item) => item.product_type === "ticket");
			const equipmentItems = selectedCartItems.filter((item) => item.product_type !== "ticket");
			console.log("Ticket items:", ticketItems);
			console.log("Equipment items:", equipmentItems);

			// Create transactions for tickets
			const ticketTransactionIds = [];
			for (const ticketItem of ticketItems) {
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

				console.log("Creating ticket transaction with payload:", transactionTicketPayload);

				const strapiRes = await fetch("/api/transaction-tickets-proxy", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(transactionTicketPayload),
				});

				console.log("Strapi ticket transaction response status:", strapiRes.status);

				if (!strapiRes.ok) {
					const errorBody = await strapiRes.text();
					console.error("Failed to create ticket transaction in Strapi. Response body:", errorBody);
					throw new Error("Failed to create ticket transaction in Strapi");
				}

				const strapiData = await strapiRes.json();
				console.log("Strapi ticket transaction response data:", strapiData);
				ticketTransactionIds.push(strapiData.data.id);
			}

			// Create transaction for equipment if any
			let equipmentTransactionId = null;
			if (equipmentItems.length > 0) {
				// Combine fields that can differ between products
				const variants = equipmentItems
					.map((item: any) => item.variant)
					.filter((v: string) => v && v.trim() !== "")
					.join(",");
				const quantities = equipmentItems.map((item: any) => item.quantity).join(",");
				const notes = equipmentItems.map((item: any) => item.note).join("; ");

				// Get common fields from first equipment product
				const firstItem = equipmentItems[0];

				const transactionPayload = {
					products: equipmentItems.map((item: any) => ({
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

				console.log("Creating equipment transaction with payload:", transactionPayload);

				const strapiRes = await fetch("/api/transaction-proxy", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ data: transactionPayload }),
				});

				console.log("Strapi equipment transaction response status:", strapiRes.status);

				if (!strapiRes.ok) {
					const errorBody = await strapiRes.text();
					console.error("Failed to create equipment transaction in Strapi. Response body:", errorBody);
					throw new Error("Failed to create equipment transaction in Strapi");
				}

				const strapiData = await strapiRes.json();
				console.log("Strapi equipment transaction response data:", strapiData);
				equipmentTransactionId = strapiData.data.id;
			}

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

			console.log("Preparing payment data for Midtrans:", paymentData);

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

			console.log("Midtrans payment initiation response status:", response.status);

			if (!response.ok) {
				const errorBody = await response.text();
				console.error("Failed to initiate payment. Response body:", errorBody);
				throw new Error("Failed to initiate payment");
			}

			const paymentResult = await response.json();
			console.log("Midtrans payment initiation response data:", paymentResult);
			const token = paymentResult.token;

			if (!token) {
				console.error("Midtrans token is missing in the response.");
				throw new Error("Midtrans token is missing.");
			}

			// Save transaction summary to sessionStorage
			const transactionSummary = {
				orderId: ticketTransactionIds.length > 0 ? ticketTransactionIds[0] : equipmentTransactionId,
				ticketTransactionIds,
				equipmentTransactionId,
				products: selectedCartItems,
				total: totalAmount,
				order_id: order_id,
				email: session?.user?.email || "",
				recipients: ticketItems.flatMap(item => item.recipients || []),
			};
			console.log("Saving transaction summary to sessionStorage:", transactionSummary);
			sessionStorage.setItem(
				"transaction_summary",
				JSON.stringify(transactionSummary),
			);

			// Redirect to Midtrans payment
			console.log("Redirecting to Midtrans with token:", token);
			window.snap.pay(token, {
				onSuccess: function (result: any) {
					console.log("Midtrans payment success:", result);
					window.location.href = "/cart/success";
				},
				onError: function (error: any) {
					console.error("Midtrans payment error:", error);
					alert("Pembayaran gagal. Silakan coba lagi.");
				},
				onClose: function () {
					console.log("Payment popup closed by user.");
				},
			});
		} catch (error) {
			console.error("Error in unified payment:", error);
			alert("Gagal memproses pembayaran. Silakan periksa konsol untuk detailnya.");
		}
	};

	if (selectedCartItems.length === 0) {
		return (
			<div className="wrapper-big py-8 lg:py-12">
				<Box className="text-center py-20">
					<h2 className="text-2xl font-semibold mb-4">Tidak ada item yang dipilih</h2>
					<p className="text-gray-600 mb-6">Silakan kembali ke keranjang dan pilih item yang ingin dibeli.</p>
					<button
						onClick={() => router.push("/cart")}
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
									<div
										key={index}
										className="flex items-center space-x-4 p-4 border border-c-gray-200 rounded-lg shadow-soft"
									>
										<div className="relative w-16 h-16">
											<Image
												src={
													item.image
														? process.env.BASE_API + item.image
														: "/images/noimage.png"
												}
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
												Tipe: {item.product_type === "ticket" ? "Tiket" : "Perlengkapan"}
											</p>
											{item.variant && (
												<p className="text-sm text-c-gray-600">Varian: {item.variant}</p>
											)}
											{item.product_type === "ticket" && (
												<>
													{item.event_date && <p className="text-sm text-c-gray-600">Tanggal Acara: {item.event_date}</p>}
													{item.waktu_event && <p className="text-sm text-c-gray-600">Jam Acara: {item.waktu_event}</p>}
												{item.end_date && item.end_date !== item.event_date && (
													<p className="text-sm text-c-gray-600">Tanggal Selesai: {formatDateIndonesia(item.end_date)}</p>
												)}
												{item.end_time && <p className="text-sm text-c-gray-600">Jam Selesai: {formatTimeWithWIB(item.end_time)}</p>}
													{item.kota_event && <p className="text-sm text-c-gray-600">Kota: {item.kota_event}</p>}
													{item.lokasi_event && <p className="text-sm text-c-gray-600">Lokasi: {item.lokasi_event}</p>}
												</>
											)}
										</div>
										<div className="text-right">
											<p className="font-semibold text-c-orange">
												{formatRupiah(item.price * item.quantity)}
											</p>
										</div>
									</div>
								))}
							</div>
						</Box>

						{/* Customer Information or Recipients Information */}
						{selectedCartItems.some((item) => item.recipients && item.recipients.length > 0) ? (
							<Box>
								<h2 className="text-xl font-semibold mb-4 text-c-blue">Detail Penerima Tiket</h2>
								<div className="space-y-4">
									{selectedCartItems.map((item, itemIndex) => (
										<div key={itemIndex} className="border rounded-lg p-4">
											<h3 className="font-semibold text-c-blue mb-3">
												{item.product_name} - {item.quantity} Tiket
											</h3>
											<div className="space-y-3">
												{item.recipients && item.recipients.map((recipient: any, recipientIndex: number) => (
													<div key={recipientIndex} className="bg-gray-50 p-3 rounded border">
														<div className="flex items-center gap-2 mb-2">
															<div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
																{recipientIndex + 1}
															</div>
															<h4 className="font-medium">Tiket {recipientIndex + 1}</h4>
														</div>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
															<p><strong>Nama:</strong> {recipient.name}</p>
															<p><strong>Email:</strong> {recipient.email}</p>
															<p><strong>No. WhatsApp:</strong> {recipient.whatsapp_number}</p>
															<p><strong>Tipe Identitas:</strong> {recipient.identity_type}</p>
															<p className="md:col-span-2"><strong>No. Identitas:</strong> {recipient.identity_number}</p>
														</div>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</Box>
						) : selectedCartItems.some((item) => item.product_type !== "ticket") ? (
							<Box>
								<h2 className="text-xl font-semibold mb-4 text-c-blue">Detail Pemesanan Perlengkapan</h2>
								<div className="space-y-4">
									{selectedCartItems
										.filter((item) => item.product_type !== "ticket")
										.map((item, index) => (
											<div key={index} className="border rounded-lg p-4">
												<h3 className="font-semibold text-c-blue mb-3">{item.product_name}</h3>
												<div className="space-y-2 text-sm">
													<p><strong>Nama Pemesan:</strong> {item.customer_name || "-"}</p>
													<p><strong>No WhatsApp:</strong> {item.telp || "-"}</p>
													<p><strong>Tanggal Acara:</strong> {item.event_date || "-"}</p>
													<p><strong>Detail Alamat:</strong> {item.shipping_location || "-"}</p>
												<p><strong>Tanggal Loading:</strong> {formatDateIndonesia(item.loading_date) || "-"}</p>
												<p><strong>Jam Loading:</strong> {formatTimeWithWIB(item.loading_time) || "-"}</p>
													<p><strong>Catatan:</strong> {item.note || "-"}</p>
												</div>
											</div>
										))}
								</div>
							</Box>
						) : (
							<Box>
								<h2 className="text-xl font-semibold mb-4 text-c-blue">Informasi Pelanggan</h2>
								<div className="space-y-2">
									<p>
										<strong>Nama:</strong> {session?.user?.name || "Tidak tersedia"}
									</p>
									<p>
										<strong>Email:</strong> {session?.user?.email || "Tidak tersedia"}
									</p>
									<p>
										<strong>Telepon:</strong> {session?.user?.phone || "Tidak tersedia"}
									</p>
								</div>
							</Box>
						)}

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
									{isProcessing ? "Memproses..." : "Lanjutkan Pembayaran"}
								</button>
								<button
									onClick={() => router.push("/cart")}
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
