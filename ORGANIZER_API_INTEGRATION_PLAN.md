# Organizer API Integration Plan

## Summary

Integrate real backend APIs into the Organizer flow in controlled phases, without destabilizing auth, locale routing, existing design system, or non-organizer flows. Keep working registration behavior stable. API calls must go through the existing API Gateway client and service prefixes.

## 1. Current State Inspection

**Organizer routes and pages**
- `/[locale]/organizer/page.tsx`: redirects to `/${locale}/organizer/center`; keep unchanged.
- `/[locale]/organizer/register/page.tsx`: real organizer registration already works; do not change location API behavior in Phase 1.
- `/[locale]/organizer/(workspace)/layout.tsx` + `OrganizerWorkspaceLayout`: workspace shell and organizer auth guard; keep auth behavior stable.
- `/[locale]/organizer/(workspace)/center/page.tsx`: wraps `OrganizerCenterPage`; currently fixture-backed.
- `/[locale]/organizer/(workspace)/events/[eventId]/layout.tsx`: wraps event detail shell; currently fixture-backed header.
- Event detail pages under `/events/[eventId]/*`: mostly fixture-backed.
- `/[locale]/organizer/(create-flow)/events/create/page.tsx`: wraps create wizard; create submit is currently fake success.

**Mock/hardcoded data**
- `features/organizer/fixtures/events.ts`: organizer hub event list, tabs, summary.
- `features/organizer/fixtures/eventDetail.ts`: event detail, metrics, analytics, orders, attendees, check-in, staff, seat map, vouchers, team, finance.
- `features/organizer/fixtures/reports.ts`: report KPIs/charts/tables.
- `OrganizerAccountPage.tsx`: hardcoded organization/account/legal/team/history.
- `CreateEventStep4Settlement.tsx`: hardcoded settlement profiles.
- `useCreateEventWizard.ts`: fake `setTimeout` submit success.

**Existing API calls**
- `register/page.tsx`: uses real IAM organization registration and IAM locations. Keep stable.
- `CreateEventWizard.tsx`: currently uses IAM locations; for create/edit integration, switch to confirmed Inventory location APIs.
- `lib/axios.ts`: shared API client with Redux token injection and refresh flow; keep as source of truth.

## 2. Backend API Contract Summary

| API | Service | Purpose | Request | Expected response | UI | Priority |
|---|---|---|---|---|---|---|
| `GET /iam-service/api/organizations/me` | IAM | Load organizer profile/status | Auth token | `BaseResponse<OrganizationProfileResponse>` | Guard, center, account | P1 |
| `GET /inventory-service/api/v1/dashboard/organizer` | Inventory | Organizer dashboard KPIs/charts | No params unless Swagger/controller confirms params | `BaseResponse<OrganizerDashboardResponse>` | Reports/dashboard | P2 |
| `GET /inventory-service/api/events/my` | Inventory | Organizer event list | `status?`, `page`, `size`, `sortBy`, `sortDirection` | defensively unwrap `BasePageResponse<ListEventResponse>` from either `response.data` or `response.data.data` | Center list | P2 |
| `GET /inventory-service/api/events/{eventId}` | Inventory | Event detail/edit prefill | path `eventId` | `BaseResponse<EventResponse>` | Event detail/edit | P3 |
| `POST /inventory-service/api/events` | Inventory | Create event | Must inspect controller/raw Swagger before implementation: multipart or JSON | Current inspected controller suggests `BaseResponse<boolean>` | Create wizard | P5 |
| `PUT /inventory-service/api/events/{eventId}` | Inventory | Update event | path `eventId`, JSON body if backend confirms | `BaseResponse<EventResponse>` | Event edit | P6 |
| `GET /inventory-service/api/categories` | Inventory | Event category enum options | none | `BaseResponse<EventCategory[]>` | Create/edit | P4 |
| `GET /inventory-service/api/locations/provinces` | Inventory | Province dropdowns | none | `Province[]` | Create/edit | P4 |
| `GET /inventory-service/api/locations/wards` | Inventory | Wards by province | `provinceCode` | `Ward[]` | Create/edit | P4 |
| `POST /iam-service/api/upload/image` | IAM | Standalone image upload | `multipart/form-data`, `file`, optional `folder` | `FileUploadResponse` raw | Create/edit image upload if needed | P4 |

## 3. Proposed Frontend API Layer

Create modules under `src/features/organizer/api/` and backend-aligned types under `src/features/organizer/types/api.ts`.

**Modules**
- `organizationApi.getMe()`
- `organizerDashboardApi.getDashboard()`
  - No `days` param by default.
  - Add params only if backend Swagger/controller confirms support.
- `organizerEventApi.getMyEvents(params)`
- `organizerEventApi.getEventById(eventId)`
- `organizerEventApi.createEvent(payload)`
- `organizerEventApi.updateEvent(eventId, payload)`
- `categoryApi.getCategories()`
- `locationApi.getProvinces()`
- `locationApi.getWards({ provinceCode })`
- `uploadApi.uploadImage(formData)`

**Response helpers**
- Add `unwrapBaseResponse<T>()` for `BaseResponse<T>`.
- Add `unwrapPage<T>()` that accepts both:
  - `response.data` as page object.
  - `response.data.data` as page object.
- `unwrapPage` must default missing `content`/`items` to `[]` and safe pagination fields to zero/default values.
- UI must never crash on missing `content`, `items`, `totalPages`, or `totalElements`.

## 4. Type Strategy

Add minimal, backend-aligned types:
- `BaseResponse<T>`, `BasePageResponse<T>`.
- `OrganizationProfileResponse`, `OrganizationStatus = "PENDING" | "VERIFIED" | "APPROVED" | "ACTIVE" | "REJECTED" | string`.
- `OrganizerDashboardResponse`.
- `EventCategory`.
- `ListEventResponse`, `EventResponse`, `ShowtimeResponse`, `TicketTypeResponse`.
- `CreateEventRequest`, `CreateShowtimeRequest`, `CreateTicketTypeRequest`.
- `UpdateEventRequest`, `UpdateShowtimeRequest`.
- `Province`, `Ward`.
- `FileUploadResponse`.

Keep backend DTOs separate from UI view models. Add mappers for hub cards, event detail header, and create/update payloads.

## 5. Integration Phases

**Phase 1 — API foundation**
- Add service layer and minimal API types.
- Add unwrap helpers, including defensive `unwrapPage`.
- Do not change organizer register location calls.
- Do not change UI behavior beyond low-risk imports if needed.
- Completion: service layer compiles; targeted lint/typecheck passes.

**Phase 2 — Organizer identity/status**
- Integrate `GET /iam-service/api/organizations/me`.
- If organization status is `PENDING` or `REJECTED`, do not call dashboard/events APIs.
- Only call dashboard/events when status is `VERIFIED`, `APPROVED`, or `ACTIVE`.
- Status behavior:
  - `PENDING`: show pending state.
  - `REJECTED`: show rejected state with reason.
  - no organization/404: redirect or show register state.
  - verified/approved/active: allow center data loading.
- Completion: no redirect loop; unauthorized statuses do not trigger inventory calls.

**Phase 3 — Organizer dashboard**
- Integrate `GET /inventory-service/api/v1/dashboard/organizer`.
- Use `organizerDashboardApi.getDashboard()` with no params unless backend confirms params.
- Replace fixture dashboard/report fields that map directly.
- Add loading/error/empty state.
- Completion: real dashboard renders defensively with missing arrays handled.

**Phase 4 — Organizer event list**
- Integrate `GET /inventory-service/api/events/my`.
- Replace `FIXTURE_EVENTS`, fixture tabs/counts, and summary with real data where available.
- Use `unwrapPage` defensively for direct or wrapped page response.
- Support known params: `status`, `page`, `size`, `sortBy`, `sortDirection`.
- Keyword filtering may remain client-side if `/events/my` does not support keyword.
- Completion: empty/missing content does not crash; event cards link to existing detail routes.

**Phase 5 — Event detail**
- Integrate `GET /inventory-service/api/events/{eventId}`.
- Replace event detail header fixture and overview basics.
- Keep secondary detail sections fixture-backed until dedicated APIs are confirmed.
- Handle 403/404 with stable error state.
- Completion: valid detail loads; invalid event does not crash.

**Phase 6 — Category/location/upload foundation**
- Integrate:
  - `GET /inventory-service/api/categories`
  - `GET /inventory-service/api/locations/provinces`
  - `GET /inventory-service/api/locations/wards`
  - `POST /iam-service/api/upload/image`
- Use Inventory location APIs for create/edit event first.
- Do not modify organizer register location behavior in this phase.
- Upload image maps `secureUrl || url` and `publicId` into form state when standalone upload is used.
- Completion: create/edit dictionaries load from real APIs with safe fallback labels.

**Phase 7 — Create event**
- Before coding, inspect backend controller or raw Swagger again to confirm request format.
- If backend is multipart, use exact part names confirmed by backend:
  - currently inspected controller suggests `event`, `bannerImage`, `thumbnailImage`.
- If backend is JSON, do not use multipart.
- Map wizard state to `CreateEventRequest`.
- Since current `POST /events` returns boolean, do not guess `eventId`.
- On success: toast success, redirect to organizer center/event list, and refresh list.
- Free ticket risk:
  - Backend currently rejects `price = 0` for `CreateTicketTypeRequest`.
  - Disable free ticket submit or validate with clear message before API call unless backend confirms free tickets are supported.
- Completion: no fake success on API failure; invalid free ticket price gives clear UX.

**Phase 8 — Update event**
- Prefill edit form from `GET /events/{eventId}`.
- Submit `PUT /events/{eventId}` using backend-confirmed JSON shape.
- Do not overbuild unsupported nested ticket/showtime update behavior.
- Completion: success toast and refreshed event detail.

## 6. UI State Requirements

Every API-backed screen must include:
- loading state
- error state
- empty state where appropriate
- success toast for mutations
- error toast for failed mutations
- defensive rendering for missing fields
- no crash on empty arrays
- no redirect loops
- locale-preserving navigation

## 7. Risk and Unknowns

Verify before/during implementation:
- Real organization status enum: `VERIFIED` vs `APPROVED`/`ACTIVE`.
- Whether dashboard endpoint supports `days`; do not pass until confirmed.
- Whether `/events/my` response is direct page or wrapped page.
- Whether `/events/my` supports keyword.
- Whether `POST /events` is multipart or JSON in deployed Swagger.
- Exact multipart part names if multipart.
- `POST /events` returns boolean, so no event detail redirect unless backend changes.
- Free ticket support conflicts with backend `price > 0` validation.
- Ward serialization may differ from frontend expectation.
- Secondary event detail APIs are not confirmed.

## 8. Manual Test Checklist

- Active/verified organizer opens center.
- Pending organizer opens center and inventory APIs are not called.
- Rejected organizer opens center and inventory APIs are not called.
- User without organization opens center/register.
- Dashboard loads and handles missing arrays.
- Event list loads direct page response.
- Event list loads wrapped page response.
- Event list handles missing/empty content.
- Event detail valid event loads.
- Event detail 403/404 shows error.
- Categories load.
- Provinces/wards load for create/edit.
- Upload image success/failure.
- Create event valid data.
- Create event missing required fields.
- Create event free ticket when backend rejects zero price.
- Create event success redirects to center/list and refreshes list.
- Update event success/failure.
- Reload preserves auth/data.
- Expired token uses existing refresh/login behavior.

## 9. Execution Rules

- First execution step: write this plan to `EvoTicket_FE/ORGANIZER_API_INTEGRATION_PLAN.md`.
- Do not implement code before approval.
- Implement one phase at a time.
- After each phase, report files changed, APIs integrated, checks run, and unresolved issues.
- Do not refactor buyer/admin/checker flows.
- Do not change design system/tokens unless required for API state UI.
- Do not introduce new token storage sources.
- Do not hardcode fake success when APIs fail.
- Do not call `/api/internal/**` from frontend.

## Assumptions and Defaults

- Keep Redux persisted auth and axios interceptor as token source of truth.
- Keep organizer register stable until a later explicit registration cleanup phase.
- Treat `VERIFIED`, `APPROVED`, and `ACTIVE` as allowed organizer statuses unless backend confirms only one.
- Keep secondary event workspace fixture-backed until dedicated APIs are confirmed.
