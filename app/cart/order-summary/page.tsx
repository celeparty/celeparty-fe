"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils";
import Box from "@/components/Box";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

declare global {
	interface Window {
		snap: any;
	}
}

export default function OrderSummaryPage() {
	const { data: session } = useSession();
	const { getSelectedItems, validateSelection } = useCart();
	const selectedItems = getSelectedItems();
	const isValidSelection = validateSelection();

	const userTelp = session?.user?.phone || "";
	const userEmail = session?.user?.email || "";

	// Redirect if no valid selection
	useEffect(() => {
		if (selectedItems.length === 0 || !isValidSelection) {
			window.location.href = '/cart';
		}
	}, [selectedItems, isValidSelection]);

	// Form state for equipment editing
	const [equipmentForm, setEquipmentForm] = useState({
		event_date: "",
		shipping_location: "",
		loading_date: "",
		loading_time: "",
		customer_name: "",
	});

	// Initialize equipment form with first equipment item data
	useEffect(() => {
		const firstEquipment = selectedItems.find(item => item.product_type !== 'ticket');
		if (firstEquipment) {
			setEquipmentForm({
				event_date: firstEquipment.event_date || "",
				shipping_location: firstEquipment.shipping_location || "",
				loading_date: firstEquipment.loading_date || "",
				loading_time: firstEquipment.loading_time || "",
				customer_name: firstEquipment.customer_name || "",
			});
		}
	}, [selectedItems]);

	// Check if selection contains tickets
	const hasTickets = selectedItems.some(item => item.product_type === 'ticket');
	const hasEquipment = selectedItems.some(item => item.product_type !== 'ticket');

	// Calculate total for selected items
	const selectedTotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

	// Form validation
	const isFormValid = () => {
		if (hasEquipment) {
			return equipmentForm.customer_name && equipmentForm.event_date &&
				   equipmentForm.shipping_location && equipmentForm.loading_date && equipmentForm.loading_time;
		}
		if (hasTickets) {
			return selectedItems.every(item => {
				if (item.product_type === 'ticket' && item.recipients) {
					return item.recipients.length === item.quantity &&
						   item.recipients.every(recipient =>
							   recipient.name && recipient.identity_type &&
							   recipient.identity_number && recipient.whatsapp_number && recipient.email
						   );
				}
				return true;
			});
		}
		return true;
	};

	const handlePayment = async () => {
		if (!isFormValid()) {
			alert("Mohon lengkapi semua data yang diperlukan sebelum melanjutkan pembayaran.");
			return;
		}

		try {
			if (hasEquipment) {
				// Handle equipment payment
				const variants = selectedItems.map(item => item.variant).filter(v => v && v.trim() !== "").join(",");
				const quantities = selectedItems.map(item => item.quantity).join(",");
				const notes = selectedItems.map(item => item.note).join("; ");

				const transactionPayload = {
					products: selectedItems.map(item => ({
						id: item.product_id,
						title: item.product_name,
					})),
					payment_status: "pending",
					variant: variants,
					quantity: quantities,
					shipping_location: equipmentForm.shipping_location,
					event_date: equipmentForm.event_date,
					loading_date: equipmentForm.loading_date,
					loading_time: equipmentForm.loading_time,
					customer_name: equipmentForm.customer_name,
					telp: userTelp,
					note: notes,
					email: userEmail,
					event_type: selectedItems[0]?.user_event_type || "",
					vendor_doc_id: selectedItems[0]?.vendor_id || "",
				};

				const strapiRes = await axios.post("/api/transaction-proxy", {
					data: transactionPayload,
				});

				const order_id = strapiRes.data.data.id || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				const response = await axios.post(`/api/payment`, {
					email: userEmail,
					items: selectedItems.map(item => ({
						id: item.product_id,
						name: item.product_name,
						price: item.price,
						quantity: item.quantity,
					})),
					order_id: order_id,
				});

				const token = response.data.token;
				window.snap.pay(token, {
					onSuccess: async function (result: any) {
						sessionStorage.setItem("transaction_summary", JSON.stringify({
							orderId: strapiRes.data.data.id,
							products: selectedItems,
							total: selectedTotal,
							...equipmentForm,
							order_id: order_id,
							email: userEmail,
						}));
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
			} else if (hasTickets) {
				// Handle ticket payment
				const ticketItem = selectedItems[0]; // Assuming single ticket type for now
				const order_id = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				const transactionTicketPayload = {
					data: {
						product_name: ticketItem.product_name,
						price: ticketItem.price.toString(),
						quantity: ticketItem.quantity.toString(),
						variant: ticketItem.variant || "",
						customer_name: ticketItem.customer_name || "",
						telp: userTelp,
						total_price: (ticketItem.price * ticketItem.quantity).toString(),
						payment_status: "pending",
						event_date: ticketItem.event_date || "",
						event_type: ticketItem.user_event_type || "",
						note: ticketItem.note || "",
						order_id: order_id,
						customer_mail: userEmail,
						verification: false,
						vendor_id: ticketItem.vendor_id || "",
						recipients: ticketItem.recipients,
					},
				};

				const strapiRes = await axios.post("/api/transaction-tickets-proxy", transactionTicketPayload);

				const response = await axios.post(`/api/payment`, {
					email: userEmail,
					items: selectedItems.map(item => ({
						id: item.product_id,
						name: item.product_name,
						price: item.price,
						quantity: item.quantity,
					})),
					order_id: order_id,
				});

				const token = response.data.token;
				window.snap.pay(token, {
					onSuccess: async function (result: any) {
						sessionStorage.setItem("transaction_summary", JSON.stringify({
							orderId: strapiRes.data.data.id,
							products: selectedItems,
							total: selectedTotal,
							customer_name: ticketItem.customer_name,
							telp: userTelp,
							order_id: order_id,
							email: userEmail,
							recipients: ticketItem.recipients,
						}));
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
			}
		} catch (error) {
			console.error("Payment processing error:", error);
			alert("Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.");
		}
	};

	if (selectedItems.length === 0 || !isValidSelection) {
		return (
			<div className="wrapper">
				<Box className="mb-7">
					<div className="text-center py-8">
						<p className="text-gray-600">Tidak ada item yang dipilih untuk checkout.</p>
						<button
							onClick={() => window.location.href = '/cart'}
							className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
						>
							Kembali ke Keranjang
						</button>
					</div>
				</Box>
			</div>
		);
	}

	return (
		<div className="wrapper">
			{/* Header */}
			<div className="mb-6">
				<button
					onClick={() => window.location.href = '/cart'}
					className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
				>
					<FaArrowLeft /> Kembali ke Keranjang
				</button>
				<h1 className="text-2xl font-bold text-gray-800">Ringkasan Pesanan</h1>
				<p className="text-gray-600 mt-1">Periksa detail pesanan Anda sebelum melanjutkan pembayaran</p>
			</div>

			<div className="flex lg:flex-row flex-col lg:gap-6 gap-4">
				{/* Order Details */}
				<div className="lg:w-8/12 w-full">
					{/* Selected Items */}
					<Box className="mb-6" title="Item yang Dipilih">
						<div className="space-y-4">
							{selectedItems.map((item, index) => (
								<div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
									<div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
										<span className="text-2xl">📦</span>
									</div>
									<div className="flex-1">
										<h4 className="font-semibold">{item.product_name}</h4>
										<p className="text-sm text-gray-600">
											{item.product_type === 'ticket' ? 'Tiket' : 'Perlengkapan Event'} • {item.quantity} x {formatRupiah(item.price)}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">{formatRupiah(item.price * item.quantity)}</p>
									</div>
								</div>
							))}
						</div>
					</Box>

					{/* Equipment Details Form */}
					{hasEquipment && (
						<Box className="mb-6" title="Detail Pengiriman & Acara">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Nama Pemesan *
									</label>
									<input
										type="text"
										value={equipmentForm.customer_name}
										onChange={(e) => setEquipmentForm({...equipmentForm, customer_name: e.target.value})}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Masukkan nama pemesan"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Tanggal Acara *
									</label>
									<input
										type="date"
										value={equipmentForm.event_date}
										onChange={(e) => setEquipmentForm({...equipmentForm, event_date: e.target.value})}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Alamat Pengiriman *
									</label>
									<textarea
										value={equipmentForm.shipping_location}
										onChange={(e) => setEquipmentForm({...equipmentForm, shipping_location: e.target.value})}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={3}
										placeholder="Masukkan alamat lengkap pengiriman"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Tanggal Loading *
									</label>
									<input
										type="date"
										value={equipmentForm.loading_date}
										onChange={(e) => setEquipmentForm({...equipmentForm, loading_date: e.target.value})}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Waktu Loading *
									</label>
									<input
										type="time"
										value={equipmentForm.loading_time}
										onChange={(e) => setEquipmentForm({...equipmentForm, loading_time: e.target.value})}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							</div>
						</Box>
					)}

					{/* Ticket Recipients (Read-only display) */}
					{hasTickets && selectedItems.map((item, itemIndex) => (
						item.product_type === 'ticket' && item.recipients && (
							<Box key={itemIndex} className="mb-6" title={`Detail Penerima Tiket - ${item.product_name}`}>
								<div className="space-y-4">
									{item.recipients.map((recipient, idx) => (
										<div key={idx} className="border rounded-lg p-4 bg-gray-50">
											<h5 className="font-semibold mb-3">Tiket {idx + 1}</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
												<div><strong>Nama:</strong> {recipient.name}</div>
												<div><strong>Tipe Identitas:</strong> {recipient.identity_type}</div>
												<div><strong>No. Identitas:</strong> {recipient.identity_number}</div>
												<div><strong>WhatsApp:</strong> {recipient.whatsapp_number}</div>
												<div className="md:col-span-2"><strong>Email:</strong> {recipient.email}</div>
											</div>
										</div>
									))}
								</div>
							</Box>
						)
					))}
				</div>

				{/* Order Summary Sidebar */}
				<div className="lg:w-4/12 w-full">
					<Box title="Ringkasan Pembayaran">
						<div className="space-y-4">
							{/* Order Items */}
							<div className="border-b pb-4">
								<h4 className="font-semibold mb-3">Detail Pesanan</h4>
								{selectedItems.map((item, index) => (
									<div key={index} className="flex justify-between text-sm mb-2">
										<span>{item.product_name} (x{item.quantity})</span>
										<span>{formatRupiah(item.price * item.quantity)}</span>
									</div>
								))}
							</div>

							{/* Total */}
							<div className="flex justify-between text-lg font-bold pt-2 border-t">
								<span>Total Pembayaran</span>
								<span className="text-orange-600">{formatRupiah(selectedTotal)}</span>
							</div>

							{/* Payment Button */}
							<button
								onClick={handlePayment}
								disabled={!isFormValid()}
								className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
									isFormValid()
										? 'bg-green-600 hover:bg-green-700'
										: 'bg-gray-400 cursor-not-allowed'
								}`}
							>
								Bayar Sekarang
							</button>

							{!isFormValid() && (
								<p className="text-sm text-red-600 text-center">
									Mohon lengkapi semua field yang wajib diisi
								</p>
							)}
						</div>
					</Box>
				</div>
			</div>
		</div>
	);
}
