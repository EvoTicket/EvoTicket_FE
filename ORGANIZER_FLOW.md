# Organizer Frontend Implementation Plan

## Scope

This document is the planning baseline for the Organizer frontend. It covers the Organizer Hub, Event Detail Workspace, Create Event Wizard, token usage rules, fixture data, and API integration plan.

Do not use this plan as approval to rewrite Buyer/Admin/Checker flows. Existing legacy tokens in `src/app/globals.css` must remain because other flows may depend on them.

## Token Audit Result

The repo is intended to use a three-layer token model:

1. Primitive/raw tokens: `asset/raw.json`
2. Semantic tokens: `asset/semantic-light.json`, `asset/semantic-dark.json`
3. Component tokens: `asset/component*.json`

Audit result:

- `asset/raw.json` is primitive-only: 112 tokens, 0 aliases. It contains base color, alpha, spacing, radius, border, and motion primitives.
- `asset/semantic-light.json` and `asset/semantic-dark.json` are semantic aliases: each has 169 tokens and all 169 are aliases via Figma alias metadata, primarily to primitive `color/*` and `alpha/*`.
- `asset/component.json` is the active component-token source when present. It has 696 tokens, 636 aliases, and 60 direct values. Most aliases point to semantic `color/*`, primitive spacing/radius/border/alpha, and some component/control aliases.
- `asset/component-light.json` and `asset/component-dark.json` both exist and have 147 tokens each, but `scripts/build-tokens.mjs` ignores both whenever `asset/component.json` exists.
- `scripts/build-tokens.mjs` generates `src/app/figma-tokens.css` with `--color-*` CSS variables plus Tailwind v4 `@theme` color/spacing/radius mappings. The generated class names such as `bg-bg-page`, `text-text-primary`, and `bg-button-primary-bg-default` are usable.
- `lib/tailwind-theme.js` still maps some component colors to non-`--color-*` variable names such as `var(--button-primary-bg-default)`, while generated CSS defines `--color-button-primary-bg-default`. The generated `@theme` mappings cover the intended classes, but this mismatch is a risk if Tailwind config mappings are relied on directly.
- Current Organizer code mixes generated tokens, legacy tokens, hardcoded HEX colors, and typo token classes. Existing pages should be cleaned incrementally during implementation. New Organizer code must follow the stricter rules below.

## Allowed Organizer Token Classes

Use generated semantic/component tokens for new Organizer code.

Core surfaces:

- `bg-bg-page`
- `bg-bg-surface`
- `bg-bg-elevated`
- `bg-bg-subtle`
- `text-text-primary`
- `text-text-secondary`
- `text-text-muted`
- `border-border-default`
- `border-border-subtle`
- `border-border-strong`

Actions:

- `bg-action-brand-bg-default`
- `hover:bg-action-brand-bg-hover`
- `active:bg-action-brand-bg-pressed`
- `text-action-brand-text-default`
- `bg-button-primary-bg-default`
- `hover:bg-button-primary-bg-hover`
- `text-button-primary-text-default`
- `bg-button-secondary-bg-default`
- `hover:bg-button-secondary-bg-hover`
- `text-button-secondary-text-default`
- `border-button-secondary-border-default`
- `bg-button-ghost-bg-default`
- `hover:bg-button-ghost-bg-hover`
- `text-button-ghost-text-default`

Fields and focus:

- `bg-field-bg-default`
- `text-field-text-value`
- `placeholder:text-field-text-placeholder`
- `border-field-border-default`
- `hover:border-field-border-hover`
- `focus:border-field-border-focus`
- `focus:ring-focus-ring`

Feedback:

- `bg-feedback-success-bg`
- `text-feedback-success-text`
- `border-feedback-success-border`
- `bg-feedback-warning-bg`
- `text-feedback-warning-text`
- `border-feedback-warning-border`
- `bg-feedback-error-bg`
- `text-feedback-error-text`
- `border-feedback-error-border`
- `bg-feedback-info-bg`
- `text-feedback-info-text`
- `border-feedback-info-border`

State tokens for event/ticket/check-in/payment status:

- Prefer `bg-state-*`, `text-state-*`, and `border-state-*` where the status maps to an existing generated token.
- Prefer `status-pill`, `badge`, `table`, `card`, `input`, and `select` component tokens where a class exists in `src/app/figma-tokens.css`.

## Banned For New Organizer Code

Do not add new hardcoded HEX/RGB/HSL colors in class names, inline styles, chart configs, or component constants unless the token set is missing a required non-UI data-visualization color and the exception is documented.

Avoid new usages of these legacy classes:

- `bg-primary`
- `text-primary`
- `bg-secondary`
- `bg-success`
- `text-success`
- `bg-warning`
- `text-warning`
- `focus:border-primary`
- `focus:ring-primary`

Do not use typo token classes:

- `bg-button-primary-bg-defaul`
- `hover:bg-button-primary-bg-defaul-hover`
- `bg-button-primary-bg-defaultext-button-primary-text-default`
- `hover:bg-button-primary-bg-defaul-hovertext-button-primary-text-default`

## Current Token Drift To Clean Later

The Organizer shell was minimally fixed in:

- `src/components/organizer/OrganizerHeader.tsx`
- `src/components/organizer/OrganizerSidebar.tsx`

Remaining known drift in Organizer pages:

- `src/app/[locale]/organizer/center/page.tsx`: legacy `primary/success/secondary`, Tailwind stock gray/green/red/blue status colors, and typo button token classes.
- `src/app/[locale]/organizer/reports/page.tsx`: hardcoded chart colors, inline chart style colors, legacy `primary/success/warning/secondary`.
- `src/app/[locale]/organizer/terms/page.tsx`: legacy `primary/warning/secondary`.
- `src/app/[locale]/organizer/account/page.tsx`: hardcoded gradient HEX colors, stock `bg-blue-500`, legacy `primary/success/warning/secondary`, and emoji-like inline icons.
- `src/app/[locale]/organizer/register/page.tsx`: legacy focus rings, `bg-secondary`, and typo button token classes.
- `src/app/[locale]/organizer/events/create/page.tsx`: legacy focus rings, `primary/secondary`, stock gray/red classes, and typo button token classes.

## Figma Reference Folder Map

Visual truth:

- `design-references/screens/hub`: Organizer Hub screenshots.
- `design-references/screens/event-detail`: Event Detail Workspace screenshots.
- `design-references/screens/create-event`: Create Event Wizard screenshots.
- In the current checkout, Create Event screenshots are located under `design-references/organizer/screens/event-detail/Create-Event-*.png`.

Reference-only code:

- `design-references/figma-code`: Figma-generated reference code.
- Expected specific reference files from the audit request were not present at the checked paths:
  - `design-references/README.md`
  - `design-references/figma-code/README.md`
  - `design-references/figma-code/src/app/App.tsx`
  - `design-references/figma-code/src/app/components/tokens.ts`
  - `design-references/figma-code/src/app/components/shell.tsx`
  - `design-references/figma-code/guidelines/Guidelines.md`
  - `design-references/figma-code/src/styles/theme.css`
  - `design-references/figma-code/src/styles/index.css`

Implementation rule:

- Screenshots are visual truth when available.
- Figma-generated code is reference only.
- Current EvoTicket_FE conventions, routing, auth, API client, and token pipeline are technical truth.

## Route Map

Existing routes:

- `src/app/[locale]/organizer/center/page.tsx`: Organizer Hub / My Events.
- `src/app/[locale]/organizer/reports/page.tsx`: Organizer-level reports.
- `src/app/[locale]/organizer/terms/page.tsx`: Organizer terms and policies.
- `src/app/[locale]/organizer/account/page.tsx`: Organizer account/profile.
- `src/app/[locale]/organizer/(create-flow)/events/create/page.tsx`: Focused Create Event Wizard without workspace sidebar.
- `src/app/[locale]/organizer/register/page.tsx`: Organizer registration.

Planned Event Detail Workspace routes:

- `src/app/[locale]/organizer/events/[eventId]/layout.tsx`
- `src/app/[locale]/organizer/events/[eventId]/overview/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/analytics/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/orders/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/attendees/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/checkin/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/checker-staff/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/seat-map/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/vouchers/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/edit/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/team/page.tsx`
- `src/app/[locale]/organizer/events/[eventId]/finance/page.tsx`

Navigation rule:

- Organizer Hub event cards should route to `/${locale}/organizer/events/${eventId}/overview`, not Buyer event detail routes.
- `OrganizerSidebar` is context-aware and switches modes based on the current route.
- Workspace mode renders the general Organizer navigation: My Events, reports, organizer terms, and account.
- Event detail mode is used for `/${locale}/organizer/events/${eventId}/...` routes, except `/${locale}/organizer/events/create`.
- Event detail navigation lives in the left sidebar, not as horizontal tabs inside the event content area.
- Event detail mode preserves the current locale and event id when linking to Overview, Analytics, Orders, Attendees, Check-in, Checker Staff, Seat Map, Vouchers, Edit, Team, and Finance.

## Component Map

Current shared Organizer components:

- `src/components/organizer/OrganizerHeader.tsx`: top workspace bar, search, create-event CTA, notifications, user/org avatar.
- `src/components/organizer/OrganizerSidebar.tsx`: Organizer primary navigation. It has two modes:
  - Workspace mode for Organizer Center, reports, terms, account, and create-event routes.
  - Event detail mode for `/${locale}/organizer/events/${eventId}/...`, where the left sidebar shows the event workspace sections and a separated back link to Organizer Center.

Recommended Organizer components to add during implementation:

- `OrganizerShell`: combines sidebar, header, responsive content wrapper, and auth guard.
- `OrganizerPageHeader`: title, subtitle, actions, breadcrumbs.
- `OrganizerStatCard`: compact metric card.
- `OrganizerStatusBadge`: tokenized status mapping for event, ticket, payment, check-in, approval, payout.
- `OrganizerEmptyState`: reusable empty state for hub tables/lists.
- `EventWorkspaceLayout`: event banner/header, event status, workspace tabs, quick actions.
- `EventWorkspaceNav`: tabs for overview, analytics, orders, attendees, check-in, checker staff, seat map, vouchers, edit, team, finance.
- `CreateEventWizardShell`: stepper, form container, sticky footer actions, draft autosave status.
- `CreateEventStepBasicInfo`
- `CreateEventStepTicketing`
- `CreateEventStepPolicies`
- `CreateEventStepPayout`
- `CreateEventStepReview`

Existing UI components in scope:

- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/CustomDatePicker.tsx`
- `src/components/ui/CustomTimePicker.tsx`
- `src/components/ui/odoMeterDigit.tsx`

Use `lucide-react` for icons, matching existing project conventions.

## Fixture Data Plan

Create fixtures only for Organizer screens that do not yet have stable API contracts or where backend endpoints are not ready.

Recommended fixture modules:

- `src/app/[locale]/organizer/_fixtures/events.ts`
- `src/app/[locale]/organizer/_fixtures/reports.ts`
- `src/app/[locale]/organizer/_fixtures/eventDetail.ts`
- `src/app/[locale]/organizer/_fixtures/createEventDraft.ts`

Fixture principles:

- Keep fixture shapes close to expected API DTOs.
- Include edge cases: no events, pending review, draft, published, cancelled, completed, sold out, resale enabled, check-in active, payout pending.
- Keep money as numbers in data and format in UI.
- Keep date/time as ISO strings in data and format in UI.
- Do not bake display-only Vietnamese labels into DTOs; map enum/status labels at the component layer.

## API Integration Plan

Existing API/auth conventions:

- `src/lib/axios.ts` creates a shared `api` client with `NEXT_PUBLIC_API_GATEWAY_BE`.
- Request interceptor injects `store.getState().auth.token` unless `skipAuth` is set.
- Response interceptor refreshes token through `/iam-service/api/auth/refresh-token` and dispatches `updateToken({ token, refreshToken })`.
- `src/lib/jwt.ts` decodes `isOrganization` and `organizationId`.
- `src/store/slices/authSlice.ts` persists `token`, `refreshToken`, `isOrganization`, and `organizationId`.

Current Organizer API touchpoints:

- Register organizer:
  - `GET /iam-service/api/locations/provinces`
  - `GET /iam-service/api/locations/wards?provinceCode=...`
  - `POST /iam-service/api/organizations`
- Organizer Hub:
  - `GET /inventory-service/api/events/my`
- Create Event:
  - `GET /inventory-service/api/categories`
  - `GET /iam-service/api/locations/provinces`
  - `GET /iam-service/api/locations/wards`
  - `POST /inventory-service/api/events`
  - `POST /inventory-service/api/upload/avatar`

Integration rules:

- Prefer the shared `api` interceptor instead of manually reading `Cookies.get("token")` in new code.
- Add small typed service modules when implementing screens, for example `organizerEventsApi`, `organizerReportsApi`, `organizerWorkspaceApi`.
- Keep DTO mapping at the API boundary. UI components should receive view models, not raw inconsistent backend envelopes.
- Organizer auth guard should read Redux auth state and route non-organizers to `/${locale}/organizer/register`.
- Create Event submit should eventually create a pending-review event, not publish immediately, unless backend requires an explicit status enum.
- Add loading, empty, error, and permission-denied states for every API-backed page.

Planned endpoint groups to confirm with backend:

- Event workspace summary: event profile, sales, ticket inventory, check-in summary, payout summary.
- Analytics: revenue time series, sales funnel, occupancy, check-in, resale/royalty.
- Orders: paginated orders/transactions with refund/payment status.
- Attendees: ticket holders, ticket status, export.
- Check-in: sessions/gates, QR scan logs, incident list.
- Checker staff: invitations, roles, active devices.
- Seat map: sections, rows, seats, holds, locks, pricing zones.
- Vouchers: promo codes, usage, constraints.
- Edit event: draft update, submit for review.
- Team: members, roles, permissions.
- Finance: settlement batches, payout method, invoices, adjustments.

## Event Detail Workspace Implementation

Implemented event-level route layout:

- `src/app/[locale]/organizer/(workspace)/events/[eventId]/layout.tsx`

The nested event layout renders only event-level UI:

- Event title and status.
- Date, venue, category, capacity, and settlement summary.
- Quick actions for public page and edit.

It intentionally does not render `OrganizerSidebar`, `OrganizerHeader`, or `OrganizerPageShell`; those remain owned by `src/app/[locale]/organizer/(workspace)/layout.tsx`.

Event section navigation is owned by `src/components/organizer/OrganizerSidebar.tsx` when the current route is an event detail route. The event layout must not render horizontal section tabs.

Event detail route map:

- `/[locale]/organizer/events/[eventId]/overview` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/overview/page.tsx`
- `/[locale]/organizer/events/[eventId]/analytics` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/analytics/page.tsx`
- `/[locale]/organizer/events/[eventId]/orders` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/orders/page.tsx`
- `/[locale]/organizer/events/[eventId]/attendees` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/attendees/page.tsx`
- `/[locale]/organizer/events/[eventId]/checkin` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/checkin/page.tsx`
- `/[locale]/organizer/events/[eventId]/checker-staff` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/checker-staff/page.tsx`
- `/[locale]/organizer/events/[eventId]/seat-map` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/seat-map/page.tsx`
- `/[locale]/organizer/events/[eventId]/vouchers` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/vouchers/page.tsx`
- `/[locale]/organizer/events/[eventId]/edit` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/edit/page.tsx`
- `/[locale]/organizer/events/[eventId]/team` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/team/page.tsx`
- `/[locale]/organizer/events/[eventId]/finance` -> `src/app/[locale]/organizer/(workspace)/events/[eventId]/finance/page.tsx`

Implemented screens:

- Overview: KPI strip, sales/check-in/resale snapshots, recent activity, quick access panel.
- Analytics: revenue and ticket velocity charts with Recharts, occupancy table.
- Orders & Transactions: fixture-backed order/payment/mint table with loading, empty, and error states.
- Attendees & Tickets: fixture-backed ticket holder table with loading, empty, and error states.
- Check-in Management: KPI strip and gate stats panel.
- Checker Staff: fixture-backed checker staff table with loading, empty, and error states.
- Seat Map Management: zone table and seat map preview.
- Voucher & Promotion: fixture-backed campaign table with loading, empty, and error states.
- Event Edit: tokenized event edit form shell, fixture-only.
- Team & Permissions: fixture-backed team member table with loading, empty, and error states.
- Finance & Settlement: finance summary cards and settlement batch table with loading, empty, and error states.

Fixture data location:

- `src/app/[locale]/organizer/_fixtures/eventDetail.ts`

Screens still waiting for API support:

- All Event Detail Workspace screens are currently fixture-only.
- Required backend support remains the endpoint groups listed in the API plan: workspace summary, analytics, orders, attendees, check-in, checker staff, seat map, vouchers, edit/review submission, team permissions, and finance settlement.

## Create Event Wizard Plan

Step 1: Basic event information

- Name, category, event type, description, banner, thumbnail, venue/address, location, schedule.

Step 2: Showtime / ticket type / seat map

- Showtime list, ticket types, prices, quantities, sale window, per-user limits, optional seat map/pricing zones.

Step 3: Event settings / policies / resale / check-in rules

- Refund policy, resale toggle and royalty, check-in window, QR rules, transfer rules, visibility.

Step 4: Organizer payout / settlement information

- Legal entity, payout method, tax info, invoice address, settlement contact.

Step 5: Review & submit

- Read-only summary, warnings, missing field list, submit for admin review.

Submit result:

- Show "Pending admin review" state.
- Link back to Organizer Hub and the Event Detail Workspace overview.

## Create Event Wizard Fix Plan

Current route path:

- The create event page currently lives at `src/app/[locale]/organizer/(workspace)/events/create/page.tsx`.
- Because it is inside `(workspace)`, it inherits `src/app/[locale]/organizer/(workspace)/layout.tsx`, which renders `OrganizerSidebar`, `OrganizerHeader`, and the workspace scroll container.

Why the sidebar must be removed:

- The create-event flow is a focused wizard, not a workspace management page.
- The Figma Create Event screens show a full-width creation surface with a top wizard header, stepper, right-side draft checklist, and footer actions.
- The Organizer workspace sidebar and event-detail sidebar are not part of this flow and create a misleading navigation context.

New route group plan:

- Move the create route to `src/app/[locale]/organizer/(create-flow)/events/create/page.tsx`.
- Keep the public URL unchanged: `/${locale}/organizer/events/create`.
- The `(create-flow)` route group must not render `OrganizerSidebar`, event-detail sidebar navigation, or the workspace left navigation.
- A `(create-flow)/layout.tsx` is optional and should remain minimal if added; the existing create wizard shell already owns the focused top bar and stepper.
- Remove the old workspace create route after the move to avoid duplicate route conflicts.

Step 1 event type rule:

- `Offline` is enabled and selected by default.
- `Online` is visible but disabled.
- `Hybrid` is visible but disabled.
- Disabled options must not change wizard state and should expose disabled/ARIA-disabled semantics.
- Wizard state must always store `eventType: "OFFLINE"` and submit logic must not allow `ONLINE` or `HYBRID`.

Step 1 category chips to add:

- Required field label: `Thể loại sự kiện *`.
- Supported backend enum-compatible values:
  - `LIVESTAGE` -> `Nhạc sống / Concert`
  - `STAGE_ART` -> `Sân khấu / Nghệ thuật`
  - `WORKSHOP` -> `Workshop / Hội thảo`
  - `SPORTS` -> `Thể thao`
  - `EXHIBITION` -> `Triển lãm`
- Only one category can be selected.
- Store the selected category in wizard state as `category: "LIVESTAGE" | "STAGE_ART" | "WORKSHOP" | "SPORTS" | "EXHIBITION"`.

Category validation:

- Category is required before Step 1 can advance to Step 2.
- If missing and the user clicks Next, show an inline error near the category chip group and do not advance.
- The selected category must be preserved through Back/Next navigation and shown in the Step 5 review screen.

Files to move or modify:

- Move `src/app/[locale]/organizer/(workspace)/events/create/**` to `src/app/[locale]/organizer/(create-flow)/events/create/**`.
- Modify `useCreateEventWizard.ts` for OFFLINE-only state, category enum state, validation readiness, and API mapping readiness.
- Modify `components/CreateEventStep1BasicInfo.tsx` for disabled Online/Hybrid options and required category chips.
- Modify `page.tsx` for Step 1 validation and inline category errors.
- Modify `components/CreateEventStep5Review.tsx` to show event type and selected category.
- Keep Organizer CTAs linked to `/${locale}/organizer/events/create`; route groups do not affect the public URL.

## Create Event Wizard Fix Audit

Current Step 1 mismatch:

- The route is correctly under `src/app/[locale]/organizer/(create-flow)/events/create/page.tsx`, so it does not inherit the workspace sidebar.
- Step 1 currently has image, basic info, location, description, and organizer cards, but validation is partial and only blocks a few fields.
- Missing or invalid fields are not consistently marked with red field borders or inline messages.
- The screenshot includes a public-content warning near the event description area; current Step 1 only has an image warning.
- Offline is selected and Online/Hybrid are visible-disabled, which must be preserved.

Current Step 2 mismatch:

- Step 2 has showtime and ticket creation, but ticket types cannot be edited after creation.
- Sale-window validation is missing, including required start/end dates and checks against showtime start time.
- The screenshot shows a warning card for an invalid ticket sale window; current UI only warns when there are no tickets.
- Inline field errors and focus/scroll-to-first-invalid behavior are missing.

Current Step 3 mismatch:

- The URL slug input is present but has no strict slug validation.
- The screenshot shows gate rows with edit/delete actions and an add-gate affordance; current UI only has total gate and checker counts.
- Gate configuration is currently frontend-only and must stay preserved locally until backend endpoints exist.

Current Step 5 mismatch:

- Step 5 has a banner preview, but the screenshot shows both poster and cover previews in the event identity section.
- Step 5 should include selected category, Offline event type, location, showtime/ticket summaries, slug, gates, and payment readiness.
- Step 5 should be gated by global wizard validity before submit.

Current progress sidebar mismatch:

- The right-side progress panel currently uses a draft-progress calculation across mixed required fields and does not represent the active step.
- Expected behavior is current-step progress only: Step 1 public info, Step 2 showtimes/tickets, Step 3 slug/settings/gates, Step 4 settlement, Step 5 global readiness.
- The user should only be able to advance when the current step validates to 100%.

Files/components to modify:

- `src/app/[locale]/organizer/(create-flow)/events/create/page.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/useCreateEventWizard.ts`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventStep1BasicInfo.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventStep2Showtimes.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventStep3Settings.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventStep5Review.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventWizardShell.tsx`
- `src/app/[locale]/organizer/(create-flow)/events/create/components/CreateEventFooterActions.tsx`
- Add a create-flow validation helper for step validation, progress, first invalid field, and warning detection.

Validation and scrolling behavior to add:

- Centralize validation with `validateStep1`, `validateStep2`, `validateStep3`, `validateStep4`, `validateStep5`, `getStepProgress`, and `getFirstInvalidField`.
- Add `data-field` attributes for important fields/groups so the page can scroll and focus to the first invalid field.
- Focus native inputs when possible; focus chip/group containers with `tabIndex={-1}` when the invalid target is a group.
- Show inline errors and token-based red/error borders after the user tries to continue.

Unsupported backend fields that remain frontend-only for now:

- Gate names/codes/notes and checker planning.
- Resale policy details, royalty fee, external wallet toggle, and buyer-facing operational notes.
- Settlement profile selection and reconciliation notes.
- Seat map usage and seat map image state.
- Draft progress/checklist metadata and final review readiness indicators.

## Known Risks

- The requested Figma reference files were not present at the specified paths during this audit; verify the actual design-reference location before screen implementation.
- `asset/component.json` overrides both `component-light.json` and `component-dark.json` in `scripts/build-tokens.mjs`; changes to light/dark component files will not affect generated CSS while `component.json` exists.
- `lib/tailwind-theme.js` has variable-name drift for component colors compared with generated `--color-*` variables.
- Existing Organizer pages contain many legacy and hardcoded color usages; new code must not copy these patterns.
- Existing `register/page.tsx` dispatches `updateToken(newToken)` even though the reducer expects `{ token, refreshToken? }`. This should be fixed when touching registration behavior.
- Existing create-event behavior posts `eventStatus: "PUBLISHED"`; the target flow expects pending admin review.
- Hub event cards now link to the Organizer Event Detail Workspace overview route.
- Some pages contain mock data and random data generation, especially reports; this can produce unstable visuals and tests.
- Manual token usage in chart libraries needs a token helper or CSS variable reader to avoid hardcoded HEX colors.
- `api` already injects auth tokens, but existing Organizer pages also manually read cookies and pass auth headers.

## Quality Gates

- Do not change Buyer/Admin/Checker flows.
- Do not delete legacy tokens from `src/app/globals.css`.
- Do not add new hardcoded HEX colors in Organizer code.
- Do not add new legacy token usages in Organizer code.
- Keep TypeScript and lint status from getting worse.
- Before full screen implementation, run:
  - `npm run lint`
  - `npm run build` or at minimum `npx tsc --noEmit` if build is too slow.

## Create Event Visual Audit

### Step 1: Thông tin sự kiện
1. **Overall layout structure**: Full width container with max width, main content on left/center, stepper on top. Stepper: 1 (active) to 5.
2. **Header/title area**: "Tạo sự kiện - Bước 1 / 5", sub-text about entering info.
3. **Stepper**: Horizontal stepper at top.
4. **Main card/section structure**: 
   - Left column (main form): Three main cards. 1) "Hình ảnh sự kiện" (Poster and Cover), 2) "Thông tin cơ bản" (Name, Tagline, Type, Category), 3) "Địa điểm / nền tảng tổ chức" (Venue name, Province, Ward, Address, Map), 4) "Mô tả sự kiện" (Short summary, Detailed description rich text), 5) "Thông tin ban tổ chức" (Logo, Org name, Intro, Email, Phone).
   - Right column: "Trạng thái bản nháp" (progress 67% with checklist of poster, cover, etc.), "Yêu cầu hình ảnh" (requirements box).
   - Sticky footer with "Lưu nháp" and "Tiếp tục".
5. **Form field groups**: Poster upload, Cover upload. Name, short description, offline/online/hybrid toggle, categories pills. Location dropdowns and map. Description rich text editor. Org contact info.
6. **Primary/secondary actions**: Header has "Lưu nháp" (top right). Footer has "Lưu nháp" (ghost/secondary) and "Tiếp tục" (primary).
7. **Empty/upload states**: Poster shows upload zone with "Kéo thả hoặc nhấn để tải lên". Cover is similar.
8. **Spacing/card hierarchy**: Gap between cards looks like 24px/32px. Cards have surface background (`bg-bg-surface` or similar) with subtle border.
9. **Components to reuse**: `src/components/MapPicker.tsx` for map, `src/components/ui/dropdown-menu` or select for location. Upload zones.

### Step 2: Suất diễn & Loại vé
1. **Overall layout structure**: Stepper 2 is active. Top has 4 summary stat cards. Warning banner. Below is split view: Left sidebar for "Danh sách suất diễn", Right panel for "Loại vé của suất diễn".
2. **Main card/section structure**: 
   - Stat cards on top.
   - Left side: "Danh sách suất diễn". "Thêm suất diễn" button. Cards for each showtime.
   - Right side: Shows tickets for the selected showtime. Button "Tạo loại vé". Table/list of tickets.
   - Modal/Panel: "Tạo loại vé mới" inline form. Fields: Name, Description, Price, Free ticket toggle, Total quantity, Min/Max per order, Sale start/end date.
   - Bottom area: "Mô hình chỗ ngồi" card (Toggle use/don't use seat map).
3. **Components to reuse**: `CustomDatePicker`, `CustomTimePicker` for showtimes and sale dates. Switch component for free tickets and seat map. 

### Step 3: Cài đặt
1. **Overall layout structure**: Stepper 3 is active.
2. **Main card/section structure**: 
   - Left: Form cards. 1) "Công bố sự kiện" 2) "Quy tắc bán vé" 3) "Chính sách resale & blockchain" 4) "Cấu hình vận hành tại cổng" 5) "Hướng dẫn cho người mua".
   - Right: "Kiểm tra cài đặt" checklist, warnings.
3. **Form field groups**: Toggles, Textareas, Selects.
4. **Primary/secondary actions**: Quay lại, Lưu nháp, Tiếp tục.

### Step 4: Hồ sơ thanh toán áp dụng
1. **Overall layout structure**: Stepper 4 is active.
2. **Main card/section structure**:
   - Left: 1) "Hồ sơ hiện tại của tổ chức" 2) "Áp dụng cho sự kiện này" 3) "Ghi chú đối soát" 4) "Trạng thái sẵn sàng" 5) "Quản lý hồ sơ thanh toán".
   - Right: "Tóm tắt hồ sơ".
3. **Primary/secondary actions**: Quay lại, Lưu nháp, Tiếp tục.

### Step 5: Review & Submit
1. **Overall layout structure**: Stepper 5 is active. Final review before submission.
2. **Main card/section structure**:
   - Left: Read-only summaries. "Nhận diện sự kiện", "Suất diễn & vé", "Công bố & Resale", "Thanh toán & Pháp lý", "Kiểm tra trước khi gửi".
   - Bottom footer: "Quay lại chỉnh sửa", "Lưu nháp", "Gửi duyệt sự kiện".
   - Right: "Kết quả sau khi gửi", "Checklist cuối cùng".
3. **Primary/secondary actions**: Gửi duyệt sự kiện.

### Submit Success Screen: Pending admin review
1. **Overall layout structure**: Centered success message in top card, summary cards below.
2. **Main card/section structure**: 
   - Top card: Green check icon, "Sự kiện đã được gửi duyệt".
   - Left column: "Thông tin sự kiện" summary. "Quy trình duyệt sự kiện". "Tiếp theo".
   - Right column: "Ý nghĩa các trạng thái", "Lưu ý".
3. **Primary actions**: Vào quản trị sự kiện, Quay về danh sách sự kiện.

### Wizard State Shape (to map to API later)
- `eventName`, `description`, `venue`, `wardCode`, `provinceCode`, `address`, `eventType`, `category`.
- `showtimes`: `startDatetime`, `endDatetime`, `ticketTypes`.
- `ticketTypes`: `typeName`, `description`, `price`, `quantityTotal`, `minPurchase`, `maxPurchase`, `saleStartDate`, `saleEndDate`.
- Images: `bannerImage`, `thumbnailImage`, `seatMapImage`.

### Unsupported UI Fields (Pending backend support)
- Resale price cap, resale policy, refund policy, checker assignment rule, settlement/bank info, team permissions, advanced approval workflow. Keep in local state for UI completeness.

## Create Event Wizard Implemented Fixes

- Step 1 now includes the public-content warning card near the event description area. Required fields use inline error messages, token-based error borders, and first-invalid scroll/focus behavior when the user tries to continue.
- Event type remains OFFLINE-only. Offline is enabled and selected; Online and Hybrid remain visible but disabled and cannot change wizard state.
- Step 2 validates showtime start/end, ticket names, quantities, purchase limits, sale windows, and sale-end timing against showtime start. Invalid sale windows block progress, while suspicious timing can surface a warning card.
- Ticket types can be created, edited, saved, cancelled, and deleted per showtime. Editing preserves the local ticket id and updates the existing ticket instead of duplicating it.
- Step 3 validates the public slug with `^[a-z0-9]+(?:-[a-z0-9]+)*$`, blocks uppercase, accents, spaces, underscores, URL strings, special characters, leading/trailing hyphens, and consecutive hyphens.
- Step 3 now supports frontend-only gate add/edit/delete behavior. Gate name is required, and gate code accepts uppercase letters, numbers, and hyphens with no spaces.
- Step 5 now shows poster and cover previews from local file state, falls back to placeholders when images are missing, and includes configured gates in the review summary.
- The right-side progress panel now reports progress for the current step only through `getStepProgress(step, wizardState)`. Navigation validates the active step and blocks Next/Submit until that step is complete.
- Unsupported backend fields remain frontend-only for now: gate configuration, resale settings, refund policy details, checker assignment preferences, buyer guidance, settlement profile selection, and review warnings.
