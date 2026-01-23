# TODO

- [x] Fix vendor products not showing in the dashboard.
  - [x] Modified `lib/auth.ts` to include `documentId` in the session.
  - [x] Modified `app/user/vendor/products/page.tsx` to correctly access `documentId` and `jwt` from the `userMe` object.