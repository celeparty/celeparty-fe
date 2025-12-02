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
	return (
		<div className={`w-full px-6 py-6 ${className}`}>
			{/* Informasi Produk Tiket */}
			<section className="mb-6">
				<h2
					className="mb-3 font-bold uppercase"
					style={{
						fontSize: '14px',
						color: config.primary_color || '#3E2882',
						borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
						paddingBottom: '8px',
						fontFamily: 'Lato, sans-serif',
					}}
				>
					Informasi Tiket
				</h2>

				<div className="space-y-3">
					{/* Nama Produk */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Nama Produk:
						</span>
						<span
							className="font-semibold"
							style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}
						>
							{data.product_title}
						</span>
					</div>

					{/* Kode Tiket */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Kode Tiket:
						</span>
						<span
							className="font-mono font-bold"
							style={{ fontSize: '13px', color: config.primary_color || '#3E2882' }}
						>
							{data.ticket_code}
						</span>
					</div>

					{/* Tipe/Varian */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Varian Tiket:
						</span>
						<span style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}>
							{data.variant_name}
						</span>
					</div>

					{/* Event Date */}
				{data.event_date && (
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Tanggal Event:
						</span>
						<span style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}>
							{formatDate(String(data.event_date))}
						</span>
					</div>
				)}					{/* Event Location */}
					{data.event_location && (
						<div className="flex justify-between pb-2">
							<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
								Lokasi Event:
							</span>
							<span style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}>
								{data.event_location}
							</span>
						</div>
					)}
				</div>
			</section>

			{/* Informasi Penerima */}
			<section className="mb-6">
				<h2
					className="mb-3 font-bold uppercase"
					style={{
						fontSize: '14px',
						color: config.primary_color || '#3E2882',
						borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
						paddingBottom: '8px',
						fontFamily: 'Lato, sans-serif',
					}}
				>
					Informasi Penerima E-Tiket
				</h2>

				<div className="space-y-3">
					{/* Nama Penerima */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Nama Penerima:
						</span>
						<span
							className="font-semibold"
							style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}
						>
							{data.recipient_name}
						</span>
					</div>

					{/* Email */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							Email:
						</span>
						<span style={{ fontSize: '11px', color: '#000000', fontFamily: 'Lato' }}>
							{data.recipient_email}
						</span>
					</div>

					{/* Telepon */}
					<div className="flex justify-between border-b border-gray-300 pb-2">
						<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
							No. Telepon:
						</span>
						<span style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}>
							{data.recipient_phone}
						</span>
					</div>

					{/* Identitas */}
					{data.recipient_identity_type && data.recipient_identity_number && (
						<div className="flex justify-between pb-2">
							<span style={{ fontSize: '12px', color: '#787878', fontFamily: 'Lato' }}>
								{data.recipient_identity_type}:
							</span>
							<span style={{ fontSize: '12px', color: '#000000', fontFamily: 'Lato' }}>
								{data.recipient_identity_number}
							</span>
						</div>
					)}
				</div>
			</section>

			{/* Deskripsi Produk */}
			{data.product_description && (
				<section className="mb-6">
					<h2
						className="mb-3 font-bold uppercase"
						style={{
							fontSize: '14px',
							color: config.primary_color || '#3E2882',
							borderBottom: `2px solid ${config.accent_color || '#DA7E01'}`,
							paddingBottom: '8px',
							fontFamily: 'Lato, sans-serif',
						}}
					>
						Deskripsi Tiket
					</h2>
					<p
						style={{
							fontSize: '11px',
							color: '#404040',
							lineHeight: '1.6',
							fontFamily: 'Lato, sans-serif',
						}}
					>
						{data.product_description}
					</p>
				</section>
			)}
		</div>
	);
};
