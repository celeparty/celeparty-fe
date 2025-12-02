/**
 * Komponen QR Code untuk Ticket Template
 * Menampilkan QR code di tengah untuk verifikasi tiket
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { iTicketTemplateContext } from './interfaces';

export const TicketTemplateQRCode: React.FC<iTicketTemplateContext> = ({
	data,
	config,
	className = '',
}) => {
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const generateQRCode = async () => {
			try {
				// Generate QR code dari data yang diberikan
				const qrDataUrl = await QRCode.toDataURL(data.qr_code_data, {
					width: 200,
					margin: 2,
					color: {
						dark: config.primary_color || '#3E2882',
						light: '#FFFFFF',
					},
					quality: 0.95,
				});
				setQrCodeDataUrl(qrDataUrl);
			} catch (error) {
				console.error('Error generating QR code:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (data.qr_code_data) {
			generateQRCode();
		}
	}, [data.qr_code_data, config.primary_color]);

	if (isLoading) {
		return (
			<div className={`flex w-full justify-center py-8 ${className}`}>
				<div
					className="h-[200px] w-[200px] animate-pulse rounded"
					style={{ backgroundColor: '#E5E5E5' }}
				/>
			</div>
		);
	}

	return (
		<div className={`flex w-full flex-col items-center py-6 ${className}`}>
			<p
				className="mb-4 font-semibold uppercase"
				style={{
					fontSize: '12px',
					color: config.primary_color || '#3E2882',
					fontFamily: 'Lato, sans-serif',
				}}
			>
				Scan untuk Verifikasi
			</p>
			{qrCodeDataUrl && (
				<img
					src={qrCodeDataUrl}
					alt="QR Code Tiket"
					className="h-[200px] w-[200px]"
					style={{
						border: `2px solid ${config.accent_color || '#DA7E01'}`,
						padding: '8px',
						backgroundColor: '#FFFFFF',
					}}
				/>
			)}
			<p
				className="mt-4 text-center text-xs"
				style={{
					fontSize: '10px',
					color: '#787878',
					fontFamily: 'Lato, sans-serif',
				}}
			>
				Tunjukkan kode di atas kepada petugas untuk memasuki event
			</p>
		</div>
	);
};
