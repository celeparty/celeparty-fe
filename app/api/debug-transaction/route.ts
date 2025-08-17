import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      return NextResponse.json({ error: 'order_id parameter is required' }, { status: 400 });
    }
    
    console.log(`Debug: Searching for order_id: ${orderId}`);
    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    // Search in transaction-tickets
    console.log('Searching in transaction-tickets...');
    const ticketResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    console.log(`Ticket search status: ${ticketResponse.status}`);
    const ticketData = await ticketResponse.json();
    console.log('Ticket search result:', ticketData);
    
    // Search in regular transactions
    console.log('Searching in regular transactions...');
    const transactionResponse = await fetch(`${BASE_API}/api/transactions?filters[order_id][$eq]=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    console.log(`Transaction search status: ${transactionResponse.status}`);
    const transactionData = await transactionResponse.json();
    console.log('Transaction search result:', transactionData);
    
    // Search without filters to see all records
    console.log('Searching all transaction-tickets...');
    const allTicketsResponse = await fetch(`${BASE_API}/api/transaction-tickets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const allTicketsData = await allTicketsResponse.json();
    console.log('All tickets:', allTicketsData);
    
    return NextResponse.json({
      order_id: orderId,
      ticket_search: {
        status: ticketResponse.status,
        data: ticketData
      },
      transaction_search: {
        status: transactionResponse.status,
        data: transactionData
      },
      all_tickets: allTicketsData
    });
    
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
