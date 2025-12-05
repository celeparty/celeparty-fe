# Debugging Guide: Ticket Approval Not Showing in Frontend

**Created**: December 5, 2025  
**Issue**: After admin approves ticket in Strapi, it still shows "Menunggu Persetujuan" (unpublished) in vendor dashboard

---

## Symptoms

1. ✗ Ticket approved in Strapi (Publish button clicked)
2. ✗ Vendor dashboard still shows yellow badge "Menunggu Persetujuan"
3. ✗ Ticket may not appear in products list
4. ✗ Edit page may not open properly

---

## Root Cause Analysis

### What Should Happen
```
Admin clicks Publish in Strapi
    ↓
Backend sets: ticket.publishedAt = [current timestamp]
    ↓
Frontend GET /api/tickets returns: { publishedAt: "2025-12-05T10:30:00Z" }
    ↓
Frontend: ticket.__status = 'published' (because publishedAt is not null)
    ↓
Dashboard: Shows green badge "Tiket Aktif"
```

### What Might Be Happening
```
1. publishedAt is set, but frontend doesn't refetch
   → Solution: Added auto-refresh (10 second interval)
   
2. publishedAt is null even after Strapi publish
   → Check: Strapi publish toggle/button working?
   
3. Frontend receives old cached data
   → Solution: React Query cache invalidation + refetch
   
4. Query filter invalid for approved tickets
   → Check: Strapi API call format
```

---

## Step-by-Step Debugging

### Step 1: Verify Ticket in Strapi

1. Open Strapi admin: `http://localhost:1337/admin`
2. Go to Tickets collection
3. Find your test ticket
4. Check the **PublishedAt** field:
   - ❌ If empty/blank → Ticket NOT published
   - ✅ If has date/time → Ticket IS published

**If field is empty**:
- Click the ticket
- Look for **"Publish"** button (green button)
- Click it
- Should see "Published successfully"

### Step 2: Verify Backend API Response

Open browser DevTools (F12) → Network tab

1. Go to vendor dashboard: `/user/vendor/products`
2. Open Network tab and filter: `tickets`
3. Look for: `GET /api/tickets?...`
4. Click it → Response tab
5. Check returned data:

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "xxx...",
      "title": "My Ticket",
      "publishedAt": "2025-12-05T10:30:00.000Z",  // ← Check this field
      "createdAt": "...",
      "users_permissions_user": 123
    }
  ]
}
```

**Expected**:
- ✅ `publishedAt` should have timestamp (not null)
- ✅ `documentId` present
- ✅ `users_permissions_user` present

### Step 3: Check Frontend Data Processing

Open browser console (F12) → Console tab

1. Refresh page `/user/vendor/products`
2. Look for logs starting with "Fetching products"
3. Check: "Setting ticket form data"

**What to look for**:

```javascript
// Good log output:
"Fetched data: 2 items"
"Fetching from endpoint: /api/tickets/abc123?populate=*"
"Query result: {data: {..., publishedAt: '2025-12-05...'}}"

// Bad log output:
"Fetched data: 0 items"
"Query result: undefined"
"Error fetching data..."
```

### Step 4: Manual Refresh Test

1. After admin approves ticket in Strapi
2. Go to vendor dashboard
3. **DO NOT REFRESH PAGE**
4. Wait 10 seconds (auto-refresh interval)
5. Check if badge changed to green

**If it works**: Auto-refresh is working ✅

**If not**:
1. Click blue "Segarkan" button (refresh button)
2. Wait 2 seconds
3. Check if data updated

**If it still doesn't work**: Issue is in query or backend

---

## Common Issues & Solutions

### Issue 1: publishedAt is null in Strapi

**Symptoms**:
- Ticket doesn't have a date in publishedAt field in Strapi
- Publish button might be grey/disabled

**Solution**:
1. Check user role has publish permission
2. Or try: Save ticket → Publish from content manager
3. Check Strapi logs for errors

### Issue 2: Badge not changing after manual refresh

**Symptoms**:
- Badge still yellow after clicking refresh button
- API call returns but data doesn't update

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear cache: `Ctrl+Shift+Delete`
3. Check if API endpoint is correct in code

### Issue 3: Edit page won't open

**Symptoms**:
- Click edit button → Page loads
- Form shows "Loading data..." but never loads
- Or shows error "Ticket not found"

**Solution**:
1. Check URL: Should be `/user/vendor/products/edit/{documentId}?type=ticket`
2. Verify `documentId` is correct (not id field)
3. Check if ticket belongs to current user
4. Check Strapi logs for 403 or 404 errors

### Issue 4: Approved tickets don't show in list

**Symptoms**:
- Create ticket → shows with yellow badge
- Admin approves
- Ticket disappears from list

**Solution**:
1. Check if accidentally removed status filters
2. Verify query is fetching ALL tickets (not just published)
3. Check backend logs for query errors
4. Verify documentId is unique and correct

---

## Testing Checklist

Execute in order:

```
[ ] 1. Create new ticket in vendor dashboard
   → Verify: Shows with yellow badge "Menunggu Persetujuan"

[ ] 2. Go to Strapi and publish the ticket
   → Click ticket → Click "Publish" → Confirm

[ ] 3. Back to vendor dashboard (without refresh)
   → Wait 10 seconds
   → Check: Badge turns green "Tiket Aktif"?

[ ] 4. If not automatic, click "Segarkan" button
   → Check: Data refreshes and badge changes?

[ ] 5. Edit the ticket
   → Click edit icon on ticket card
   → Verify: Form loads data (not empty)

[ ] 6. Delete the ticket
   → Click trash icon
   → Confirm deletion
   → Verify: Removed from list after refresh

[ ] 7. Create another ticket, approve, and verify on public site
   → Go to products page: /products
   → Search for your ticket
   → Check: Only approved tickets show
```

---

## Browser Console Commands

Run these in browser console (F12 → Console) for manual testing:

```javascript
// Check current data in React Query cache
const queryClient = new QueryClient();
console.log(queryClient.getQueryData(['vendorProducts', userId]));

// Force refetch manually (if console has access)
// refetch();  // Requires component context

// Check localStorage for JWT token
console.log(localStorage.getItem('auth_token'));

// Check if Strapi is reachable
fetch('http://localhost:1337/api/tickets').then(r => r.json()).then(console.log);
```

---

## Strapi Admin Check

1. Open: `http://localhost:1337/admin`
2. Login with admin credentials
3. Go to: Content Manager → Tickets
4. Find your test ticket
5. Verify all fields:

| Field | Expected | Actual |
|-------|----------|--------|
| Title | Your ticket name | _____ |
| Published | Has date (green) | _____ |
| PublishedAt | Shows timestamp | _____ |
| Vendor | Shows user ID | _____ |

---

## Network API Call Format

**Expected API calls** (check Network tab in DevTools):

```
GET /api/tickets?populate=*&filters[users_permissions_user][documentId]=USER_ID
Response:
{
  "data": [
    { "publishedAt": "2025-12-05T...", ... }  // Approved
    { "publishedAt": null, ... }              // Unapproved
  ]
}

GET /api/tickets/TICKET_ID?populate=*
Response:
{
  "data": {
    "id": 1,
    "documentId": "...",
    "publishedAt": "2025-12-05T..." or null,
    ...
  }
}
```

---

## Logs to Check

### Frontend Logs (Browser Console)
```
✓ "Fetching products and tickets..."
✓ "Fetched data: X items"
✓ No errors in red
```

### Backend Logs (Strapi Terminal)
```
✓ "Ticket created successfully"
✓ No 403/404 errors
✓ Database queries successful
```

---

## Quick Checklist for Each Problem

### ✗ Badge not updating
- [ ] Wait 10 seconds (auto-refresh)
- [ ] Click "Segarkan" button
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check Strapi: publishedAt has value?

### ✗ Edit page blank
- [ ] Check URL has `?type=ticket`
- [ ] Check Network tab: API returns data?
- [ ] Check console: Any errors?
- [ ] Check backend logs

### ✗ Ticket missing from list
- [ ] Check it's really approved in Strapi
- [ ] Click refresh button
- [ ] Hard refresh browser
- [ ] Check if documentId correct

---

## Advanced Debugging

### Check React Query Internals

1. Install React Query DevTools (browser extension)
2. Open DevTools
3. Check "vendorProducts" query:
   - Status: Loading/Success/Error?
   - Data: Shows tickets?
   - Last updated: When?

### Check Strapi Database

If still not working, check database directly:

**SQLite**:
```sql
SELECT id, documentId, title, published_at FROM tickets WHERE users_permissions_user = YOUR_USER_ID;
```

**PostgreSQL**:
```sql
SELECT id, "documentId", title, "publishedAt" FROM tickets WHERE users_permissions_user_id = YOUR_USER_ID;
```

Should see: `published_at` has timestamp for approved, NULL for pending

---

## Solution Summary

### If Badge Not Updating
1. ✅ Auto-refresh every 10 seconds (new feature)
2. ✅ Manual "Segarkan" button added
3. ✅ React Query cache properly configured
4. ✅ Publish status should now sync within 10 seconds max

### If Edit Page Won't Open
1. ✅ Ensure documentId is correct (not id)
2. ✅ Ensure user owns ticket
3. ✅ Check backend logs for permission errors

### If Tickets Missing from List
1. ✅ Query fetches ALL tickets (both published & unpublished)
2. ✅ No filter removes approved tickets
3. ✅ All approved tickets should show with green badge

---

## Next Steps

1. **Test the new auto-refresh feature**
   - Go to dashboard
   - Approve ticket in Strapi
   - Wait 10 seconds
   - Badge should update automatically

2. **If still having issues**:
   - Run debugging steps above
   - Report console errors
   - Check Strapi logs
   - Verify API responses

3. **If everything works**:
   - Great! Feature is working
   - Test edge cases (multiple tickets, rapid changes, etc.)

---

**Last Updated**: December 5, 2025
