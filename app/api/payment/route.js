import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import _ from "lodash"

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY
})  
// u/ mendapatkan data
export function GET() {
    return NextResponse.json({
        message: process.env.SERVER_KEY,
        data: [{
            id: 1,
            name: "Payment 1",
            description: "Integration Midtrans"
        }]
    })
}

// create / post data
export async function POST(req) {
    try {
        const data = await req.json();
        console.log('PAYMENT BODY:', data);
        const { email, items } = data;
        console.log('ITEMS:', items);
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error("data not found");
        }

        const itemDetails = items.map((item) => ({
            key: item.id,
            id: item.id,
            name: item.name,
            price: _.ceil(parseFloat(item.price.toString())),
            quantity: item.quantity
        }));

        const grossAmount = _.sumBy(itemDetails, (item) => item.price * item.quantity);
        const order_id = `ORDER-${Date.now()}-${_.random(1000, 9999)}`;

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount: grossAmount
            },
            item_details: itemDetails,
            customer_details: {
                email: email || ""
            }
        };
        console.log('MIDTRANS PARAMETER:', parameter);

        const token = await snap.createTransactionToken(parameter);

        return NextResponse.json({ token, order_id });
    } catch (err) {
        console.error('Midtrans error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}