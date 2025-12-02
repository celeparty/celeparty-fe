/**
 * Komponen Footer untuk Ticket Template
 * Menampilkan line warna primary, tanggal generate, dan informasi kontak
 */

import React from 'react';
import { iTicketTemplateContext } from './interfaces';
import { formatDate } from '@/lib/utils';

export const TicketTemplateFooter: React.FC<iTicketTemplateContext> = ({
	data,
	config,
	className = '',
}) => {
	const formattedDate = formatDate(data.generated_date instanceof Date ? data.generated_date.toISOString() : String(data.generated_date));

	return (
		<div className={`w-full ${className}`}>
			{/* Garis Batas Warna Primary */}
			{config.show_footer_line !== false && (
				<div
					style={{
						height: '4px',
						backgroundColor: config.primary_color || '#3E2882',
						width: '100%',
					}}
				/>
			)}

			<div
				className="flex flex-col items-center justify-between px-6 py-4 md:flex-row"
				style={{ backgroundColor: '#F5F5F5' }}
			>
				{/* Tanggal Generate (Kiri) */}
				<div
					className="mb-4 text-left md:mb-0"
					style={{
						fontSize: '10px',
						color: '#929292',
						fontFamily: 'Lato, sans-serif',
					}}
				>
					<p>Tiket dihasilkan pada:</p>
					<p className="font-semibold">{formattedDate}</p>
				</div>

				{/* Informasi Kontak & Social Media (Kanan) */}
				<div
					className="text-center md:text-right"
					style={{
						fontSize: '10px',
						color: '#787878',
						fontFamily: 'Lato, sans-serif',
					}}
				>
					<p className="mb-2 font-semibold">{config.company_name}</p>
					
					<div className="mb-2 flex items-center justify-center gap-2 md:justify-end">
						{config.contact_info.phone && (
							<span>📞 {config.contact_info.phone}</span>
						)}
						{config.contact_info.email && (
							<span>📧 {config.contact_info.email}</span>
						)}
					</div>

					{/* Social Media */}
					{config.show_social_media !== false && (
						<div className="flex items-center justify-center gap-3 md:justify-end">
							{config.contact_info.instagram && (
								<a
									href={`https://instagram.com/${config.contact_info.instagram}`}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: config.primary_color || '#3E2882', textDecoration: 'none' }}
									className="hover:underline"
								>
									📱 Instagram
								</a>
							)}
							{config.contact_info.tiktok && (
								<a
									href={`https://tiktok.com/@${config.contact_info.tiktok}`}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: config.primary_color || '#3E2882', textDecoration: 'none' }}
									className="hover:underline"
								>
									🎵 TikTok
								</a>
							)}
							{config.contact_info.whatsapp && (
								<a
									href={`https://wa.me/${config.contact_info.whatsapp}`}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: config.primary_color || '#3E2882', textDecoration: 'none' }}
									className="hover:underline"
								>
									💬 WhatsApp
								</a>
							)}
							{config.contact_info.facebook && (
								<a
									href={`https://facebook.com/${config.contact_info.facebook}`}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: config.primary_color || '#3E2882', textDecoration: 'none' }}
									className="hover:underline"
								>
									f Facebook
								</a>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Footer Message */}
			{config.footer_message && (
				<div
					className="w-full border-t border-gray-300 px-6 py-3 text-center"
					style={{
						fontSize: '10px',
						color: '#787878',
						fontFamily: 'Lato, sans-serif',
						fontStyle: 'italic',
					}}
				>
					{config.footer_message}
				</div>
			)}
		</div>
	);
};
