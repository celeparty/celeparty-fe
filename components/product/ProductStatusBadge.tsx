import React, { useState } from "react";
import { Info } from "lucide-react";

interface ProductStatusBadgeProps {
	status: 'published' | 'unpublished' | 'pending' | 'rejected' | null;
	className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status, className = "" }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	const statusConfig = {
		published: {
			label: 'Tiket Aktif',
			bgColor: 'bg-green-500',
			description: 'Produk Anda sudah aktif dan dapat dilihat oleh pelanggan di halaman Celeparty.',
		},
		unpublished: {
			label: 'Menunggu Persetujuan',
			bgColor: 'bg-yellow-500',
			description: 'Produk Anda sedang dalam proses verifikasi oleh admin. Biasanya membutuhkan waktu 1-3 hari kerja.',
		},
		pending: {
			label: 'Pending',
			bgColor: 'bg-yellow-500',
			description: 'Status produk sedang dalam proses.',
		},
		rejected: {
			label: 'Ditolak',
			bgColor: 'bg-red-500',
			description: 'Produk Anda ditolak oleh admin. Silakan hubungi support untuk informasi lebih lanjut.',
		},
	};

	if (!status || !statusConfig[status]) {
		return null;
	}

	const config = statusConfig[status];

	return (
		<div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
			<div className={`px-2 py-1 text-xs font-bold rounded-full text-white ${config.bgColor} flex items-center gap-1 cursor-help ${className}`}>
				{config.label}
				<Info className="h-3 w-3" />
			</div>

			{showTooltip && (
				<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
					{config.description}
					<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
				</div>
			)}
		</div>
	);
};

export default ProductStatusBadge;
