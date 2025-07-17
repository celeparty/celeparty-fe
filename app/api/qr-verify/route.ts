import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');
    
    console.log('GET request for order_id:', order_id);
    
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required', status: 400 });
    }

    const STRAPI_URL = `${process.env.BASE_API}/api/transactions`;
    const KEY_API = process.env.KEY_API;
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment', status: 500 });
    }

    // Find transaction by order_id
    console.log('Finding transaction with order_id:', order_id);
    const findRes = await fetch(`${STRAPI_URL}?filters[order_id]=${order_id}`, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
    });

    const findData = await findRes.json();
    console.log('Find response:', { status: findRes.status, data: findData });

    if (!findRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to find transaction,',
        details: findData 
      }, { status: findRes.status });
    }

    const transaction = findData?.data?.[0];
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found', status: 404 });
    }

    console.log('Found transaction:', transaction);

    return NextResponse.json({ 
      success: true, 
      data: transaction 
    });

  } catch (err: any) {
    console.error('Error in QR verification GET:', err);
    return NextResponse.json({ 
      error: err.message || 'Unknown error', 
      status: 500 
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id } = body;
    
    console.log('QR verification request:', { order_id });
    
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required', status: 400 });
    }

    const STRAPI_URL = `${process.env.BASE_API}/api/transactions`;
    const KEY_API = process.env.KEY_API;
    
    console.log('Environment check:', {
      BASE_API: process.env.BASE_API,
      KEY_API: KEY_API ? 'SET' : 'NOT SET',
      STRAPI_URL
    });
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment', status: 500 });
    }

    // 1. Find transaction by order_id
    console.log('Finding transaction with order_id:', order_id);
    const findRes = await fetch(`${STRAPI_URL}?filters[order_id]=${order_id}`, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
    });

    const findData = await findRes.json();
    console.log('Find response:', { status: findRes.status, data: findData });

    if (!findRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to find transaction,',
        details: findData 
      }, { status: findRes.status });
    }

    const transaction = findData?.data?.[0];
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found', status: 404 });
    }

    console.log('Found transaction:', transaction);

    if (transaction.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment status is not paid', status: 400 });
    }

    // 2. Update verification status
    console.log('Updating verification for transaction ID:', transaction.id);
    const updateRes = await fetch(`${STRAPI_URL}/${transaction.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY_API}`,
      },
      body: JSON.stringify({
        data: { verification: true }
      }),
    });

    const updateData = await updateRes.json();
    console.log('Update response:', { status: updateRes.status, data: updateData });

    if (!updateRes.ok) {
      console.error('Update failed with status:', updateRes.status);
      console.error('Update error details:', updateData);
      return NextResponse.json({ 
        error: 'Failed to update verification,',
        status: updateRes.status,
        details: updateData,
        transaction_id: transaction.id,
        strapi_url: STRAPI_URL
      }, { status: updateRes.status });
    }

    console.log('Update successful:', updateData);
    return NextResponse.json({ 
      success: true, 
      message: 'Ticket verified successfully',
      data: updateData.data 
    });

  } catch (err: any) {
    console.error('Error in QR verification POST:', err);
    return NextResponse.json({ 
      error: err.message || 'Unknown error', 
      status: 500 
    });
  }
} 