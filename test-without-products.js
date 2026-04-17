// Test WITHOUT products field
async function testWithoutProducts() {
  const payload = {
    data: {
      order_id: "TEST-" + Date.now(),
      payment_status: "pending",
      customer_name: "Test User",
      customer_mail: "test@example.com",
      telp: "081234567890",
      vendor_doc_id: "test-vendor-123",
      event_type: "Ticket",
      product_name: "Test Product",
      quantity: "1",
      price: "100000",
      total_price: "100000",
      recipients: []
      // ❌ REMOVED: products: []
    }
  };

  console.log("📦 Testing WITHOUT products field...");
  
  const response = await fetch("/api/transaction-tickets-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("\nResponse:");
  console.log(text);
  
  try {
    const data = JSON.parse(text);
    if (data.data?.id) {
      console.log("\n✅ SUCCESS! ID:", data.data.id);
    }
  } catch(e) {}
}

testWithoutProducts();
