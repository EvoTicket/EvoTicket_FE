export type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "brand"
  | "accent";

export type OrgEventStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "ON_SALE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type SaleStatus = "On sale" | "Not on sale" | "Draft" | "Closed";

export type EventMode = "Offline" | "Online" | "Hybrid";

export interface OrgFixtureEvent {
  id: string;
  title: string;
  thumbnailUrl: string;
  categoryName: string;
  mode: EventMode;
  venue: string;
  dateLabel: string;
  eventStatus: OrgEventStatus;
  saleStatus: SaleStatus;
  rawStatus?: string | null;
  rawApprovalStatus?: string | null;
  displayStatus?: string;
  displayStatusLabel?: string;
  displayStatusTone?: StatusTone;
  sold: number | null;
  total: number | null;
  revenue: string;
  checkerCount: number;
  updatedLabel: string;
}

export type EventSectionKey =
  | "overview"
  | "analytics"
  | "orders"
  | "attendees"
  | "checkin"
  | "checker-staff"
  | "seat-map"
  | "vouchers"
  | "edit"
  | "team"
  | "finance";

export type FixtureState = "loaded" | "loading" | "empty" | "error";

export interface EventNavItem {
  key: EventSectionKey;
  label: string;
  href: string;
  group: "operations" | "finance";
}

export interface EventMetric {
  label: string;
  value: string;
  helper?: string;
  tone: StatusTone;
}

export interface EventTableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "right" | "center";
}
