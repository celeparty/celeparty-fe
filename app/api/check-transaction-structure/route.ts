import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
    
    // Search for transaction
    const searchResponse = await fetch(`${BASE_API}/api/transaction-tickets?filters[order_id][$eq]=${orderId}`, {
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
    
    // Check all fields
    const fieldCheck = {
      id: transaction.id,
      order_id: transaction.order_id,
      event_type: transaction.event_type,
      payment_status: transaction.payment_status,
      customer_mail: transaction.customer_mail,
      email: transaction.email,
      customer_name: transaction.customer_name,
      product_name: transaction.product_name,
      variant: transaction.variant,
      quantity: transaction.quantity,
      total_price: transaction.total_price,
      event_date: transaction.event_date,
      telp: transaction.telp,
      note: transaction.note,
      verification: transaction.verification,
      vendor_id: transaction.vendor_id,
      all_fields: Object.keys(transaction)
    };
    
    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      field_check: fieldCheck,
      full_transaction: transaction
    });
    
  } catch (error: any) {
    console.error('Check structure error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
