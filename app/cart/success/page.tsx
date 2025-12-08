"use client";
import Box from "@/components/Box";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
	const [summary, setSummary] = useState<any>(null);
	const router = useRouter();

	useEffect(() => {
		const data = sessionStorage.getItem("transaction_summary");
		if (data) setSummary(JSON.parse(data));
	}, []);

	useEffect(() => {
		if (summary) {
			const timer = setTimeout(() => {
				router.push("/user/profile/bio");
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [summary, router]);

	if (!summary) return <div className="text-center p-7">Memuat ringkasan transaksi...</div>;

	return (
		<div className="wrapper flex flex-col items-center justify-center min-h-[60vh]">
			<Box className="max-w-lg w-full text-center p-12">
				<h2 className="text-2xl font-bold mb-4 text-green-600">Transaksi Berhasil!</h2>
				<div className="mb-2">
					Nomor Order: <span className="font-mono">{summary.orderId}</span>
				</div>
				<div className="mb-4">
					Total: <span className="font-bold text-c-orange">Rp {summary.total.toLocaleString()}</span>
				</div>
				<div className="mb-4">
					<h4 className="font-semibold mb-2">Produk:</h4>
					<ul className="text-center">
						{summary.products.map((item: any, idx: number) => (
							<li key={idx} className="mb-1 text-center mx-auto ">
								{item.product_name} x {item.quantity}
								{item.note && <span className="ml-2 text-xs text-gray-500">({item.note})</span>}
							</li>
						))}
					</ul>
				</div>
				<div className="mb-4">
					<Button
						onClick={async () => {
							try {
								// Handle unified invoice generation for mixed transactions
								const invoicePromises = [];

								// Generate invoices for ticket transactions
								if (summary.ticketTransactionIds && summary.ticketTransactionIds.length > 0) {
									summary.ticketTransactionIds.forEach((ticketId: string) => {
										invoicePromises.push(
											fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/transaction-tickets/generateInvoice/${ticketId}`)
												.then(response => response.blob())
												.then(blob => ({ type: 'ticket', id: ticketId, blob }))
										);
									});
								}

								// Generate invoice for equipment transaction
								if (summary.equipmentTransactionId) {
									invoicePromises.push(
										fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/transactions/generateInvoice/${summary.equipmentTransactionId}`)
											.then(response => response.blob())
											.then(blob => ({ type: 'equipment', id: summary.equipmentTransactionId, blob }))
									);
								}

								// Download all invoices
								const results = await Promise.all(invoicePromises);

								results.forEach((result, index) => {
									const link = document.createElement("a");
									link.href = URL.createObjectURL(result.blob);
									link.download = `invoice-${result.type}-${result.id}.pdf`;
									link.click();
								});

								if (results.length === 0) {
									alert("Tidak ada invoice yang dapat diunduh.");
								}
							} catch (error) {
								console.error("Error downloading invoices:", error);
								alert("Gagal mengunduh invoice. Silakan coba lagi.");
							}
						}}
						className="flex items-center gap-2 mx-auto"
					>
						<Download className="h-4 w-4" />
						Download Invoice
					</Button>
				</div>
				<Link href="/" className="inline-block bg-c-green text-white px-6 py-2 rounded-lg mt-4">
					Kembali ke Beranda
				</Link>
			</Box>
		</div>
	);
}
