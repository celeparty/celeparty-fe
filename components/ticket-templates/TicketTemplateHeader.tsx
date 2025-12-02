/**
 * Komponen Header untuk Ticket Template
 * Menampilkan logo, nama perusahaan, dan slogan
 */

import React from 'react';
import { iTicketTemplateContext } from './interfaces';

export const TicketTemplateHeader: React.FC<iTicketTemplateContext> = ({
	data,
	config,
	className = '',
}) => {
	return (
		<div
			className={`w-full border-b-4 px-6 py-6 text-center ${className}`}
			style={{ borderColor: config.primary_color || '#3E2882' }}
		>
			{/* Logo */}
			{config.logo_url && (
				<div className="mb-4 flex justify-center">
					<img
						src={config.logo_url}
						alt={config.company_name}
						className="h-16 w-auto max-w-[150px]"
					/>
				</div>
			)}

			{/* Company Name */}
			<h1
				className="mb-2 font-bold"
				style={{
					fontSize: '24px',
					color: config.primary_color || '#3E2882',
					fontFamily: 'Lato, sans-serif',
				}}
			>
				{config.company_name}
			</h1>

			{/* Company Slogan */}
			{config.company_slogan && (
				<p
					className="italic"
					style={{
						fontSize: '12px',
						color: config.accent_color || '#DA7E01',
						fontFamily: 'Lato, sans-serif',
					}}
				>
					{config.company_slogan}
				</p>
			)}
		</div>
	);
};
