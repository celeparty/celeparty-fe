# Quick Test Guide - Session 8 Changes

## Prerequisites
- Strapi backend running: `npm run develop`
- Frontend dev: `npm run dev` or build for testing

---

## Test 1: Create New Ticket (Backend Status Check)

**Steps**:
1. Log in as vendor
2. Go to `/user/vendor/products` 
3. Click "Tambah Produk" → Fill ticket form → Submit
4. Check Strapi admin panel → Tickets collection
5. Find your newly created ticket

**Expected Result**:
- ✅ Ticket appears in Strapi with **Draft** status (not published)
- ✅ Ticket shows `publishedAt: null` in database
- ✅ Frontend shows ticket with **yellow badge** "Menunggu Persetujuan"

**If Issue**: Check backend controller logs:
```bash
# Terminal where Strapi is running
# Look for: "Creating ticket for user: [ID]"
# Look for: "Ticket created successfully: [ID]"
```

---

## Test 2: Edit Ticket - Form Pre-population

**Steps**:
1. From ticket dashboard, click **Edit** on any ticket
2. Observe form loading
3. Check if all fields have data:
   - Title ✓
   - Description ✓
   - Event Date ✓
   - Event Time ✓
   - End Date ✓
   - End Time ✓
   - City ✓
   - Location ✓
   - Images ✓
   - Variants ✓

**Expected Result**:
- ✅ Loading state appears briefly
- ✅ All fields pre-populate with existing data
- ✅ Images show with preview
- ✅ Dates formatted correctly (DD/MM/YYYY)

**If Issue - Check browser console**:
```javascript
// Should see:
// "Fetching from endpoint: /api/tickets/[slug]?populate=*"
// "Query result: {data: {...}}"
// "Processing dataContent: {...}"
// "Setting ticket form data: {...}"
```

---

## Test 3: Edit and Save Ticket

**Steps**:
1. While in edit mode, change **Title** and **Description**
2. Click **Save**
3. Go back to dashboard
4. Open ticket again

**Expected Result**:
- ✅ Changes saved successfully
- ✅ Toast notification: "Tiket berhasil diperbarui"
- ✅ Re-opening ticket shows new data
- ✅ Status badge remains the same (yellow/green)

---

## Test 4: Dashboard Status Badges

**Steps**:
1. Go to `/user/vendor/products`
2. Observe all ticket cards
3. Look for colored badges on tickets

**Expected Result**:
```
Unpublished Ticket:
┌─────────────────┐
│  [Image]        │
│  [🟡 Menunggu]  │ ← Yellow badge, top-right
│  Tiket Name     │
│  Rp 100.000     │
└─────────────────┘

Published Ticket:
┌─────────────────┐
│  [Image]        │
│  [🟢 Tiket Aktif]│ ← Green badge, top-right
│  Tiket Name     │
│  Rp 100.000     │
└─────────────────┘
```

- ✅ Both published and unpublished tickets visible
- ✅ Correct color badges
- ✅ Equipment products have NO badge

---

## Test 5: Admin Publishing (Strapi)

**Steps**:
1. Go to Strapi Admin Panel (`http://localhost:1337`)
2. Navigate to Tickets collection
3. Click on a ticket with status "Draft"
4. Click **Publish** button
5. Go back to vendor dashboard in frontend

**Expected Result**:
- ✅ Ticket published in Strapi
- ✅ Frontend badge changes from yellow to green
- ✅ Ticket shows "Tiket Aktif"

---

## Test 6: Products Query Filter

**Steps**:
1. Check Network tab in browser DevTools
2. Go to `/user/vendor/products`
3. Look at API requests

**Expected Result**:
```
API Calls should show:

1. GET /api/products?...&filters[publishedAt][$notnull]=true
   → Returns only PUBLISHED equipment products

2. GET /api/tickets?...&filters[users_permissions_user][documentId]={userId}
   → Returns ALL tickets (published + unpublished)
```

---

## Test 7: Delete Ticket

**Steps**:
1. On ticket card, click trash icon
2. Confirm deletion
3. Refresh page

**Expected Result**:
- ✅ Ticket removed from dashboard
- ✅ Toast: "Produk berhasil dihapus"
- ✅ Deleted from database

---

## Debugging Commands

### Backend Logs
```bash
# In Strapi terminal, search for:
"Creating ticket for user:"
"Ticket created successfully:"
"Updating ticket:"
"Ticket updated successfully:"

# Check publishedAt field:
# Should be null for unpublished tickets
```

### Frontend Console
```javascript
// Before creating ticket:
console.log("Submitting ticket data...");

// After submitting:
console.log("Ticket Response:", response);

// When loading edit form:
console.log("Fetching from endpoint:", endpoint);
console.log("Query result:", result);
console.log("Setting ticket form data:", ticketFormData);
```

### Browser DevTools Network Tab
```
Filter: /api/tickets
Look for:
- POST (create) → 201 Created
- PUT (update) → 200 OK
- GET (fetch) → 200 OK
- DELETE → 204 No Content
```

---

## Common Issues & Fixes

### Issue: Form fields empty after loading
**Solution**:
1. Check browser console for errors
2. Verify API returns data: `GET /api/tickets/{slug}?populate=*`
3. Check if `isDataLoaded` state is being set to true
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Status badge not showing
**Solution**:
1. Verify ticket has `__status` property set
2. Check ItemProduct receives `status` prop
3. Inspect element to see if badge HTML exists
4. Check if `publishedAt` field exists in data

### Issue: Edit button doesn't load
**Solution**:
1. Check `type=ticket` query parameter in URL
2. Verify productType matches 'ticket'
3. Check network tab for 404 errors
4. Verify documentId is correct

### Issue: Can't save edited ticket
**Solution**:
1. Check authorization headers (Bearer token)
2. Verify user owns the ticket
3. Check backend logs for forbidden errors
4. Verify `users_permissions_user` matches current user

---

## Success Criteria

All tests passed if:

- ✅ New tickets start with unpublished status
- ✅ Edit form loads all data correctly
- ✅ Save/update works
- ✅ Dashboard shows both published/unpublished
- ✅ Status badges display correctly
- ✅ Admin can publish via Strapi
- ✅ Published tickets show green badge
- ✅ Unpublished tickets show yellow badge
- ✅ Delete functionality works
- ✅ No console errors

---

## Notes

- **Timestamps**: Dates stored in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Frontend Display**: Formatted as DD/MM/YYYY for user
- **Status Source**: Based on `publishedAt` field
  - `null` = unpublished (yellow)
  - Has value = published (green)
- **Admin Control**: Only admin can change publish status via Strapi
- **Vendor Control**: Vendor can create, edit, delete their own tickets

---

## Next Step

Once all tests pass:
1. Document any issues found
2. Push to staging environment
3. Run production deployment
4. Monitor logs for errors
