# TODO: Remove Ticket Categories from Equipment Products

## Completed Tasks

- [x] Modified `app/products/ProductContent.tsx` to only show categories for ticket products
- [x] Updated `getFilterCatsQuery` function to return empty data for non-ticket types
- [x] Added logic to prevent ticket categories from appearing on equipment product pages

## Summary of Changes

- Equipment products (from product table) will no longer display ticket categories in filters
- Ticket products (from ticket table) will continue to show their relevant categories
- This prevents user confusion by clearly separating equipment and ticket product categorization

## Testing Required

- Verify that equipment product pages do not show ticket categories
- Verify that ticket product pages still show appropriate categories
- Test filtering functionality on both product types
