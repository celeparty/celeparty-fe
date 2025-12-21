import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// Helper function to get a browser instance
async function getBrowser() {
	if (process.env.NODE_ENV === "production") {
		return await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
	} else {
		return await puppeteer.launch({ headless: true });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { ticketDetailId } = await req.json();

		if (!ticketDetailId) {
			return NextResponse.json({ error: "ticketDetailId is required" }, { status: 400 });
		}
		
		// Construct the URL to the ticket rendering page
		const host = req.headers.get("host");
		const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
		const renderUrl = `${protocol}://${host}/ticket-render/${ticketDetailId}`;

		// Fetch the HTML of the ticket page
		const ticketPageResponse = await fetch(renderUrl, { cache: 'no-store' });
		if (!ticketPageResponse.ok) {
			throw new Error(`Failed to fetch ticket render page: ${ticketPageResponse.statusText}`);
		}
		const ticketHtml = await ticketPageResponse.text();

		// Use Puppeteer to generate a PDF from the HTML
		const browser = await getBrowser();
		const page = await browser.newPage();

		await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 1 });
		await page.setContent(ticketHtml, { waitUntil: "networkidle0" });

		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "20px",
				right: "20px",
				bottom: "20px",
				left: "20px",
			},
		});

		await browser.close();

		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="e-ticket-${ticketDetailId}.pdf"`,
			},
		});
	} catch (error) {
		console.error("Error generating PDF:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// Add a GET handler for basic testing
export async function GET() {
	return NextResponse.json({
		message: "PDF generation endpoint is ready. Use POST to generate a ticket.",
	});
}