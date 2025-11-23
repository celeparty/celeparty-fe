Task: Add non-ticket product detail form with validation on cart page

Steps:

1. Add updateProductDetails method in lib/store/cart.ts for updating customer_name, event_date, shipping_location, loading_date, and loading_time fields.

2. Update app/cart/dataContent.tsx:

   - Add input form fields for these details under each non-ticket product summary.
   - Hook inputs to the new updateProductDetails method.
   - Add validation styling for inputs.
   - Ensure existing validation logic for continue button works.

3. Test UI for non-ticket product form and validation correctness.

4. Verify no changes in ticket product form and validation.

5. Code cleanup and commit changes.

Proceeding with step 1: add updateProductDetails method in lib/store/cart.ts.
