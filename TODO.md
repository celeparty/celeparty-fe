# Ticket Product Integration Fix

## Issues to Fix:

- [ ] Products page doesn't show ticket products (only shows equipment products)
- [ ] Ensure transaction flow uses ticket table for tickets
- [ ] Remove any remaining ticket category logic from products

## Steps:

1. Update app/products/ProductContent\_.tsx to fetch both products and tickets
2. Verify transaction/cart logic handles tickets correctly
3. Test all flows work end-to-end
