/**
 * API Route: POST /api/generate-ticket-pdf
 *
 * Generates a professional ticket PDF using Puppeteer to render React components.
 * Returns the PDF file.
 */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ReactDOMServer from 'react-dom/server';
import { TicketTemplate } from '@/components/ticket-templates/TicketTemplate';
import { iTicketTemplateData } from '@/components/ticket-templates/interfaces';
import React from 'react';

// Helper function to get the base URL
function getBaseUrl() {
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	// Assume localhost for local development
	return 'http://localhost:3000';
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Use the body as the ticket data
		const ticketData: iTicketTemplateData = body;

		// Validate required fields
		if (
			!ticketData.ticket_code ||
			!ticketData.product_title ||
			!ticketData.recipient_name ||
			!ticketData.recipient_email
		) {
			return NextResponse.json(
				{
					error:
						'Missing required fields: ticket_code, product_title, recipient_name, recipient_email',
				},
				{ status: 400 },
			);
		}

		// --- Render React component to HTML string ---
		const ticketHtml = ReactDOMServer.renderToString(
			React.createElement(TicketTemplate, {
				data: ticketData,
				config: {
					// Config can be customized or passed in the request
					primary_color: '#3E2882',
					accent_color: '#DA7E01',
					company_name: 'Celeparty',
					logo_url: `${getBaseUrl()}/images/logo.png`, // Assuming logo is in public/images
				},
			}),
		);

		// --- Create the full HTML document with Tailwind CSS ---
		const html = `
      <html>
        <head>
          <title>E-Ticket</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Lato', sans-serif;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7fafc;">
          ${ticketHtml}
        </body>
      </html>
    `;

		// --- Generate PDF using Puppeteer ---
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();

		// Set content and wait for network activity to settle
		await page.setContent(html, { waitUntil: 'networkidle0' });

		// Set a viewport that matches the ticket width to ensure proper rendering
		await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 1 });

		const pdfBuffer = await page.pdf({
			width: '800px',
			printBackground: true,
			preferCSSPageSize: true,
		});

		await browser.close();

		// --- Return PDF as response ---
		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="e-ticket-${ticketData.ticket_code}.pdf"`,
			},
		});
	} catch (error) {
		console.error('Error generating ticket PDF:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ error: 'Failed to generate ticket PDF', details: errorMessage },
			{ status: 500 },
		);
	}
}