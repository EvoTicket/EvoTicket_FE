"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { OrganizerTabs } from "@/src/features/organizer/components/hub/OrganizerTabs";
import { OrganizerToolbar, type FilterOption } from "@/src/features/organizer/components/common/OrganizerToolbar";
import { OrganizerMetricCard } from "@/src/features/organizer/components/common/OrganizerMetricCard";
import { OrganizerEventCard } from "@/src/features/organizer/components/hub/OrganizerEventCard";
import { OrganizerEmptyState } from "@/src/features/organizer/components/common/OrganizerEmptyState";
import { organizerEventApi } from "@/src/features/organizer/api/organizerEventApi";
import { mapListEventToOrganizerCard } from "@/src/features/organizer/mappers";

import type { OrganizerEventListParams } from "@/src/features/organizer/types/api";
import type { OrgFixtureEvent } from "@/src/features/organizer/types/organizer";

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: "category",
    label: "Loại sự kiện",
    options: [
      { value: "LIVESTAGE", label: "Sân khấu / Âm nhạc" },
      { value: "STAGE_ART", label: "Nghệ thuật sân khấu" },
      { value: "WORKSHOP", label: "Workshop" },
      { value: "SPORTS", label: "Thể thao" },
      { value: "EXHIBITION", label: "Triển lãm" },
    ],
  },
  {
    key: "eventType",
    label: "Hình thức",
    options: [
      { value: "OFFLINE", label: "Trực tiếp" },
      { value: "ONLINE", label: "Trực tuyến" },
      { value: "HYBRID", label: "Kết hợp" },
    ],
  },
  // {
  //   key: "timeRange",
  //   label: "Thời gian",
  //   options: [
  //     { value: "TODAY", label: "Hôm nay" },
  //     { value: "THIS_WEEK", label: "Tuần này" },
  //     { value: "THIS_MONTH", label: "Tháng này" },
  //     { value: "NEXT_MONTH", label: "Tháng tới" },
  //   ],
  // },
  // {
  //   key: "status",
  //   label: "Trạng thái",
  //   options: [
  //     { value: "UPCOMING", label: "Sắp diễn ra" },
  //     { value: "ON_SALE", label: "Đang mở bán" },
  //     { value: "ON_GOING", label: "Đang diễn ra" },
  //     { value: "COMPLETED", label: "Đã kết thúc" },
  //     { value: "CANCELLED", label: "Đã hủy" },
  //   ],
  // },
];

const EMPTY_FILTERS: Record<string, string> = {};

/** Convert a human-friendly time-range key to ISO date strings for the API. */
function timeRangeToDateParams(
  timeRange: string | undefined
): Pick<OrganizerEventListParams, "startDate" | "endDate"> {
  if (!timeRange) return {};

  const now = new Date();
  const startOf = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const iso = (d: Date) => d.toISOString().split("T")[0];

  if (timeRange === "TODAY") {
    const today = iso(startOf(new Date()));
    return { startDate: today, endDate: today };
  }
  if (timeRange === "THIS_WEEK") {
    const monday = startOf(new Date());
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: iso(monday), endDate: iso(sunday) };
  }
  if (timeRange === "THIS_MONTH") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: iso(first), endDate: iso(last) };
  }
  if (timeRange === "NEXT_MONTH") {
    const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return { startDate: iso(first), endDate: iso(last) };
  }
  return {};
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
const EVENT_TABLE_GRID =
  "minmax(220px,2.2fr) minmax(160px,1.35fr) minmax(110px,0.75fr) minmax(120px,0.9fr) minmax(96px,0.7fr) 64px 112px";

type PageState = "loading" | "loaded" | "error";

type OrganizerCenterTab = {
  key: string;
  label: string;
  eventStatuses?: string[];
  approvalStatuses?: string[];
};

const STATUS_TABS: OrganizerCenterTab[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt", approvalStatuses: ["PENDING"] },
  { key: "upcoming", label: "Sắp diễn ra", approvalStatuses: ["ACCEPTED"], eventStatuses: ["UPCOMING", "SALE_CLOSED"] },
  { key: "onsale", label: "Đang mở bán", approvalStatuses: ["ACCEPTED"], eventStatuses: ["ON_SALE"] },
  { key: "ongoing", label: "Đang diễn ra", approvalStatuses: ["ACCEPTED"], eventStatuses: ["ON_GOING"] },
  { key: "ended", label: "Đã kết thúc", approvalStatuses: ["ACCEPTED"], eventStatuses: ["COMPLETED"] },
  { key: "rejected", label: "Bị từ chối", approvalStatuses: ["REJECTED"] },
  { key: "cancelled", label: "Đã hủy", eventStatuses: ["CANCELLED"] },
];

function toSafeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function buildListParams(
  tab: OrganizerCenterTab,
  keyword: string | undefined,
  selectedFilters: Record<string, string>,
  size: number
): OrganizerEventListParams {
  // Status: explicit filter overrides the tab's default
  const statusFilter = selectedFilters["status"];
  const eventStatuses = statusFilter ? [statusFilter] : tab.eventStatuses;

  return {
    keyword,
    eventStatuses,
    approvalStatuses: tab.approvalStatuses,
    // Category filter (Loại sự kiện) — maps to `categories` API param
    categories: selectedFilters["category"] ? [selectedFilters["category"]] : undefined,
    // Format filter (Hình thức) — maps to `eventTypes` API param
    eventTypes: selectedFilters["eventType"] ? [selectedFilters["eventType"]] : undefined,
    // Time range filter — maps to startDate / endDate
    ...timeRangeToDateParams(selectedFilters["timeRange"]),
    page: 1,
    size,
    sort: "NEWEST",
  };
}

export default function OrganizerCenterPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "vi";

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(EMPTY_FILTERS);
  const [pageState, setPageState] = useState<PageState>("loading");

  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});

  const [events, setEvents] = useState<OrgFixtureEvent[]>([]);

  const activeFilters = useMemo(
    () => STATUS_TABS.find((tab) => tab.key === activeTab) ?? STATUS_TABS[0],
    [activeTab]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadEvents = useCallback(async () => {
    setPageState("loading");

    const keyword = debouncedSearch || undefined;
    const requestParams = buildListParams(activeFilters, keyword, selectedFilters, PAGE_SIZE);

    try {
      const [dashboard, countDashboards] = await Promise.all([
        organizerEventApi.getOrganizerDashboard(requestParams),
        Promise.all(
          STATUS_TABS.map(async (tab) => {
            const countDashboard = await organizerEventApi.getOrganizerDashboard(
              buildListParams(tab, keyword, selectedFilters, 1)
            );
            return [
              tab.key,
              toSafeNumber(
                countDashboard.events?.totalElements,
                countDashboard.events?.content?.length ?? 0
              ),
            ] as const;
          })
        ),
      ]);

      const page = dashboard.events;
      const safeContent = Array.isArray(page?.content) ? page.content : [];

      setTabCounts(Object.fromEntries(countDashboards));

      setEvents(safeContent.map(mapListEventToOrganizerCard));
      setPageState("loaded");
    } catch (error) {
      console.error("Failed to load organizer events", error);

      setTabCounts({});
      setEvents([]);
      setPageState("error");
    }
  }, [activeFilters, debouncedSearch, selectedFilters]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadEvents();
    });

    return () => cancelAnimationFrame(frame);
  }, [loadEvents]);

  const tabs = useMemo(
    () =>
      STATUS_TABS.map((tab) => {
        return {
          key: tab.key,
          label: tab.label,
          count: tabCounts[tab.key] ?? 0,
        };
      }),
    [tabCounts]
  );

  const summary = useMemo(
    () => [
      {
        label: "Tổng sự kiện",
        value: String(tabCounts.all ?? 0),
        tone: "brand" as const,
      },
      {
        label: "Sắp diễn ra",
        value: String(tabCounts.upcoming ?? 0),
        tone: "brand" as const,
      },
      {
        label: "Đang mở bán",
        value: String(tabCounts.onsale ?? 0),
        tone: "success" as const,
      },
      {
        label: "Chờ duyệt",
        value: String(tabCounts.pending ?? 0),
        tone: "info" as const,
      },
      {
        label: "Đã kết thúc",
        value: String(tabCounts.ended ?? 0),
        tone: "neutral" as const,
      },
    ],
    [tabCounts]
  );

  const basePath = `/${locale}/organizer/events`;
  const createHref = `/${locale}/organizer/events/create`;

  const handleFilterChange = useCallback((key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedFilters(EMPTY_FILTERS);
  }, []);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
    setSearch("");
    setDebouncedSearch("");
    setSelectedFilters(EMPTY_FILTERS);
  }, []);

  if (pageState === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />

        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]"
            />
          ))}
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]"
          />
        ))}
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
        <div className="text-base font-medium text-[var(--color-feedback-error-text)]">
          Không thể tải dữ liệu sự kiện
        </div>

        <p className="text-[13px] text-[var(--color-text-muted)]">
          Vui lòng thử lại sau hoặc kiểm tra trạng thái đăng nhập của tài khoản tổ chức.
        </p>

        <Button
          type="button"
          variant="secondary"
          size="md"
          leftIcon={<RefreshCw />}
          onClick={loadEvents}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
            Sự kiện của tôi
          </h1>

          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            Quản lý toàn bộ sự kiện của tổ chức, từ chờ duyệt đến đã kết thúc.
          </p>
        </div>
      </div>

      <OrganizerTabs
        tabs={tabs}
        activeKey={activeTab}
        onTabChange={handleTabChange}
      />

      <OrganizerToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên, mô tả hoặc địa điểm sự kiện"
        filters={FILTER_OPTIONS}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <OrganizerMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            tone={item.tone}
          />
        ))}
      </div> */}

      {events.length === 0 ? (
        <OrganizerEmptyState
          title={
            search || Object.values(selectedFilters).some(Boolean)
              ? "Không tìm thấy sự kiện phù hợp"
              : "Chưa có sự kiện nào trong nhóm này"
          }
          description={
            search || Object.values(selectedFilters).some(Boolean)
              ? "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại."
              : "Danh sách sự kiện của tổ chức đang trống hoặc chưa có dữ liệu phù hợp với bộ lọc hiện tại."
          }
          onClear={clearFilters}
          createHref={createHref}
        />
      ) : (
        <div className="overflow-x-auto rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div
            className="grid min-w-[980px] items-center gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-3 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]"
            style={{
              gridTemplateColumns: EVENT_TABLE_GRID,
            }}
          >
            <span>Sự kiện</span>
            <span>Thời gian &amp; Địa điểm</span>
            <span>Trạng thái</span>
            <span>Vé bán ra</span>
            <span>Doanh thu</span>
            <span>Checker</span>
            <span className="text-right">Hành động</span>
          </div>

          {events.map((event, index) => (
            <OrganizerEventCard
              key={event.id}
              event={event}
              basePath={basePath}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
