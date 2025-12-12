/**
 * Komponen Body untuk Ticket Template
 * Menampilkan informasi produk, tiket, dan penerima
 */

import React from 'react';
import { iTicketTemplateContext } from './interfaces';
import { formatDate } from '@/lib/utils';

export const TicketTemplateBody: React.FC<iTicketTemplateContext> = ({
	data,
	config,
	className = '',
}) => {
	const InfoRow: React.FC<{ label: string; value: React.ReactNode; isBold?: boolean }> = ({
		label,
		value,
		isBold = false,
	}) => (
		<div className="grid grid-cols-3 items-center border-b border-gray-200 py-3">
			<span className="text-sm text-gray-600">{label}</span>
			<span
				className={`col-span-2 text-sm ${isBold ? 'font-bold text-gray-900' : 'text-gray-800'}`}
			>
				{value}
			</span>
		</div>
	);

	return (
		<div className={`w-full px-8 py-6 ${className}`}>
			{/* Informasi Produk Tiket */}
			<section className="mb-8">
				<h2
					className="mb-4 text-base font-bold uppercase"
					style={{
						color: config.primary_color || '#3E2882',
						borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
						paddingBottom: '8px',
					}}
				>
					Informasi Tiket
				</h2>
				<div className="space-y-1">
					<InfoRow label="Nama Event" value={data.product_title} isBold />
					<InfoRow
						label="Kode Tiket"
						value={
							<span
								className="font-mono text-lg"
								style={{ color: config.primary_color || '#3E2882' }}
							>
								{data.ticket_code}
							</span>
						}
					/>
					<InfoRow label="Varian Tiket" value={data.variant_name} />
					{data.event_date && (
						<InfoRow label="Tanggal Event" value={formatDate(String(data.event_date))} />
					)}
					{data.event_location && (
						<InfoRow label="Lokasi Event" value={data.event_location} />
					)}
				</div>
			</section>

			{/* Informasi Penerima */}
			<section className="mb-8">
				<h2
					className="mb-4 text-base font-bold uppercase"
					style={{
						color: config.primary_color || '#3E2882',
						borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
						paddingBottom: '8px',
					}}
				>
					Informasi Penerima E-Tiket
				</h2>
				<div className="space-y-1">
					<InfoRow label="Nama Penerima" value={data.recipient_name} isBold />
					<InfoRow label="Email" value={data.recipient_email} />
					<InfoRow label="No. Whatsapp" value={data.recipient_phone} />
					{data.recipient_identity_type && data.recipient_identity_number && (
						<InfoRow
							label={data.recipient_identity_type}
							value={data.recipient_identity_number}
						/>
					)}
				</div>
			</section>

			{/* Deskripsi Produk */}
			{data.product_description && (
				<section>
					<h2
						className="mb-4 text-base font-bold uppercase"
						style={{
							color: config.primary_color || '#3E2882',
							borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
							paddingBottom: '8px',
						}}
					>
						Deskripsi Tiket
					</h2>
					<p className="text-xs leading-relaxed text-gray-700">
						{data.product_description}
					</p>
				</section>
			)}
		</div>
	);
};
