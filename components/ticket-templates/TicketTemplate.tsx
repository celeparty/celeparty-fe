/**
 * Komponen Utama Ticket Template
 * Menyatukan header, body, QR code, dan footer dalam satu template profesional
 */

import React from 'react';
import { TicketTemplateHeader } from './TicketTemplateHeader';
import { TicketTemplateBody } from './TicketTemplateBody';
import { TicketTemplateQRCode } from './TicketTemplateQRCode';
import { TicketTemplateFooter } from './TicketTemplateFooter';
import { iTicketTemplateContext } from './interfaces';

export const TicketTemplate: React.FC<iTicketTemplateContext> = ({
	data,
	config,
	className = '',
}) => {
	return (
		<div
			className={`mx-auto w-full bg-white print:w-full ${className}`}
			style={{
				maxWidth: '800px',
				fontFamily: 'Lato, sans-serif',
				boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
			}}
		>
			{/* Header dengan Logo dan Nama Perusahaan */}
			<TicketTemplateHeader data={data} config={config} />

			{/* Body dengan Informasi Tiket dan Penerima */}
			<TicketTemplateBody data={data} config={config} />

			{/* QR Code di Tengah */}
			<TicketTemplateQRCode data={data} config={config} />

			{/* Footer dengan Informasi Kontak */}
			<TicketTemplateFooter data={data} config={config} />
		</div>
	);
};

export default TicketTemplate;
