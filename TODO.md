# TODO: Implement Individual Ticket Recipients System

## Strapi Backend Changes

### 1. Create new `ticket-detail` content type

- [x] Create `../celeparty-strapi/src/api/ticket-detail/` directory structure
- [x] Create schema.json with fields: recipient_name, recipient_email, barcode, status, relation to transaction-ticket
- [x] Create lifecycles.js for ticket-detail
- [x] Create routes, controllers, services files

### 2. Modify `transaction-ticket` schema

- [x] Add one-to-many relation to `ticket-detail` in schema.json
- [x] Update types if needed

### 3. Update lifecycles for individual ticket generation

- [x] Modify lifecycles.js to generate individual ticket-detail records when quantity > 1
- [x] Generate unique barcodes for each ticket-detail
- [x] Update PDF generation to create individual PDFs with unique QR codes

### 4. Update email notifications

- [x] Modify email sending to send individual ticket PDFs instead of bulk

### 5. Update lifecycles to use recipient data

- [ ] Modify transaction-ticket lifecycles.js to use recipient data when creating ticket-details instead of default customer data

## Frontend Changes

### 6. Update cart to collect recipient details

- [ ] Modify `app/cart/dataContent.tsx` to use cart store for recipients instead of local state
- [ ] Update checkoutTicket function to send recipient data to backend

### 7. Update QR verification page

- [ ] Modify `app/qr/page.tsx` to check individual ticket-detail records by barcode
- [ ] Update verification logic to work with ticket-detail barcodes

### 8. Update transaction tables

- [ ] Modify `components/profile/UserTicketTransactionTable.tsx` to display individual ticket details
- [ ] Show recipient information and individual ticket status

## Testing & Compatibility

### 9. Ensure backward compatibility

- [ ] Test existing single-quantity tickets still work
- [ ] Ensure bulk tickets (quantity=1) don't create ticket-detail records

### 10. End-to-end testing

- [ ] Test complete flow: purchase with multiple recipients → payment → email → verification
- [ ] Test QR scanning for individual tickets
- [ ] Test vendor verification of individual tickets
