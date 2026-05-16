# Organizer API Integration Plan

## Summary

Integrate real backend APIs into the Organizer flow in controlled phases, without destabilizing auth, locale routing, existing design system, or non-organizer flows. Keep working registration behavior stable. API calls must go through the existing API Gateway client and service prefixes.

## Implementation Status

| Task | Status | Notes |
|---|---|---|
| Task 1 / Phase 1 - API foundation | Completed | Added organizer API modules, backend-aligned types, and defensive response helpers. |
| Task 2 / Phase 2 - Organizer identity/status | Completed | Workspace guard loads `GET /iam-service/api/organizations/me`; pending/rejected/not-found states do not render inventory-backed workspace content. |
| Task 3 / Phase 3 - Organizer dashboard/reports | Completed | Reports page uses legacy `GET /inventory-service/api/v1/dashboard/organizer?days=30`; backend legacy endpoint query was fixed and now returns safe real/empty data. |
| Task 4 / Phase 4 - Organizer Center event list | Completed | Center uses Swagger endpoint `GET /inventory-service/api/events/organizer/dashboard` with supported filter params. It does not call the legacy dashboard endpoint. |
| Task 5 / Phase 5 - Event detail | Pending | Detail shell/pages are still mostly fixture-backed except existing detail route structure. |
| Task 6 / Phase 6 - Category/location/upload foundation | Completed | Create wizard loads real Inventory categories/provinces/wards, handles loading/error/empty states, clears stale ward on province change, and keeps banner/thumbnail as `File` state for multipart submit later. |
| Task 7 / Phase 7 - Create event | Completed | Create wizard validates all steps, blocks unsupported free tickets, submits multipart `event` JSON plus optional `bannerImage`/`thumbnailImage`, and redirects to Organizer Center on `data === true`. |
| Task 8 / Phase 8 - Update event | Pending | Not implemented. |

## 1. Current State Inspection

**Organizer routes and pages**
- `/[locale]/organizer/page.tsx`: redirects to `/${locale}/organizer/center`; keep unchanged.
- `/[locale]/organizer/register/page.tsx`: real organizer registration already works; do not change location API behavior in the completed phases.
- `/[locale]/organizer/(workspace)/layout.tsx` + `OrganizerWorkspaceLayout`: workspace shell and organizer auth guard now calls `GET /iam-service/api/organizations/me` and blocks pending/rejected/not-found organizations before inventory-backed content renders.
- `/[locale]/organizer/(workspace)/center/page.tsx`: wraps `OrganizerCenterPage`; event list, counts, and summary now load from `GET /inventory-service/api/events/organizer/dashboard`.
- `/[locale]/organizer/(workspace)/reports/page.tsx`: wraps `OrganizerReportsPage`; reports KPIs/charts/tables now load defensively from legacy `GET /inventory-service/api/v1/dashboard/organizer?days=30`.
- `/[locale]/organizer/(workspace)/events/[eventId]/layout.tsx`: wraps event detail shell; currently fixture-backed header.
- Event detail pages under `/events/[eventId]/*`: mostly fixture-backed.
- `/[locale]/organizer/(create-flow)/events/create/page.tsx`: wraps create wizard; create submit is currently fake success.

**Mock/hardcoded data**
- `features/organizer/fixtures/events.ts`: no longer the source of Organizer Center event list/counts; still exists for any remaining fallback or unrelated fixture-backed surfaces.
- `features/organizer/fixtures/eventDetail.ts`: event detail, metrics, analytics, orders, attendees, check-in, staff, seat map, vouchers, team, finance.
- `features/organizer/fixtures/reports.ts`: reports page no longer uses it as the primary data source for dashboard metrics; retained for static report metadata/remaining non-API UI if referenced.
- `OrganizerAccountPage.tsx`: hardcoded organization/account/legal/team/history.
- `CreateEventStep4Settlement.tsx`: hardcoded settlement profiles.
- `useCreateEventWizard.ts`: fake `setTimeout` submit success.

**Existing API calls**
- `register/page.tsx`: uses real IAM organization registration and IAM locations. Keep stable.
- `OrganizerWorkspaceLayout.tsx`: uses `organizationApi.getMe()` -> `GET /iam-service/api/organizations/me`.
- `OrganizerReportsPage.tsx`: uses `organizerDashboardApi.getDashboard(30)` -> `GET /inventory-service/api/v1/dashboard/organizer?days=30`.
- `OrganizerCenterPage.tsx`: uses `organizerEventApi.getOrganizerDashboard(params)` -> `GET /inventory-service/api/events/organizer/dashboard`.
- `CreateEventWizard.tsx`: currently uses IAM locations; for create/edit integration, switch to confirmed Inventory location APIs.
- `lib/axios.ts`: shared API client with Redux token injection and refresh flow; keep as source of truth.

## 2. Backend API Contract Summary

| API | Service | Purpose | Request | Expected response | UI | Priority |
|---|---|---|---|---|---|---|
| `GET /iam-service/api/organizations/me` | IAM | Load organizer profile/status | Auth token | `BaseResponse<OrganizationProfileResponse>` | Guard, center, account | Done |
| `GET /inventory-service/api/v1/dashboard/organizer` | Inventory | Legacy organizer dashboard KPIs/charts for Reports | `days` supported by controller, currently `30` from reports UI | `BaseResponse<OrganizerDashboardMetricsResponse>` | Reports/dashboard | Done |
| `GET /inventory-service/api/events/organizer/dashboard` | Inventory | Organizer Center list plus status counts | `keyword`, `categories`, `eventTypes`, `eventStatuses`, `approvalStatuses`, `startDate`, `endDate`, `page`, `size`, `sort` | `BaseResponse<OrgEventDto>` with `events: BasePageResponse<EventResponseDto>` | Center list | Done |
| `GET /inventory-service/api/events/my` | Inventory | Legacy/simple organizer event list | `status?`, `page`, `size`, `sortBy`, `sortDirection` | `BasePageResponse<ListEventResponse>` | Not used by Organizer Center | Legacy |
| `GET /inventory-service/api/events/{eventId}` | Inventory | Event detail/edit prefill | path `eventId` | `BaseResponse<EventResponse>` | Event detail/edit | P3 |
| `POST /inventory-service/api/events` | Inventory | Create event | Multipart confirmed in inspected controller: `event`, `bannerImage`, `thumbnailImage` | Current inspected controller suggests `BaseResponse<boolean>` | Create wizard | P5 |
| `PUT /inventory-service/api/events/{eventId}` | Inventory | Update event | path `eventId`, JSON body if backend confirms | `BaseResponse<EventResponse>` | Event edit | P6 |
| `GET /inventory-service/api/categories` | Inventory | Event category enum options | none | `BaseResponse<EventCategory[]>` | Create/edit | P4 |
| `GET /inventory-service/api/locations/provinces` | Inventory | Province dropdowns | none | `Province[]` | Create/edit | P4 |
| `GET /inventory-service/api/locations/wards` | Inventory | Wards by province | `provinceCode` | `Ward[]` | Create/edit | P4 |
| `POST /iam-service/api/upload/image` | IAM | Standalone image upload | `multipart/form-data`, `file`, optional `folder` | `FileUploadResponse` raw | Create/edit image upload if needed | P4 |

## 3. Proposed Frontend API Layer

Modules under `src/features/organizer/api/` and backend-aligned types under `src/features/organizer/types/api.ts`.

**Modules**
- `organizationApi.getMe()` - completed.
- `organizerDashboardApi.getDashboard(days = 30)` - completed for Reports and aligned with legacy controller.
- `organizerEventApi.getOrganizerDashboard(params)` - completed for Organizer Center using `/api/events/organizer/dashboard`.
- `organizerEventApi.getMyEvents(params)` - implemented as a wrapper over `getOrganizerDashboard(params).events`; not a call to `/events/my`.
- `organizerEventApi.getEventById(eventId)` - pending.
- `organizerEventApi.createEvent(payload)` - completed for multipart `POST /inventory-service/api/events`.
- `organizerEventApi.updateEvent(eventId, payload)` - pending.
- `categoryApi.getCategories()` - completed for `BaseResponse<string[]>`.
- `locationApi.getProvinces()` - completed for raw `ProvinceResponse[]`.
- `locationApi.getWards(provinceCode)` - completed for raw `WardResponse[]`.
- `uploadApi.uploadImage(formData)` - existing standalone upload helper remains available, but create wizard does not upload banner/thumbnail separately in Task 6.

**Response helpers**
- `unwrapBaseResponse<T>()` exists for `BaseResponse<T>`.
- `unwrapPage<T>()` exists and accepts both:
  - `response.data` as page object.
  - `response.data.data` as page object.
- `unwrapPage` defaults missing `content`/`items` to `[]` and safe pagination fields to zero/default values.
- UI must never crash on missing `content`, `items`, `totalPages`, or `totalElements`.

## 4. Type Strategy

Minimal, backend-aligned types are present:
- `BaseResponse<T>`, `BasePageResponse<T>`.
- `OrganizationProfileResponse`, `OrganizationStatus = "PENDING" | "VERIFIED" | "REJECTED" | string`.
- `OrganizerDashboardMetricsResponse`.
- `OrganizerDashboardResponse` for `/events/organizer/dashboard`.
- `EventCategory`, `EventType`, `EventStatus`, `EventApprovalStatus`.
- `ListEventResponse`, `EventResponse`, `ShowtimeResponse`, `TicketTypeResponse`.
- `CreateEventRequest`, `CreateShowtimeRequest`, `CreateTicketTypeRequest`.
- `UpdateEventRequest`, `UpdateShowtimeRequest`.
- `ProvinceResponse`, `WardResponse`, plus compatibility aliases `Province`, `Ward`.
- `FileUploadResponse`.

Keep backend DTOs separate from UI view models. Existing mappers cover Organizer Center cards and report/dashboard derived values; event detail/create/update mappers still need completion when those phases begin.

## 5. Integration Phases

**Phase 1 - API foundation - Completed**
- Added service layer and minimal API types.
- Added unwrap helpers, including defensive `unwrapPage`.
- Did not change organizer register location calls.
- Completion: service layer and types are present under `src/features/organizer/api/` and `src/features/organizer/types/api.ts`.

**Phase 2 - Organizer identity/status - Completed**
- Integrated `GET /iam-service/api/organizations/me`.
- If organization status is `PENDING` or `REJECTED`, workspace content is blocked and inventory-backed child pages do not render.
- Only statuses `VERIFIED`, `APPROVED`, or `ACTIVE` allow center/report content to load.
- Status behavior:
  - `PENDING`: shows pending state.
  - `REJECTED`: shows rejected state with reason and resubmit action.
  - no organization/404: redirects to register.
  - verified/approved/active: allows center data loading.
- Completion: no redirect loop expected; unauthorized statuses do not intentionally trigger inventory calls.

**Phase 3 - Organizer dashboard/reports - Completed**
- Integrated `GET /inventory-service/api/v1/dashboard/organizer`.
- Uses `organizerDashboardApi.getDashboard(30)` because the backend controller confirms `days` support.
- Replaced fixture dashboard/report fields that map directly.
- Added loading/error/empty-safe rendering.
- Backend note: legacy endpoint was fixed in `Inventory-Service` by removing a Hibernate fetch join on basic enum field `Event.category`; empty data now returns safe zero/list values.
- Completion: reports page renders defensively with missing arrays handled.

**Phase 4 - Organizer Center event list - Completed**
- Integrated `GET /inventory-service/api/events/organizer/dashboard`.
- Replaced `FIXTURE_EVENTS`, fixture tabs/counts, and summary with real data where available.
- Uses normalized dashboard/page response handling defensively.
- Supports known params: `keyword`, `categories`, `eventTypes`, `eventStatuses`, `approvalStatuses`, `startDate`, `endDate`, `page`, `size`, `sort`.
- Does not use legacy `/api/v1/dashboard/organizer` for Organizer Center.
- Does not use `days`, `sortBy`, `sortDirection`, `status`, or `page=0` for Organizer Center.
- Completion: empty/missing content does not crash; event cards link to existing detail routes.

**Phase 5 - Event detail - Pending**
- Integrate `GET /inventory-service/api/events/{eventId}`.
- Replace event detail header fixture and overview basics.
- Keep secondary detail sections fixture-backed until dedicated APIs are confirmed.
- Handle 403/404 with stable error state.
- Completion: valid detail loads; invalid event does not crash.

**Phase 6 - Category/location/upload foundation - Completed**
- Integrated:
  - `GET /inventory-service/api/categories`
  - `GET /inventory-service/api/locations/provinces`
  - `GET /inventory-service/api/locations/wards?provinceCode={provinceCode}`
- Used Inventory location APIs for create event wizard.
- Did not modify organizer register location behavior.
- Category response is handled as wrapped `BaseResponse<string[]>`.
- Province and ward responses are handled as raw arrays, not `BaseResponse`.
- Ward API is not called until a province is selected.
- Changing province clears stale `wardCode` and `wardName`.
- Banner and thumbnail files are stored as `File` objects in wizard state; preview URLs remain UI-only state.
- No standalone banner/thumbnail upload is performed in this phase.
- Completion: create wizard dictionaries load from real APIs with safe loading/error/empty/retry behavior.

**Phase 7 - Create event - Completed**
- Confirmed backend controller uses multipart `POST /api/events`.
- Exact part names:
  - `event`: JSON object matching `CreateEventRequest`.
  - `bannerImage`: optional binary.
  - `thumbnailImage`: optional binary.
- Event JSON shape used:
  - `eventName`
  - `description`
  - `venue`
  - `wardCode`
  - `provinceCode`
  - `address`
  - `eventType`
  - `totalSeats`
  - `isFeatured`
  - `latitude`
  - `longitude`
  - `category`
  - `showtimes[]`
  - `showtimes[].ticketTypes[]`
- Nested showtimes and ticket types are included in the `event` JSON part.
- `totalSeats` maps from total ticket quantity.
- Dates are sent as ISO local datetime strings from `datetime-local`, matching backend `LocalDateTime`.
- Backend rejects `price = 0`; free tickets are blocked with a clear validation message.
- Since `POST /events` returns boolean, the UI does not guess `eventId`.
- On success with `data === true`: shows toast, redirects to locale-preserving Organizer Center, and refreshes the route.
- On failure: shows backend message or safe status-specific fallback, keeps user input, and does not redirect.
- No `/api/internal/**` calls are used.
- Completion: no fake success on API failure; invalid free ticket price gives clear UX.

**Phase 8 - Update event - Pending**
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

Verify before/during future implementation:
- Real organization status enum may still need backend confirmation beyond `VERIFIED`, `APPROVED`, and `ACTIVE`.
- Legacy dashboard endpoint supports `days`; Reports currently passes `30`.
- Organizer Center must continue using `/events/organizer/dashboard`, not `/events/my`.
- `/events/organizer/dashboard` supports server-side keyword and status filters through confirmed params.
- Whether `POST /events` is multipart or JSON in deployed Swagger.
- Exact multipart part names if multipart.
- `POST /events` returns boolean, so no event detail redirect unless backend changes.
- Free ticket support conflicts with backend `price > 0` validation.
- Ward serialization may differ from frontend expectation.
- Secondary event detail APIs are not confirmed.

## 8. Manual Test Checklist

- Active/verified organizer opens center.
- Pending organizer opens workspace and inventory-backed child content is not rendered.
- Rejected organizer opens workspace and inventory-backed child content is not rendered.
- User without organization opens center/register flow.
- Reports dashboard loads and handles missing arrays.
- Organizer Center event list loads wrapped `OrgEventDto.events` response.
- Event list handles missing/empty content.
- Event list sends `page` as 1-indexed and `sort`, not `sortBy`/`sortDirection`.
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

- Continue implementing one remaining phase at a time.
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
