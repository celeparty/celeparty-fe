import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');
    
    console.log('GET request for order_id:', order_id);
    
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required', status: 400 });
    }

    const KEY_API = process.env.KEY_API;
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment', status: 500 });
    }

    // Try to find in transactions table first
    const TRANSACTIONS_URL = `${process.env.BASE_API}/api/transactions`;
    console.log('Searching in transactions table with order_id:', order_id);
    const transactionsRes = await fetch(`${TRANSACTIONS_URL}?filters[order_id]=${order_id}`, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
    });

    const transactionsData = await transactionsRes.json();
    console.log('Transactions search response:', { status: transactionsRes.status, data: transactionsData });

    if (transactionsRes.ok && transactionsData?.data?.length > 0) {
      const transaction = transactionsData.data[0];
      console.log('Found transaction in transactions table:', transaction);
      return NextResponse.json({ 
        success: true, 
        data: transaction 
      });
    }

    // If not found in transactions, try transaction-tickets table
    const TICKETS_URL = `${process.env.BASE_API}/api/transaction-tickets`;
    console.log('Searching in transaction-tickets table with order_id:', order_id);
    const ticketsRes = await fetch(`${TICKETS_URL}?filters[order_id]=${order_id}`, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
    });

    const ticketsData = await ticketsRes.json();
    console.log('Transaction-tickets search response:', { status: ticketsRes.status, data: ticketsData });

    if (ticketsRes.ok && ticketsData?.data?.length > 0) {
      const ticket = ticketsData.data[0];
      console.log('Found transaction in transaction-tickets table:', ticket);
      return NextResponse.json({ 
        success: true, 
        data: ticket 
      });
    }

    // If not found in both tables
    return NextResponse.json({ error: 'Transaction not found in both tables', status: 404 });

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

    const KEY_API = process.env.KEY_API;
    
    console.log('Environment check:', {
      BASE_API: process.env.BASE_API,
      KEY_API: KEY_API ? 'SET' : 'NOT SET'
    });
    
    if (!KEY_API) {
      return NextResponse.json({ error: 'KEY_API not set in environment', status: 500 });
    }

    // Try to find in transactions table first
    const TRANSACTIONS_URL = `${process.env.BASE_API}/api/transactions`;
    console.log('Searching in transactions table with order_id:', order_id);
    const transactionsRes = await fetch(`${TRANSACTIONS_URL}?filters[order_id]=${order_id}`, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
    });

    const transactionsData = await transactionsRes.json();
    console.log('Transactions search response:', { status: transactionsRes.status, data: transactionsData });

    let transaction = null;
    let isTicket = false;

    if (transactionsRes.ok && transactionsData?.data?.length > 0) {
      transaction = transactionsData.data[0];
      isTicket = false;
      console.log('Found transaction in transactions table:', transaction);
    } else {
      // If not found in transactions, try transaction-tickets table
      const TICKETS_URL = `${process.env.BASE_API}/api/transaction-tickets`;
      console.log('Searching in transaction-tickets table with order_id:', order_id);
      const ticketsRes = await fetch(`${TICKETS_URL}?filters[order_id]=${order_id}`, {
        headers: {
          Authorization: `Bearer ${KEY_API}`,
        },
      });

      const ticketsData = await ticketsRes.json();
      console.log('Transaction-tickets search response:', { status: ticketsRes.status, data: ticketsData });

      if (ticketsRes.ok && ticketsData?.data?.length > 0) {
        transaction = ticketsData.data[0];
        isTicket = true;
        console.log('Found transaction in transaction-tickets table:', transaction);
      }
    }

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found in both tables', status: 404 });
    }

    // Check payment status (different field names for different tables)
    const paymentStatus = transaction.payment_status || transaction.attributes?.payment_status;
    if (paymentStatus !== 'settlement' && paymentStatus !== 'paid') {
      return NextResponse.json({ 
        error: `Payment status is not settlement/paid. Current status: ${paymentStatus}`, 
        status: 400 
      });
    }

    // Update verification status
    const updateUrl = isTicket 
      ? `${process.env.BASE_API}/api/transaction-tickets/${transaction.id}`
      : `${TRANSACTIONS_URL}/${transaction.id}`;

    console.log('Updating verification for transaction ID:', transaction.id, 'isTicket:', isTicket);
    const updateRes = await fetch(updateUrl, {
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
        update_url: updateUrl
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