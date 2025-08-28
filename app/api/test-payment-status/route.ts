import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, payment_status } = body;
    
    if (!order_id || !payment_status) {
      return NextResponse.json({ error: 'Missing order_id or payment_status' }, { status: 400 });
    }
    

    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    // First, find the transaction by order_id

    const searchResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    const searchData = await searchResponse.json();
    
    if (!searchResponse.ok || !searchData.data || searchData.data.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction not found', 
        search_data: searchData 
      }, { status: 404 });
    }
    
    const transaction = searchData.data[0];

    
    // Check if status is already the target status
    if (transaction.payment_status === payment_status) {
      return NextResponse.json({ 
        message: `Payment status is already ${payment_status}`,
        transaction_id: transaction.id,
        current_status: transaction.payment_status
      });
    }
    
    // Update the payment status

    const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${transaction.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          payment_status: payment_status,
          event_type: 'Ticket' // Ensure event_type is set
        }
      }),
    });
    
    const updateData = await updateResponse.json();
    
    if (!updateResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to update payment status', 
        status: updateResponse.status,
        data: updateData 
      }, { status: updateResponse.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Payment status updated from ${transaction.payment_status} to ${payment_status}`,
      transaction_id: transaction.id,
      old_status: transaction.payment_status,
      new_status: payment_status,
      data: updateData 
    });
    
  } catch (error: any) {
    console.error('Test payment status error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
