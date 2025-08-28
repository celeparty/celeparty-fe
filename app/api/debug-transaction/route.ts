import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      return NextResponse.json({ error: 'order_id parameter is required' }, { status: 400 });
    }
    
    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    // Search in transaction-tickets
    const ticketResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const ticketData = await ticketResponse.json();
    
    // Search in regular transactions
    const transactionResponse = await fetch(`${BASE_API}/api/transactions?filters[order_id][$eq]=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const transactionData = await transactionResponse.json();
    
    // Search without filters to see all records
    const allTicketsResponse = await fetch(`${BASE_API}/api/transaction-tickets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const allTicketsData = await allTicketsResponse.json();
    
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
