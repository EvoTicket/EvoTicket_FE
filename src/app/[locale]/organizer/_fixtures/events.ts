/**
 * Organizer event fixtures — mock data for Hub screens.
 * Shapes approximate expected API DTOs.
 */

export type OrgEventStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "ON_SALE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type SaleStatus =
  | "On sale"
  | "Not on sale"
  | "Draft"
  | "Closed";

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
  sold: number | null;
  total: number | null;
  revenue: string;
  checkerCount: number;
  updatedLabel: string;
}

export const FIXTURE_EVENTS: OrgFixtureEvent[] = [
  {
    id: "e1",
    title: "Anh Trai Say Hi Concert 2026",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=240&q=80",
    categoryName: "Livestage",
    mode: "Offline",
    venue: "Nhà thi đấu Phú Thọ",
    dateLabel: "26/04/2026 · 19:30",
    eventStatus: "ON_SALE",
    saleStatus: "On sale",
    sold: 4280,
    total: 8000,
    revenue: "5.4 tỷ",
    checkerCount: 12,
    updatedLabel: "Cập nhật 2 giờ trước",
  },
  {
    id: "e2",
    title: "Blockchain Ticketing Workshop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e4?w=240&q=80",
    categoryName: "Hội thảo & Workshop",
    mode: "Offline",
    venue: "HCMUT Hall A5",
    dateLabel: "12/05/2026 · 08:30",
    eventStatus: "PENDING_REVIEW",
    saleStatus: "Not on sale",
    sold: 0,
    total: 250,
    revenue: "0 đ",
    checkerCount: 0,
    updatedLabel: "Cập nhật 1 ngày trước",
  },
  {
    id: "e3",
    title: "Creative Expo 2026",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=240&q=80",
    categoryName: "Triển lãm / Trải nghiệm",
    mode: "Hybrid",
    venue: "SECC + Livestream",
    dateLabel: "03/06/2026 · 09:00",
    eventStatus: "DRAFT",
    saleStatus: "Draft",
    sold: null,
    total: null,
    revenue: "—",
    checkerCount: 0,
    updatedLabel: "Cập nhật 4 giờ trước",
  },
  {
    id: "e4",
    title: "Startup Finance Forum",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=240&q=80",
    categoryName: "Hội thảo & Workshop",
    mode: "Online",
    venue: "Zoom Webinar",
    dateLabel: "18/03/2026 · 19:00",
    eventStatus: "COMPLETED",
    saleStatus: "Closed",
    sold: 620,
    total: 700,
    revenue: "186 triệu",
    checkerCount: 0,
    updatedLabel: "Cập nhật 5 ngày trước",
  },
];

export const FIXTURE_TABS = [
  { key: "all", label: "Tất cả", count: 12 },
  { key: "draft", label: "Nháp", count: 1 },
  { key: "pending", label: "Chờ duyệt", count: 2 },
  { key: "upcoming", label: "Sắp diễn ra", count: 3 },
  { key: "onsale", label: "Đang mở bán", count: 4 },
  { key: "ended", label: "Đã kết thúc", count: 5 },
];

export const FIXTURE_SUMMARY = [
  { label: "Tổng sự kiện", value: "12", tone: "brand" as const },
  { label: "Đang mở bán", value: "4", tone: "success" as const },
  { label: "Chờ duyệt", value: "2", tone: "warning" as const },
  { label: "Đã kết thúc", value: "5", tone: "neutral" as const },
];

/** Fixture state toggle — change to test loading / empty / error */
export type FixtureState = "loaded" | "loading" | "empty" | "error";
export const FIXTURE_PAGE_STATE: FixtureState = "loaded";
