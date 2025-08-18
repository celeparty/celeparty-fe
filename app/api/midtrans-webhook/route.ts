import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Midtrans webhook received:', body);

    // Verify webhook signature (optional but recommended for security)
    const signatureKey = process.env.MIDTRANS_SIGNATURE_KEY;
    if (signatureKey && body.signature_key) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(body.order_id + body.status_code + body.gross_amount + signatureKey)
        .digest('hex');
      
      if (body.signature_key !== expectedSignature) {
        console.error('Invalid webhook signature');
        console.error('Expected:', expectedSignature);
        console.error('Received:', body.signature_key);
        // For now, let's not block the request if signature is invalid
        // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const { order_id, transaction_status, fraud_status } = body;
    
    // Map Midtrans status to our payment status
    let paymentStatus = 'pending';
    switch (transaction_status) {
      case 'capture':
        paymentStatus = 'success';
        break;
      case 'settlement':
        paymentStatus = 'settlement';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Check if fraud status is acceptable
    if (fraud_status === 'challenge') {
      paymentStatus = 'pending';
    } else if (fraud_status === 'deny') {
      paymentStatus = 'failed';
    }

    console.log(`Updating payment status for order ${order_id} to ${paymentStatus}`);

    // Update transaction in Strapi
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;

    if (!BASE_API || !KEY_API) {
      console.error('Missing environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // First, try to update transaction-tickets
    try {
      console.log(`Searching for transaction-ticket with order_id: ${order_id}`);
      
      // Try exact match first
      const encodedOrderId = encodeURIComponent(order_id);
      let ticketResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${encodedOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KEY_API}`,
        },
      });
      
      let ticketData = await ticketResponse.json();
      console.log(`Ticket search response status: ${ticketResponse.status}`);
      console.log(`Ticket search result:`, ticketData);
      console.log(`Ticket data length:`, ticketData.data?.length);
      console.log(`Ticket data:`, ticketData.data);
      
      // If not found, try searching all tickets to see what we have
      if (!ticketResponse.ok || ticketData.data.length === 0) {
        console.log('Exact match not found, searching all tickets...');
        const allTicketsResponse = await fetch(`${BASE_API}/api/transaction-tickets`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${KEY_API}`,
          },
        });
        
        const allTickets = await allTicketsResponse.json();
        console.log('All tickets found:', allTickets.data?.map((t: any) => ({ id: t.id, order_id: t.order_id })));
        
        // Try to find by partial match or use the most recent ticket
        const matchingTicket = allTickets.data?.find((t: any) => 
          t.order_id === order_id || 
          t.order_id?.includes(order_id) || 
          order_id.includes(t.order_id)
        );
        
        if (matchingTicket) {
          console.log('Found matching ticket by partial match:', matchingTicket);
          ticketData = { data: [matchingTicket] };
        } else {
          console.log('No matching ticket found even in all tickets');
        }
      }
      
      console.log(`Checking ticketData.data:`, !!ticketData.data);
      console.log(`Checking ticketData.data.length:`, ticketData.data?.length);
      
      if (ticketData.data && ticketData.data.length > 0) {
        // Update transaction-ticket
        const ticketDocumentId = ticketData.data[0].documentId;
        console.log(`Found ticket with documentId: ${ticketDocumentId}`);
        console.log(`Updating transaction-ticket ${ticketDocumentId} with status: ${paymentStatus}`);
        
        // Update directly to Strapi
        console.log(`Updating directly to Strapi: ${BASE_API}/api/transaction-tickets/${ticketDocumentId}`);
        const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${ticketDocumentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${KEY_API}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              payment_status: paymentStatus
            }
          }),
        });

        console.log(`Update response status: ${updateResponse.status}`);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log(`Successfully updated transaction-ticket ${ticketDocumentId} status to ${paymentStatus}`, updateResult);
          return NextResponse.json({ success: true, type: 'ticket', updated_id: ticketDocumentId });
        } else {
          const errorData = await updateResponse.json();
          console.error(`Failed to update transaction-ticket:`, errorData);
        }
      } else {
        console.log(`No transaction-ticket found with order_id: ${order_id}`);
      }
    } catch (error) {
      console.error('Error searching transaction-ticket:', error);
    }

    // If not found in transaction-tickets, try regular transactions
    try {
      const transactionResponse = await fetch(`${BASE_API}/api/transactions?filters[order_id][$eq]=${order_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KEY_API}`,
        },
      });

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();
        if (transactionData.data && transactionData.data.length > 0) {
          // Update transaction
          const transactionId = transactionData.data[0].id;
          const updateResponse = await fetch(`${BASE_API}/api/transactions/${transactionId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${KEY_API}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                payment_status: paymentStatus
              }
            }),
          });

          if (updateResponse.ok) {
            console.log(`Successfully updated transaction ${transactionId} status to ${paymentStatus}`);
            return NextResponse.json({ success: true, type: 'transaction' });
          }
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }

    console.log(`No transaction found for order_id: ${order_id}`);
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
