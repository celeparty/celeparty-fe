# Ticket Product Visibility Fix - Quick Testing Guide

## 🚀 Quick Start

### Prerequisites
```bash
# Terminal 1: Start Strapi backend
cd d:\laragon\www\celeparty-strapi
npm run develop

# Terminal 2: Start Next.js frontend
cd d:\laragon\www\celeparty-fe
npm run dev
```

## ✅ Test Scenarios

### Test 1: Ticket Appears on Home Page
```
1. Open Strapi Admin: http://localhost:1337/admin
2. Navigate to: Content Manager → Tickets (or Content → Tickets)
3. Create new ticket or edit existing one
4. Set these fields:
   - title: "Test Ticket - [date]"
   - publishedAt: Today's date (this makes it visible)
5. Save
6. Open Frontend: http://localhost:3000
7. ✅ EXPECTED: Ticket appears in product carousel/grid on home page
```

### Test 2: Ticket Appears on Products Listing Page
```
1. After Test 1 (ticket is published)
2. Navigate to: http://localhost:3000/products
3. ✅ EXPECTED: Ticket appears mixed with equipment products
4. Scroll and see multiple products/tickets mixed
```

### Test 3: Ticket Detail Page Works
```
1. From products page, click on a ticket product
2. ✅ EXPECTED: URL should be /products/[slug]?type=ticket
3. ✅ EXPECTED: Page loads with ticket details (event date, location, etc.)
4. ✅ EXPECTED: All ticket-specific fields are visible (event_date, kota_event, waktu_event)
```

### Test 4: Edit Ticket Without Type Parameter
```
1. From ticket detail page, click "Edit" button (if vendor)
2. ✅ EXPECTED: URL is /user/vendor/products/edit/[slug]?type=ticket
3. ✅ EXPECTED: TicketForm loads (not ProductForm)
4. ✅ EXPECTED: All fields pre-populated with ticket data
5. Make a change (e.g., update title) and save
6. ✅ EXPECTED: Save successful, no errors
```

### Test 5: Ticket Edit with Fallback (Manual URL)
```
1. Manually type URL: http://localhost:3000/user/vendor/products/edit/[ticket-slug]
   (copy a ticket documentId from Strapi, remove the ?type=ticket part)
2. ✅ EXPECTED: TicketForm still loads (fallback logic worked)
3. ✅ EXPECTED: Form pre-populated correctly
4. Check browser console: should see "Ticket fallback result" log message
```

### Test 6: Equipment Product Still Works
```
1. Navigate to: http://localhost:3000/products
2. Click on an equipment product (not ticket)
3. ✅ EXPECTED: URL is /products/[slug] (no ?type parameter)
4. ✅ EXPECTED: Equipment-specific fields shown (location, category, price variants)
5. Click Edit (if vendor)
6. ✅ EXPECTED: ProductForm loads (not TicketForm)
7. ✅ EXPECTED: All equipment fields pre-populated
```

### Test 7: Add Ticket to Cart
```
1. Open ticket detail page
2. Select options if applicable (variants, quantity)
3. Click "Add to Cart"
4. Open cart: http://localhost:3000/cart
5. ✅ EXPECTED: Ticket appears in cart with all ticket fields
6. Open browser DevTools → Application → Local Storage
7. Find cart data (look for product_type field)
8. ✅ EXPECTED: product_type value is "ticket" (not "product")
```

### Test 8: Ticket Purchase Flow
```
1. Add ticket to cart (Test 7)
2. Go to cart page
3. Click "Proceed to Checkout"
4. ✅ EXPECTED: Checkout page displays ticket items correctly
5. Select payment method
6. Click "Pay Now"
7. ✅ EXPECTED: Transaction processes without errors
8. Check Strapi: order should show ticket with product_type: "ticket"
```

## 🔍 Debugging Tips

### Check Console Logs
Open browser DevTools (F12) → Console tab to see:
```
✅ Good signs:
- "Fetching from endpoint: /api/tickets/[slug]?populate=*"
- "Query result: {...ticket data...}"
- "Setting ticket form data: {...}"
- "Ticket fallback result: {...}"

❌ Bad signs:
- "Query result: undefined"
- "Both product and ticket fetch failed"
- "[object Object]" (serialization errors)
```

### Check Network Requests
DevTools → Network tab:
```
✅ Should see:
- GET /api/tickets?populate=*... (status 200)
- GET /products?... → shows tickets in response
- GET /api/tickets/[slug]?populate=* (for edit page)

❌ Should NOT see:
- Failed requests to tickets endpoint (status 404/500)
```

### Check Strapi Data
1. Strapi Admin: http://localhost:1337/admin
2. Content Manager → Tickets
3. Click on a ticket to verify:
   - ✅ publishedAt field is set (shows as blue published status)
   - ✅ event_date is set
   - ✅ kota_event is set
   - ✅ main_image has image

## 🐛 Common Issues & Fixes

### Issue: Tickets Don't Appear on Home/Products Page
**Cause**: `publishedAt` not set in Strapi
**Fix**: 
1. Go to Strapi Admin → Tickets
2. Edit ticket
3. Ensure "Publish" button is clicked (or set publishedAt manually)
4. Save
5. Wait 5 seconds, refresh frontend

### Issue: Edit Page Shows Error
**Cause**: URL missing `?type=ticket` parameter
**Fix**: 
1. Check ticket detail URL has `?type=ticket`
2. If manually navigating, add `?type=ticket` to edit URL
3. Check browser console for detailed error message

### Issue: Wrong Form Appears (ProductForm for Ticket)
**Cause**: Type detection not working
**Fix**:
1. Verify ticket has `event_date` or `kota_event` fields filled in Strapi
2. Check console for "Ticket fallback result" message
3. Manually add `?type=ticket` to edit URL

### Issue: Cart Shows Wrong Product Type
**Cause**: Sidebar not setting product_type correctly
**Fix**:
1. Verify `app/products/[slug]/SideBar.tsx` has `product_type: "ticket"` logic
2. Check cart local storage in DevTools
3. Clear local storage and try again

## 📊 Quick Status Check

Run this in browser console while on any product/ticket page:
```javascript
// Check local storage cart structure
JSON.parse(localStorage.getItem('cart_items'))?.forEach(item => {
  console.log('Item:', item.product_name, 'Type:', item.product_type);
});

// Should output:
// Item: Ticket Name Type: ticket
// Item: Equipment Name Type: equipment
```

## ✅ Success Criteria

All of these should be true for successful implementation:

- [ ] Tickets with `publishedAt` appear on home page
- [ ] Tickets appear on `/products` listing page mixed with equipment
- [ ] Clicking ticket opens detail page with `?type=ticket` URL parameter
- [ ] Edit button from ticket detail opens TicketForm (not ProductForm)
- [ ] Edit page works without manual `?type=ticket` parameter (fallback)
- [ ] Equipment products still work normally
- [ ] Adding ticket to cart sets `product_type: "ticket"`
- [ ] Checkout process works for tickets
- [ ] No console errors during the flow
- [ ] All fields pre-populated correctly in edit form

## 📞 Support

If tests fail:
1. Check browser console for errors
2. Check Strapi backend is running (should show in terminal)
3. Check ticket has `publishedAt` field set
4. Verify ticket has `event_date` and `kota_event` filled
5. Clear browser cache: Ctrl+Shift+Delete → Clear All

---
**Last Updated**: After ticket visibility system overhaul
**Status**: Ready for QA Testing
