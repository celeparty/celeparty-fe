import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, payment_status } = body;
    
    if (!id || !payment_status) {
      return NextResponse.json({ error: 'Missing id or payment_status' }, { status: 400 });
    }
    

    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    const STRAPI_URL = `${BASE_API}/api/transaction-tickets/${id}`;

    
    const updateResponse = await fetch(STRAPI_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          payment_status: payment_status
        }
      }),
    });
    
    const updateData = await updateResponse.json();
    
    if (!updateResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to update', 
        status: updateResponse.status,
        data: updateData 
      }, { status: updateResponse.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updateData 
    });
    
  } catch (error: any) {
    console.error('Test update error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
