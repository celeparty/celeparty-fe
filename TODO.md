# TODO: Implement Vendor Ticket Management Dashboard

## Tasks

- [ ] Update vendor layout to separate "Pesanan Perlengkapan Event" and "Management Tiket" menus
- [ ] Create new ticket management page with 3 tabs: Dashboard Ticket, Scan Tiket, Kirim Undangan Tiket
- [ ] Implement Dashboard Ticket tab with summary table and detail views
- [ ] Implement Scan Tiket tab with QR scanning functionality
- [ ] Implement Kirim Undangan Tiket tab with form and password confirmation
- [ ] Update OrdersBaseContent to only show equipment orders
- [ ] Create new components for ticket management features
- [ ] Test all functionality

## Details

### Menu Separation

- Change "Pesanan" to "Pesanan Perlengkapan Event" linking to current orders page (equipment only)
- Add new "Management Tiket" menu linking to new ticket management page

### Dashboard Ticket Tab

- Summary table with columns: Nama Produk Tiket, Varian Tiket, Jumlah Tiket, Jumlah Terjual, Sisa Stok, Persentasi Terjual, Jumlah Terverifikasi, Harga Jual, Total Income Bersih
- Detail button for each product leading to detailed view
- Detailed view: Same summary + table of sold tickets with sorting/filtering by variant and status, export to Excel/PDF/CSV

### Scan Tiket Tab

- Button to scan ticket (open camera)
- Table of verification history (latest first) with verification time

### Kirim Undangan Tiket Tab

- Form to send tickets: select product, fill recipient details, quantity
- Password confirmation before sending
- Tickets marked as "bypass" payment status
- History table of sent tickets
