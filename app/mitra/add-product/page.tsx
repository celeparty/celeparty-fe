import Link from "next/link"
import React from 'react'

export default function page() {
	return (
		<div className="flex">
			<div className="relative flex justify-between items-center w-full max-w-[500px] text-center gap-5">
				<Link href="/mitra/add-product/tiket" className="p-5 bg-c-gray-text hover:bg-c-green text-white rounded-xl flex-1 h-full flex items-center justify-center">Add Tiket</Link>
				<Link href="/mitra/add-product/party" className="p-5 bg-c-gray-text hover:bg-c-green text-white rounded-xl flex-1 h-full flex items-center justify-center">Add Produk Party</Link>
			</div>
		</div>
	)
}
