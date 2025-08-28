import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');
    
    if (!order_id) {
      return NextResponse.json({ error: 'order_id parameter required' }, { status: 400 });
    }
    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    
    // Search in transaction-tickets
    const ticketResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const ticketData = await ticketResponse.json();
    
    // Search in transactions
    const transactionResponse = await fetch(`${BASE_API}/api/transactions?filters[order_id][$eq]=${order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const transactionData = await transactionResponse.json();
    
    return NextResponse.json({
      order_id,
      ticket_search: {
        status: ticketResponse.status,
        data: ticketData
      },
      transaction_search: {
        status: transactionResponse.status,
        data: transactionData
      }
    });
    
  } catch (err: any) {
    console.error('Error in find-transaction:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
