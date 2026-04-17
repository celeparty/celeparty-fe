// Simple Direct Test - Run di Browser Console (F12)
// Ini test langsung ke endpoint yang sudah ada

async function testDirectly() {
  console.clear();
  console.log("🔵 Testing directly to transaction-tickets-proxy...\n");

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
      variant: "Regular",
      quantity: "1",
      price: "100000",
      total_price: "100000",
      recipients: [],
      products: []
    }
  };

  console.log("📦 Payload:");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch("/api/transaction-tickets-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("\n📊 Response Status:", response.status);
    console.log("📊 Content-Type:", response.headers.get("content-type"));

    const text = await response.text();
    console.log("\n📥 Raw Response Text:");
    console.log(text.substring(0, 500));

    try {
      const data = JSON.parse(text);
      console.log("\n✅ Parsed as JSON:");
      console.table(data);
      if (data.error) {
        console.error("❌ ERROR:", data.error);
        console.error("Details:", data.details);
      }
      return data;
    } catch (e) {
      console.error("❌ Could not parse as JSON");
      return text;
    }
  } catch (error) {
    console.error("❌ FETCH ERROR:", error);
    return error;
  }
}

testDirectly();
