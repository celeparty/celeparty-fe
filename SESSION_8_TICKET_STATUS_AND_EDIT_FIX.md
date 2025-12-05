# Session 8: Ticket Status & Edit Form Fix

## Date
December 5, 2025

## Issues Resolved

### 1. Edit Ticket Form - Data Not Pre-populating
**Problem**: When editing an existing ticket, all form fields were empty even though data was being fetched.

**Root Cause**: 
- Component was initializing with empty state `{} as iTicketFormReq`
- No loading state handling, so form rendered before data was available
- Missing data checks in the useEffect dependencies

**Solution**:
- Added proper loading state management with `isDataLoaded` flag
- Enhanced query with `enabled: !!props.slug` to ensure it only runs when slug exists
- Added loading/error/empty states UI
- Fixed dependency array to include `query.isLoading`
- Added detailed console logging for debugging
- Proper null/undefined checks with fallback values

**Files Modified**:
- `app/user/vendor/products/edit/[slug]/ContentProductEdit.tsx`

### 2. Ticket Initial Status - Should Start as Unpublished
**Problem**: Tickets created by vendor should start as unpublished, waiting for admin approval via Strapi.

**Root Cause**: Backend `create()` method wasn't setting `publishedAt` to null initially.

**Solution**:
- Modified backend `create()` method to explicitly set `data.publishedAt = null`
- Admin can then publish tickets through Strapi interface
- This ensures only admin-approved tickets are "live"

**Files Modified**:
- `src/api/ticket/controllers/ticket.js`

### 3. Ticket Product Not Visible in Dashboard
**Problem**: Published tickets weren't showing in vendor dashboard, and unpublished tickets weren't visible at all.

**Root Cause**: Query was filtered to only show published products, which didn't include unpublished tickets.

**Solution**:
- Modified products page query to fetch all vendor tickets (both published and unpublished)
- Products still fetched only published items
- Added status tracking to each item: `__status: ticket.publishedAt ? 'published' : 'unpublished'`

**Files Modified**:
- `app/user/vendor/products/page.tsx`

### 4. No Status Indicator for Ticket Products
**Problem**: Vendor couldn't see whether their tickets were approved/published or waiting for approval.

**Root Cause**: Frontend components had no status badge display.

**Solution**:
- Enhanced `ItemProduct` component to accept `status` prop
- Added status badge to product card display:
  - **"Tiket Aktif"** (green) = Published/Approved
  - **"Menunggu Persetujuan"** (yellow) = Unpublished/Waiting for Admin
- Status appears on top-right of product card
- Only shows for ticket products, not equipment

**Files Modified**:
- `components/product/ItemProduct.tsx`

---

## Implementation Details

### Backend Changes

#### `src/api/ticket/controllers/ticket.js`
Added `publishedAt: null` in create method:

```javascript
async create(ctx) {
  // ... existing code ...
  data.users_permissions_user = userId;
  
  // Set initial status as unpublished (will be published by admin through Strapi)
  data.publishedAt = null;

  // ... rest of code ...
}
```

### Frontend Changes

#### `app/user/vendor/products/page.tsx`
Updated query to fetch all tickets:

```typescript
// Before: Only fetched published tickets
const ticketsRes = await axios.get(
  `${process.env.BASE_API}/api/tickets?populate=*&filters[users_permissions_user][documentId]=${userMe.user.documentId}`
);

// After: Fetch all tickets + track status
const [productsRes, ticketsRes] = await Promise.all([
  // Products: only published
  axios.get(
    `...&filters[publishedAt][$notnull]=true`
  ),
  // Tickets: ALL (published + unpublished)
  axios.get(
    `...`
  ),
]);

// Map data with status
const ticketsData = (ticketsRes?.data?.data || []).map((ticket: any) => ({
  ...ticket,
  __type: 'ticket',
  __status: ticket.publishedAt ? 'published' : 'unpublished',
}));
```

#### `components/product/ItemProduct.tsx`
Added status badge:

```typescript
interface iItemProduct {
  // ... existing props ...
  status?: 'published' | 'unpublished' | null;
}

// In render:
{props.status && (
  <div className="absolute top-2 right-2 z-10">
    <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${
      props.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
    }`}>
      {props.status === 'published' ? 'Tiket Aktif' : 'Menunggu Persetujuan'}
    </span>
  </div>
)}
```

#### `app/user/vendor/products/edit/[slug]/ContentProductEdit.tsx`
Enhanced data loading with proper state management:

```typescript
const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

const query = useQuery({
  queryKey: ["qProductDetail", props.slug, productType],
  queryFn: getQuery,
  enabled: !!props.slug, // Only run when slug exists
});

useEffect(() => {
  if (query.isLoading) return; // Wait for data
  
  if (dataContent) {
    // Process data with proper null checks
    const ticketFormData: iTicketFormReq = {
      title: dataContent.title || "",
      description: dataContent.description || "",
      // ... rest of fields with defaults ...
    };
    setDefaultTicketFormData(ticketFormData);
    setIsDataLoaded(true);
  }
}, [dataContent, productType, query.isLoading]);

// Render with loading states
{query.isLoading ? (
  <div>Loading data...</div>
) : query.isError ? (
  <div>Error loading data</div>
) : isDataLoaded ? (
  <TicketForm formDefaultData={defaultTicketFormData} />
) : (
  <div>No data available</div>
)}
```

---

## Data Flow

### Creating a New Ticket

```
User Creates Ticket
    ↓
Frontend: POST /api/tickets with data
    ↓
Backend Controller:
  - Extract userId from JWT context
  - Set users_permissions_user = userId
  - Set publishedAt = null ← NEW: Initial unpublished status
  - Call super.create()
    ↓
Database: Ticket saved with publishedAt=null (unpublished)
    ↓
Admin sees ticket in Strapi with draft status
    ↓
Admin reviews and publishes via Strapi admin panel
    ↓
publishedAt = [timestamp]
    ↓
Frontend: Ticket now shows as "Tiket Aktif" (green badge)
```

### Editing an Existing Ticket

```
User clicks Edit on Ticket Card
    ↓
Frontend: Navigate to /products/edit/{ticketId}?type=ticket
    ↓
ContentProductEdit:
  - Query: GET /api/tickets/{ticketId}?populate=*
  - Show loading state while fetching
  - Once loaded, pass data to TicketForm
    ↓
TicketForm:
  - Receives defaultTicketFormData with all fields populated
  - useEffect resets form with formatYearDate applied
  - Images converted and ready for preview
  - All fields pre-filled for editing
    ↓
User edits and submits
    ↓
Frontend: PUT /api/tickets/{ticketId}
    ↓
Backend: Verifies ownership, updates ticket
    ↓
Database: Updated ticket still has same publishedAt status
    ↓
If admin wants to publish: Admin uses Strapi to publish
```

### Viewing Ticket Products in Dashboard

```
Vendor Dashboard: /user/vendor/products
    ↓
Frontend queries:
  1. Products (only published): GET /api/products?...&filters[publishedAt][$notnull]=true
  2. Tickets (all): GET /api/tickets?...
    ↓
Display combined list with status badges:
  
  [Equipment 1]            [Ticket 1]              [Ticket 2]
  (no badge)               [🟢 Tiket Aktif]        [🟡 Menunggu Persetujuan]
  
  ↓ Published              ↓ Admin approved        ↓ Waiting for approval
```

---

## User Experience

### For Vendor

1. **Create Ticket**: Click "Tambah Produk" → Fill form → Submit
   - Ticket created with status "Menunggu Persetujuan" (yellow badge)
   - Visible in dashboard immediately
   
2. **Edit Ticket**: Click edit button on ticket card
   - All form fields populated with existing data
   - Can modify any field except vendor (locked)
   - Click save to update
   
3. **Wait for Approval**: Check dashboard
   - Yellow badge indicates waiting for admin
   - Green badge indicates approved and live
   
4. **Monitor**: See both published and unpublished tickets in one place

### For Admin

1. **Review Tickets**: Go to Strapi admin panel → Tickets collection
2. **Publish**: Click ticket → Click "Publish" button in Strapi
3. **Ticket Goes Live**: 
   - Frontend shows "Tiket Aktif" (green) badge
   - Ticket appears to customers on public site

---

## Testing Checklist

- [ ] Create new ticket → Check backend shows `publishedAt: null`
- [ ] Verify ticket appears in vendor dashboard with yellow badge ("Menunggu Persetujuan")
- [ ] Edit existing ticket → Form loads all data correctly
- [ ] Click Edit → Fields pre-populate → Submit changes → Success
- [ ] Admin publishes ticket via Strapi
- [ ] Refresh vendor dashboard → Badge changes to green ("Tiket Aktif")
- [ ] Check public product listing → Only shows published tickets
- [ ] Vendor dashboard → Shows both published and unpublished tickets
- [ ] Delete functionality → Still works for both products and tickets
- [ ] Status persists across page refresh

---

## Build Status

✅ **Frontend Build**: SUCCESS
- 47 pages compiled
- 0 errors
- 0 warnings
- Ready for deployment

---

## Git Commits

1. **Backend**: `feat: Set ticket initial status to unpublish (publishedAt=null) - admin publishes via Strapi`
   - Modified: `src/api/ticket/controllers/ticket.js`

2. **Frontend**: `feat: Fix ticket edit form data pre-population and add status badges - show both published/unpublished tickets in dashboard`
   - Modified: 3 files
     - `app/user/vendor/products/edit/[slug]/ContentProductEdit.tsx`
     - `app/user/vendor/products/page.tsx`
     - `components/product/ItemProduct.tsx`

---

## Next Steps

1. **Test with Running Backend**: Start Strapi and run comprehensive tests
2. **Verify Admin Publishing**: Test admin publishing flow in Strapi
3. **Check Public Display**: Verify only published tickets show to customers
4. **Deploy**: Once verified, deploy to staging then production

---

## Summary

Session 8 successfully implemented:
✅ Ticket edit form with proper data pre-loading
✅ Initial ticket status as unpublished (awaiting admin approval)
✅ Status badges in dashboard (green=active, yellow=waiting)
✅ Display both published and unpublished tickets for vendors
✅ Clean UI/UX for vendor ticket management lifecycle

All changes committed and build verified.
