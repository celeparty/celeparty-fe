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
				const qrDataUrl = await QRCode.toDataURL(data.qr_code_data, {
					width: 256, // Generate a larger QR code for better quality
					margin: 1,
					color: {
						dark: config.primary_color || '#3E2882',
						light: '#FFFFFF',
					},
					errorCorrectionLevel: 'H', // High error correction
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

	return (
		<div className={`flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-8 ${className}`}>
			<div className="w-full max-w-[220px] text-center">
				<p
					className="mb-3 text-sm font-semibold uppercase tracking-wider"
					style={{ color: config.primary_color || '#3E2882' }}
				>
					Scan untuk Verifikasi
				</p>
				{isLoading ? (
					<div className="mx-auto h-48 w-48 animate-pulse rounded-lg bg-gray-300" />
				) : (
					qrCodeDataUrl && (
						<div
							className="mx-auto flex h-auto w-full items-center justify-center rounded-lg p-2"
							style={{
								border: `3px solid ${config.accent_color || '#DA7E01'}`,
								backgroundColor: '#FFFFFF',
							}}
						>
							<img
								src={qrCodeDataUrl}
								alt="QR Code Tiket"
								className="h-auto w-full" // Responsive image
							/>
						</div>
					)
				)}
				<p className="mt-4 text-center text-xs text-gray-600">
					Tunjukkan kode di atas kepada petugas untuk memasuki event.
				</p>
			</div>
		</div>
	);
};
