# Query Troubleshooting & Optimization

## Current Query Issues

### Problem: Query Filter Format
The current query uses:
```
filters[publishedAt][$notnull]=true
```

This might not work in all Strapi versions. Better approaches:

### Solution 1: Use $notNull (Correct Filter)
```javascript
// BEFORE (might not work):
/api/tickets?filters[publishedAt][$notnull]=true

// AFTER (should work):
/api/tickets?filters[publishedAt][$notNull]=true
```

### Solution 2: Alternative - Use publication_state
```javascript
// Better approach - use Strapi's publication state
/api/tickets?publicationState=live
// Returns only published (live) tickets

/api/tickets?publicationState=preview
// Returns all tickets (published + draft)
```

---

## Recommended Fix

Use `publicationState` instead of `publishedAt` filter:

```typescript
// Current approach (may have issues):
axios.get(`/api/products?populate=*&filters[publishedAt][$notnull]=true`)

// Recommended approach (more reliable):
axios.get(`/api/products?populate=*&publicationState=live`)
```

---

## Updated Query for Products Page

Replace in `app/user/vendor/products/page.tsx`:

```typescript
const getData = async () => {
  if (!userMe?.user?.documentId || !userMe?.jwt) {
    console.log('Waiting for user data...');
    return { data: [] };
  }

  try {
    console.log('Fetching products and tickets...');
    
    // Fetch both products (equipment) and tickets
    const [productsRes, ticketsRes] = await Promise.all([
      // Products: Only published (live) items
      axios.get(
        `${process.env.BASE_API}/api/products?populate=*&filters[users_permissions_user][documentId]=${userMe.user.documentId}&publicationState=live`,
        {
          headers: {
            Authorization: `Bearer ${userMe.jwt}`,
          },
        },
      ),
      // Tickets: All states (published + draft) so vendor can see everything
      axios.get(
        `${process.env.BASE_API}/api/tickets?populate=*&filters[users_permissions_user][documentId]=${userMe.user.documentId}&publicationState=preview`,
        {
          headers: {
            Authorization: `Bearer ${userMe.jwt}`,
          },
        },
      ),
    ]);

    // Process and return data...
  }
};
```

---

## Why This Works Better

| Approach | Pros | Cons |
|----------|------|------|
| `filters[publishedAt][$notNull]=true` | Explicit | May not work in all versions |
| `publicationState=live` | Native Strapi | Only published |
| `publicationState=preview` | Native Strapi | Shows draft + published |

Using `publicationState` is **Strapi's official way** to control publication status.

---

## Implementation Steps

1. Update the query in `getData()` function
2. Use `publicationState=preview` for tickets (shows all)
3. Use `publicationState=live` for products (shows only published)
4. Test that auto-refresh works correctly
5. Verify approved tickets show immediately

---

## Status Determination Logic

```typescript
// Keep this - it works regardless of query
const ticketsData = (ticketsRes?.data?.data || []).map((ticket: any) => ({
  ...ticket,
  __type: 'ticket',
  __status: ticket.publishedAt ? 'published' : 'unpublished',
}));
```

This logic will work because:
- When admin publishes in Strapi: `publishedAt` gets a timestamp
- When ticket is draft: `publishedAt` is null
- Frontend checks the actual field value (not the query parameter)

---

## Next Steps

If you want to implement this fix:

1. Apply the query change above
2. Rebuild (`npm run build`)
3. Test:
   - Create ticket
   - Approve in Strapi
   - Check dashboard (should update in 10 seconds)
   - Verify green badge appears

---

**Note**: This is optional - the current implementation with React Query auto-refresh + manual refresh button should work fine even with current query format.
