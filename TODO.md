# Ticket Visibility Fix - TODO List

## Issue Identified

Ticket products were not showing up on the frontend because the ticket schema was missing the `user_event_type` field that the frontend code uses to differentiate between tickets and equipment products.

## Changes Made

- ✅ Added `user_event_type` relation field to ticket schema
- ✅ Added `tickets` inverse relation to user-event-type schema

## Next Steps

- [ ] **IMPORTANT**: Restart your Strapi server to apply the schema changes
- [ ] Test ticket visibility on products page (/products)
- [ ] Test ticket visibility on home page (/)
- [ ] Verify ticket filtering works correctly
- [ ] Test ticket detail pages load properly
- [ ] Verify vendor dashboard shows tickets correctly

## How to Apply Changes

1. Stop your Strapi server (if running)
2. Start Strapi server again: `npm run develop` or `yarn develop`
3. The schema changes will be automatically applied
4. Test the application to verify tickets are now visible

## Testing Checklist

- [ ] Products page shows both equipment and tickets
- [ ] Home page shows both equipment and tickets
- [ ] Ticket detail pages load with correct data
- [ ] Vendor can edit tickets in dashboard
- [ ] Ticket management functionality works
- [ ] Cart and checkout work for tickets

## Database Migration

- [ ] Run Strapi content-type migration if needed
- [ ] Ensure existing ticket data has proper user_event_type values
