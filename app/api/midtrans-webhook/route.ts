import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Helper function to generate a random code
function generateRandomCode(length: number): string {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

async function handleSuccessfulTicketTransaction(
	transactionTicketId: string,
	BASE_API: string,
	KEY_API: string,
) {
	try {
		// 1. Fetch the full transaction-ticket data
		const ticketResponse = await fetch(`${BASE_API}/api/transaction-tickets/${transactionTicketId}?populate=*`, {
			headers: {
				Authorization: `Bearer ${KEY_API}`,
			},
		});

		if (!ticketResponse.ok) {
			const errorData = await ticketResponse.json();
			console.error(`Failed to fetch transaction-ticket details for ID ${transactionTicketId}:`, errorData);
			return;
		}

		const ticketData = await ticketResponse.json();
		const transaction = ticketData.data.attributes;
		const ticketProduct = transaction.ticket_product?.data;
		const user = transaction.user?.data;

		if (!ticketProduct || !user) {
			console.error("Missing ticket_product or user in transaction data:", transaction);
			return;
		}

		// 2. Generate unique ticket code
		const randomCode = generateRandomCode(6);
		const ticketCode = `CTix-${ticketProduct.id}-${randomCode}`;

		// 3. Generate barcode URL
		const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/qr/verify?code=${ticketCode}`;

		// 4. Create the ticket-detail entry in Strapi
		const ticketDetailPayload = {
			data: {
				ticket_code: ticketCode,
				barcode_url: verificationUrl,
				ticket_product: ticketProduct.id,
				transaction_ticket: transactionTicketId,
				user: user.id,
				recipient_name: transaction.customer_name,
				recipient_email: transaction.customer_email,
				recipient_whatsapp: transaction.customer_phone,
				id_type: transaction.customer_identity_type,
				id_number: transaction.customer_identity_number,
				is_verified: false,
			},
		};

		const createTicketDetailResponse = await fetch(`${BASE_API}/api/ticket-details`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${KEY_API}`,
			},
			body: JSON.stringify(ticketDetailPayload),
		});

		if (!createTicketDetailResponse.ok) {
			const errorData = await createTicketDetailResponse.json();
			console.error("Failed to create ticket-detail:", errorData);
			return;
		}

		const newTicketDetail = await createTicketDetailResponse.json();
		console.log("Successfully created ticket-detail:", newTicketDetail.data.id);

		// 5. Trigger email sending (non-blocking)
		fetch(`${process.env.NEXTAUTH_URL}/api/send-ticket-email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ticketDetailId: newTicketDetail.data.id }),
		}).catch(error => {
			console.error("Error triggering send-ticket-email:", error);
		});

	} catch (error) {
		console.error("Error in handleSuccessfulTicketTransaction:", error);
	}
}

export async function POST(req: NextRequest) {
	console.log("=== MIDTRANS WEBHOOK RECEIVED ===");
	console.log("Timestamp:", new Date().toISOString());
	try {
		const body = await req.json();

		// Verify webhook signature (optional but recommended for security)
		const signatureKey = process.env.MIDTRANS_SIGNATURE_KEY;
		if (signatureKey && body.signature_key) {
			const expectedSignature = crypto
				.createHash("sha512")
				.update(body.order_id + body.status_code + body.gross_amount + signatureKey)
				.digest("hex");

			if (body.signature_key !== expectedSignature) {
				console.error("Invalid webhook signature");
				console.error("Expected:", expectedSignature);
				console.error("Received:", body.signature_key);
				// return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
			}
		}

		const { order_id, transaction_status, fraud_status } = body;

		// Map Midtrans status to our payment status
		let paymentStatus = "pending";
		switch (transaction_status) {
			case "capture":
			case "settlement":
				paymentStatus = "success";
				break;
			case "pending":
				paymentStatus = "pending";
				break;
			case "deny":
			case "expire":
			case "cancel":
				paymentStatus = "failed";
				break;
			default:
				paymentStatus = "pending";
		}

		if (fraud_status === "challenge") {
			paymentStatus = "pending";
		} else if (fraud_status === "deny") {
			paymentStatus = "failed";
		}

		const BASE_API = process.env.BASE_API;
		const KEY_API = process.env.KEY_API;

		if (!BASE_API || !KEY_API) {
			console.error("Missing environment variables");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		// First, try to find and update transaction-tickets
		try {
			const encodedOrderId = encodeURIComponent(order_id);
			const ticketResponse = await fetch(
				`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${encodedOrderId}&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${KEY_API}`,
					},
				},
			);

			if (!ticketResponse.ok) {
				throw new Error("Failed to fetch transaction-tickets");
			}

			const ticketData = await ticketResponse.json();

			if (ticketData.data && ticketData.data.length > 0) {
				const ticketDocument = ticketData.data[0];
				const ticketDocumentId = ticketDocument.id;
				const currentPaymentStatus = ticketDocument.attributes.payment_status;

				// Update the payment status in Strapi
				const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${ticketDocumentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${KEY_API}`,
					},
					body: JSON.stringify({
						data: {
							payment_status: paymentStatus,
						},
					}),
				});

				if (!updateResponse.ok) {
					const errorData = await updateResponse.json();
					console.error(`Failed to update transaction-ticket ${ticketDocumentId}:`, errorData);
					// Still, we might want to proceed if the status is already success.
				}

				// If payment is successful AND it wasn't already marked as successful, create the e-ticket
				if (
					(paymentStatus === "success" || paymentStatus === "settlement") &&
					currentPaymentStatus !== "success" &&
					currentPaymentStatus !== "settlement"
				) {
					await handleSuccessfulTicketTransaction(ticketDocumentId, BASE_API, KEY_API);
				}

				return NextResponse.json({ success: true, type: "ticket", updated_id: ticketDocumentId });
			}
		} catch (error) {
			console.error("Error processing transaction-ticket:", error);
		}

		// If not a ticket or an error occurred, try regular transactions
		try {
			const transactionResponse = await fetch(
				`${BASE_API}/api/transactions?filters[order_id][$eq]=${order_id}`,
				{
					headers: {
						Authorization: `Bearer ${KEY_API}`,
					},
				},
			);

			if (transactionResponse.ok) {
				const transactionData = await transactionResponse.json();
				if (transactionData.data && transactionData.data.length > 0) {
					const transactionId = transactionData.data[0].id;
					const updateResponse = await fetch(`${BASE_API}/api/transactions/${transactionId}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${KEY_API}`,
						},
						body: JSON.stringify({
							data: {
								payment_status: paymentStatus,
							},
						}),
					});

					if (updateResponse.ok) {
						return NextResponse.json({ success: true, type: "transaction", updated_id: transactionId });
					}
				}
			}
		} catch (error) {
			console.error("Error updating regular transaction:", error);
		}

		return NextResponse.json({ error: "Transaction not found or failed to update" }, { status: 404 });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		message: "Midtrans webhook endpoint is working",
		timestamp: new Date().toISOString(),
		status: "ok",
	});
}
