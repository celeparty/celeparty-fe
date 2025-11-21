"use client";
import Box from "@/components/Box";
import { eProductType } from "@/lib/enums/eProduct";
import { useCart } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/utils";
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

	// Get selected items and validation from store
	const selectedItems = useCart((state) => state.selectedItems);
	const validateSelection = useCart((state) => state.validateSelection());
	const selectItem = useCart((state) => state.selectItem);
	const deselectItem = useCart((state) => state.deselectItem);
	const getSelectedItems = useCart((state) => state.getSelectedItems);
	const clearSelection = useCart((state) => state.clearSelection);

	const selectedCartItems = getSelectedItems();
	const selectedTotal = selectedCartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0);
	const isSelectionValid =
		selectedItems.length > 0 &&
		selectedCartItems.length > 0 &&
		selectedCartItems.every((item: any) => item.product_type === selectedCartItems[0].product_type);

	// Validasi cart berdasarkan tipe produk - sekarang menggunakan selected items
	const isCartValid =
		selectedCartItems.length > 0 &&
		isSelectionValid &&
		selectedCartItems.every((item: any) => {
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



	return (
		<div className="wrapper">
			{cart.length > 0 ? (
				<div className="flex lg:flex-row flex-col lg:gap-5 gap-2">
					<div className="lg:w-8/12 w-full">
						{cart.map((item: any, index: number) => {
							const isSelected = selectedItems.includes(item.product_id);
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
												<span
													className={`px-2 py-1 rounded text-xs ${item.product_type === "ticket" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
												>
													{item.product_type === "ticket" ? "Ticket" : "Equipment"}
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
								</Box>
							);
						})}
					</div>
					<div className="lg:w-4/12 w-full">
						<Box className="mb-7">
							<div className="w-full">
								<h4 className="text-lg text-black mb-2">Ringkasan Belanja</h4>

								{/* Selected Items Summary */}
								{selectedCartItems.length > 0 && (
									<div className="mb-4 p-3 border rounded bg-blue-50">
										<h5 className="font-semibold text-blue-800 mb-2">
											Item Terpilih ({selectedCartItems.length})
										</h5>
										{selectedCartItems.map((item: any, idx: number) => (
											<div key={idx} className="text-sm text-blue-700 mb-1">
												• {item.product_name} (x{item.quantity})
											</div>
										))}
										<div className="mt-2 pt-2 border-t border-blue-200">
											<div className="flex justify-between font-semibold text-blue-900">
												<span>Total Terpilih:</span>
												<span>{formatRupiah(selectedTotal)}</span>
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
								{selectedCartItems.length > 0 && (
									<div className="mb-3">
										{!isSelectionValid ? (
											<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
												<strong>Peringatan:</strong> Tidak dapat mencampur produk tiket dan
												perlengkapan event dalam satu checkout. Pilih hanya produk dengan tipe
												yang sama.
											</div>
										) : (
											<button
												className="w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
												onClick={() => {
													// Navigate to order summary page with selected items
													window.location.href = "/cart/order-summary";
												}}
											>
												Lanjutkan Checkout ({selectedCartItems.length} item)
											</button>
										)}
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
