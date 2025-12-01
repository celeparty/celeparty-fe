# Setup Instructions for Ticket Management Feature

## 1. Install Required Dependencies

Run the following command to install additional libraries needed for export functionality:

```bash
npm install xlsx jspdf jspdf-autotable jsqr
# atau jika menggunakan yarn
yarn add xlsx jspdf jspdf-autotable jsqr
```

### Library Descriptions:

- **xlsx**: For Excel export functionality
- **jspdf**: For PDF export with table support
- **jspdf-autotable**: Plugin for jspdf to create formatted tables
- **jsqr**: For QR code scanning from camera stream

## 2. Optional: For Better QR Code Scanning

Alternatively, you can use ZXing library for more robust QR scanning:

```bash
npm install @zxing/library
# atau
yarn add @zxing/library
```

## 3. TypeScript Types (if needed)

```bash
npm install --save-dev @types/jspdf @types/xlsx
# atau
yarn add --dev @types/jspdf @types/xlsx
```

## 4. Update TicketScan.tsx for Actual QR Scanning

The current implementation has a placeholder for QR code scanning. To enable actual QR scanning:

### Option A: Using jsQR

```typescript
import jsQR from "jsqr";

// In captureQRCode function:
const imageData = context.getImageData(
  0,
  0,
  canvasRef.current.width,
  canvasRef.current.height
);
const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

if (qrCode) {
  const uniqueToken = qrCode.data; // atau parse dari JSON
  // Send to API
}
```

### Option B: Using ZXing

```typescript
import { BrowserMultiFormatReader } from "@zxing/library";

const codeReader = new BrowserMultiFormatReader();

// In startCamera:
const controls = await codeReader.decodeFromVideoElement(videoRef.current);
```

## 5. Database Schema Requirements

The backend should have the following tables:

### tickets table

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  documentId VARCHAR(255) UNIQUE,
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  unique_token VARCHAR(255) UNIQUE NOT NULL,
  product_id UUID NOT NULL,
  variant_id VARCHAR(255),
  recipient_id UUID NOT NULL,
  payment_status ENUM('paid', 'bypass') DEFAULT 'paid',
  verification_status ENUM('unverified', 'verified') DEFAULT 'unverified',
  verification_date DATE,
  verification_time TIME,
  verified_by UUID,
  used_at TIMESTAMP,
  qr_code LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (recipient_id) REFERENCES ticket_recipients(id)
);
```

### ticket_recipients table

```sql
CREATE TABLE ticket_recipients (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  identity_type VARCHAR(50),
  identity_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ticket_verifications table

```sql
CREATE TABLE ticket_verifications (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL,
  verified_by UUID NOT NULL,
  verification_date DATE,
  verification_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (verified_by) REFERENCES users_permissions_users(id)
);
```

### ticket_send_history table

```sql
CREATE TABLE ticket_send_history (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  variant_id VARCHAR(255),
  sent_by UUID NOT NULL,
  recipient_count INT,
  send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (sent_by) REFERENCES users_permissions_users(id)
);
```

## 6. Environment Variables

Add to your `.env.local`:

```env
# QR Code Encryption (optional)
NEXT_PUBLIC_QR_ENCRYPTION_KEY=your-secret-key
```

## 7. File Locations

All ticket management components are located at:

```
d:\laragon\www\celeparty-fe\components\profile\vendor\ticket-management\
├── TicketDashboard.tsx
├── TicketSummaryTable.tsx
├── TicketDetailPage.tsx
├── TicketScan.tsx
└── TicketSend.tsx
```

Supporting files:

- `lib/interfaces/iTicketManagement.ts` - TypeScript interfaces
- `lib/utils/ticketManagementUtils.ts` - Utility functions
- `lib/api/ticketApiEndpoints.ts` - API documentation
- `TICKET_MANAGEMENT_README.md` - Feature documentation

## 8. Next Steps

1. ✅ Frontend components are ready
2. 🔄 Implement backend API endpoints
3. 🔄 Create database tables
4. 🔄 Integrate email notification system
5. 🔄 Add QR code generation
6. 🔄 Add system fee calculation

## 9. Troubleshooting

### Camera access denied

- Make sure the browser has permission to access camera
- Test in different browser if needed
- Use HTTPS for camera permission (required on production)

### Export not working

- Check if xlsx and jspdf are properly installed
- Check browser console for errors
- Ensure data is properly formatted

### QR scanning not working

- Verify jsQR library is installed
- Check if canvas context is properly initialized
- Ensure good lighting for camera

## 10. Testing

Test each feature:

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to /user/vendor/tickets

# 3. Test Dashboard Ticket Tab
#    - View summary
#    - Click detail
#    - Test filter & sort
#    - Test export buttons

# 4. Test Scan Ticket Tab
#    - Open camera
#    - Test capture (needs actual QR code)
#    - Test verification

# 5. Test Kirim Undangan Tab
#    - Select product & variant
#    - Add recipients
#    - Test password confirmation
#    - Verify send history
```

## Need Help?

Refer to:

- `TICKET_MANAGEMENT_README.md` for feature overview
- `lib/api/ticketApiEndpoints.ts` for API requirements
- Component JSDoc comments for specific implementation details
