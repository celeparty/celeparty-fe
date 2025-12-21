import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import ReactDOMServer from "react-dom/server";
import TicketTemplate from "@/components/ticket-templates/TicketTemplate"; // This component needs to be created

// Helper function to get a browser instance
async function getBrowser() {
	if (process.env.NODE_ENV === "production") {
		// In production, you might want to use a more optimized setup
		// e.g., connecting to a pre-existing browser instance
		return await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
	} else {
		// In development, launch a new browser
		return await puppeteer.launch({ headless: true });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { ticketDetailId } = await req.json();

		if (!ticketDetailId) {
			return NextResponse.json({ error: "ticketDetailId is required" }, { status: 400 });
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			console.error("Missing environment variables for Strapi");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// 1. Fetch the complete ticket-detail data from Strapi
		const response = await fetch(`${BASE_API}/api/ticket-details/${ticketDetailId}?populate=deep`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error(`Failed to fetch ticket-detail ${ticketDetailId}:`, errorData);
			return NextResponse.json({ error: "Failed to fetch ticket details" }, { status: 404 });
		}

		const ticketDetail = await response.json();
		const ticketData = ticketDetail.data;

		if (!ticketData) {
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		}

		// 2. Render the React component to an HTML string
		const ticketHtml = ReactDOMServer.renderToString(
			<TicketTemplate ticket={ticketData.attributes} />,
		);

		// 3. Use Puppeteer to generate a PDF from the HTML
		const browser = await getBrowser();
		const page = await browser.newPage();

		// Set a modern viewport
		await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 1 });

		// Set the HTML content
		// We wrap the component's HTML in a full HTML document with a viewport meta tag
		await page.setContent(
			`<html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* You can include global styles here if needed */
            body { font-family: sans-serif; }
          </style>
        </head>
        <body>
          ${ticketHtml}
        </body>
      </html>`,
			{ waitUntil: "networkidle0" },
		);

		// Generate the PDF buffer
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

		// 4. Return the PDF as a response
		return new NextResponse(pdfBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="e-ticket-${ticketData.attributes.ticket_code}.pdf"`,
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