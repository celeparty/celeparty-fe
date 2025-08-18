import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Strapi connection...');
    
    const BASE_API = process.env.BASE_API;
    const KEY_API = process.env.KEY_API;
    
    console.log('BASE_API:', BASE_API);
    console.log('KEY_API exists:', !!KEY_API);
    
    if (!BASE_API || !KEY_API) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }
    
    // Test 1: Basic connection to Strapi
    console.log('Testing basic connection...');
    const basicResponse = await fetch(`${BASE_API}/api/transaction-tickets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KEY_API}`,
      },
    });
    
    console.log('Basic response status:', basicResponse.status);
    const basicData = await basicResponse.json();
    console.log('Basic response data:', basicData);
    
    // Test 2: Try to get a specific transaction
    if (basicData.data && basicData.data.length > 0) {
      const firstTransaction = basicData.data[0];
      console.log('Testing specific transaction update...');
      console.log('Transaction ID:', firstTransaction.id);
      
      const updateResponse = await fetch(`${BASE_API}/api/transaction-tickets/${firstTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${KEY_API}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            payment_status: firstTransaction.payment_status // Keep same status
          }
        }),
      });
      
      console.log('Update response status:', updateResponse.status);
      const updateData = await updateResponse.json();
      console.log('Update response data:', updateData);
      
      return NextResponse.json({ 
        success: true,
        basic_test: {
          status: basicResponse.status,
          data: basicData
        },
        update_test: {
          status: updateResponse.status,
          data: updateData,
          transaction_id: firstTransaction.id
        }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      basic_test: {
        status: basicResponse.status,
        data: basicData
      },
      message: 'No transactions found to test update'
    });
    
  } catch (error: any) {
    console.error('Test Strapi connection error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
