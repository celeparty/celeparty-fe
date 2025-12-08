# Ticket Product Issues - Fix Plan

## Issues Identified:

1. **Home page & Products page**: Only show approved tickets (correct behavior)
2. **Vendor products page**: Shows all tickets including pending (correct)
3. **Management Ticket dashboard**: Currently shows transaction data, should show ticket products
4. **Edit functionality**: Should work for tickets
5. **Ticket detail viewing**: Should work for transactions

## Current Status:

- Tickets created with state=pending (confirmed by user)
- Public pages correctly filter for approved tickets only
- Vendor pages show all tickets (correct)
- TicketSendInvitationTab shows vendor's tickets (correct)

## Plan:

1. **Fix Management Ticket dashboard** - Show ticket products instead of transactions
2. **Verify edit functionality** - Ensure tickets can be edited
3. **Verify ticket detail viewing** - Ensure transaction details work
4. **Test all ticket visibility** - Confirm correct behavior across all pages

## Next Steps:

- Update TicketDashboard component to show ticket products
- Test edit functionality for tickets
- Test transaction detail viewing
- Verify all pages work correctly
