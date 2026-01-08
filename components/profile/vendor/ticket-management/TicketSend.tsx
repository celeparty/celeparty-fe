"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { axiosUser } from "@/lib/services";
import {
	iSendTicketRequest,
	iTicketRecipient,
	iSendTicketHistory,
} from "@/lib/interfaces/iTicketManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { formatDateIndonesia } from "@/lib/dateFormatIndonesia";
import { Plus, Trash2, Lock } from "lucide-react";
import Skeleton from "@/components/Skeleton";

export const TicketSend: React.FC = () => {
	const { data: session } = useSession();
	const { toast } = useToast();

	// Form state
	const [selectedProduct, setSelectedProduct] = useState<string>("");
	const [selectedVariant, setSelectedVariant] = useState<string>("");
	const [quantity, setQuantity] = useState<number>(1);
	const [recipients, setRecipients] = useState<iTicketRecipient[]>([
		{
			name: "",
			email: "",
			phone: "",
			identity_type: "KTP",
			identity_number: "",
		},
	]);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch products
	const getVendorTickets = async () => {
		if (!session?.jwt || !session?.user?.documentId) return [];
		try {
			// Try method 1: Filter by users_permissions_user relationship
			console.log("TicketSend - Fetching products for vendor:", session.user.documentId);
			let response = null;
			let fallbackError = null;

			try {
				// Method 1: Filter by users_permissions_user id
				const url1 = `/api/products?filters[users_permissions_user][id][$eq]=${session.user.documentId}&filters[user_event_type][name][$eq]=Ticket&populate[variants]=*&pagination[pageSize]=100`;
				console.log("TicketSend - Trying filter method 1:", url1);
				response = await axiosUser("GET", url1, session.jwt);
				console.log("TicketSend - Method 1 success:", response.data?.data?.length || 0, "products found");
			} catch (error1: any) {
				console.warn("TicketSend - Method 1 failed:", error1.response?.status, error1.response?.data?.error || error1.message);
				fallbackError = error1;
				
				try {
					// Method 2: Fetch all ticket products and filter by user relationship
					const url2 = `/api/products?filters[user_event_type][name][$eq]=Ticket&populate[users_permissions_user]=*&populate[variants]=*&pagination[pageSize]=100`;
					console.log("TicketSend - Trying filter method 2:", url2);
					response = await axiosUser("GET", url2, session.jwt);
					console.log("TicketSend - Method 2 success, filtering client-side");
				} catch (error2: any) {
					console.warn("TicketSend - Method 2 failed:", error2.response?.status, error2.response?.data?.error || error2.message);
					
					try {
						// Method 3: Just get all products and filter by user
						const url3 = `/api/products?filters[user_event_type][name][$eq]=Ticket&populate=*&pagination[pageSize]=100`;
						console.log("TicketSend - Trying filter method 3:", url3);
						response = await axiosUser("GET", url3, session.jwt);
						console.log("TicketSend - Method 3 success, will filter client-side");
					} catch (error3: any) {
						console.error("TicketSend - All methods failed, returning empty", error3.message);
						return [];
					}
				}
			}

			const products = response?.data?.data || [];
			console.log("TicketSend - Total products fetched:", products.length);
			
			// Map to a consistent structure, ensuring variants are always an array
			return products.map((p: any) => {
				// Try both 'variant' and 'variants' field names
				const variantData = p.attributes?.variants || p.attributes?.variant || [];
				const variantArray = Array.isArray(variantData) ? variantData : [];
				
				const mappedProduct = {
					id: p.id || p.documentId,
					documentId: p.id || p.documentId,
					title: p.attributes?.title || p.title || "Tiket Tanpa Nama",
					vendor_id: p.attributes?.users_permissions_user?.data?.id || p.attributes?.users_permissions_user,
					variant: variantArray.map((v: any) => ({
						id: v.id || v.documentId,
						documentId: v.id || v.documentId,
						name: v.name || "Default",
						price: parseFloat(v.price || 0)
					})) || [],
				};
				
				console.log("TicketSend - Mapped product:", {
					title: mappedProduct.title,
					id: mappedProduct.id,
					variantCount: mappedProduct.variant.length,
					variants: mappedProduct.variant
				});
				
				return mappedProduct;
			}).filter((product: any) => {
				// Client-side filter: Only return products where vendor matches current user
				// This handles case where filter didn't work on server side
				const vendorMatch = product.vendor_id === session.user.documentId ||
					product.vendor_id === session.user.id ||
					!product.vendor_id; // Include if vendor_id not set (fallback)
				console.log("TicketSend - Product filter check:", {
					title: product.title,
					vendor_id: product.vendor_id,
					currentUser: session.user.documentId,
					matches: vendorMatch
				});
				return vendorMatch;
			});
		} catch (error) {
			console.error("TicketSend - Error fetching vendor tickets:", error);
			return [];
		}
	};

	const productsQuery = useQuery({
		queryKey: ["vendorTickets", session?.jwt],
		queryFn: getVendorTickets,
		enabled: !!session?.jwt,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch send history
	const getSendHistory = async () => {
		if (!session?.jwt) return [];
		try {
			// Correct endpoint: /api/ticket-send-histories instead of /api/transactions/send-history
			const response = await axiosUser(
				"GET",
				`/api/ticket-send-histories?filters[vendor][$eq]=${session.user.documentId}&sort=createdAt:desc&pagination[pageSize]=100`,
				session.jwt
			);
			const histories = response.data?.data || [];
			console.log("Ticket send history:", histories);
			return histories;
		} catch (error) {
			console.error("Error fetching send history:", error);
			return [];
		}
	};

	const historyQuery = useQuery({
		queryKey: ["transactionSendHistory", session?.jwt],
		queryFn: getSendHistory,
		enabled: !!session?.jwt,
		staleTime: 5 * 60 * 1000,
	});

	// Get variants for selected product
	const variants = useMemo(() => {
		console.log('Computing variants...', {
			selectedProduct,
			productsQueryDataLength: productsQuery.data?.length,
		});

		if (!selectedProduct || !productsQuery.data || productsQuery.data.length === 0) {
			console.log('Early return: Missing selectedProduct or productsQuery.data');
			return [];
		}
		
		console.log('Looking for product with ID:', selectedProduct);
		console.log('Available products:', productsQuery.data.map((p: any) => ({
			id: p.id,
			documentId: p.documentId,
			title: p.title,
			variantCount: Array.isArray(p.variant) ? p.variant.length : 0,
		})));
		
		const product = productsQuery.data.find(
			(p: any) => p.documentId === selectedProduct || p.id === selectedProduct
		);
		
		console.log('Found product:', {
			selectedProduct,
			found: !!product,
			productTitle: product?.title,
			variantArray: product?.variant,
			variantCount: Array.isArray(product?.variant) ? product.variant.length : 0,
		});
		
		if (!product) {
			console.warn('Product not found with ID:', selectedProduct);
			return [];
		}
		
		// Get variants from product
		const productVariants = Array.isArray(product.variant) ? product.variant : [];
		console.log('Product variants to display:', productVariants);
		
		// Map variants to display format
		const mappedVariants = productVariants.map((v: any) => ({
			...v,
			id: v.id || v.documentId,
			documentId: v.documentId || v.id,
		}));
		
		console.log('Mapped variants:', mappedVariants);
		return mappedVariants;
	}, [selectedProduct, productsQuery.data]);

	// Handle recipient change
	const handleRecipientChange = (
		index: number,
		field: keyof iTicketRecipient,
		value: string
	) => {
		const newRecipients = [...recipients];
		newRecipients[index] = {
			...newRecipients[index],
			[field]: value,
		};
		setRecipients(newRecipients);
	};

	// Add recipient
	const addRecipient = () => {
		if (recipients.length < quantity) {
			setRecipients([
				...recipients,
				{
					name: "",
					email: "",
					phone: "",
					identity_type: "KTP",
					identity_number: "",
				},
			]);
		}
	};

	// Remove recipient
	const removeRecipient = (index: number) => {
		setRecipients(recipients.filter((_, i) => i !== index));
	};

	// Validate form
	const isFormValid = useMemo(() => {
		return (
			selectedProduct &&
			selectedVariant &&
			recipients.length === quantity &&
			recipients.every(
				(r) => r.name && r.email && r.phone && r.identity_number
			)
		);
	}, [selectedProduct, selectedVariant, quantity, recipients]);

	// Handle submit
	const handleSubmit = async () => {
		if (!isFormValid) {
			toast({
				title: "Validasi Gagal",
				description: "Silakan lengkapi semua data yang wajib diisi",
				className: eAlertType.FAILED,
			});
			return;
		}

		setShowPasswordModal(true);
	};

	// Confirm send
	const confirmSend = async () => {
		if (!password) {
			toast({
				title: "Error",
				description: "Masukkan password untuk konfirmasi",
				className: eAlertType.FAILED,
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const payload: iSendTicketRequest = {
				product_id: selectedProduct,
				variant_id: selectedVariant,
				recipients,
				password,
			};

			// TODO: This endpoint is speculative and needs to be implemented in the backend.
			const response = await axiosUser(
				"POST",
				"/api/transactions/send-invitation",
				session?.jwt || "",
				payload
			);

			if (response?.success) {
				toast({
					title: "Sukses",
					description: `Tiket berhasil dikirim ke ${recipients.length} penerima!`,
					className: eAlertType.SUCCESS,
				});

				// Reset form
				setSelectedProduct("");
				setSelectedVariant("");
				setQuantity(1);
				setRecipients([
					{
						name: "",
						email: "",
						phone: "",
						identity_type: "KTP",
						identity_number: "",
					},
				]);
				setPassword("");
				setShowPasswordModal(false);

				// Refresh history
				historyQuery.refetch();
			}
		} catch (error: any) {
			console.error("Error sending tickets:", error);
			toast({
				title: "Error",
				description:
					error?.response?.data?.message || "Gagal mengirim tiket",
				className: eAlertType.FAILED,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (productsQuery.isLoading || historyQuery.isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton width="100%" height="200px" />
				<Skeleton width="100%" height="300px" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Send Form */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h3 className="text-lg font-semibold mb-4">Form Kirim Tiket Undangan</h3>

				<div className="space-y-4 mb-6">
					{/* Pilih Produk Tiket */}
					<div>
						<label className="block text-sm font-medium mb-2">
							Pilih Produk Tiket <span className="text-red-500">*</span>
						</label>
						{productsQuery.isLoading ? (
							<div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">Loading produk...</div>
						) : productsQuery.isError ? (
							<div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">Error memuat produk</div>
						) : !productsQuery.data || productsQuery.data.length === 0 ? (
							<div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
								Tidak ada produk tiket. Silakan buat produk tiket terlebih dahulu.
							</div>
						) : (
							<Select value={selectedProduct} onValueChange={(value) => {
								setSelectedProduct(value);
								setSelectedVariant(""); // Reset variant when product changes
							}}>
								<SelectTrigger className="bg-white">
									<SelectValue placeholder="Pilih Produk Tiket" />
								</SelectTrigger>
								<SelectContent>
									{productsQuery.data?.map((product: any) => (
										<SelectItem 
											key={product.documentId || product.id} 
											value={product.documentId || product.id}
										>
											{product.title || product.name || "Produk Tanpa Nama"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>					{/* Pilih Varian */}
					<div>
						<label className="block text-sm font-medium mb-2">
							Pilih Varian Tiket <span className="text-red-500">*</span>
						</label>
						{!selectedProduct ? (
							<div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
								Pilih produk tiket terlebih dahulu
							</div>
						) : variants.length === 0 ? (
							<div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
								Tidak ada varian untuk produk ini
							</div>
						) : (
							<Select value={selectedVariant} onValueChange={setSelectedVariant}>
								<SelectTrigger className="bg-white">
									<SelectValue placeholder="Pilih Varian Tiket" />
								</SelectTrigger>
								<SelectContent>
									{variants.map((variant: any) => (
										<SelectItem 
											key={variant.id || variant.documentId || variant.name} 
											value={variant.id || variant.documentId || variant.name}
										>
											{variant.name} {variant.price ? `- Rp ${variant.price.toLocaleString('id-ID')}` : ''}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{/* Jumlah Tiket */}
					<div>
						<label className="block text-sm font-medium mb-2">
							Jumlah Tiket <span className="text-red-500">*</span>
						</label>
						<Input
							type="number"
							min="1"
							max="100"
							value={quantity}
							onChange={(e) => {
								const newQty = parseInt(e.target.value) || 1;
								setQuantity(newQty);

								// Adjust recipients array
								const currentLength = recipients.length;
								if (newQty > currentLength) {
									const newRecipients = [
										...recipients,
										...Array(newQty - currentLength)
											.fill(null)
											.map(() => ({
												name: "",
												email: "",
												phone: "",
												identity_type: "KTP",
												identity_number: "",
											})),
									];
									setRecipients(newRecipients);
								} else if (newQty < currentLength) {
									setRecipients(recipients.slice(0, newQty));
								}
							}}
							placeholder="Masukkan jumlah tiket"
						/>
					</div>
				</div>

				{/* Recipients Section */}
				<div className="space-y-4">
					<h4 className="font-semibold">
						Detail Penerima Tiket ({recipients.length}/{quantity})
					</h4>
					{recipients.map((recipient, idx) => (
						<div
							key={idx}
							className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
						>
							<div className="flex justify-between items-center mb-3">
								<p className="font-medium text-sm">Penerima {idx + 1}</p>
								{recipients.length > 1 && (
									<button
										type="button"
										onClick={() => removeRecipient(idx)}
										className="text-red-500 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<Input
									placeholder="Nama Penerima"
									value={recipient.name}
									onChange={(e) =>
										handleRecipientChange(idx, "name", e.target.value)
									}
									required
								/>
								<Input
									placeholder="Email"
									type="email"
									value={recipient.email}
									onChange={(e) =>
										handleRecipientChange(idx, "email", e.target.value)
									}
									required
								/>
								<Input
									placeholder="No. Telepon"
									value={recipient.phone}
									onChange={(e) =>
										handleRecipientChange(idx, "phone", e.target.value)
									}
									required
								/>
								<Select
									value={recipient.identity_type}
									onValueChange={(value) =>
										handleRecipientChange(idx, "identity_type", value)
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="KTP">KTP</SelectItem>
										<SelectItem value="SIM">SIM</SelectItem>
										<SelectItem value="PASSPORT">PASSPORT</SelectItem>
										<SelectItem value="OTHER">Lainnya</SelectItem>
									</SelectContent>
								</Select>
								<Input
									placeholder="No. Identitas"
									value={recipient.identity_number}
									onChange={(e) =>
										handleRecipientChange(
											idx,
											"identity_number",
											e.target.value
										)
									}
									required
									className="md:col-span-2"
								/>
							</div>
						</div>
					))}

					{recipients.length < quantity && (
						<Button
							type="button"
							variant="outline"
							onClick={addRecipient}
							className="w-full flex items-center justify-center gap-2"
						>
							<Plus className="w-4 h-4" />
							Tambah Penerima
						</Button>
					)}
				</div>

				{/* Submit Button */}
				<div className="mt-6">
					<Button
						onClick={handleSubmit}
						disabled={!isFormValid}
						className="w-full"
						size="lg"
					>
						Kirim Tiket Undangan
					</Button>
				</div>
			</div>

			{/* Password Confirmation Modal */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
						<h4 className="font-semibold text-lg flex items-center gap-2">
							<Lock className="w-5 h-5" />
							Konfirmasi Password
						</h4>
						<p className="text-sm text-gray-600">
							Masukkan password akun Anda untuk konfirmasi pengiriman tiket
						</p>
						<Input
							type="password"
							placeholder="Masukkan password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowPasswordModal(false);
									setPassword("");
								}}
								className="flex-1"
							>
								Batal
							</Button>
							<Button
								onClick={confirmSend}
								disabled={isSubmitting}
								className="flex-1"
							>
								{isSubmitting ? "Mengirim..." : "Konfirmasi"}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Send History */}
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h3 className="text-lg font-semibold mb-4">Riwayat Pengiriman Tiket</h3>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-gray-100 border-b border-gray-200">
								<th className="px-3 py-2 text-left font-semibold">Tanggal Kirim</th>
								<th className="px-3 py-2 text-left font-semibold">Produk</th>
								<th className="px-3 py-2 text-left font-semibold">Varian</th>
								<th className="px-3 py-2 text-center font-semibold">Jumlah</th>
								<th className="px-3 py-2 text-left font-semibold">Dikirim Oleh</th>
							</tr>
						</thead>
						<tbody>
							{historyQuery.data && historyQuery.data.length > 0 ? (
								historyQuery.data.map((item: iSendTicketHistory, idx: number) => (
									<tr
										key={idx}
										className="border-b border-gray-200 hover:bg-gray-50"
									>
										<td className="px-3 py-2">
											{formatDateIndonesia(item.send_date)}
										</td>
										<td className="px-3 py-2">{item.product_title}</td>
										<td className="px-3 py-2">{item.variant_name}</td>
										<td className="px-3 py-2 text-center">{item.recipient_count}</td>
										<td className="px-3 py-2">{item.sent_by}</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="px-3 py-8 text-center text-gray-500">
										Belum ada riwayat pengiriman tiket
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
