# TODO: Remove Price Fields from Product Form

## Tasks

- [x] Update SchemaProduct.ts: Remove main_price, price_min, price_max from the schema
- [x] Update ProductForm.tsx:
  - [x] Remove input fields for main_price, price_min, price_max
  - [x] Remove these from watchedFields array
  - [x] Remove from form validation status display
  - [x] Remove from submit button disabled condition
  - [x] Remove price formatting in onSubmit function
- [x] Update iProduct.ts: Remove main_price, price_min, price_max from iProductReq and iUpdateProduct interfaces

## Followup Steps

- [ ] Test the form to ensure it submits without price validations
- [ ] Verify variants handle pricing correctly
