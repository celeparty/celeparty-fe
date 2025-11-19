# Product Page Fixes TODO

## Issues to Fix

- [ ] Product images not displaying (API populate issue)
- [ ] Search data not appearing immediately (requires debounced input)
- [ ] Filter menu needs more professional look (c-blue theme enhancement)

## Implementation Steps

### 1. Fix Product Images

- [ ] Update API call in `app/products/ProductContent.tsx` to use `populate=main_image` instead of `populate=*`

### 2. Add Immediate Search

- [ ] Add debounced search input field in `app/products/ProductContent.tsx`
- [ ] Use `lodash.debounce` for responsive searching
- [ ] Implement local search state separate from URL params

### 3. Enhance Filter Styling

- [ ] Update `components/product/ProductFilters.tsx` with:
  - [ ] Gradient background (c-blue to c-blue-light)
  - [ ] Enhanced shadows and rounded corners
  - [ ] Professional layout elements
  - [ ] Better visual hierarchy

### 4. Testing

- [ ] Test image loading functionality
- [ ] Test immediate search responsiveness
- [ ] Test filter professional appearance
- [ ] Verify no breaking changes to existing functionality

## Files to Modify

- `app/products/ProductContent.tsx`
- `components/product/ProductFilters.tsx`
