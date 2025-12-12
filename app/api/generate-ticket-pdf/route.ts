/**
 * API Route: POST /api/generate-ticket-pdf
 *
 * Generates a ticket PDF by rendering a dedicated page with Puppeteer.
 * This avoids using ReactDOMServer in an API route, which is not supported in Next.js App Router.
 */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Helper function to get the base URL
function getBaseUrl(req: NextRequest) {
	const protocol = req.headers.get('x-forwarded-proto') || 'http';
	const host = req.headers.get('host');
	return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { transactionId } = body;

		if (!transactionId) {
			return NextResponse.json({ error: 'Missing required field: transactionId' }, { status: 400 });
		}

		const baseUrl = getBaseUrl(req);
		const renderUrl = `${baseUrl}/ticket-render/${transactionId}`;

		console.log(`Rendering ticket page for PDF generation: ${renderUrl}`);

		// --- Generate PDF using Puppeteer ---
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();

		// Go to the dedicated rendering page
		await page.goto(renderUrl, { waitUntil: 'networkidle0' });

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
				'Content-Disposition': `attachment; filename="e-ticket-${transactionId}.pdf"`,
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
