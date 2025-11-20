"use client";
import { DatePickerInput } from "@/components/form-components/DatePicker";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { eProductType } from "@/lib/enums/eProduct";
import { CartItem } from "@/lib/interfaces/iCart";
import { useCart, useNotif } from "@/lib/store/cart";
import { useTransaction } from "@/lib/store/transaction";
import { format, isValid, parse } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Notification = () => {
	const { statusNotif, message } = useNotif();

	return (
		statusNotif && (
			<div className="fixed top-0 left-0 right-0 z-50">
				<div className="wrapper-big">
					<div className=" bg-c-blue text-center text-white p-4 rounded-md shadow-md mt-1">{message}</div>
				</div>
			</div>
		)
	);
};

export default function SideBar({ dataProducts, currentPrice, selectedVariantId }: any) {
	const [qtyValue, setQtyValue] = useState(0);
	const [note, setNote] = useState("");
	const [shippingAddress, setShippingAddress] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [loadingDate, setLoadingDate] = useState("");
	const [loadingTime, setLoadingTime] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [telp, setTelp] = useState("");

	const { data: session, status } = useSession();
	const { cart, setCart }: any = useCart();
	const { transaction }: any = useTransaction();
	const notifCart = useNotif((state) => state.notifCart);

	const selectedVariant = dataProducts.variant.find((v: any) => v.id === selectedVariantId);
	const maxQuota = selectedVariant ? Number(selectedVariant.quota) : 0;

	const { toast } = useToast();

	const { user_event_type } = dataProducts;
	const { name: productTypeName } = user_event_type || {};

	useEffect(() => {
		if (session && session.user) {
			setCustomerName(session.user.name || "");
			setTelp(session.user.telp || "");
		}
	}, [session]);

	const addCart = () => {
		notifCart(`${dataProducts.title} berhasil dimasukan ke keranjang`);
		let variantName = "";
		if (dataProducts.variant && dataProducts.variant.length > 0 && selectedVariantId) {
			const selected = dataProducts.variant.find((v: any) => v.id === selectedVariantId);
			if (selected) variantName = selected.name;
		}
		const cartData = {
			product_id: dataProducts.id,
			product_name: dataProducts.title,
			price: currentPrice,
			image: dataProducts.main_image[0].url,
			quantity: qtyValue,
			note: note,
			loading_date: loadingDate,
			loading_time: loadingTime,
			event_date: productTypeName === eProductType.ticket ? dataProducts.event_date || "" : eventDate,
			shipping_location: shippingAddress,
			customer_name: customerName,
			telp: telp,
			variant: variantName,
			user_event_type: dataProducts.user_event_type?.name || dataProducts.user_event_type?.id || "",
			product_type: productTypeName === eProductType.ticket ? ("ticket" as const) : ("equipment" as const),
			vendor_id: dataProducts.users_permissions_user?.documentId || "",
		};
		const cartRaw = useCart.getState().cart;
		const prevCart: CartItem[] = Array.isArray(cartRaw) ? cartRaw : [];
		const idx = prevCart.findIndex((item: CartItem) => item.product_id === cartData.product_id);
		let newCart: CartItem[];
		if (idx !== -1) {
			// Update data jika produk sudah ada
			newCart = [...prevCart];
			newCart[idx] = { ...newCart[idx], ...cartData };
		} else {
			// Tambah produk baru
			newCart = [...prevCart, cartData];
		}
		setCart(newCart);
	};

	const showErrorToast = () => {
		toast({
			description:
				qtyValue >= maxQuota && selectedVariantId !== null
					? "Anda telah memilih melebihi batas kuota tiket"
					: "Silahkan pilih variant Produk terlebih dahulu!",
			className: eAlertType.FAILED,
			duration: 1000,
		});
	};

	return (
		<div className="p-5 shadow-lg rounded-lg border-solid border-[1px] border-gray-100 -mt-6 lg:-mt-0">
			{status === "authenticated" ? (
				<>
					<h4 className="font-bold lg:font-normal">Atur Jumlah dan Detail Pengiriman</h4>
					<div className="relative lg:mt-5 mt-[10px]">
						<label className="mb-1 block">Jumlah</label>
						<div className=" border-solid w-auto inline-block border-[1px] rounded-lg border-c-gray">
							<div className="flex items-center gap-2">
								<div
									className="cursor-pointer p-3 hover:text-green-300"
									onClick={() => {
										qtyValue > 0 && setQtyValue(qtyValue - 1);
									}}
								>
									<FaMinus />
								</div>
								<div>{qtyValue}</div>
								<div
									className="cursor-pointer p-3 hover:text-green-300"
									onClick={() => {
										if (qtyValue < maxQuota) {
											setQtyValue(qtyValue + 1);
										} else {
											showErrorToast();
										}
									}}
								>
									<FaPlus />
								</div>
							</div>
						</div>
					</div>
					<div className="relative lg:mt-5 mt-[10px]">
						<div>Minimal Order : {dataProducts.minimal_order > 0 ? dataProducts.minimal_order : "1"} </div>
						<div>
							Batas waktu pemesanan :{" "}
							{selectedVariant?.purchase_deadline || (dataProducts.maximal_order_date ?? "-")}{" "}
						</div>
						{/* Field Tanggal Acara - untuk produk non-ticket saja */}
						{productTypeName !== eProductType.ticket && (
							<div className="input-group">
								<label className="mb-1 block text-black mt-3 font-bold">Tanggal Acara</label>
								<DatePickerInput
									onChange={(date) => {
										if (date instanceof Date && isValid(date)) {
											const formatted = format(date, "dd-MM-yyyy");
											setEventDate(formatted);
										}
									}}
									textLabel="Pilih Tanggal Acara"
									value={eventDate ? parse(eventDate, "dd-MM-yyyy", new Date()) : null}
								/>
							</div>
						)}

						{/* Field khusus untuk produk non-ticket */}
						{productTypeName !== eProductType.ticket && (
							<>
								<div className="input-group">
									<label className="mb-1 block text-black mt-3 font-bold">Detail Alamat</label>
									<textarea
										className="w-full h-[100px] border-solid border-[1px] rounded-lg border-c-gray p-3"
										onChange={(e) => setShippingAddress(e.target.value)}
									/>
								</div>
								<div className="input-group">
									<label className="mb-1 block text-black mt-3 font-bold">Tanggal Loading</label>
									<DatePickerInput
										onChange={(date) => {
											if (date instanceof Date && isValid(date)) {
												const formatted = format(date, "dd-MM-yyyy");
												setLoadingDate(formatted);
											}
										}}
										textLabel="Pilih Tanggal Loading"
										value={loadingDate ? parse(loadingDate, "dd-MM-yyyy", new Date()) : null}
									/>
								</div>
								<div className="input-group">
									<label className="mb-1 block text-black mt-3 font-bold">Jam Loading</label>
									<div className="time-input w-full border-solid border-[1px] rounded-lg border-c-gray p-3">
										<input
											type="time"
											className="w-full"
											onChange={(e) => {
												const time = e.target.value;
												setLoadingTime(time);
											}}
											value={loadingTime}
										/>
									</div>
								</div>
							</>
						)}

						{/* Field catatan untuk semua produk */}
						<div className="input-group">
							<label className="mb-1 block text-black mt-3 font-bold">Tambah Catatan</label>
							<textarea
								className="w-full h-[100px] border-solid border-[1px] rounded-lg border-c-gray p-3"
								onChange={(e) => setNote(e.target.value)}
							/>
						</div>
					</div>
					<div className="text-center mx-auto w-full lg:max-w-[150px]">
						<input
							type="button"
							disabled={
								qtyValue >= 1 &&
								(dataProducts.variant && dataProducts.variant.length > 1
									? selectedVariantId !== null
									: true)
									? false
									: true
							}
							value="+ Keranjang"
							className={`${
								qtyValue >= 1 &&
								(
									dataProducts.variant && dataProducts.variant.length > 1
										? selectedVariantId !== null
										: true
								)
									? "bg-c-green cursor-pointer"
									: "bg-c-gray-text2 opacity-30 cursor-default"
							}  mt-5 text-white text-[15px] py-3 w-full rounded-lg `}
							onClick={addCart}
						/>
					</div>
				</>
			) : (
				<div>
					<h4>Silahkan Login Terlebih Dahulu</h4>
					<div className="h-14">
						<Link
							href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
							className="btnline justify-center items-start inline-flex"
						>
							<div className="py-1">Masuk</div>
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
