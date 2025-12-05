# Comprehensive Testing Guide - Ticket System

## Pre-Test Checklist

- [ ] Strapi backend running: `npm run develop`
- [ ] Frontend running or built: `npm run build`
- [ ] Database is clean or has test data
- [ ] At least 2 vendor accounts created for testing
- [ ] Browser console open (F12 - Console tab)
- [ ] Network tab open to check API calls

---

## Test Suite 1: Ticket Creation

### Test 1.1 - Create Simple Ticket

**Setup**: 
- Login as Vendor A (ID: 123)

**Steps**:
1. Navigate to: `/user/vendor/add-product`
2. Click "Tiket" tab
3. Fill form:
   - Nama Tiket: "Konser Musik 2024"
   - Deskripsi: "Konser musik terbesar tahun ini"
   - Gambar: Upload 1 image
   - Tanggal Acara: 2024-12-20
   - Waktu Acara: 19:00
   - Tanggal Selesai: 2024-12-21
   - Jam Selesai: 23:00
   - Kota Acara: Jakarta Pusat
   - Lokasi Acara: Stadium Utama
   - Variant: Add variant "VIP" with price Rp 500.000 and quota 100

4. Click "Simpan Tiket"

**Expected Results**:
- ✅ No errors in console
- ✅ Toast notification: "Sukses menambahkan tiket!"
- ✅ Redirect to `/user/vendor/products`
- ✅ New ticket appears in list with correct data

**Backend Logs Should Show**:
```
Creating ticket for user: 123
Ticket data: {
  title: "Konser Musik 2024",
  description: "...",
  event_date: "2024-12-20",
  waktu_event: "19:00",
  end_date: "2024-12-21",
  end_time: "23:00",
  kota_event: "Jakarta Pusat",
  lokasi_event: "Stadium Utama",
  variant: [{name: "VIP", price: 500000, quota: "100", ...}],
  main_image: [{id: "...", ...}]
}
Ticket created successfully: {documentId}
```

**Database Verification**:
```sql
SELECT * FROM tickets WHERE users_permissions_user = 123;
-- Should return 1 row with all fields populated
```

---

### Test 1.2 - Create Ticket with Multiple Variants

**Steps**:
1. Navigate to: `/user/vendor/add-product` → Tiket
2. Fill form same as Test 1.1
3. Add multiple variants:
   - Variant 1: "Reguler" - Rp 300.000, Quota 200
   - Variant 2: "VIP" - Rp 500.000, Quota 100
   - Variant 3: "VVIP" - Rp 1.000.000, Quota 50
4. Click "Simpan Tiket"

**Expected Results**:
- ✅ All variants saved correctly
- ✅ In product list, shows lowest price (Reguler - Rp 300.000)

**Browser Console**:
- Check Network tab → POST /api/tickets → Response should show all 3 variants

---

### Test 1.3 - Validation Tests

**Test 1.3a - Missing Required Fields**

**Steps**:
1. Navigate to: `/user/vendor/add-product` → Tiket
2. Only fill: Nama Tiket
3. Click "Simpan Tiket"

**Expected Results**:
- ✅ Warning box shows required fields
- ✅ Form NOT submitted
- ✅ No API call made

---

**Test 1.3b - Invalid Date (End before Start)**

**Steps**:
1. Navigate to: `/user/vendor/add-product` → Tiket
2. Fill all fields but:
   - Tanggal Acara: 2024-12-21
   - Tanggal Selesai: 2024-12-20 (BEFORE event date)
3. Click "Simpan Tiket"

**Expected Results**:
- ✅ Toast error: "Tanggal selesai tidak boleh lebih awal dari tanggal acara."
- ✅ Form NOT submitted

---

**Test 1.3c - Invalid Time Format**

**Steps**:
1. Navigate to: `/user/vendor/add-product` → Tiket
2. Fill all fields but:
   - Waktu Acara: "25:00" (invalid)
3. Click "Simpan Tiket"

**Expected Results**:
- ✅ Toast error: "Format waktu acara tidak valid. Gunakan format HH:MM"
- ✅ Form NOT submitted

---

## Test Suite 2: Ticket Editing

### Test 2.1 - Edit Existing Ticket

**Setup**:
- Login as Vendor A
- Have created at least 1 ticket from Test 1.1

**Steps**:
1. Navigate to: `/user/vendor/products`
2. Find the ticket created in Test 1.1
3. Click edit icon (pencil)
4. Should go to: `/user/vendor/products/edit/{ticket-id}?type=ticket`
5. Change:
   - Title: "Konser Musik 2024 - Updated"
   - Kota Acara: Jakarta Selatan
6. Click "Simpan Tiket"

**Expected Results**:
- ✅ Form loads existing data correctly
- ✅ Toast notification: "Sukses edit tiket!"
- ✅ Changes visible in product list
- ✅ users_permissions_user remains same (still Vendor A)

**Backend Logs Should Show**:
```
Updating ticket: {documentId} for user: 123
Ticket updated successfully: {documentId}
```

---

### Test 2.2 - Security Check - Cannot Edit Other Vendor's Ticket

**Setup**:
- Have 2 vendor accounts
- Vendor A created a ticket
- Logged in as Vendor B

**Steps**:
1. Vendor B tries to manually navigate to:
   `/user/vendor/products/edit/{vendor-a-ticket-id}?type=ticket`
2. Check backend response

**Expected Results**:
- ✅ Backend returns 403 Forbidden
- ✅ Frontend shows error: "Not authorized to update this ticket"
- ✅ Ticket NOT modified

---

## Test Suite 3: Ticket Deletion

### Test 3.1 - Delete Ticket

**Setup**:
- Login as Vendor A
- Have created multiple tickets

**Steps**:
1. Navigate to: `/user/vendor/products`
2. Click delete icon (trash) on a ticket
3. Confirm deletion

**Expected Results**:
- ✅ Ticket removed from list immediately
- ✅ Toast: "The product has been successfully deleted"
- ✅ Ticket deleted from database

---

### Test 3.2 - Security Check - Cannot Delete Other Vendor's Ticket

**Steps**:
1. Make DELETE API call to someone else's ticket:
   `DELETE /api/tickets/{other-vendor-ticket-id}`
   with Vendor B's JWT token

**Expected Results**:
- ✅ Backend returns 403 Forbidden
- ✅ Ticket NOT deleted
- ✅ Error message: "Not authorized to delete this ticket"

---

## Test Suite 4: Product Listing

### Test 4.1 - Mixed Product Listing

**Setup**:
- Vendor A has created:
  - 1 equipment product
  - 2 tickets

**Steps**:
1. Login as Vendor A
2. Navigate to: `/user/vendor/products`

**Expected Results**:
- ✅ Lists shows all 3 items (1 equipment + 2 tickets)
- ✅ Each item has correct type marker (__type field)
- ✅ Equipment items show 1 edit/delete option
- ✅ Ticket items show 1 edit/delete option
- ✅ Edit link includes correct type: `?type=equipment` or `?type=ticket`

---

### Test 4.2 - Equipment Products Unaffected

**Steps**:
1. Navigate to: `/user/vendor/products`
2. Click edit on an equipment product
3. Make changes
4. Save

**Expected Results**:
- ✅ Still uses `/api/products` endpoint
- ✅ No changes to equipment flow
- ✅ Equipment and tickets work independently

---

## Test Suite 5: Vendor Profile Update

### Test 5.1 - Simple Profile Update

**Setup**:
- Login as Vendor A

**Steps**:
1. Navigate to: `/user/vendor/profile`
2. Fill in profile information:
   - Name: "Vendor Test A"
   - Email: "vendor-a@test.com"
   - Phone: "082123456789"
   - Address: "Jl. Test No. 1"
3. Click "Simpan"

**Expected Results**:
- ✅ Toast: "Update profile berhasil!"
- ✅ Profile data saved to database
- ✅ Browser console shows:
  ```
  Submitting vendor profile with data: {...}
  Profile update response: {status: 200, data: {...}}
  ```

---

### Test 5.2 - Profile Update with Validation Error

**Steps**:
1. Navigate to: `/user/vendor/profile`
2. Fill:
   - Email: "invalid-email" (no @)
3. Form should show validation warning
4. Try to click "Simpan"

**Expected Results**:
- ✅ Form prevents submission
- ✅ Toast: "Validasi Gagal"

---

### Test 5.3 - Silent Failure Debug (if occurs)

**Steps**:
1. Navigate to: `/user/vendor/profile`
2. Fill required fields
3. Open Browser Console (F12)
4. Watch console while clicking "Simpan"

**Expected Results**:
- ✅ See log: "Submitting vendor profile with data: ..."
- ✅ See log: "Profile update response: ..."
- ✅ If error: See log: "Profile update error: ..."
- ✅ Toast notification shown

---

## Test Suite 6: Ticket Dashboard

### Test 6.1 - View Ticket Dashboard

**Setup**:
- Login as Vendor A
- Have created 2-3 tickets

**Steps**:
1. Navigate to: `/user/vendor/tickets`
2. Click "Dashboard Ticket" tab

**Expected Results**:
- ✅ Dashboard loads
- ✅ Shows list of all vendor's tickets
- ✅ Each ticket shows:
  - Title
  - Total sold
  - Revenue
  - Variants with stats
- ✅ No tickets from other vendors shown

**Backend Logs Should Show**:
```
GET /api/tickets/summary?filters[users_permissions_user]=123
Fetched X tickets for user 123
```

---

## Test Suite 7: Complete End-to-End Flow

### Test 7.1 - Full Ticket Lifecycle

**Steps**:
1. **CREATE**: Create new ticket as Vendor A
2. **VERIFY**: Check it appears in product list
3. **LIST**: Verify it shows in dashboard
4. **EDIT**: Edit the ticket details
5. **VERIFY**: Check changes saved
6. **VIEW DASHBOARD**: Verify updated data shows in dashboard
7. **DELETE**: Delete the ticket
8. **VERIFY**: Confirm removed from list

**Expected Results**:
- ✅ All steps complete without errors
- ✅ All notifications shown correctly
- ✅ No console errors
- ✅ Database reflects all changes

---

## Browser Console Debugging Commands

### Check Recent API Calls
```javascript
// Copy-paste in console to see all recent XHR calls
fetch('about:blank')
  .then(() => console.log('Check Network tab → Filter XHR'))
  .catch(() => {});
```

### Verify JWT Token
```javascript
// Check if JWT token is present and valid
const token = sessionStorage.getItem('jwt') || localStorage.getItem('jwt');
console.log('Token:', token);
console.log('Token expiry:', jwt_decode(token)?.exp);
```

### Check API Response
```javascript
// After making a ticket creation request, check response
// Network tab → tickets → Response tab
// Should see: { data: { id: "...", documentId: "...", title: "..." } }
```

---

## Common Test Issues & Solutions

| Issue | Solution |
|-------|----------|
| 500 error when creating ticket | Check Strapi logs for detailed error |
| "Tidak ada respons dari server" | Verify backend is running on correct port |
| Ticket created but not in list | Check filters, verify users_permissions_user is set |
| Profile update silent failure | Open console, check logs, look for API error |
| Cannot find ?type=ticket in URL | Check browser doesn't have old cached version |
| Edit form loads product instead of ticket | Verify query param is being passed correctly |

---

## Performance Testing

### Test P1 - Load Time
**Steps**:
1. Open DevTools Network tab
2. Navigate to `/user/vendor/products`
3. Check load time

**Target**: < 3 seconds for page load

---

### Test P2 - Create Ticket Performance
**Steps**:
1. Create ticket with large image (5MB)
2. Monitor upload time in Network tab

**Expected**: < 30 seconds total

---

## Security Testing

### Test S1 - JWT Token Validation
**Steps**:
1. Create ticket with valid JWT
2. Try to create ticket without JWT
3. Try to create ticket with expired JWT

**Expected Results**:
- ✅ Valid JWT: Success
- ✅ No JWT: 401 Unauthorized
- ✅ Expired JWT: 401 Unauthorized

---

### Test S2 - XSS Prevention
**Steps**:
1. Create ticket with title containing: `<script>alert('xss')</script>`
2. View ticket in dashboard

**Expected Results**:
- ✅ Title escaped/sanitized
- ✅ No script execution
- ✅ HTML displayed as text

---

## Sign-Off Checklist

- [ ] Test Suite 1 (Creation) - All passed
- [ ] Test Suite 2 (Editing) - All passed
- [ ] Test Suite 3 (Deletion) - All passed
- [ ] Test Suite 4 (Listing) - All passed
- [ ] Test Suite 5 (Profile) - All passed
- [ ] Test Suite 6 (Dashboard) - All passed
- [ ] Test Suite 7 (End-to-End) - All passed
- [ ] Browser Console - No errors
- [ ] Strapi Logs - No errors
- [ ] Database - Data correct
- [ ] Security - All validations passed
- [ ] Performance - Within targets

---

**Testing Date**: ________  
**Tester**: ________  
**Result**: ________ (PASS / FAIL)  
**Issues Found**: ________

---

## Next Steps After Testing

1. If all tests pass:
   - Deploy to staging
   - Deploy to production
   
2. If issues found:
   - Document issue
   - Fix root cause
   - Re-test affected areas

---

**Guide Version**: 1.0  
**Last Updated**: 2024
