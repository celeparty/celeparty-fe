# Dashboard Vendor - Ticket Management

Dokumentasi lengkap untuk implementasi fitur Management Tiket di dashboard vendor.

## 📋 Daftar Fitur

### 1. Dashboard Ticket

- **Ringkasan Penjualan**: Tabel summary yang menampilkan data penjualan tiket dari setiap produk
- **Detail Per Varian**: Setiap varian menampilkan:
  - Jumlah tiket
  - Jumlah tiket terjual
  - Sisa stok
  - Persentase tiket terjual
  - Jumlah tiket terverifikasi
  - Harga jual tiket
  - Total income bersih (setelah fee sistem)
- **Button Detail**: Masuk ke halaman detail produk tiket
- **Halaman Detail Tiket**:
  - Summary cards dengan statistik utama
  - Filter & sort:
    - Sort by: Tanggal, Varian, Status
    - Filter by: Varian, Status Verifikasi, Nama Penerima
  - Export data (Excel, PDF, CSV)
  - Tabel detail tiket yang sudah terjual

### 2. Scan Ticket

- **Akses Kamera**: Button untuk membuka akses kamera device
- **Capture QR Code**: Capture QR code dari tiket menggunakan kamera
- **Decode Data**: Extract unique_token dari QR code
- **Display Ticket Info**: Tampilkan detail tiket yang terdeteksi
- **Verify Button**: Button untuk verifikasi tiket
- **Verification History**:
  - Tabel riwayat verifikasi tiket
  - Urutkan dari yang terbaru
  - Menampilkan waktu verifikasi
  - Auto-refresh setiap 3 menit

### 3. Kirim Undangan Tiket

- **Form Section**:
  - Pilih produk tiket
  - Pilih varian tiket
  - Masukkan jumlah tiket
  - Input data penerima (name, email, phone, identity type, identity number)
  - Dynamic recipient form sesuai jumlah tiket
- **Password Confirmation Modal**:
  - Muncul saat klik tombol kirim
  - Require password untuk konfirmasi
- **Send History**:
  - Tabel riwayat pengiriman tiket
  - Menampilkan tanggal, produk, varian, jumlah, dan penerima

## 🏗️ Struktur File

```
components/
└── profile/
    └── vendor/
        └── ticket-management/
            ├── TicketDashboard.tsx          # Main dashboard component
            ├── TicketSummaryTable.tsx       # Summary table component
            ├── TicketDetailPage.tsx         # Detail page with filters & export
            ├── TicketScan.tsx               # Scan ticket component
            └── TicketSend.tsx               # Send invitation component

lib/
├── interfaces/
│   └── iTicketManagement.ts                 # Type definitions
├── api/
│   └── ticketApiEndpoints.ts                # API documentation
└── utils/
    └── ticketManagementUtils.ts             # Utility functions

app/
└── user/
    └── vendor/
        └── tickets/
            └── page.tsx                     # Main page dengan tabs
```

## 🔧 Backend API Requirements

### Required Endpoints

```
GET  /api/tickets/summary
GET  /api/tickets/detail/:productId
POST /api/tickets/scan
POST /api/tickets/:ticketId/verify
GET  /api/tickets/verification-history
POST /api/tickets/send-invitation
GET  /api/tickets/send-history
```

Lihat `lib/api/ticketApiEndpoints.ts` untuk detail lengkap setiap endpoint.

## 📦 Dependencies

Frontend sudah menggunakan:

- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching
- `next-auth/react` - Authentication
- `date-fns` - Date formatting
- `xlsx` - Excel export
- `jspdf` - PDF export

Tambahan yang mungkin diperlukan:

- `jsqr` atau `zxing` - QR code scanning
- `html2canvas` - Screenshot export
- `papaparse` - CSV parsing

## 🎯 Implementation Checklist

### Frontend (Done ✅)

- [x] TicketDashboard component dengan tabs
- [x] TicketSummaryTable component
- [x] TicketDetailPage dengan filter, sort, dan export
- [x] TicketScan component dengan camera integration
- [x] TicketSend component dengan form dan history
- [x] Interfaces dan types
- [x] Utility functions
- [x] API documentation

### Backend (To Do 🔄)

- [ ] Create database tables (tickets, ticket_recipients, ticket_verifications, etc)
- [ ] Implement all API endpoints
- [ ] Create ticket summary calculation
- [ ] Implement QR code generation & encryption
- [ ] Create email notification system
- [ ] Implement payment verification integration
- [ ] Add system fee calculation logic
- [ ] Create verification history tracking
- [ ] Implement password confirmation logic

### Additional Features (Optional)

- [ ] Real-time ticket sales dashboard
- [ ] Bulk ticket generation
- [ ] Ticket template customization
- [ ] SMS notification for ticket delivery
- [ ] Analytics & reporting
- [ ] Ticket usage tracking

## 🚀 Usage

### Dashboard Ticket

1. Navigate to `/user/vendor/tickets`
2. Default tab adalah "Dashboard Ticket"
3. Lihat ringkasan penjualan tiket
4. Click "Detail" button untuk lihat detail tiket
5. Use filter & sort untuk menganalisis data
6. Click export button untuk download data

### Scan Ticket

1. Navigate to "Scan Tiket" tab
2. Click "Buka Kamera" button
3. Point kamera ke QR code pada tiket
4. Click "Capture QR Code"
5. Review detail tiket
6. Click "Verifikasi Tiket"
7. Check verification history di bawah

### Kirim Undangan Tiket

1. Navigate to "Kirim Undangan Tiket" tab
2. Pilih produk dan varian tiket
3. Tentukan jumlah tiket yang akan dikirim
4. Isi data penerima untuk setiap tiket
5. Click "Kirim Tiket Undangan"
6. Enter password untuk konfirmasi
7. Check send history di bawah

## 🔐 Security Considerations

1. **JWT Token**: Verify pada setiap request
2. **User Authorization**: Ensure vendor hanya access data miliknya
3. **Password Confirmation**: Gunakan bcrypt untuk hashing
4. **QR Code Encryption**: Encrypt unique_token sebelum di-encode ke QR
5. **Rate Limiting**: Limit scan requests untuk prevent abuse
6. **CORS**: Configure proper CORS settings
7. **Data Validation**: Validate semua input dari frontend

## 📊 Data Export Formats

### Excel (.xlsx)

- Columns: Kode Tiket, Nama Penerima, Email, No. Telepon, Varian, Status, Tanggal, etc
- Filename: `Tiket_[ProductName]_[Date].xlsx`

### PDF

- Formatted table dengan header
- Includes: Tiket code, recipient info, variant, status, date
- Filename: `Tiket_[ProductName]_[Date].pdf`

### CSV

- Comma-separated values
- Include header row
- Filename: `Tiket_[ProductName]_[Date].csv`

## 🐛 Error Handling

Semua component sudah handle error dengan:

- Toast notifications (success/error)
- Loading states dengan Skeleton
- Empty state messages
- Input validation

## 📝 Notes

- Semua waktu menggunakan ISO format di database
- Display format untuk user: `DD/MM/YYYY HH:MM`
- System fee untuk income calculation: default 5% (configurable)
- Auto-refresh data setiap 5 menit (configurable per component)
