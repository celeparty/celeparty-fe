/**
 * API Endpoints untuk Ticket Management
 * 
 * File ini mendokumentasikan semua API endpoint yang diperlukan untuk fitur management ticket
 * Backend (Strapi) harus mengimplementasikan endpoints ini
 */

// ============================================
// DASHBOARD TICKET ENDPOINTS
// ============================================

/**
 * GET /api/tickets/summary
 * 
 * Mendapatkan ringkasan penjualan tiket dari vendor
 * 
 * Response:
 * {
 *   data: [
 *     {
 *       product_id: string,
 *       product_title: string,
 *       product_image: string,
 *       variants: [
 *         {
 *           variant_id: string,
 *           variant_name: string,
 *           price: number,
 *           quota: number,
 *           sold: number,
 *           verified: number,
 *           remaining: number,
 *           soldPercentage: number,
 *           netIncome: number,
 *           systemFeePercentage: number
 *         }
 *       ],
 *       totalRevenue: number,
 *       totalTicketsSold: number
 *     }
 *   ]
 * }
 */

/**
 * GET /api/tickets/detail/:productId
 * 
 * Mendapatkan detail tiket yang terjual untuk suatu produk
 * 
 * Query Parameters:
 * - variant?: string (filter by variant name)
 * - status?: "verified" | "unverified" (filter by verification status)
 * - dateFrom?: string (format: YYYY-MM-DD)
 * - dateTo?: string (format: YYYY-MM-DD)
 * - search?: string (search by recipient name or email)
 * 
 * Response:
 * {
 *   data: [
 *     {
 *       id: string,
 *       documentId: string,
 *       ticket_code: string,
 *       unique_token: string,
 *       product_title: string,
 *       variant_name: string,
 *       recipient_name: string,
 *       recipient_email: string,
 *       recipient_phone: string,
 *       recipient_identity_type: string,
 *       recipient_identity_number: string,
 *       purchase_date: string (ISO),
 *       payment_status: "paid" | "bypass",
 *       verification_status: "verified" | "unverified",
 *       verification_date?: string (ISO),
 *       verification_time?: string,
 *       used_at?: string (ISO),
 *       qr_code?: string (base64 atau URL)
 *     }
 *   ]
 * }
 */

// ============================================
// SCAN TICKET ENDPOINTS
// ============================================

/**
 * POST /api/tickets/scan
 * 
 * Scan QR code untuk mendapatkan data tiket
 * 
 * Body:
 * {
 *   qr_data: string (encrypted unique token dari QR code)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   ticket: {
 *     id: string,
 *     ticket_code: string,
 *     recipient_name: string,
 *     product_title: string,
 *     variant_name: string,
 *     recipient_email: string,
 *     verification_status: "verified" | "unverified"
 *   },
 *   message: string
 * }
 */

/**
 * POST /api/tickets/:ticketId/verify
 * 
 * Verifikasi tiket setelah scan
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   ticket: { ... }
 * }
 */

/**
 * GET /api/tickets/verification-history
 * 
 * Mendapatkan riwayat verifikasi tiket
 * 
 * Response:
 * {
 *   data: [
 *     {
 *       id: string,
 *       ticket_code: string,
 *       recipient_name: string,
 *       variant_name: string,
 *       verification_date: string (YYYY-MM-DD),
 *       verification_time: string (HH:MM:SS),
 *       verified_by?: string
 *     }
 *   ]
 * }
 */

// ============================================
// SEND TICKET ENDPOINTS
// ============================================

/**
 * POST /api/tickets/send-invitation
 * 
 * Mengirim tiket undangan ke recipients
 * 
 * Body:
 * {
 *   product_id: string,
 *   variant_id: string,
 *   recipients: [
 *     {
 *       name: string,
 *       email: string,
 *       phone: string,
 *       identity_type: "KTP" | "SIM" | "PASSPORT" | "OTHER",
 *       identity_number: string
 *     }
 *   ],
 *   password: string (untuk konfirmasi user)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   tickets_created: number,
 *   recipients: [
 *     {
 *       email: string,
 *       status: "sent" | "failed"
 *     }
 *   ]
 * }
 */

/**
 * GET /api/tickets/send-history
 * 
 * Mendapatkan riwayat pengiriman tiket undangan
 * 
 * Response:
 * {
 *   data: [
 *     {
 *       id: string,
 *       send_date: string (ISO),
 *       product_title: string,
 *       variant_name: string,
 *       recipient_count: number,
 *       recipients: [
 *         {
 *           name: string,
 *           email: string,
 *           phone: string,
 *           identity_type: string,
 *           identity_number: string
 *         }
 *       ],
 *       sent_by: string
 *     }
 *   ]
 * }
 */

// ============================================
// NOTES
// ============================================

/**
 * SECURITY NOTES:
 * 
 * 1. Verify JWT token pada setiap request
 * 2. Ensure user hanya bisa access data miliknya sendiri
 * 3. Password confirmation harus divalidasi dengan bcrypt
 * 4. QR code harus encrypted dengan secure key
 * 5. Rate limiting pada scan endpoint
 * 
 * DATABASE REQUIREMENTS:
 * 
 * Tables yang diperlukan:
 * - tickets (ticket_code, unique_token, verification_status, etc)
 * - ticket_recipients (detail penerima tiket)
 * - ticket_verifications (history verifikasi)
 * - ticket_send_history (history pengiriman undangan)
 */

export {};
