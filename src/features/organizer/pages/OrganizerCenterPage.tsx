"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { OrganizerTabs } from "@/src/features/organizer/components/hub/OrganizerTabs";
import { OrganizerToolbar, type FilterOption } from "@/src/features/organizer/components/common/OrganizerToolbar";
import { OrganizerEventCard } from "@/src/features/organizer/components/hub/OrganizerEventCard";
import { OrganizerEmptyState } from "@/src/features/organizer/components/common/OrganizerEmptyState";
import { organizerEventApi } from "@/src/features/organizer/api/organizerEventApi";
import { mapListEventToOrganizerCard } from "@/src/features/organizer/mappers";
import { useTranslations } from "next-intl";

import type { OrganizerEventListParams } from "@/src/features/organizer/types/api";
import type { OrgFixtureEvent } from "@/src/features/organizer/types/organizer";

// ─── Constants ────────────────────────────────────────────────────────────────

// Will generate filter options using t() inside the component
// to avoid t() being called before hook init
const EMPTY_FILTERS: Record<string, string> = {};

// Fetch all events in one large page — FE will handle tab filtering
const PAGE_SIZE = 200;
const SEARCH_DEBOUNCE_MS = 350;
const EVENT_TABLE_GRID =
  "minmax(220px,2.2fr) minmax(160px,1.35fr) minmax(110px,0.75fr) minmax(120px,0.9fr) minmax(96px,0.7fr) 64px 112px";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = "idle" | "error";

type OrganizerCenterTab = {
  key: string;
  label: string;
  /** rawApprovalStatus values to include (e.g. PENDING_REVIEW, PUBLISHED, REJECTED) */
  approvalStatuses?: string[];
  /** rawStatus values to include (e.g. UPCOMING, ON_SALE, ON_GOING, COMPLETED, CANCELLED) */
  eventStatuses?: string[];
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

// Tab definitions without label (labels will be injected via translation)
const STATUS_TABS: OrganizerCenterTab[] = [
  { key: "all", label: "all" },
  
  // Approval statuses
  { key: "draft", label: "draft", approvalStatuses: ["DRAFT"] },
  { key: "pending", label: "pending", approvalStatuses: ["PENDING_REVIEW"] },
  { key: "published", label: "published", approvalStatuses: ["PUBLISHED"] },
  { key: "rejected", label: "rejected", approvalStatuses: ["REJECTED"] },
  
  // Event statuses
  { key: "upcoming", label: "upcoming", eventStatuses: ["UPCOMING"] },
  { key: "onsale", label: "onsale", eventStatuses: ["ON_SALE"] },
  { key: "sale_closed", label: "sale_closed", eventStatuses: ["SALE_CLOSED"] },
  { key: "ongoing", label: "ongoing", eventStatuses: ["ON_GOING"] },
  { key: "completed", label: "completed", eventStatuses: ["COMPLETED"] },
  
  // Cancelled (can be in either)
  { key: "cancelled", label: "cancelled" },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Filter events for a given tab — no API call, runs in memory. */
function filterEventsByTab(
  events: OrgFixtureEvent[],
  tab: OrganizerCenterTab
): OrgFixtureEvent[] {
  if (tab.key === "all") return events;

  return events.filter((event) => {
    const approval = (event.rawApprovalStatus ?? "").toUpperCase();
    const status = (event.rawStatus ?? "").toUpperCase();

    if (tab.key === "cancelled") {
      return approval === "CANCELLED" || status === "CANCELLED";
    }

    const approvalMatch =
      !tab.approvalStatuses || tab.approvalStatuses.includes(approval);
    const statusMatch =
      !tab.eventStatuses || tab.eventStatuses.includes(status);

    // Both axes specified → both must match; single axis → wildcard on the other
    if (tab.approvalStatuses && tab.eventStatuses) {
      return approvalMatch && statusMatch;
    }
    if (tab.approvalStatuses) return approvalMatch;
    if (tab.eventStatuses) return statusMatch;
    return true;
  });
}

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

/** Build API params. Tab filtering is intentionally omitted — we fetch everything. */
function buildAllEventsParams(
  keyword: string | undefined,
  selectedFilters: Record<string, string>,
  size: number
): OrganizerEventListParams {
  return {
    keyword,
    // No approvalStatuses / eventStatuses — the API returns all statuses
    categories: selectedFilters["category"]
      ? [selectedFilters["category"]]
      : undefined,
    eventTypes: selectedFilters["eventType"]
      ? [selectedFilters["eventType"]]
      : undefined,
    ...timeRangeToDateParams(selectedFilters["timeRange"]),
    page: 1,
    size,
    sort: "NEWEST",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrganizerCenterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) ?? "vi";
  const t = useTranslations("Organizer.CenterPage");

  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilters, setSelectedFilters] =
    useState<Record<string, string>>(EMPTY_FILTERS);

  /** true only during the very first fetch — shows full-page skeleton */
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  /** true during subsequent fetches (search / filter changes) — shows table spinner */
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");
  const hasLoadedOnce = useRef(false);

  /** Full unfiltered list returned by the API. */
  const [allEvents, setAllEvents] = useState<OrgFixtureEvent[]>([]);

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Listen for custom tab switch events (e.g. from CreateEventButton)
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("switchTab", handleSwitchTab);
    return () => window.removeEventListener("switchTab", handleSwitchTab);
  }, []);

  // Fetch: one API call, no tab filter
  const loadEvents = useCallback(async () => {
    const isFirst = !hasLoadedOnce.current;
    if (isFirst) {
      setIsInitialLoading(true);
    } else {
      setIsTableLoading(true);
    }

    const keyword = debouncedSearch || undefined;
    const requestParams = buildAllEventsParams(
      keyword,
      selectedFilters,
      PAGE_SIZE
    );

    try {
      const dashboard =
        await organizerEventApi.getOrganizerDashboard(requestParams);

      const page = dashboard.events;
      const safeContent = Array.isArray(page?.content) ? page.content : [];

      setAllEvents(safeContent.map(mapListEventToOrganizerCard));
      setPageState("idle");
    } catch (error) {
      console.error("Failed to load organizer events", error);
      setAllEvents([]);
      setPageState("error");
    } finally {
      hasLoadedOnce.current = true;
      setIsInitialLoading(false);
      setIsTableLoading(false);
    }
  }, [debouncedSearch, selectedFilters]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void loadEvents());
    return () => cancelAnimationFrame(frame);
  }, [loadEvents]);

  // ── Derived FE state (no API call) ─────────────────────────────────────────

  /** Count per tab — computed from allEvents, O(n * tabs). */
  const tabCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const tab of STATUS_TABS) {
      counts[tab.key] = filterEventsByTab(allEvents, tab).length;
    }
    return counts;
  }, [allEvents]);

  /** Events for the currently active tab — instant, no fetch. */
  const events = useMemo(() => {
    const activeTabDef =
      STATUS_TABS.find((t) => t.key === activeTab) ?? STATUS_TABS[0];
    return filterEventsByTab(allEvents, activeTabDef);
  }, [allEvents, activeTab]);

  const tabs = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        key: tab.key,
        label: t(`tabs.${tab.label}`),
        count: tabCounts[tab.key] ?? 0,
      })),
    [tabCounts, t]
  );

  const filterOptions: FilterOption[] = useMemo(() => [
    {
      key: "category",
      label: t("filters.category"),
      options: [
        { value: "LIVESTAGE", label: t("filters.liveStage") },
        { value: "STAGE_ART", label: t("filters.stageArt") },
        { value: "WORKSHOP", label: t("filters.workshop") },
        { value: "SPORTS", label: t("filters.sports") },
        { value: "EXHIBITION", label: t("filters.exhibition") },
      ],
    },
    {
      key: "eventType",
      label: t("filters.eventType"),
      options: [
        { value: "OFFLINE", label: t("filters.offline") },
        { value: "ONLINE", label: t("filters.online") },
        { value: "HYBRID", label: t("filters.hybrid") },
      ],
    },
  ], [t]);

  const basePath = `/${locale}/organizer/events`;
  const createHref = `/${locale}/organizer/events/create`;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedFilters(EMPTY_FILTERS);
  }, []);

  /**
   * Tab change is now instant: no API call, just flip activeTab.
   * Search and filter dropdown values are preserved across tab switches.
   */
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  // ── Skeleton / Error states ─────────────────────────────────────────────────

  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />

        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]"
            />
          ))}
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
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
          {t("errorTitle")}
        </div>

        <p className="text-[13px] text-[var(--color-text-muted)]">
          {t("errorDesc")}
        </p>

        <Button
          type="button"
          variant="secondary"
          size="md"
          leftIcon={<RefreshCw />}
          onClick={loadEvents}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-start justify-between">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
            {t("title")}
          </h1>

          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            {t("desc")}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <OrganizerTabs
          tabs={tabs}
          activeKey={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="shrink-0">
        <OrganizerToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("searchPlaceholder")}
          filters={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Table area — flex-1, scroll internally */}
      <div className="relative min-h-0 flex-1">
        {/* Table loading overlay — only for search/filter refetch, not first load */}
        {isTableLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-ds-lg bg-[var(--color-bg-page)]/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-action-brand-bg-default)]" />
              <span className="text-[12px] text-[var(--color-text-muted)]">{t("searching")}</span>
            </div>
          </div>
        )}

        {events.length === 0 && !isTableLoading ? (
          <OrganizerEmptyState
            title={
              search || Object.values(selectedFilters).some(Boolean)
                ? t("emptySearchTitle")
                : t("emptyTitle")
            }
            description={
              search || Object.values(selectedFilters).some(Boolean)
                ? t("emptySearchDesc")
                : t("emptyDesc")
            }
            onClear={clearFilters}
            createHref={createHref}
          />
        ) : (
          <div className="scrollbar-none max-h-full overflow-y-auto overflow-x-auto rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
            <div
              className="sticky top-0 z-10 grid min-w-[980px] items-center gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-3 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]"
              style={{ gridTemplateColumns: EVENT_TABLE_GRID }}
            >
              <span>{t("tableHeaders.event")}</span>
              <span>{t("tableHeaders.timeLocation")}</span>
              <span>{t("tableHeaders.status")}</span>
              <span>{t("tableHeaders.ticketsSold")}</span>
              <span>{t("tableHeaders.revenue")}</span>
              <span>{t("tableHeaders.checker")}</span>
              <span className="text-right">{t("tableHeaders.action")}</span>
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
    </div>
  );
}
