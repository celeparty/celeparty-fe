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
        const requestData = await req.json()
        console.log("Request data:", requestData)
        
        // Handle both old format (array) and new format (object with items)
        let items = []
        if (Array.isArray(requestData)) {
            items = requestData
        } else if (requestData.items && Array.isArray(requestData.items)) {
            items = requestData.items
        } else {
            throw new Error("Invalid data format")
        }
        
        if (items.length === 0) {
            throw new Error("No items found")
        }

        const itemDetails = items.map((item) => {
            return {
                id: item.id,
                price: _.ceil(parseFloat(item.price.toString())),
                quantity: item.quantity,
                name: item.name
            }
        })

                const grossAmount = _.sumBy(itemDetails, (item) => item.price * item.quantity)
        
        // Gunakan order_id yang sudah ada atau generate baru
        const orderId = requestData.order_id || `ORDER-${Date.now()}-${_.random(1000, 9999)}`
        
        const parameter = {
          item_details: itemDetails,
          transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount
          }
        }

        console.log("Midtrans parameter:", parameter)
        const token = await snap.createTransactionToken(parameter)
        
        return NextResponse.json({
            token: token,
            order_id: orderId
        })
    } catch (error) {
        console.error("Payment API error:", error)
        return NextResponse.json(
            { error: error.message || "Payment processing failed" },
            { status: 500 }
        )
    }
}