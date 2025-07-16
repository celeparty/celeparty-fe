"use client";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import Link from "next/link";

export default function SuccessPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("transaction_summary");
    if (data) setSummary(JSON.parse(data));
  }, []);

  if (!summary) return <div className="text-center p-7">Memuat ringkasan transaksi...</div>;

  return (
    <div className="wrapper flex flex-col items-center justify-center min-h-[60vh]">
      <Box className="max-w-lg w-full text-center p-12">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Transaksi Berhasil!</h2>
        <div className="mb-2">Nomor Order: <span className="font-mono">{summary.orderId}</span></div>
        <div className="mb-4">Total: <span className="font-bold text-c-orange">Rp {summary.total.toLocaleString()}</span></div>
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
        <Link href="/" className="inline-block bg-c-green text-white px-6 py-2 rounded-lg mt-4">Kembali ke Beranda</Link>
      </Box>
    </div>
  );
} 