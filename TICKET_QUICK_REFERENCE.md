# 🚀 Quick Reference - Ticket Management

## 📦 Instalasi

```bash
# 1. Install dependencies
npm install xlsx jspdf jspdf-autotable jsqr

# 2. (Optional) Untuk QR scanning lebih robust
npm install @zxing/library
```

## 📂 File Locations

| File          | Path                                                                 | Purpose                 |
| ------------- | -------------------------------------------------------------------- | ----------------------- |
| Main Page     | `app/user/vendor/tickets/page.tsx`                                   | Entry point dengan tabs |
| Dashboard     | `components/profile/vendor/ticket-management/TicketDashboard.tsx`    | Main dashboard          |
| Summary Table | `components/profile/vendor/ticket-management/TicketSummaryTable.tsx` | Sales summary           |
| Detail Page   | `components/profile/vendor/ticket-management/TicketDetailPage.tsx`   | Detail & export         |
| Scan          | `components/profile/vendor/ticket-management/TicketScan.tsx`         | QR scanning             |
| Send          | `components/profile/vendor/ticket-management/TicketSend.tsx`         | Send tickets            |
| Interfaces    | `lib/interfaces/iTicketManagement.ts`                                | Types & interfaces      |
| Utils         | `lib/utils/ticketManagementUtils.ts`                                 | Helper functions        |

## 🎯 Fitur Quick Navigation

### Dashboard Tab

| Fitur         | Component          | File                 |
| ------------- | ------------------ | -------------------- |
| Summary Table | TicketSummaryTable | TicketDashboard.tsx  |
| Detail Page   | TicketDetailPage   | Linked from Summary  |
| Filter        | Input + Select     | TicketDetailPage.tsx |
| Sort          | Select Options     | TicketDetailPage.tsx |
| Export        | Buttons            | TicketDetailPage.tsx |

### Scan Tab

| Fitur   | Component   | File           |
| ------- | ----------- | -------------- |
| Camera  | HTML5 Video | TicketScan.tsx |
| Capture | Canvas      | TicketScan.tsx |
| Verify  | API Call    | TicketScan.tsx |
| History | Table       | TicketScan.tsx |

### Send Tab

| Fitur      | Component      | File           |
| ---------- | -------------- | -------------- |
| Form       | Select + Input | TicketSend.tsx |
| Recipients | Dynamic Form   | TicketSend.tsx |
| Password   | Modal          | TicketSend.tsx |
| History    | Table          | TicketSend.tsx |

## 🔌 API Endpoints Required

```javascript
// Dashboard
GET /api/tickets/summary
GET /api/tickets/detail/:productId

// Scan
POST /api/tickets/scan
POST /api/tickets/:ticketId/verify
GET /api/tickets/verification-history

// Send
POST /api/tickets/send-invitation
GET /api/tickets/send-history
```

## 📝 Data Structure

### Ticket Summary Response

```javascript
{
  product_id: string,
  product_title: string,
  variants: [
    {
      variant_name: string,
      price: number,
      quota: number,
      sold: number,
      verified: number,
      remaining: number,
      soldPercentage: number,
      netIncome: number
    }
  ],
  totalRevenue: number,
  totalTicketsSold: number
}
```

### Ticket Detail Response

```javascript
{
  id: string,
  ticket_code: string,
  unique_token: string,
  recipient_name: string,
  recipient_email: string,
  variant_name: string,
  payment_status: "paid" | "bypass",
  verification_status: "verified" | "unverified",
  verification_date: string,
  verification_time: string
}
```

## 🎨 Component Props

### TicketSummaryTable

```typescript
props {
  data: iTicketSummary[],
  onDetailClick: (product: iTicketSummary) => void
}
```

### TicketDetailPage

```typescript
props {
  product: iTicketSummary
}
```

## 🔐 Key Functions

```typescript
// Calculate net income (deduct system fee)
calculateNetIncome(gross: number, feePercentage: number): number

// Calculate sold percentage
calculateSoldPercentage(sold: number, quota: number): number

// Validate recipient data
validateRecipientData(name, email, phone, id): { valid, errors }

// Format verification time
formatVerificationTime(date: string, time: string): string

// Generate ticket code
generateTicketCode(productId: string, index: number): string
```

## 💾 Database Schema Quick Reference

```sql
-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  ticket_code VARCHAR(50) UNIQUE,
  unique_token VARCHAR(255) UNIQUE,
  product_id UUID,
  variant_id VARCHAR(255),
  recipient_id UUID,
  payment_status ENUM('paid', 'bypass'),
  verification_status ENUM('unverified', 'verified'),
  verification_date DATE,
  verification_time TIME
);

-- Recipients
CREATE TABLE ticket_recipients (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  identity_type VARCHAR(50),
  identity_number VARCHAR(100)
);

-- Verification History
CREATE TABLE ticket_verifications (
  id UUID PRIMARY KEY,
  ticket_id UUID,
  verified_by UUID,
  verification_date DATE,
  verification_time TIME
);

-- Send History
CREATE TABLE ticket_send_history (
  id UUID PRIMARY KEY,
  product_id UUID,
  variant_id VARCHAR(255),
  sent_by UUID,
  recipient_count INT,
  send_date TIMESTAMP
);
```

## 🔄 State Management

```typescript
// Dashboard
const [selectedProduct, setSelectedProduct] = useState<iTicketSummary | null>(
  null
);

// Scan
const [isCameraActive, setIsCameraActive] = useState(false);
const [scannedTicket, setScannedTicket] = useState<any>(null);

// Send
const [selectedProduct, setSelectedProduct] = useState<string>("");
const [selectedVariant, setSelectedVariant] = useState<string>("");
const [recipients, setRecipients] = useState<iTicketRecipient[]>([]);
const [showPasswordModal, setShowPasswordModal] = useState(false);
```

## 🔄 Query Hooks

```typescript
// Fetch data
const summaryQuery = useQuery({
  queryKey: ["ticketSummary", session?.jwt],
  queryFn: getTicketSummary,
  enabled: !!session?.jwt,
  staleTime: 5 * 60 * 1000,
});

// Manual refetch
await historyQuery.refetch();
```

## 📤 Export Functions

```typescript
// Excel
handleExportExcel() {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tiket");
  XLSX.writeFile(workbook, filename);
}

// PDF
handleExportPDF() {
  const doc = new jsPDF();
  doc.autoTable({ head, body });
  doc.save(filename);
}

// CSV
handleExportCSV() {
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  // Download
}
```

## 🎯 Filter & Sort Example

```typescript
// Filter & sort data
const filteredData = useMemo(() => {
  let data = detailQuery.data || [];

  // Filter
  if (filterVariant !== "all") {
    data = data.filter((t) => t.variant_name === filterVariant);
  }
  if (filterStatus !== "all") {
    data = data.filter((t) => t.verification_status === filterStatus);
  }

  // Sort
  data.sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.purchase_date) - new Date(a.purchase_date);
    }
    // ...
  });

  return data;
}, [detailQuery.data, filterVariant, filterStatus, sortBy, sortOrder]);
```

## 🚨 Error Handling

```typescript
try {
  const response = await axiosUser("GET", endpoint, jwt);
  // Handle success
} catch (error: any) {
  const errorMsg = error?.response?.data?.error?.message;

  // Map ke bahasa Indonesia
  if (errorMsg.includes("invalid")) {
    toast({ description: "Data tidak valid" });
  }
  // ... more mappings
}
```

## 📱 Responsive Breakpoints

```css
/* Default (mobile) */
/* md: (768px) */
md:grid-cols-2
md:col-span-2

/* lg: (1024px) */
lg:text-[17px]
```

## 🔑 Important Notes

1. **JWT Required**: All API calls need valid JWT token
2. **User Authorization**: Backend must verify user owns the product
3. **Password Confirmation**: For sensitive operations like sending tickets
4. **QR Code Encryption**: For security, QR codes harus encrypted
5. **Auto-refresh**: History tabs auto-refresh setiap 3-5 menit
6. **Email Notifications**: Backend harus kirim email saat tiket dikirim
7. **System Fee**: Default 5%, dapat di-configure

## 🐛 Common Issues & Solutions

| Issue              | Solution                                |
| ------------------ | --------------------------------------- |
| Camera not working | Check browser permissions, use HTTPS    |
| Export too slow    | Implement pagination for large datasets |
| QR scan fails      | Use better lighting, try ZXing library  |
| API 401 error      | Check JWT token validity                |
| Email not sent     | Check email service configuration       |

## 📚 Documentation

| File                         | Purpose                |
| ---------------------------- | ---------------------- |
| TICKET_MANAGEMENT_README.md  | Full feature overview  |
| TICKET_SETUP_INSTRUCTIONS.md | Setup & installation   |
| BACKEND_API_EXAMPLES.md      | Backend implementation |
| IMPLEMENTATION_CHECKLIST.md  | Complete checklist     |

## 🔗 Related Files

- `lib/enums/eAlert.ts` - Alert types
- `lib/services.ts` - API client
- `hooks/use-toast.ts` - Toast notifications
- `components/ui/button.tsx` - Button component
- `components/ui/input.tsx` - Input component
- `components/ui/select.tsx` - Select component
- `components/Skeleton.tsx` - Loading skeleton

## 🎬 Getting Started

1. ✅ Frontend code ready
2. 📦 Install dependencies: `npm install xlsx jspdf jspdf-autotable jsqr`
3. 🔄 Setup backend APIs per documentation
4. 💾 Create database tables
5. 📧 Configure email service
6. 🧪 Test all features
7. 🚀 Deploy

---

**Generated**: 2025-12-01
**Status**: Frontend Complete ✅
