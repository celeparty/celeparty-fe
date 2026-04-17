// Browser Console Script - Copy & Run ini di F12 Console untuk test transaction creation

async function testTransactionCreation() {
  console.clear();
  console.log("🔵 Starting Transaction Creation Debug...\n");

  const testPayload = {
    transaction_type: "ticket",
    order_id: "TEST-" + Date.now(),
    payment_status: "pending",
    customer_name: "Test User",
    customer_mail: "test@example.com",
    telp: "081234567890",
    vendor_doc_id: "test-vendor-123",
    event_type: "Ticket",
    product_name: "Test Ticket Product",
    variant: "Regular",
    quantity: "1",
    price: "100000",
    total_price: "100000",
    recipients: JSON.stringify([
      {
        name: "John Doe",
        email: "john@example.com",
        identity_type: "KTP",
        identity_number: "1234567890123456"
      }
    ])
  };

  console.log("📦 Test Payload:");
  console.table(testPayload);

  try {
    const response = await fetch("/api/debug-transaction-creation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("\n🔗 Response Status:", response.status);
    console.log("🔗 Response Headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    const data = await response.json();

    console.log("\n📥 Response Data:");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ SUCCESS! Transaction created:");
      console.log("ID:", data.data?.data?.id);
    } else {
      console.error("\n❌ FAILED! Error:");
      console.error("Status:", data.status);
      console.error("Error:", data.error);
      if (data.details?.error) {
        console.error("Strapi Error Message:", data.details.error.message);
        console.error("Strapi Error Details:", JSON.stringify(data.details.error.details || {}, null, 2));
      }
    }

    return data;
  } catch (error) {
    console.error("\n❌ FETCH ERROR:", error.message);
    console.error(error);
  }
}

// Run the test
testTransactionCreation();
