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
			// Here you would implement the payment logic
			// For now, just redirect back to cart or show a message
			alert('Payment integration would go here');
		} catch (error) {
			console.error('Payment error:', error);
		} finally {
			setIsProcessing(false);
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
