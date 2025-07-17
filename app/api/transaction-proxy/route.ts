import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const STRAPI_URL = `${process.env.BASE_API}/api/transactions`;
    const KEY_API = process.env.KEY_API;
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment' }, { status: 500 });
    }
    const strapiRes = await fetch(STRAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY_API}`,
      },
      body: JSON.stringify(body),
    });
    const data = await strapiRes.json();
    if (!strapiRes.ok) {
      return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing transaction id.' }, { status: 400 });
    }
    const STRAPI_URL = `${process.env.BASE_API}/api/transactions/${id}`;
    const KEY_API = process.env.KEY_API;
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment' }, { status: 500 });
    }
    
    console.log('Updating transaction:', { id, data, STRAPI_URL });
    
    const strapiRes = await fetch(STRAPI_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY_API}`,
      },
      body: JSON.stringify({ data }),
    });
    
    const resData = await strapiRes.json();
    console.log('Strapi response:', { status: strapiRes.status, data: resData });
    
    if (!strapiRes.ok) {
      return NextResponse.json({ 
        error: resData.error || resData, 
        status: strapiRes.status,
        details: resData 
      }, { status: strapiRes.status });
    }
    return NextResponse.json(resData);
  } catch (err: any) {
    console.error('Error in PUT transaction-proxy:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { search } = new URL(req.url);
    const STRAPI_URL = `${process.env.BASE_API}/api/transactions${search}`;
    const KEY_API = process.env.KEY_API;
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment' }, { status: 500 });
    }
    const strapiRes = await fetch(STRAPI_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    const data = await strapiRes.json();
    if (!strapiRes.ok) {
      return NextResponse.json({ error: data.error || data }, { status: strapiRes.status });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 