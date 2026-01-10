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
	transactionId: string,
	BASE_API: string,
	KEY_API: string,
) {
	try {
		console.log(`[Webhook] Starting ticket transaction processing for transaction ID: ${transactionId}`);

		// 1. Fetch the full transaction data
		const transactionResponse = await fetch(
			`${BASE_API}/api/transactions/${transactionId}`,
			{
				headers: {
					Authorization: `Bearer ${KEY_API}`,
				},
			},
		);

		if (!transactionResponse.ok) {
			const errorData = await transactionResponse.text();
			console.error(
				`[Webhook] Failed to fetch transaction details for ID ${transactionId}:`,
				errorData,
			);
			throw new Error(`Failed to fetch transaction: ${errorData}`);
		}

		const transactionDataResponse = await transactionResponse.json();
		const transaction = transactionDataResponse.data?.attributes;

		if (!transaction) {
			console.error("[Webhook] Transaction attributes not found in response:", transactionDataResponse);
			throw new Error("Transaction attributes not found");
		}

		console.log("[Webhook] Transaction data loaded:", {
			orderId: transaction.order_id,
			eventType: transaction.event_type,
			hasTicketRecipients: !!transaction.ticket_recipients,
		});

		// 2. Only process if this is a Ticket transaction
		if (transaction.event_type !== "Ticket") {
			console.log(
				`[Webhook] Skipping non-ticket transaction. Event type: ${transaction.event_type}`,
			);
			return;
		}

		// 3. Parse ticket recipients
		let recipients = [];
		if (transaction.ticket_recipients) {
			try {
				if (typeof transaction.ticket_recipients === "string") {
					recipients = JSON.parse(transaction.ticket_recipients);
				} else {
					recipients = transaction.ticket_recipients;
				}
			} catch (parseError) {
				console.error("[Webhook] Failed to parse ticket_recipients:", parseError);
				throw new Error(`Failed to parse ticket_recipients: ${parseError}`);
			}
		}

		if (!recipients || recipients.length === 0) {
			console.error(
				"[Webhook] No ticket recipients found in transaction data",
				transaction.ticket_recipients,
			);
			throw new Error("No ticket recipients found");
		}

		console.log(`[Webhook] Processing ${recipients.length} ticket recipients`);

		// 4. Create ticket-detail for each recipient
		const createdTickets = [];
		for (let index = 0; index < recipients.length; index++) {
			const recipient = recipients[index];

			if (!recipient || !recipient.email) {
				console.warn(`[Webhook] Skipping recipient at index ${index}: missing email`, recipient);
				continue;
			}

			try {
				const randomCode = generateRandomCode(6);
				const ticketCode = `CTix-${transactionId}-${index + 1}-${randomCode}`;
				const verificationUrl = `${
					process.env.NEXTAUTH_URL || "http://localhost:3000"
				}/qr/verify?code=${ticketCode}`;

				const ticketDetailPayload = {
					data: {
						ticket_code: ticketCode,
						barcode_url: verificationUrl,
						recipient_name: recipient.name || "",
						recipient_email: recipient.email,
						recipient_whatsapp: recipient.whatsapp_number || "",
						id_type: recipient.identity_type || "",
						id_number: recipient.identity_number || "",
						is_verified: false,
						transaction: transactionId,
					},
				};

				console.log(
					`[Webhook] Creating ticket-detail for recipient ${index + 1}: ${recipient.email}`,
				);

				const createTicketDetailResponse = await fetch(`${BASE_API}/api/ticket-details`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${KEY_API}`,
					},
					body: JSON.stringify(ticketDetailPayload),
				});

				if (!createTicketDetailResponse.ok) {
					const errorData = await createTicketDetailResponse.text();
					console.error(
						`[Webhook] Failed to create ticket-detail for recipient ${index + 1}:`,
						errorData,
					);
					throw new Error(`Failed to create ticket-detail: ${errorData}`);
				}

				const newTicketDetail = await createTicketDetailResponse.json();
				const ticketDetailId = newTicketDetail.data?.id;

				if (!ticketDetailId) {
					console.error("[Webhook] No ID returned for created ticket-detail");
					throw new Error("No ticket-detail ID in response");
				}

				createdTickets.push({
					id: ticketDetailId,
					email: recipient.email,
					code: ticketCode,
				});

				console.log(
					`[Webhook] Successfully created ticket-detail: ${ticketDetailId} for ${recipient.email}`,
				);

				// 5. Trigger e-ticket email sending (non-blocking)
				const emailUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/send-eticket-email`;
				console.log(`[Webhook] Queuing email send to: ${emailUrl}`);

				fetch(emailUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						ticketDetailId: ticketDetailId,
						recipientEmail: recipient.email,
						recipientName: recipient.name || "Penerima Tiket",
						ticketCode: ticketCode,
					}),
				}).catch((error) => {
					console.error(
						`[Webhook] Error queuing e-ticket email for ${recipient.email}:`,
						error,
					);
				});
			} catch (recipientError) {
				console.error(
					`[Webhook] Error processing recipient at index ${index}:`,
					recipientError,
				);
				// Continue processing other recipients even if one fails
				continue;
			}
		}

		if (createdTickets.length === 0) {
			console.error("[Webhook] No tickets were successfully created");
			throw new Error("Failed to create any ticket details");
		}

		console.log(
			`[Webhook] Successfully created ${createdTickets.length} ticket details`,
			createdTickets,
		);
	} catch (error) {
		console.error("[Webhook] Error in handleSuccessfulTicketTransaction:", error);
		// Re-throw to be caught by the main handler
		throw error;
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

		// First, try to find and update transactions (for unified transaction flow)
		try {
			console.log(`[Webhook] Looking for transaction with order_id: ${order_id}`);
			const encodedOrderId = encodeURIComponent(order_id);
			const transactionResponse = await fetch(
				`${BASE_API}/api/transactions?filters[order_id][$eq]=${encodedOrderId}`,
				{
					headers: {
						Authorization: `Bearer ${KEY_API}`,
					},
				},
			);

			if (!transactionResponse.ok) {
				throw new Error("Failed to fetch transactions");
			}

			const transactionData = await transactionResponse.json();
			console.log(`[Webhook] Transaction search result:`, {
				found: transactionData.data?.length > 0,
				count: transactionData.data?.length || 0,
			});

			if (transactionData.data && transactionData.data.length > 0) {
				const transactionDocument = transactionData.data[0];
				const transactionDocumentId = transactionDocument.id;
				const currentPaymentStatus = transactionDocument.attributes?.payment_status;
				const eventType = transactionDocument.attributes?.event_type;

				console.log(`[Webhook] Found transaction: ${transactionDocumentId}`, {
					currentPaymentStatus,
					eventType,
					newPaymentStatus: paymentStatus,
				});

				// Update the payment status in Strapi
				const updateResponse = await fetch(`${BASE_API}/api/transactions/${transactionDocumentId}`, {
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
					const errorData = await updateResponse.text();
					console.error(
						`[Webhook] Failed to update transaction ${transactionDocumentId}:`,
						errorData,
					);
					// Don't throw - still proceed if it's a successful payment
				} else {
					console.log(`[Webhook] Successfully updated transaction payment status to: ${paymentStatus}`);
				}

				// If payment is successful AND it wasn't already marked as successful, handle ticket transaction
				if (
					(paymentStatus === "success" || paymentStatus === "settlement") &&
					currentPaymentStatus !== "success" &&
					currentPaymentStatus !== "settlement"
				) {
					console.log(
						`[Webhook] Payment successful for transaction ${transactionDocumentId}. Processing tickets...`,
					);
					await handleSuccessfulTicketTransaction(transactionDocumentId, BASE_API, KEY_API);
				}

				return NextResponse.json({
					success: true,
					type: "transaction",
					updated_id: transactionDocumentId,
				});
			}
		} catch (error) {
			console.error("[Webhook] Error processing transactions collection:", error);
		}

		// If not found in unified transactions, try transaction-tickets (legacy flow)
		try {
			console.log(
				`[Webhook] Looking for transaction-ticket with order_id: ${order_id}`,
			);
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
				const updateResponse = await fetch(
					`${BASE_API}/api/transaction-tickets/${ticketDocumentId}`,
					{
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
					},
				);

				if (!updateResponse.ok) {
					const errorData = await updateResponse.json();
					console.error(
						`[Webhook] Failed to update transaction-ticket ${ticketDocumentId}:`,
						errorData,
					);
					// Still, we might want to proceed if the status is already success.
				}

				// If payment is successful AND it wasn't already marked as successful, create the e-ticket
				if (
					(paymentStatus === "success" || paymentStatus === "settlement") &&
					currentPaymentStatus !== "success" &&
					currentPaymentStatus !== "settlement"
				) {
					console.log(
						`[Webhook] Processing legacy transaction-ticket: ${ticketDocumentId}`,
					);
					// Note: Legacy handler would be different - keeping original logic for backward compatibility
					// await handleSuccessfulTicketTransaction(ticketDocumentId, BASE_API, KEY_API);
				}

				return NextResponse.json({
					success: true,
					type: "transaction-ticket",
					updated_id: ticketDocumentId,
				});
			}
		} catch (error) {
			console.error("[Webhook] Error processing transaction-tickets collection:", error);
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
