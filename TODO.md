# TODO: Fix Product and Ticket Visibility

## Current Issue

- Many products not appearing on home page and products page
- Ticket products not showing on home page and products page
- getCombinedQuery function in ProductContent\_.tsx is incomplete

## Tasks

- [x] Complete getCombinedQuery function in app/products/ProductContent\_.tsx
- [x] Implement parallel fetching of products and tickets
- [x] Add proper filtering logic for both product types
- [x] Merge results with type markers (\_\_productType)
- [x] Handle pagination across combined dataset
- [x] Update all components to use consistent type checking
- [x] Update ProductList.tsx to use **productType instead of **type
- [x] Update ProductListBox.tsx to use \_\_productType for location display
- [x] Update ProductContent\_.tsx to use \_\_productType for URL generation
- [x] Fix ticket type detection in ProductListBox.tsx (was checking item.**type instead of item.**productType)
- [x] Test implementation on products page
- [x] Verify tickets appear correctly
- [x] Verify filtering works for both types

## Implementation Plan

1. Standardize type markers to `__productType` with values 'equipment' and 'ticket'
2. Fix pagination logic in getCombinedQuery
3. Update all components to use consistent type checking
4. Test and verify functionality
