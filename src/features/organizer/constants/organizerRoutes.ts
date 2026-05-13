import type { EventNavItem } from "../types/organizer";

export const ORGANIZER_WORKSPACE_NAV_ITEMS = [
  { key: "center", label: "Sự kiện của tôi", href: "center" },
  { key: "reports", label: "Quản lý báo cáo", href: "reports" },
  { key: "terms", label: "Điều khoản cho Ban tổ chức", href: "terms" },
  { key: "account", label: "Tài khoản", href: "account" },
] as const;

export const EVENT_NAV_ITEMS: EventNavItem[] = [
  { key: "overview", label: "Overview", href: "overview", group: "operations" },
  { key: "analytics", label: "Analytics", href: "analytics", group: "operations" },
  { key: "orders", label: "Orders", href: "orders", group: "operations" },
  { key: "attendees", label: "Attendees", href: "attendees", group: "operations" },
  { key: "checkin", label: "Check-in", href: "checkin", group: "operations" },
  { key: "checker-staff", label: "Checker Staff", href: "checker-staff", group: "operations" },
  { key: "seat-map", label: "Seat Map", href: "seat-map", group: "operations" },
  { key: "vouchers", label: "Vouchers", href: "vouchers", group: "operations" },
  { key: "edit", label: "Edit", href: "edit", group: "operations" },
  { key: "team", label: "Team", href: "team", group: "operations" },
  { key: "finance", label: "Finance", href: "finance", group: "finance" },
];

export function organizerCenterPath(locale: string) {
  return `/${locale}/organizer/center`;
}

export function organizerCreateEventPath(locale: string) {
  return `/${locale}/organizer/events/create`;
}

export function organizerEventSectionPath(
  locale: string,
  eventId: string,
  section: string,
) {
  return `/${locale}/organizer/events/${eventId}/${section}`;
}
