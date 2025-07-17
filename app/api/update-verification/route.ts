import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction_id } = body;
    
    console.log('Update verification request for transaction ID:', transaction_id);
    
    if (!transaction_id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const STRAPI_URL = `${process.env.BASE_API}/api/transactions/${transaction_id}`;
    const KEY_API = process.env.KEY_API;
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment' }, { status: 500 });
    }

    console.log('Updating verification at:', STRAPI_URL);
    
    const updateRes = await fetch(STRAPI_URL, {
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
      return NextResponse.json({ 
        error: 'Failed to update verification',
        status: updateRes.status,
        details: updateData 
      }, { status: updateRes.status });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification updated successfully',
      data: updateData.data 
    });

  } catch (err: any) {
    console.error('Error updating verification:', err);
    return NextResponse.json({ 
      error: err.message || 'Unknown error',
      status: 500 
    });
  }
} 