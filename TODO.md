# TODO: Fix Redirect After Login/Register from Product Pages

## Completed Tasks

- [x] Update `middleware.ts` to check for `redirect` query parameter when redirecting authenticated users from `/auth/login`, and redirect to that URL if present, otherwise to `/user/home`.
- [x] Remove `window.location.reload()` from `app/auth/login/page.tsx` to prevent interference with client-side navigation.

## Pending Tasks

- [ ] Test the flow: Navigate from a product page → login/register → verify redirection back to the product page instead of dashboard/bio.
