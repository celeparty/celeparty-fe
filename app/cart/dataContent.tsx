"use client";
import Box from "@/components/Box";
import { eProductType } from "@/lib/enums/eProduct";
import { useCart } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils";
import axios from "axios";
import { isValid } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { PiSmileySadDuotone } from "react-icons/pi";
import { RiDeleteBin6Fill } from "react-icons/ri";

declare global {
	interface Window {
		snap: any;
	}
}

export default function CartContent() {
	const { cart, setCart, updateQuantity, updateNote, deleteItem, calculateTotal }: any = useCart();
	const [value, setValue] = useState(0);
	const data = cart.map((item: any) => {
		return {
			id: item.product_id,
			name: item.product_name,
			image: item.main_image ? process.env.BASE_API + item.main_image[0].url : "/images/noimage.png",
			price: parseInt(item.price),
			quantity: item.quantity,
			note: item.note,
			totalPriceItem: item.price * item.quantity,
		};
	});

	// State untuk form checkout
	const [form, setForm] = useState({
		event_date: "",
		shipping_location: "",
		loading_date: "",
		loading_time: "",
		customer_name: "",
		telp: "",
		variant: "",
	});
	const [formError, setFormError] = useState("");

	// State untuk edit quantity dan catatan
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const [editQuantity, setEditQuantity] = useState(1);
	const [editNote, setEditNote] = useState("");

	// State untuk recipient details (untuk ticket dengan quantity > 1)
	const { updateRecipients } = useCart();

	const { data: session } = useSession();
	const userTelp = session?.user?.phone || "-";
	const userEmail = session?.user?.email || "";

	// Sinkronkan telp di cart dengan session.user.phone
	useEffect(() => {
		if (userTelp && userTelp !== "-") {
			const updatedCart = cart.map((item: any) => ({
				...item,
				telp: userTelp,
			}));
			setCart(updatedCart);
		}
		// eslint-disable-next-line
	}, [userTelp]);

	// Pisahkan cart berdasarkan tipe produk
	const ticketItems = cart.filter((item: any) => item.product_type === "ticket");
	const equipmentItems = cart.filter((item: any) => item.product_type !== "ticket");

	// Validasi: tidak boleh ada campuran tiket dan perlengkapan dalam satu cart
	const hasMixedProducts = ticketItems.length > 0 && equipmentItems.length > 0;

	// Get selected items and validation
	const selectedItems = useCart((state) => state.getSelectedItems());
	const validateSelection = useCart((state) => state.validateSelection());
	const selectItem = useCart((state) => state.selectItem);
	const deselectItem = useCart((state) => state.deselectItem);
	const clearSelection = useCart((state) => state.clearSelection);

	// Validasi cart berdasarkan tipe produk
	const isCartValid =
		cart.length > 0 &&
		!hasMixedProducts && // Tidak boleh campur tiket dan perlengkapan
		cart.every((item: any) => {
			// Validasi dasar yang diperlukan semua produk
			const basicValidation = item.customer_name && userTelp;

			// Jika produk adalah ticket
			if (item.product_type === "ticket" && item.variant) {
				// Untuk ticket dengan quantity >= 1, validasi recipients
				const recipientsValid =
					item.recipients &&
					item.recipients.length === item.quantity &&
					item.recipients.every(
						(recipient: any) =>
							recipient.name &&
							recipient.identity_type &&
							recipient.identity_number &&
							recipient.whatsapp_number &&
							recipient.email &&
							/^\d+$/.test(recipient.identity_number) &&
							/^\d+$/.test(recipient.whatsapp_number),
					);
				return basicValidation && recipientsValid;
			}

			// Jika produk bukan ticket, perlu semua field
			const isValid =
				basicValidation && item.event_date && item.shipping_location && item.loading_date && item.loading_time;
			return isValid;
		});

	const handleCheckout = async () => {
		if (!isCartValid) {
			alert("Data transaksi belum lengkap. Silakan lengkapi di halaman produk.");
			return;
		}
		// Gabungkan field yang bisa berbeda antar produk
		const variants = cart
			.map((item: any) => item.variant)
			.filter((v: string) => v && v.trim() !== "")
			.join(",");
		const quantities = cart.map((item: any) => item.quantity).join(",");
		const notes = cart.map((item: any) => item.note).join("; ");
		// Ambil field yang sama dari produk pertama
		const c = cart[0] || {};

		try {
			// Siapkan payload transaksi ke Strapi
			const transactionPayload = {
				products: cart.map((item: any) => ({
					id: item.product_id,
					title: item.product_name,
				})),
				payment_status: "pending",
				variant: variants,
				quantity: quantities,
				shipping_location: c.shipping_location,
				event_date: c.event_date,
				loading_date: c.loading_date,
				loading_time: c.loading_time,
				customer_name: c.customer_name,
				telp: userTelp,
				note: notes,
				email: userEmail,
				event_type: c.user_event_type, // Tambahan field event_type
				vendor_doc_id: c.vendor_id || "", // Tambahkan vendor_id dari cart item
			};

			// Push data ke Strapi terlebih dahulu
			const strapiRes = await axios.post("/api/transaction-proxy", {
				data: transactionPayload,
			});

			console.log("Transaction Payload:", JSON.stringify(transactionPayload, null, 2));
			console.log("Cart data:", cart);
			console.log("Variants:", variants);

			// const order_id =
			//   strapiRes.data.data.id ||
			//   `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// if (!strapiRes.data.data.order_id) {
			//   await axios.put(`/api/transaction-proxy/${strapiRes.data.data.id}`, {
			//     data: { order_id: order_id },
			//   });
			// }
			const order_id = strapiRes.data.data.id || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Kirim ke Midtrans untuk pembayaran
			const response = await axios.post(`/api/payment`, {
				email: userEmail,
				items: data,
				order_id: order_id,
			});
			const token = response.data.token;

			window.snap.pay(token, {
				onSuccess: async function (result: any) {
					try {
						sessionStorage.setItem(
							"transaction_summary",
							JSON.stringify({
								orderId: strapiRes.data.data.id,
								products: cart,
								total: calculateTotal(),
								...c,
								order_id: order_id,
								email: userEmail,
							}),
						);
						setCart([]);
						window.location.href = "/cart/success";
					} catch (err: any) {
						console.error("Error saving transaction summary:", err);
						alert("Transaksi berhasil, tapi ada masalah dengan penyimpanan data.");
					}
				},
				onError: function (error: any) {
					console.error("Error pembayaran Midtrans:", error);
					alert("Pembayaran gagal di Midtrans. Silakan coba lagi.");
				},
				onClose: function () {
					// User menutup popup pembayaran
				},
			});
		} catch (error) {
			console.error("Error in handleCheckout:", error);
			alert("Gagal memproses pembayaran. Silakan coba lagi.");
		}
	};

	const checkoutTicket = async () => {
		// Check recipient validation for ticket products
		const ticketItem = cart[0];
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
			// Ambil data dari cart untuk ticket
			const ticketItem = cart[0]; // Ambil item pertama karena untuk ticket biasanya hanya 1 item

			// Generate order_id terlebih dahulu
			const order_id = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			// Siapkan payload untuk Strapi transaction-tickets
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
					// Include recipients data always for tickets
					recipients: ticketItem.recipients,
				},
			};

			try {
				// Push data ke Strapi transaction-tickets terlebih dahulu
				const strapiRes = await axios.post("/api/transaction-tickets-proxy", transactionTicketPayload);

				try {
					// Kirim ke Midtrans untuk pembayaran
					const response = await axios.post(`/api/payment`, {
						email: userEmail,
						items: data,
						order_id: order_id,
					});

					const token = response.data.token;

					window.snap.pay(token, {
						onSuccess: async function (result: any) {
							try {
								// Simpan summary transaksi ke sessionStorage
								sessionStorage.setItem(
									"transaction_summary",
									JSON.stringify({
										orderId: strapiRes.data.data.id,
										products: cart,
										total: calculateTotal(),
										customer_name: ticketItem.customer_name,
										telp: userTelp,
										order_id: order_id,
										email: userEmail,
										recipients: ticketItem.recipients,
									}),
								);

								setCart([]);
								window.location.href = "/cart/success";
							} catch (err: any) {
								console.error("Error saving transaction summary:", err);
								alert("Transaksi berhasil, tapi ada masalah dengan penyimpanan data.");
							}
						},
						onError: function (error: any) {
							console.error("Error pembayaran Midtrans:", error);
							alert("Pembayaran gagal di Midtrans. Silakan coba lagi.");
						},
						onClose: function () {
							// User menutup popup pembayaran
						},
					});
				} catch (paymentError: any) {
					console.error("Error calling payment API:", paymentError);
					console.error("Payment error response:", paymentError.response?.data);
					alert(`Error payment API: ${paymentError.response?.data?.error || paymentError.message}`);
				}
			} catch (strapiError: any) {
				console.error("Error calling Strapi:", strapiError);
				console.error("Strapi error response:", strapiError.response?.data);
				alert(`Error Strapi: ${strapiError.response?.data?.error || strapiError.message}`);
			}
		} catch (error: any) {
			console.error("Error in checkoutTicket:", error);
			console.error("Error response:", error.response?.data);
			alert(`Gagal memproses pembayaran: ${error.response?.data?.error || error.message}`);
		}
	};

	return (
		<div className="wrapper">
			{cart.length > 0 ? (
				<div className="flex lg:flex-row flex-col lg:gap-5 gap-2">
					<div className="lg:w-8/12 w-full">
						{cart.map((item: any, index: number) => {
							const isSelected = selectedItems.some(selected => selected.product_id === item.product_id);
							return (
								<Box className="lg:mb-7 mb-3" title={item.product_name} key={index}>
									<div className="flex w-full">
										<div className="flex items-center mr-4">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={(e) => {
													if (e.target.checked) {
														selectItem(item.product_id);
													} else {
														deselectItem(item.product_id);
													}
												}}
												className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
											/>
										</div>
										<div className="w-[100px] h-[100px] relative">
											<Image
												src={
													item.image
														? (process.env.BASE_API || "http://localhost:1337") + item.image
														: "/images/noimage.png"
												}
												alt="image"
												fill
												className="object-cover"
											/>
										</div>
										<div className="ml-5 flex-1">
											<div className="flex gap-1">
												<div className="font-bold">Price: </div> {formatRupiah(item.price)}
											</div>
											<div className="flex gap-1">
												<div className="font-bold">Quantity: </div> {item.quantity}
											</div>
											<div className="flex gap-1">
												<div className="font-bold">Type: </div>
												<span className={`px-2 py-1 rounded text-xs ${item.product_type === 'ticket' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
													{item.product_type === 'ticket' ? 'Ticket' : 'Equipment'}
												</span>
											</div>
										</div>
									</div>

									<div className="mt-2">
										{cart.map((item: any, idx: number) => (
											<div
												key={item.product_id || idx}
												className="mb-3 border-b pb-2 last:border-b-0 last:pb-0"
											>
												<div className="mb-1">
													<b>Produk:</b> {item.product_name}
												</div>
												<div className="mb-1">
													<b>Tanggal Acara:</b> {item.event_date}
												</div>
												<div className="mb-1">
													<b>Nama Pemesan:</b> {item.customer_name || "-"}
												</div>
												<div className="mb-1">
													<b>No. Telepon:</b> {userTelp}
												</div>
												<div className="mb-1">
													<b>Varian Produk:</b> {item.variant || "-"}
												</div>
												{item.product_type !== "ticket" && (
													<>
														<div className="mb-1">
															<b>Detail Alamat:</b> {item.shipping_location || "-"}
														</div>
														<div className="mb-1">
															<b>Tanggal Acara:</b> {item.event_date || "-"}
														</div>
														<div className="mb-1">
															<b>Tanggal Loading:</b> {item.loading_date || "-"}
														</div>
														<div className="mb-1">
															<b>Jam Loading:</b> {item.loading_time || "-"}
														</div>
													</>
												)}
											</div>
										))}
									</div>
									<div className="flex lg:gap-7 gap-3 mt-2 lg:mt-0">
										<div className="flex-1">
											{item.product_type !== "ticket" && (
												<>
													<h5 className="mb-2 lg:mb-0 font-bold py-2">Catatan</h5>
													<textarea
														className="w-full border-[1px] border-c-gray rounded-lg p-2"
														value={item.note}
														onChange={(e) => updateNote(item.product_id, e.target.value)}
													/>
												</>
											)}

											{/* Recipient form for tickets - moved to order summary page */}
											{item.product_type === "ticket" && item.quantity >= 1 && (
												<div className="mt-6">
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
														<div className="flex items-center gap-2 mb-2">
															<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
																<span className="text-white text-sm font-bold">👤</span>
															</div>
															<h5 className="text-lg font-bold text-blue-800">
																Detail Penerima Tiket
															</h5>
														</div>
														<p className="text-sm text-blue-600">
															Form pengisian detail penerima telah dipindahkan ke halaman ringkasan pesanan.
															Silakan lanjutkan ke checkout untuk mengisi data penerima.
														</p>
													</div>
												</div>
											)}
										</div>

										<div className="relative flex lg:gap-5 gap-2 items-start lg:py-4 pt-[28px]">
											<div className="flex flex-col items-center justify-center gap-1 order-2 lg:order-1 mt-[8px] font-extrabold lg:font-normal text-red-500 lg:text-gray-500 lg:border-none border border-black rounded-lg px-2 py-1 lg:px-2 lg:py-1">
												Hapus{" "}
												<RiDeleteBin6Fill
													className="text-[#DA7E01] cursor-pointer text-2xl"
													onClick={() => deleteItem(item.product_id)}
												/>
											</div>
											<div className="flex flex-col lg:items-center items-start lg:justify-center justify-start gap-1 order-1 lg:order-2">
												<h3 className="font-extrabold lg:font-normal">Jumlah</h3>
												<div className="flex items-center gap-2 border border-c-gray rounded-lg">
													<div
														className="cursor-pointer p-3 hover:text-green-300"
														onClick={() => {
															if (item.quantity > 0) {
																updateQuantity(item.product_id, item.quantity - 1);
															}
														}}
													>
														<FaMinus />
													</div>
													<div>{item.quantity}</div>
													<div
														className="cursor-pointer p-3 hover:text-green-300"
														onClick={() => {
															updateQuantity(item.product_id, item.quantity + 1);
														}}
													>
														<FaPlus />
													</div>
												</div>
											</div>
										</div>
									</div>
								</Box>
							);
						})}
					</div>
					<div className="lg:w-4/12 w-full">
						<Box className="mb-7">
							<div className="w-full">
								<h4 className="text-lg text-black mb-2">Ringkasan Belanja</h4>

								{/* Selected Items Summary */}
								{selectedItems.length > 0 && (
									<div className="mb-4 p-3 border rounded bg-blue-50">
										<h5 className="font-semibold text-blue-800 mb-2">Item Terpilih ({selectedItems.length})</h5>
										{selectedItems.map((item, idx) => (
											<div key={idx} className="text-sm text-blue-700 mb-1">
												• {item.product_name} (x{item.quantity})
											</div>
										))}
										<div className="mt-2 pt-2 border-t border-blue-200">
											<div className="flex justify-between font-semibold text-blue-900">
												<span>Total Terpilih:</span>
												<span>{formatRupiah(selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
											</div>
										</div>
									</div>
								)}

								{/* Ringkasan data inputan user di cart (readonly, untuk semua produk) */}
								<div className="mb-4 p-3 border rounded bg-gray-50">
									{/* Total Belanja */}
									<div className="flex font-bold justify-between text-[16px] mt-2 w-full  pt-2">
										<div className="">Total Keranjang</div>
										<div className="text-c-orange">{formatRupiah(calculateTotal())}</div>
									</div>
								</div>

								{/* Continue Checkout Button */}
								{selectedItems.length > 0 && (
									<div className="mb-3">
										{!validateSelection ? (
											<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
												<strong>Peringatan:</strong> Tidak dapat mencampur produk tiket dan perlengkapan event dalam satu checkout.
												Pilih hanya produk dengan tipe yang sama.
											</div>
										) : (
											<button
												className="w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
												onClick={() => {
													// Navigate to order summary page with selected items
													window.location.href = '/cart/order-summary';
												}}
											>
												Lanjutkan Checkout ({selectedItems.length} item)
											</button>
										)}
									</div>
								)}

								{/* Tombol pembayaran lama (untuk backward compatibility) */}
								{cart[0]?.product_type !== "ticket" ? (
									<div
										className={`bg-c-green text-white text-center py-3 mt-5 rounded-lg cursor-pointer ${
											!isCartValid ? "opacity-50 pointer-events-none" : ""
										}`}
										onClick={!isCartValid ? undefined : handleCheckout}
									>
										Pembayaran (Semua Item)
									</div>
								) : (
									<div
										className={`bg-c-green text-white text-center py-3 mt-5 rounded-lg cursor-pointer ${
											!isCartValid ? "opacity-50 pointer-events-none" : ""
										}`}
										onClick={!isCartValid ? undefined : checkoutTicket}
									>
										Pembayaran (Semua Item)
									</div>
								)}
							</div>
						</Box>
					</div>
				</div>
			) : (
				<Box className="mb-7 flex gap-1 items-center justify-center text-2xl">
					<div>Keranjang Belanja Kosong</div>
					<PiSmileySadDuotone />
				</Box>
			)}
		</div>
	);
}
