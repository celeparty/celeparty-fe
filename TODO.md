# Ticket Product Transaction Process Fix

## Issues Identified

- Ticket products with "approved" status are not showing on product pages, homepage, or edit pages
- ProductList component filters tickets by `publishedAt` instead of `state=approved`
- ProductContent.tsx only fetches from `/api/products` endpoint, missing tickets
- Transaction process doesn't properly categorize tickets from Ticket Product table

## Tasks to Complete

### 1. Fix ProductList Component (Homepage)

- [ ] Change ticket filter from `filters[publishedAt][$notnull]=true` to `filters[state][$eq]=approved`

### 2. Fix ProductContent.tsx (Full Product Listing)

- [ ] Modify to fetch both products and tickets in parallel
- [ ] Merge and sort results by updatedAt
- [ ] Handle filtering and pagination for both types

### 3. Fix Product Detail Page

- [ ] Update to detect product type from URL parameters or data structure
- [ ] Ensure proper routing for ticket products

### 4. Fix Product Edit Page

- [ ] Ensure proper type detection and form rendering
- [ ] Handle both product and ticket editing

### 5. Update Transaction/Cart Logic

- [ ] Ensure tickets are properly added to cart
- [ ] Update transaction processing for ticket products
- [ ] Fix checkout process for tickets

### 6. Testing

- [ ] Test ticket visibility on homepage
- [ ] Test ticket visibility on product listing page
- [ ] Test ticket detail pages
- [ ] Test ticket editing
- [ ] Test ticket transactions
