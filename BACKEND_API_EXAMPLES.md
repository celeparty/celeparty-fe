/\*\*

- BACKEND API IMPLEMENTATION EXAMPLES
-
- File ini berisi contoh implementasi API endpoints untuk Ticket Management di Strapi
- Gunakan sebagai referensi untuk mengimplementasikan di backend Anda
  \*/

// ============================================
// 1. DASHBOARD TICKET - Get Summary
// ============================================

/\*\*

- Endpoint: GET /api/tickets/summary
-
- Controller Example (Strapi):
  \*/

const getTicketSummary = async (ctx) => {
try {
const { user } = ctx.state;

    // Get all products milik vendor dengan type ticket
    const products = await strapi.entityService.findMany("api::product.product", {
      filters: {
        users_permissions_user: { id: user.id },
        user_event_type: { name: "ticket" },
      },
      populate: ["variant", "main_image"],
    });

    const summary = await Promise.all(
      products.map(async (product) => {
        // Get all tickets untuk product ini
        const tickets = await strapi.entityService.findMany(
          "api::ticket.ticket",
          {
            filters: { product: { id: product.id } },
            populate: ["variant", "recipient"],
          }
        );

        // Group by variant
        const variantMap = new Map();
        tickets.forEach((ticket) => {
          const variantName = ticket.variant?.name || "Default";
          if (!variantMap.has(variantName)) {
            variantMap.set(variantName, {
              tickets: [],
              variant: ticket.variant,
            });
          }
          variantMap.get(variantName).tickets.push(ticket);
        });

        // Calculate summary per variant
        const variants = Array.from(variantMap.values()).map((item) => {
          const sold = item.tickets.length;
          const verified = item.tickets.filter(
            (t) => t.verification_status === "verified"
          ).length;
          const price = item.variant?.price || 0;
          const quota = parseInt(item.variant?.quota) || 0;
          const remaining = quota - sold;
          const grossRevenue = sold * price;
          const systemFeePercentage = 5;
          const netIncome =
            grossRevenue - (grossRevenue * systemFeePercentage) / 100;

          return {
            variant_id: item.variant?.id,
            variant_name: variantName,
            price,
            quota,
            sold,
            verified,
            remaining,
            soldPercentage: quota > 0 ? (sold / quota) * 100 : 0,
            netIncome,
            systemFeePercentage,
          };
        });

        return {
          product_id: product.id,
          product_title: product.title,
          product_image: product.main_image?.[0]?.url,
          variants,
          totalRevenue: variants.reduce((sum, v) => sum + v.netIncome, 0),
          totalTicketsSold: variants.reduce((sum, v) => sum + v.sold, 0),
        };
      })
    );

    ctx.body = { data: summary };

} catch (error) {
ctx.throw(500, error.message);
}
};

// ============================================
// 2. DASHBOARD TICKET - Get Detail
// ============================================

/\*\*

- Endpoint: GET /api/tickets/detail/:productId
  \*/

const getTicketDetail = async (ctx) => {
try {
const { user } = ctx.state;
const { productId } = ctx.params;
const { variant, status, search } = ctx.query;

    // Verify product belongs to user
    const product = await strapi.entityService.findOne(
      "api::product.product",
      productId,
      { filters: { users_permissions_user: { id: user.id } } }
    );

    if (!product) {
      return ctx.throw(404, "Product not found");
    }

    // Build filter
    const filters = { product: { id: productId } };
    if (variant) filters.variant = { name: variant };
    if (status) filters.verification_status = status;

    // Get tickets
    let tickets = await strapi.entityService.findMany("api::ticket.ticket", {
      filters,
      populate: ["product", "variant", "recipient"],
    });

    // Apply search filter (client-side since it's complex)
    if (search) {
      tickets = tickets.filter(
        (t) =>
          t.recipient?.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.recipient?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Format response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      documentId: ticket.documentId,
      ticket_code: ticket.ticket_code,
      unique_token: ticket.unique_token,
      product_title: product.title,
      variant_name: ticket.variant?.name || "Default",
      recipient_name: ticket.recipient?.name,
      recipient_email: ticket.recipient?.email,
      recipient_phone: ticket.recipient?.phone,
      recipient_identity_type: ticket.recipient?.identity_type,
      recipient_identity_number: ticket.recipient?.identity_number,
      purchase_date: ticket.createdAt,
      payment_status: ticket.payment_status,
      verification_status: ticket.verification_status,
      verification_date: ticket.verification_date,
      verification_time: ticket.verification_time,
      used_at: ticket.used_at,
      qr_code: ticket.qr_code,
    }));

    ctx.body = { data: formattedTickets };

} catch (error) {
ctx.throw(500, error.message);
}
};

// ============================================
// 3. SCAN TICKET - Scan QR Code
// ============================================

/\*\*

- Endpoint: POST /api/tickets/scan
  \*/

const scanTicket = async (ctx) => {
try {
const { qr_data } = ctx.request.body;

    if (!qr_data) {
      return ctx.throw(400, "QR data is required");
    }

    // Decrypt QR data
    const decryptedData = decryptQRCode(qr_data); // Implement your decryption
    const { unique_token } = JSON.parse(decryptedData);

    // Find ticket
    const ticket = await strapi.entityService.findOne("api::ticket.ticket", {
      filters: { unique_token },
      populate: ["product", "variant", "recipient"],
    });

    if (!ticket) {
      return ctx.throw(404, "Ticket not found");
    }

    ctx.body = {
      success: true,
      ticket: {
        id: ticket.id,
        ticket_code: ticket.ticket_code,
        recipient_name: ticket.recipient?.name,
        product_title: ticket.product?.title,
        variant_name: ticket.variant?.name,
        recipient_email: ticket.recipient?.email,
        verification_status: ticket.verification_status,
      },
      message: "Ticket found successfully",
    };

} catch (error) {
ctx.throw(500, error.message);
}
};

// ============================================
// 4. SCAN TICKET - Verify Ticket
// ============================================

/\*\*

- Endpoint: POST /api/tickets/:ticketId/verify
  \*/

const verifyTicket = async (ctx) => {
try {
const { user } = ctx.state;
const { ticketId } = ctx.params;

    const ticket = await strapi.entityService.findOne(
      "api::ticket.ticket",
      ticketId
    );

    if (!ticket) {
      return ctx.throw(404, "Ticket not found");
    }

    if (ticket.verification_status === "verified") {
      return ctx.throw(400, "Ticket already verified");
    }

    const now = new Date();
    const verifiedTicket = await strapi.entityService.update(
      "api::ticket.ticket",
      ticketId,
      {
        data: {
          verification_status: "verified",
          verification_date: now.toISOString().split("T")[0],
          verification_time: now.toTimeString().split(" ")[0],
          verified_by: user.id,
        },
      }
    );

    // Log verification
    await strapi.entityService.create("api::ticket-verification.ticket-verification", {
      data: {
        ticket: ticketId,
        verified_by: user.id,
        verification_date: now.toISOString().split("T")[0],
        verification_time: now.toTimeString().split(" ")[0],
      },
    });

    ctx.body = {
      success: true,
      message: "Ticket verified successfully",
      ticket: verifiedTicket,
    };

} catch (error) {
ctx.throw(500, error.message);
}
};

// ============================================
// 5. SEND TICKET - Send Invitation
// ============================================

/\*\*

- Endpoint: POST /api/tickets/send-invitation
  \*/

const sendTicketInvitation = async (ctx) => {
try {
const { user } = ctx.state;
const { product_id, variant_id, recipients, password } = ctx.request.body;

    // Verify password
    const validPassword = await strapi
      .plugin("users-permissions")
      .service("user")
      .validatePassword(password, user.password);

    if (!validPassword) {
      return ctx.throw(401, "Invalid password");
    }

    // Create tickets for each recipient
    const createdTickets = await Promise.all(
      recipients.map(async (recipient) => {
        // Generate ticket code & unique token
        const ticketCode = generateTicketCode(product_id);
        const uniqueToken = generateUniqueToken();
        const qrCode = generateQRCode({ uniqueToken, ticketCode });

        // Create recipient
        const recipientRecord = await strapi.entityService.create(
          "api::ticket-recipient.ticket-recipient",
          {
            data: recipient,
          }
        );

        // Create ticket
        const ticket = await strapi.entityService.create(
          "api::ticket.ticket",
          {
            data: {
              ticket_code: ticketCode,
              unique_token: uniqueToken,
              qr_code: qrCode,
              product: product_id,
              variant: variant_id,
              recipient: recipientRecord.id,
              payment_status: "bypass",
              verification_status: "unverified",
            },
          }
        );

        // Send email
        await sendTicketEmail(recipient.email, {
          ticketCode,
          qrCode,
          uniqueToken,
        });

        return { ticket, recipient };
      })
    );

    // Log send history
    await strapi.entityService.create(
      "api::ticket-send-history.ticket-send-history",
      {
        data: {
          product: product_id,
          variant: variant_id,
          sent_by: user.id,
          recipient_count: recipients.length,
        },
      }
    );

    ctx.body = {
      success: true,
      message: `Tickets sent to ${recipients.length} recipients`,
      tickets_created: createdTickets.length,
      recipients: recipients.map((r) => ({
        email: r.email,
        status: "sent",
      })),
    };

} catch (error) {
ctx.throw(500, error.message);
}
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateTicketCode = (productId) => {
const timestamp = Date.now().toString().slice(-6);
const randomNum = Math.floor(Math.random() \* 10000)
.toString()
.padStart(4, "0");
return `TKT-${productId.toString().substring(0, 3).toUpperCase()}-${timestamp}-${randomNum}`;
};

const generateUniqueToken = () => {
return Math.random().toString(36).substring(2, 15) +
Math.random().toString(36).substring(2, 15);
};

const generateQRCode = (data) => {
// Use 'qrcode' library to generate QR code
const QRCode = require("qrcode");
return QRCode.toDataURL(JSON.stringify(data));
};

const decryptQRCode = (encryptedData) => {
// Implement your decryption logic
// Using crypto library
const crypto = require("crypto");
const key = process.env.QR_ENCRYPTION_KEY;
// Implementation here
return encryptedData; // placeholder
};

const sendTicketEmail = async (email, ticketData) => {
// Use email service (Nodemailer, SendGrid, etc)
// Implementation here
};

module.exports = {
getTicketSummary,
getTicketDetail,
scanTicket,
verifyTicket,
sendTicketInvitation,
};
