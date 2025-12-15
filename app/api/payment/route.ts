import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

// Ensure environment variables are defined
if (!process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION) {
    throw new Error('NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION is not defined');
}
if (!process.env.MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY is not defined');
}
if (!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
    throw new Error('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not defined');
}

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
    isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(req: NextRequest) {
    console.log("Received payment request");
    try {
        const body = await req.json();
        console.log("Request body:", body);
        const { order_id, items, email } = body;

        if (!order_id || !items || !Array.isArray(items) || items.length === 0 || !email) {
            console.error("Invalid request body:", body);
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Calculate gross_amount from items
        const gross_amount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        console.log("Calculated gross_amount:", gross_amount);

        // Prepare item_details for Midtrans
        const item_details = items.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            name: item.name.substring(0, 50), // Max 50 chars for item name
        }));
        console.log("Prepared item_details for Midtrans:", item_details);

        // Prepare transaction parameters for Midtrans
        const parameter = {
            transaction_details: {
                order_id: order_id,
                gross_amount: gross_amount,
            },
            item_details: item_details,
            customer_details: {
                email: email,
                // You can add more customer details here if available
                // first_name: session.user.name,
                // phone: session.user.phone,
            },
            callbacks: {
                finish: `${req.nextUrl.origin}/cart/success`,
                error: `${req.nextUrl.origin}/cart/order-summary`,
                pending: `${req.nextUrl.origin}/cart/order-summary`,
            }
        };

        console.log("Creating Midtrans transaction with parameter:", parameter);

        // Create a transaction with Midtrans
        const transaction = await snap.createTransaction(parameter);

        console.log('Midtrans transaction created:', transaction);

        // Return the token to the frontend
        return NextResponse.json({ token: transaction.token });

    } catch (error) {
        console.error('Error creating Midtrans transaction:', JSON.stringify(error, null, 2));
        // Check if the error is from Midtrans and log it
        if (error instanceof Error && 'ApiResponse' in error) {
             // @ts-ignore
            console.error('Midtrans API Response Error:', error.ApiResponse);
        }
        return NextResponse.json({ error: 'Failed to process payment', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
