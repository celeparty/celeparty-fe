# Session 9: Step-by-Step Testing Guide

## 🎯 Quick Start

**Estimated Time**: 15-20 minutes  
**Environment**: Local development or staging

### Prerequisites

- [ ] Frontend running (`npm run dev`)
- [ ] Backend (Strapi) running
- [ ] Vendor account created with at least 1 ticket product
- [ ] Browser console open (F12)

---

## Test Suite 1: Home Page Display

### Step 1.1: Verify Tickets on Home Page

```
1. Navigate to http://localhost:3000
2. Look for "Untuk Anda" section (should be below banner)
3. Check for product cards displaying
4. Look for any item with "Tiket Aktif" status badge
```

**Expected Result**:

- ✅ See mix of equipment (no badge) and tickets (yellow or green badge)
- ✅ Up to 5 items shown
- ✅ All items sorted by most recent first

**If Failed**:

```
Check browser console for errors:
- Look for network requests to /api/products and /api/tickets
- Verify both return 200 status
- Check response contains proper data structure
```

### Step 1.2: Verify URL Structure

```
1. Right-click on a product card → Inspect
2. Find the <a href="..."> tag
3. Regular products: /products/[documentId]
4. Tickets: /products/[documentId]?type=ticket
```

**Expected Result**:

- ✅ Ticket URLs have `?type=ticket` parameter
- ✅ Product URLs don't have type parameter

---

## Test Suite 2: Ticket Detail Page

### Step 2.1: Open Ticket Detail

```
1. On home page, click on any ticket card
2. Wait for page to load
3. Verify you land on /products/[slug]?type=ticket
```

**Expected Result**:

- ✅ Detail page loads with ticket information
- ✅ Title, description, variants visible
- ✅ No 404 error

**Console Check**:

```
Search console for:
"Query result:" or "Found product:"
These log statements indicate proper data fetching
```

### Step 2.2: Verify Detail Content

```
1. Check ticket title matches dashboard
2. Verify variant list shows (if ticket has variants)
3. Check price display
4. Look for any error messages
```

**Expected Result**:

- ✅ All data displays correctly
- ✅ Matches dashboard preview
- ✅ No console errors

---

## Test Suite 3: Vendor Dashboard

### Step 3.1: Login & Navigate to Products

```
1. Login as vendor
2. Click menu → Produk Saya (or navigate to /user/vendor/products)
3. Wait for products to load
```

**Expected Result**:

- ✅ See both equipment and tickets in list
- ✅ Tickets have status badge (green or yellow)
- ✅ Equipment don't have status badge

**Console Check**:

```
Look for:
"Fetching products and tickets..."
"Tickets Data:"
Verify ticket count > 0
```

### Step 3.2: Test Edit Button

```
1. Find a ticket product in the list
2. Hover over the card - should see Edit (pencil) icon
3. Click Edit button
```

**Expected Result**:

- ✅ Navigate to /user/vendor/products/edit/[slug]?type=ticket
- ✅ Form loads with ticket data
- ✅ All fields pre-populated (title, description, variants, etc.)

**If Form Empty**:

```
Check console for:
"useEffect triggered - isLoading: false, dataContent: ..."
"Processing dataContent:"
"Setting ticket form data:"

If missing, refresh and try again - React Query may need time to fetch
```

### Step 3.3: Edit and Save Ticket

```
1. On edit page, change any field (e.g., title, description)
2. Scroll down and click Save/Submit button
3. Wait for success notification
```

**Expected Result**:

- ✅ Success toast: "Berhasil di update"
- ✅ Form remains on edit page
- ✅ Changes reflected when you go back to dashboard

---

## Test Suite 4: Vendor Profile

### Step 4.1: Navigate to Profile

```
1. Login as vendor
2. Click menu → Profil (or navigate to /user/vendor/profile)
3. Wait for profile form to load
```

**Expected Result**:

- ✅ Form loads with current vendor data
- ✅ All fields populated (name, email, phone, etc.)
- ✅ No "Profil Vendor" title visible if form still loading

### Step 4.2: Make Profile Changes

```
1. Find any editable field (e.g., Phone)
2. Clear and enter new value
3. Scroll down to Save button
4. Click Submit/Save
```

**Expected Result**:

- ✅ Green success toast: "Update profile berhasil!"
- ✅ Toast disappears after 3 seconds
- ✅ No error messages

**Console Check**:

```
Look for:
"Submitting vendor profile with data: {...}"
"User ID to update: [ID]"
"Profile update response: {...}"
```

### Step 4.3: Verify Changes Persisted

```
1. Refresh the page (F5)
2. Wait for profile to reload
3. Check if your changes are still there
```

**Expected Result**:

- ✅ Form reloads with your updated values
- ✅ Changes persisted to database

**If Not Saved**:

```
Check error in console:
"Error response:"
Look for Strapi error message about validation or permissions
```

---

## Test Suite 5: Ticket Management Variants

### Step 5.1: Navigate to Ticket Management

```
1. Login as vendor
2. Go to menu → Management Tiket (or /user/vendor/tickets)
3. Click tab "Kirim Undangan Tiket"
4. Wait for page to load
```

**Expected Result**:

- ✅ Form loads with "Pilih Produk Tiket" dropdown
- ✅ Loading skeleton appears briefly
- ✅ "Tidak ada produk tiket" OR list of products

**Console Check**:

```
Look for:
"Vendor Tickets Response:"
"Vendor Tickets Raw Data:"
"First ticket structure:"
"Returning [X] tickets"
```

### Step 5.2: Select Product and Verify Variants

```
1. Click "Pilih Produk Tiket" dropdown
2. Select a ticket product
3. Wait for variant dropdown to enable
4. Click "Pilih Varian Tiket" dropdown
```

**Expected Result**:

- ✅ Variant dropdown shows options
- ✅ Each variant shows: [Name] - Rp [Price]
- ✅ At least 1 variant available

**If No Variants**:

```
Check console for "Computing variants..." logs:
- "Looking for product with ID: [ID]"
- "Found product:" - Check if variant array exists
- "Product variants to display:" - Check if empty array

If empty, the ticket may not have variants defined in Strapi
```

### Step 5.3: Continue with Ticket Send

```
1. Keep variant selected
2. Enter Jumlah Tiket (e.g., 1)
3. Fill recipient information
4. Click Send button
```

**Expected Result**:

- ✅ Form validates and accepts submission
- ✅ Password modal appears
- ✅ After submission, history updates

---

## 🐛 Troubleshooting

### Common Issue #1: Tickets Not Appearing

**Symptoms**:

- "Tidak ada produk tiket" on all pages
- Home page only shows equipment

**Debugging**:

```bash
# Check Strapi tickets table
# In Strapi admin, go to Tickets
# Verify:
1. Tickets exist in database
2. publishedAt is NOT NULL (for home page)
3. Users match current vendor
```

**Fix**:

```
1. Create test ticket in Strapi
2. Make sure publishedAt is set to current date
3. Verify owner is current vendor
4. Refresh frontend and try again
```

### Common Issue #2: Variants Empty After Product Select

**Symptoms**:

- Select ticket product but no variants show
- "Tidak ada varian untuk produk ini" message

**Debugging**:

```javascript
// In browser console, run:
console.log("Check Redux/Zustand state:");
// Then look at network tab:
// GET /api/tickets?populate=*
// Inspect response: Look for variant array in ticket object
```

**Fix**:

```
1. In Strapi, edit the ticket product
2. Make sure variants are added to ticket
3. Save ticket
4. Refresh frontend
```

### Common Issue #3: Profile Won't Save

**Symptoms**:

- Click Save but nothing happens
- No success/error toast

**Debugging**:

```javascript
// Check console for:
// "Submitting vendor profile with data:"
// "Profile update response:"
// "Profile update error:"
```

**Fix**:

```
1. Check validation errors (look for red text on form)
2. Verify JWT token is valid (check localStorage for auth)
3. Check Strapi server is running
4. Look for CORS errors in console
```

---

## ✅ Final Verification Checklist

After all tests pass, verify:

- [ ] Home page shows mix of products and tickets
- [ ] Can click ticket cards and view details
- [ ] Can edit ticket from dashboard
- [ ] Can save vendor profile changes
- [ ] Ticket variants display in management page
- [ ] No console errors or warnings (except pre-existing ones)
- [ ] Build completes with no errors (`npm run build`)
- [ ] No broken links or 404s

---

## 📊 Test Results Template

Copy and fill after testing:

```
# Test Results - Session 9

Date: ___________
Tester: ___________
Environment: ___________

## Home Page
- [ ] Tickets appear: YES / NO / PARTIAL
- [ ] Status badges show: YES / NO
- [ ] Issue: ___________

## Detail Page
- [ ] Can click tickets: YES / NO
- [ ] Detail loads: YES / NO
- [ ] Issue: ___________

## Vendor Dashboard
- [ ] Edit button visible: YES / NO
- [ ] Form pre-populates: YES / NO
- [ ] Can save changes: YES / NO
- [ ] Issue: ___________

## Profile Save
- [ ] Can edit profile: YES / NO
- [ ] Changes persist: YES / NO
- [ ] Success message shows: YES / NO
- [ ] Issue: ___________

## Variants Loading
- [ ] Dropdown shows products: YES / NO
- [ ] Variants appear after select: YES / NO
- [ ] Can submit form: YES / NO
- [ ] Issue: ___________

## Overall Status
[ ] PASS - Ready for production
[ ] FAIL - Issues found
[ ] PARTIAL - Some issues remain

Notes: ___________
```

---

## 🚀 Deployment Checklist

Before merging to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] Performance is acceptable (< 2s load time)
- [ ] Database backups taken
- [ ] Strapi running and responsive
- [ ] Environment variables correct
- [ ] Git commit message clear and descriptive
