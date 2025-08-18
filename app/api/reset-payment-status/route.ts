import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id } = body;
    
    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }
    
    console.log('Resetting payment status to pending for order_id:', order_id);
    
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
        error: 'Transaction not found'
      }, { status: 404 });
    }
    
    const transaction = searchData.data[0];
    console.log('Found transaction:', transaction.id);
    console.log('Current payment_status:', transaction.payment_status);
    
    // Reset to pending
    const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${transaction.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          payment_status: 'pending',
          event_type: 'Ticket'
        }
      }),
    });
    
    const updateData = await updateResponse.json();
    
    if (!updateResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to reset payment status', 
        status: updateResponse.status,
        data: updateData 
      }, { status: updateResponse.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Payment status reset to pending`,
      transaction_id: transaction.id,
      old_status: transaction.payment_status,
      new_status: 'pending',
      data: updateData 
    });
    
  } catch (error: any) {
    console.error('Reset payment status error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
