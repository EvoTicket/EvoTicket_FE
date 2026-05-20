import type {
  OrganizerDashboardMetricsResponse,
  ListEventResponse,
} from "./types/api";
import type {
  OrgFixtureEvent,
  OrgEventStatus,
  SaleStatus,
  StatusTone,
} from "./types/organizer";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=240&q=80";

type Nullable<T> = T | null | undefined;

type ApiListEvent = ListEventResponse & {
  id?: number | string | null;

  // Old / generic names
  eventName?: string | null;
  title?: string | null;
  thumbnailImage?: string | null;
  bannerImage?: string | null;
  eventType?: string | null;
  eventStatus?: string | null;
  startDatetime?: string | null;
  endDatetime?: string | null;
  totalSeats?: number | string | null;
  ticketAvailabilityStatus?: string | null;
  fullAddress?: string | null;
  provinceName?: string | null;

  // Current organizer dashboard API names
  name?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  type?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  status?: string | null;
  approvalStatus?: string | null;
  soldTickets?: number | string | null;
  totalTickets?: number | string | null;
  revenue?: number | string | null;
  totalCheckers?: number | string | null;
  checkers?: number | string | null;
  updatedAt?: string | null;
};

type DashboardLike = OrganizerDashboardMetricsResponse &
  Partial<{
    totalRevenue: number | string | null;
    totalTicketsSold: number | string | null;
    avgOccupancyRate: number | null;
    avgCheckInRate: number | null;
    resaleVolume: number | string | null;
    royaltyFee: number | string | null;
    revenueTrend: Array<{
      day?: string | number | null;
      revenue?: number | string | null;
    }>;
    ticketSalesByEvent: Array<{
      name?: string | null;
      tickets?: number | null;
    }>;
    occupancyByCategory: Array<{
      name?: string | null;
      value?: number | null;
      color?: string;
    }>;
    checkInStatus: {
      checkedIn?: number | null;
      notCheckedIn?: number | null;
      peakGateTime?: string | null;
    };
    performanceTable: Array<{
      name?: string | null;
      type?: string | null;
      sold?: string | null;
      occupancy?: string | null;
      revenue?: string | null;
      checkin?: string | null;
      resale?: string | null;
      royalty?: string | null;
      status?: string | null;
    }>;
  }>;

function toNumber(value: Nullable<number | string>): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNonEmptyString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function formatNumber(value: Nullable<number | string>): string {
  const numberValue = toNumber(value);
  return numberValue == null ? "—" : numberValue.toLocaleString("vi-VN");
}

function formatMoney(value: Nullable<number | string>): string {
  const numberValue = toNumber(value);

  if (numberValue == null) {
    return "—";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function formatPercent(value: Nullable<number>): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}%`
    : "—";
}

function formatDateTime(value: Nullable<string>): string {
  if (!value) {
    return "Chưa có lịch";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Inventory backend có 2 trục:
 * - approvalStatus: PENDING_REVIEW / PUBLISHED / REJECTED
 * - status: UPCOMING / ON_SALE / SALE_CLOSED / ON_GOING / COMPLETED / CANCELLED
 *
 * OrgEventStatus hiện tại của FE là model cũ, nên mapper cần ép về các status FE đang hiểu.
 * Nếu muốn hiển thị đầy đủ UPCOMING / SALE_CLOSED / ON_GOING thì cần sửa thêm
 * OrgEventStatus + OrganizerEventCard.
 */
function normalizeEventStatus(
  status: Nullable<string>,
  approvalStatus: Nullable<string>
): OrgEventStatus {
  const normalizedStatus = status?.toUpperCase();
  const normalizedApprovalStatus = approvalStatus?.toUpperCase();

  if (normalizedStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (normalizedApprovalStatus === "REJECTED") {
    return "REJECTED";
  }

  if (normalizedApprovalStatus === "PENDING_REVIEW") {
    return "PENDING_REVIEW";
  }

  if (normalizedApprovalStatus === "DRAFT") {
    return "DRAFT";
  }

  switch (normalizedStatus) {
    case "DRAFT":
      return "DRAFT";

    case "PENDING_REVIEW":
      return "PENDING_REVIEW";

    case "APPROVED":
      return "APPROVED";

    case "ON_SALE":
      return "ON_SALE";

    case "COMPLETED":
      return "COMPLETED";

    case "CANCELLED":
      return "CANCELLED";

    case "REJECTED":
      return "REJECTED";

    case "UPCOMING":
      return "APPROVED";

    case "SALE_CLOSED":
      return "APPROVED";

    case "ON_GOING":
      return "ON_SALE";

    case "ACTIVE":
    case "PUBLISHED":
      return "ON_SALE";

    case "ENDED":
      return "COMPLETED";

    default:
      return normalizedApprovalStatus === "PUBLISHED" ? "APPROVED" : "DRAFT";
  }
}

function getOrganizerDisplayStatus(params: {
  status?: string | null;
  approvalStatus?: string | null;
}): {
  key: string;
  label: string;
  tone: StatusTone;
} {
  const status = params.status?.toUpperCase();
  const approvalStatus = params.approvalStatus?.toUpperCase();

  if (approvalStatus === "PENDING_REVIEW") {
    return {
      key: "PENDING",
      label: "Chờ duyệt",
      tone: "info" as const,
    };
  }

  if (approvalStatus === "REJECTED") {
    return {
      key: "REJECTED",
      label: "Bị từ chối",
      tone: "error" as const,
    };
  }

  if (approvalStatus === "DRAFT") {
    return {
      key: "DRAFT",
      label: "Bản nháp",
      tone: "neutral" as const,
    };
  }

  if (status === "CANCELLED") {
    return {
      key: "CANCELLED",
      label: "Đã hủy",
      tone: "error" as const,
    };
  }

  if (status === "ON_SALE") {
    return {
      key: "ON_SALE",
      label: "Đang mở bán",
      tone: "success" as const,
    };
  }

  if (status === "ON_GOING") {
    return {
      key: "ON_GOING",
      label: "Đang diễn ra",
      tone: "success" as const,
    };
  }

  if (status === "COMPLETED") {
    return {
      key: "COMPLETED",
      label: "Đã kết thúc",
      tone: "neutral" as const,
    };
  }

  if (status === "SALE_CLOSED") {
    return {
      key: "SALE_CLOSED",
      label: "Đã đóng bán",
      tone: "warning" as const,
    };
  }

  if (status === "UPCOMING") {
    return {
      key: "UPCOMING",
      label: "Sắp diễn ra",
      tone: "brand" as const,
    };
  }

  return {
    key: "UNKNOWN",
    label: "Không xác định",
    tone: "neutral" as const,
  };
}

function modeLabel(value: Nullable<string>): OrgFixtureEvent["mode"] {
  const upper = value?.toUpperCase();

  if (upper === "ONLINE") {
    return "Online";
  }

  if (upper === "HYBRID") {
    return "Hybrid";
  }

  return "Offline";
}

function venueLabel(event: ApiListEvent): string {
  return (
    event.venue ||
    event.fullAddress ||
    event.provinceName ||
    "Chưa cập nhật địa điểm"
  );
}

function saleStatusFromEvent(params: {
  status?: string | null;
  approvalStatus?: string | null;
  eventStatus: OrgEventStatus;
  availability?: string | null;
}): SaleStatus {
  const status = params.status?.toUpperCase();
  const approvalStatus = params.approvalStatus?.toUpperCase();
  const availability = params.availability?.toUpperCase();

  if (approvalStatus === "PENDING" || approvalStatus === "REJECTED") {
    return "Not on sale";
  }

  if (status === "ON_SALE" || availability === "ON_SALE") {
    return "On sale";
  }

  if (
    status === "SALE_CLOSED" ||
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    availability === "CLOSED"
  ) {
    return "Closed";
  }

  if (params.eventStatus === "DRAFT") {
    return "Draft";
  }

  return "Not on sale";
}

export function mapListEventToOrganizerCard(
  event: ListEventResponse
): OrgFixtureEvent {
  const raw = event as ApiListEvent;

  const backendStatus = raw.status ?? raw.eventStatus;
  const backendApprovalStatus = raw.approvalStatus;

  const eventStatus = normalizeEventStatus(
    backendStatus,
    backendApprovalStatus
  );
  const displayStatus = getOrganizerDisplayStatus({
    status: backendStatus,
    approvalStatus: backendApprovalStatus,
  });

  const total =
    toNumber(raw.totalTickets) ??
    toNumber(raw.totalSeats);

  const sold = toNumber(raw.soldTickets);

  const title = toNonEmptyString(
    raw.name ?? raw.eventName ?? raw.title,
    "Sự kiện chưa đặt tên"
  );

  const thumbnailUrl =
    raw.thumbnailUrl ||
    raw.thumbnailImage ||
    raw.bannerImage ||
    DEFAULT_EVENT_IMAGE;

  const startDatetime =
    raw.startTime ||
    raw.startDatetime ||
    null;

  return {
    id: String(raw.id ?? "unknown"),
    title,
    thumbnailUrl,
    categoryName: raw.category || "Chưa phân loại",
    mode: modeLabel(raw.type ?? raw.eventType),
    venue: venueLabel(raw),
    dateLabel: formatDateTime(startDatetime),

    /**
     * Badge chính của event card.
     * Vì OrgFixtureEvent hiện tại vẫn dùng enum cũ,
     * ta normalize status backend về status FE đang hiểu.
     */
    eventStatus,
    rawStatus: backendStatus ?? null,
    rawApprovalStatus: backendApprovalStatus ?? null,
    displayStatus: displayStatus.key,
    displayStatusLabel: displayStatus.label,
    displayStatusTone: displayStatus.tone,

    /**
     * saleStatus chỉ nên mô tả trạng thái bán vé rút gọn.
     * Không được gán getOrganizerDisplayStatus ở đây.
     */
    saleStatus: saleStatusFromEvent({
      status: backendStatus,
      approvalStatus: backendApprovalStatus,
      eventStatus,
      availability: raw.ticketAvailabilityStatus,
    }),

    sold,
    total,
    revenue: formatMoney(raw.revenue),
    checkerCount: toNumber(raw.totalCheckers ?? raw.checkers) ?? 0,
    updatedLabel: raw.updatedAt
      ? `Cập nhật ${formatDateTime(raw.updatedAt)}`
      : "Chưa có cập nhật",
  };
}

export function mapDashboardKpis(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  return [
    {
      label: "Tổng doanh thu",
      value: formatMoney(raw?.totalRevenue),
      delta: undefined,
      tone: "success" as StatusTone,
    },
    {
      label: "Số vé đã bán",
      value: formatNumber(raw?.totalTicketsSold),
      delta: undefined,
      tone: "success" as StatusTone,
    },
    {
      label: "Tỷ lệ lấp đầy TB",
      value: formatPercent(raw?.avgOccupancyRate),
      delta: undefined,
      tone: "brand" as StatusTone,
    },
    {
      label: "Tỷ lệ check-in TB",
      value: formatPercent(raw?.avgCheckInRate),
      delta: undefined,
      tone: "warning" as StatusTone,
    },
    {
      label: "Volume resale",
      value: formatNumber(raw?.resaleVolume),
      delta: undefined,
      tone: "info" as StatusTone,
    },
    {
      label: "Royalty fee",
      value: formatMoney(raw?.royaltyFee),
      delta: undefined,
      tone: "accent" as StatusTone,
    },
  ];
}

export function mapRevenueTrend(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  return Array.isArray(raw?.revenueTrend)
    ? raw.revenueTrend.map((item, index) => ({
        day: String(item?.day ?? index + 1),
        rev: toNumber(item?.revenue) ?? 0,
      }))
    : [];
}

export function mapTicketSalesByEvent(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  if (!Array.isArray(raw?.ticketSalesByEvent)) return [];

  return raw.ticketSalesByEvent
    .map((item) => ({
      name: item?.name || "Chưa đặt tên",
      value: typeof item?.tickets === "number" ? item.tickets : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function mapOccupancyByCategory(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  return Array.isArray(raw?.occupancyByCategory)
    ? raw.occupancyByCategory.map((item) => ({
        name: item?.name || "Khác",
        value: typeof item?.value === "number" ? item.value : 0,
        color: item?.color,
      }))
    : [];
}

export function mapCheckInStatus(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  const checked =
    typeof raw?.checkInStatus?.checkedIn === "number"
      ? raw.checkInStatus.checkedIn
      : 0;

  const unchecked =
    typeof raw?.checkInStatus?.notCheckedIn === "number"
      ? raw.checkInStatus.notCheckedIn
      : 0;

  const total = checked + unchecked;
  const checkedPct = total > 0 ? Math.round((checked / total) * 100) : 0;

  return {
    checked: { value: checked, pct: checkedPct },
    unchecked: {
      value: unchecked,
      pct: total > 0 ? 100 - checkedPct : 0,
    },
    gateRate: formatPercent(raw?.avgCheckInRate),
    peakTime: raw?.checkInStatus?.peakGateTime || "—",
  };
}

export function mapPerformanceTable(
  data: OrganizerDashboardMetricsResponse | null | undefined
) {
  const raw = data as DashboardLike | null | undefined;

  return Array.isArray(raw?.performanceTable)
    ? raw.performanceTable.map((row) => ({
        event: row?.name || "Sự kiện chưa đặt tên",
        type: row?.type || "—",
        sold: row?.sold || "—",
        fill: row?.occupancy || "—",
        rev: row?.revenue || "—",
        checkin: row?.checkin || "—",
        resale: row?.resale || "—",
        royalty: row?.royalty || "—",
        status: row?.status || "—",
        tone: "neutral" as StatusTone,
      }))
    : [];
}

export function hasDashboardData(
  data: OrganizerDashboardMetricsResponse | null | undefined
): boolean {
  const raw = data as DashboardLike | null | undefined;

  if (!raw) {
    return false;
  }

  return Boolean(
    raw.totalRevenue != null ||
      raw.totalTicketsSold != null ||
      raw.avgOccupancyRate != null ||
      raw.avgCheckInRate != null ||
      raw.resaleVolume != null ||
      raw.royaltyFee != null ||
      (Array.isArray(raw.revenueTrend) && raw.revenueTrend.length > 0) ||
      (Array.isArray(raw.occupancyByCategory) &&
        raw.occupancyByCategory.length > 0) ||
      (Array.isArray(raw.ticketSalesByEvent) &&
        raw.ticketSalesByEvent.length > 0) ||
      (Array.isArray(raw.performanceTable) &&
        raw.performanceTable.length > 0)
  );
}

export { formatMoney, formatNumber };
