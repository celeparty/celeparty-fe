import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { data } = body;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing transaction id.' }, { status: 400 });
    }
    
    const STRAPI_URL = `${process.env.BASE_API}/api/transactions/${id}`;
    const KEY_API = process.env.KEY_API;
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment' }, { status: 500 });
    }
    

    
    const strapiRes = await fetch(STRAPI_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY_API}`,
      },
      body: JSON.stringify({ data }),
    });
    
    const resData = await strapiRes.json();

    
    if (!strapiRes.ok) {
      return NextResponse.json({ 
        error: resData.error || resData, 
        status: strapiRes.status,
        details: resData 
      }, { status: strapiRes.status });
    }
    
    return NextResponse.json(resData);
  } catch (err: any) {
    console.error('Error in PUT transaction-proxy/[id]:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
