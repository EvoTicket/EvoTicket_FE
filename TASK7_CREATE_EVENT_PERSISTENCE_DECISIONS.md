# Task 7 Create Event Persistence Decisions

## Persisted now

- Event core fields: name, description, venue, address, ward, province, event type, category, coordinates, total seats.
- Media: banner and thumbnail upload are still sent as multipart files.
- Showtimes and ticket types: created under the event in Inventory-Service.
- Approval status: backend sets organizer-created events to `PENDING`.

## De-scoped from required create validation

- `urlSlug`: not persisted by Inventory-Service yet. Optional frontend validation remains if a slug is entered.
- `gates`, `totalGates`, `expectedCheckers`, `gateNotes`: not persisted by Inventory-Service yet. Gate setup should move to a post-create check-in setup flow or a dedicated gate API.
- `selectedProfileId`: not persisted by Inventory-Service yet. Settlement profile selection should move to post-approval/payment setup unless Payment-Service owns this link.
- `organizerName`, `organizerEmail`, `organizerPhone`: not persisted by Inventory-Service yet. Contact info should be derived from IAM organization data or added as explicit event contact fields.

## Frontend-only preview fields

- `visibility`: create API has no visibility/publish column. Public exposure is controlled by backend `approvalStatus`.
- `allowResale`, `resaleMaxPriceCap`, `royaltyFee`: no event resale policy schema/API exists yet.
- `postPurchaseNotes`, `checkinReminder`: no persistence target exists yet.

## Backend gaps remaining

- Add slug column/API and uniqueness validation if buyer detail routes must use slugs.
- Add event gate schema/API or Checkin-Service ownership for gate setup.
- Add settlement profile link in the service that owns payout configuration.
- Add resale policy schema/API before enabling resale lifecycle behavior.
- Add event contact fields only if IAM organization data is insufficient.
- Admin reject reason is accepted by the request DTO but not stored because the events table has no rejection reason column.
