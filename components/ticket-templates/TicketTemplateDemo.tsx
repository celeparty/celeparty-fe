/**
 * Komponen Demo Ticket Template
 * Untuk testing dan preview template tiket
 */

'use client';

import React, { useState } from 'react';
import { TicketPreview } from '@/components/ticket-templates/TicketPreview';
import { generateSampleTicketData, generateSampleTemplateConfig } from '@/lib/utils/ticket-template';
import { TicketData, iTicketTemplateConfig } from '@/components/ticket-templates/interfaces';
import toast from 'react-hot-toast';

export const TicketTemplateDemo: React.FC = () => {
	const [ticketData] = useState<TicketData>(generateSampleTicketData());
	const [templateConfig] = useState<iTicketTemplateConfig>(generateSampleTemplateConfig());

	const handleDownload = (filename: string) => {
		console.log('Tiket diunduh:', filename);
	};

	const handleEmail = (pdfBase64: string) => {
		console.log('PDF siap dikirim via email. Size:', pdfBase64.length, 'bytes');
		// Implementasi pengiriman email akan dilakukan di sini
		toast.success('PDF siap untuk dikirim via email');
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="mb-2 text-4xl font-bold text-c-blue">
						Ticket Template Preview
					</h1>
					<p className="text-gray-600">
						Demo profesional ticket template dengan QR code, informasi lengkap, dan akses download/email
					</p>
				</div>

				{/* Info Card */}
				<div className="mb-8 rounded-lg bg-blue-50 p-6 border border-blue-200">
					<h2 className="mb-4 font-semibold text-blue-900">📋 Informasi Tiket Demo</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-sm text-blue-700">
								<strong>Produk:</strong> {ticketData.ticket_product.attributes.name}
							</p>
							<p className="text-sm text-blue-700">
								<strong>Kode:</strong> {ticketData.ticket_code}
							</p>
							<p className="text-sm text-blue-700">
								<strong>Varian:</strong>   {ticketData.transaction_ticket.attributes.variant || 'Regular';}
							</p>
						</div>
						<div>
							<p className="text-sm text-blue-700">
								<strong>Penerima:</strong> {ticketData.recipient_name}
							</p>
							<p className="text-sm text-blue-700">
								<strong>Email:</strong> {ticketData.recipient_email}
							</p>
							<p className="text-sm text-blue-700">
								<strong>Telepon:</strong> {ticketData.recipient_phone}
							</p>
						</div>
					</div>
				</div>

				{/* Ticket Preview */}
				<TicketPreview
					ticketData={ticketData}
					templateConfig={templateConfig}
					onDownload={handleDownload}
					onEmail={handleEmail}
					showActions={true}
				/>

				{/* Features List */}
				<div className="mt-8 rounded-lg bg-white p-6">
					<h2 className="mb-4 text-xl font-bold text-c-blue">✨ Fitur Template</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Header Profesional</p>
								<p className="text-sm text-gray-600">Logo, nama perusahaan, dan slogan</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Informasi Lengkap</p>
								<p className="text-sm text-gray-600">Produk, tiket, dan data penerima</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">QR Code Verifikasi</p>
								<p className="text-sm text-gray-600">Dipindai untuk validasi tiket</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Footer Informatif</p>
								<p className="text-sm text-gray-600">Tanggal, kontak, dan media sosial</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">PDF Download</p>
								<p className="text-sm text-gray-600">Berkualitas tinggi dan siap print</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Email Ready</p>
								<p className="text-sm text-gray-600">Base64 untuk pengiriman email</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Responsive Design</p>
								<p className="text-sm text-gray-600">Sempurna di semua ukuran layar</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<span className="mt-1 text-lg text-c-orange">✓</span>
							<div>
								<p className="font-semibold">Color Customizable</p>
								<p className="text-sm text-gray-600">Primary dan accent warna dapat diubah</p>
							</div>
						</div>
					</div>
				</div>

				{/* Usage Instructions */}
				<div className="mt-8 rounded-lg bg-green-50 p-6">
					<h2 className="mb-4 text-xl font-bold text-green-900">📖 Cara Menggunakan</h2>
					<div className="space-y-4 text-sm text-green-900">
						<div>
							<p className="font-semibold">1. Import Komponen</p>
							<code className="mt-1 block rounded bg-green-100 p-2">
								import {'{ TicketTemplate }'} from '@/components/ticket-templates';
							</code>
						</div>
						<div>
							<p className="font-semibold">2. Siapkan Data Tiket</p>
							<code className="mt-1 block rounded bg-green-100 p-2">
								const ticketData: TicketData = {'{ ... }'};
							</code>
						</div>
						<div>
							<p className="font-semibold">3. Render Komponen</p>
							<code className="mt-1 block rounded bg-green-100 p-2">
								{'<TicketTemplate data={ticketData} config={config} />'}
							</code>
						</div>
						<div>
							<p className="font-semibold">4. Download atau Email</p>
							<code className="mt-1 block rounded bg-green-100 p-2">
								await downloadTicketPDF(element, ticketData);
							</code>
						</div>
					</div>
				</div>

				{/* API Reference */}
				<div className="mt-8 rounded-lg bg-gray-100 p-6">
					<h2 className="mb-4 text-xl font-bold text-gray-900">🔧 API Reference</h2>
					<div className="space-y-4 text-sm text-gray-800">
						<div>
							<p className="mb-2 font-semibold">Komponen Utama:</p>
							<ul className="ml-4 list-inside list-disc space-y-1">
								<li>TicketTemplate - Komponen template lengkap</li>
								<li>TicketPreview - Preview dengan button aksi</li>
								<li>TicketTemplateHeader - Hanya header</li>
								<li>TicketTemplateBody - Hanya body</li>
								<li>TicketTemplateQRCode - Hanya QR code</li>
								<li>TicketTemplateFooter - Hanya footer</li>
							</ul>
						</div>
						<div>
							<p className="mb-2 font-semibold">Fungsi PDF:</p>
							<ul className="ml-4 list-inside list-disc space-y-1">
								<li>downloadTicketPDF() - Download PDF</li>
								<li>getTicketPDFAsBase64() - Get base64 string</li>
								<li>getTicketPDFAsBlob() - Get Blob object</li>
								<li>generateMultipleTicketPDFs() - Multiple tickets</li>
							</ul>
						</div>
						<div>
							<p className="mb-2 font-semibold">Konfigurasi:</p>
							<ul className="ml-4 list-inside list-disc space-y-1">
								<li>getDefaultTemplateConfig() - Config default</li>
								<li>mergeTemplateConfig() - Merge dengan custom</li>
								<li>validateTemplateConfig() - Validasi</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketTemplateDemo;
