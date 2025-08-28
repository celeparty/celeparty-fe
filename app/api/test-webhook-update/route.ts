import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_id, payment_status } = body;
    
    if (!transaction_id || !payment_status) {
      return NextResponse.json({ error: 'transaction_id and payment_status required' }, { status: 400 });
    }
    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    

    
    // Update transaction-ticket directly
    const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${transaction_id}`, {
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
    

    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
  
      return NextResponse.json({ 
        success: true, 
        updated_id: transaction_id,
        new_status: payment_status,
        result: updateResult 
      });
    } else {
      const errorData = await updateResponse.json();
      console.error(`Failed to update transaction:`, errorData);
      return NextResponse.json({ 
        error: 'Failed to update transaction',
        details: errorData 
      }, { status: updateResponse.status });
    }
    
  } catch (err: any) {
    console.error('Error in test-webhook-update:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
