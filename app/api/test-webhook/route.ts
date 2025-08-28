import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    
    // Simulate Midtrans webhook data
    const mockWebhookData = {
      order_id: body.order_id || "ORDER-1752685946461-7177",
      transaction_status: body.transaction_status || "settlement",
      fraud_status: body.fraud_status || "accept",
      status_code: "200",
      gross_amount: "450000",
      signature_key: body.signature_key || "test_signature"
    };
    

    
    // Call the actual webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/midtrans-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockWebhookData),
    });
    
    const webhookResult = await webhookResponse.json();

    
    return NextResponse.json({
      success: true,
      webhook_result: webhookResult,
      status: webhookResponse.status
    });
    
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Test webhook endpoint is working',
    usage: 'POST with order_id and transaction_status to test webhook'
  });
}
