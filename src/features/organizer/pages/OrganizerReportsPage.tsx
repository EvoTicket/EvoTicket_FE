"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  RefreshCw,
  Calendar,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { OrganizerMetricCard } from "@/src/features/organizer/components/common/OrganizerMetricCard";
import { OrganizerStatusBadge } from "@/src/features/organizer/components/common/OrganizerStatusBadge";
import { OrganizerToolbar, type FilterOption } from "@/src/features/organizer/components/common/OrganizerToolbar";
import { useTokenColors } from "@/src/features/organizer/hooks/useTokenColor";
import { organizerDashboardApi } from "@/src/features/organizer/api/organizerDashboardApi";
import { Button } from "@/src/components/ui/button";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";
import {
  hasDashboardData,
  mapCheckInStatus,
  mapDashboardKpis,
  mapOccupancyByCategory,
  mapPerformanceTable,
  mapRevenueTrend,
  mapTicketSalesByEvent,
  formatMoney,
  formatNumber,
} from "@/src/features/organizer/mappers";
import type { OrganizerDashboardMetricsResponse } from "@/src/features/organizer/types/api";
import { useTranslations } from "next-intl";

/* ── Filter definitions ───────────────────────────────────── */

const REPORT_FILTER_OPTIONS: FilterOption[] = [
  // {
  //   key: "eventScope",
  //   label: "Tất cả sự kiện",
  //   options: [
  //     { value: "ALL", label: "Tất cả" },
  //     { value: "ACTIVE", label: "Đang hoạt động" },
  //     { value: "ENDED", label: "Đã kết thúc" },
  //   ],
  // },
  // {
  //   key: "eventType",
  //   label: "Loại sự kiện",
  //   options: [
  //     { value: "MUSIC", label: "Âm nhạc" },
  //     { value: "SPORT", label: "Thể thao" },
  //     { value: "CONFERENCE", label: "Hội thảo" },
  //     { value: "EXHIBITION", label: "Triển lãm" },
  //     { value: "OTHER", label: "Khác" },
  //   ],
  // },
  // {
  //   key: "format",
  //   label: "Hình thức",
  //   options: [
  //     { value: "OFFLINE", label: "Trực tiếp" },
  //     { value: "ONLINE", label: "Trực tuyến" },
  //     { value: "HYBRID", label: "Kết hợp" },
  //   ],
  // },
  // {
  //   key: "status",
  //   label: "Trạng thái",
  //   options: [
  //     { value: "UPCOMING", label: "Sắp diễn ra" },
  //     { value: "ON_SALE", label: "Đang mở bán" },
  //     { value: "COMPLETED", label: "Đã kết thúc" },
  //   ],
  // },
];

const EMPTY_REPORT_FILTERS: Record<string, string> = {};

/* ── Chart color map ─────────────────────────────────────── */

const CHART_VARS = {
  brand: "--color-action-brand-bg-default",
  brandHover: "--color-action-brand-bg-hover",
  accent: "--color-action-accent-bg-default",
  info: "--color-feedback-info-icon",
  success: "--color-feedback-success-icon",
  borderSubtle: "--color-border-subtle",
  textMuted: "--color-text-muted",
  textPrimary: "--color-text-primary",
  textSecondary: "--color-text-secondary",
  bgElevated: "--color-bg-elevated",
  borderDefault: "--color-border-default",
} as const;

const REPORT_DAYS = 30;

/* ── Helpers ─────────────────────────────────────────────── */

function Panel({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[15px] font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div className="text-[11px] text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-[var(--color-text-primary)]">
        {value}
      </div>
    </div>
  );
}

function ResaleStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatusTone;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        <OrganizerStatusBadge tone={tone}>●</OrganizerStatusBadge>
      </div>
      <span className="text-xl font-semibold text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}

function FormatBtn({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-ds-md border px-2.5 py-2 text-xs font-medium ${active
          ? "border-[var(--color-action-brand-bg-default)] bg-[var(--color-action-brand-bg-pressed)] text-white"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function ReportsPage() {
  const t = useTranslations("Organizer.Reports");
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(EMPTY_REPORT_FILTERS);
  const [dashboard, setDashboard] = useState<OrganizerDashboardMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const c = useTokenColors(CHART_VARS);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedFilters(EMPTY_REPORT_FILTERS);
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await organizerDashboardApi.getDashboard(REPORT_DAYS);
      setDashboard(data);
    } catch (loadError) {
      console.error("Failed to load organizer dashboard", loadError);
      setDashboard(null);
      setError(t("load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadDashboard();
    });

    return () => cancelAnimationFrame(frame);
  }, [loadDashboard]);

  const kpis = useMemo(() => mapDashboardKpis(dashboard), [dashboard]);
  const revenueSeries = useMemo(() => mapRevenueTrend(dashboard), [dashboard]);
  const ticketByEvent = useMemo(() => mapTicketSalesByEvent(dashboard), [dashboard]);
  const checkIn = useMemo(() => mapCheckInStatus(dashboard), [dashboard]);
  const performanceTable = useMemo(() => mapPerformanceTable(dashboard), [dashboard]);
  const resaleStats = useMemo(
    () => [
      // Backend dashboard does not expose active resale listing count yet.
      { label: t("resale_stat_listings"), value: "—", tone: "info" as StatusTone },
      // Backend dashboard does not expose average resale price yet.
      { label: t("resale_stat_avg_price"), value: "—", tone: "brand" as StatusTone },
      { label: t("resale_stat_trades"), value: formatNumber(dashboard?.resaleVolume), tone: "success" as StatusTone },
      { label: t("resale_stat_royalty"), value: formatMoney(dashboard?.royaltyFee), tone: "accent" as StatusTone },
    ],
    [dashboard?.resaleVolume, dashboard?.royaltyFee, t]
  );
  const hasData = hasDashboardData(dashboard);

  const occupancyData = useMemo(
    () => {
      const colors = [c.brand, c.accent, c.info, c.success];
      return mapOccupancyByCategory(dashboard).map((o, index) => ({
        ...o,
        color: o.color || colors[index % colors.length],
      }));
    },
    [c, dashboard]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
          <div className="h-64 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
        <div className="text-base font-medium text-[var(--color-feedback-error-text)]">
          {error}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          leftIcon={<RefreshCw />}
          onClick={loadDashboard}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
          {t("title")}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          {t("subtitle")}
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
        <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[13px] text-[var(--color-text-primary)]">
          <Calendar size={14} className="text-[var(--color-icon-muted)]" />
          {t("last_days", { days: REPORT_DAYS })}
        </button>
        <OrganizerToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("search_placeholder")}
          filters={REPORT_FILTER_OPTIONS}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          actions={
            <>
              <button
                type="button"
                onClick={loadDashboard}
                className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)]"
              >
                <RefreshCw size={13} />
                {t("refresh")}
              </button>
              <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
                <Download size={13} />
                {t("export_data")}
              </button>
            </>
          }
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <OrganizerMetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            tone={kpi.tone}
          />
        ))}
      </div>

      {!hasData && (
        <div className="rounded-ds-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-4 text-sm text-[var(--color-text-muted)]">
          {t("no_data")}
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left 2/3 */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Revenue chart */}
          <Panel
            title={t("revenue_chart_title")}
            subtitle={t("revenue_chart_subtitle")}
            right={
              <div className="flex items-center gap-2">
                <OrganizerStatusBadge tone="success">
                  +12.4%
                </OrganizerStatusBadge>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {t("vnd_million")}
                </span>
              </div>
            }
          >
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={revenueSeries}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={c.brand}
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="100%"
                        stopColor={c.brand}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke={c.borderSubtle}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: c.textMuted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: c.textMuted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: c.bgElevated,
                      border: `1px solid ${c.borderDefault}`,
                      borderRadius: 8,
                      color: c.textPrimary,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rev"
                    stroke={c.brand}
                    strokeWidth={2}
                    fill="url(#revFill)"
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Ticket by event bar chart */}
          <Panel
            title={t("ticket_chart_title")}
            subtitle={t("ticket_chart_subtitle")}
          >
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart
                  data={ticketByEvent}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke={c.borderSubtle}
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: c.textMuted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: c.textSecondary, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: c.bgElevated,
                      border: `1px solid ${c.borderDefault}`,
                      borderRadius: 8,
                      color: c.textPrimary,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={c.brand}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Right 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Occupancy donut */}
          <Panel title={t("occupancy_chart_title")} subtitle={t("occupancy_chart_subtitle")}>
            <div style={{ width: "100%", height: 200, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {occupancyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-primary)]">
                <span className="text-[22px] font-semibold">
                  {Math.round(dashboard?.avgOccupancyRate || 0)}%
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {t("avg_org")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {occupancyData.map((o) => (
                <div
                  key={o.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <span
                      className="h-2 w-2 rounded-ds-sm"
                      style={{ background: o.color }}
                    />
                    {o.name}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {o.value}%
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Check-in status */}
          <Panel
            title={t("checkin_title")}
            subtitle={t("checkin_subtitle")}
          >
            <div className="flex flex-col gap-3">
              {/* Checked */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: "var(--color-badge-success-text)",
                    }}
                  />
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    {t("checked_in")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    {checkIn.checked.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {checkIn.checked.pct}%
                  </span>
                </div>
              </div>

              {/* Unchecked */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: "var(--color-badge-warning-text)",
                    }}
                  />
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    {t("not_checked_in")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    {checkIn.unchecked.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {checkIn.unchecked.pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-badge-neutral-bg)]">
                <div
                  className="h-full"
                  style={{
                    width: `${checkIn.checked.pct}%`,
                    background: "var(--color-feedback-success-icon)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <MiniStat
                  label={t("gate_rate")}
                  value={checkIn.gateRate}
                />
                <MiniStat
                  label={t("peak_time")}
                  value={checkIn.peakTime}
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Resale / blockchain */}
      <Panel
        title={t("resale_title")}
        subtitle={t("resale_subtitle")}
        right={
          <OrganizerStatusBadge tone="accent">{t("blockchain")}</OrganizerStatusBadge>
        }
      >
        <div className="grid grid-cols-4 gap-4">
          {resaleStats.map((r) => (
            <ResaleStat
              key={r.label}
              label={r.label}
              value={r.value}
              tone={r.tone}
            />
          ))}
        </div>
      </Panel>

      {/* Performance table + export */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <Panel
            title={t("performance_title")}
            subtitle={t("performance_subtitle")}
          >
            <div className="overflow-hidden rounded-ds-md border border-[var(--color-border-subtle)]">
              {/* Header */}
              <div
                className="grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]"
                style={{
                  gridTemplateColumns:
                    "2fr 1fr 0.9fr 0.8fr 1fr 0.9fr 1fr 1fr 1fr",
                  background: "var(--color-bg-elevated)",
                }}
              >
                <span>{t("col_event")}</span>
                <span>{t("col_type")}</span>
                <span>{t("col_sold")}</span>
                <span>{t("col_fill")}</span>
                <span>{t("col_revenue")}</span>
                <span>{t("col_checkin")}</span>
                <span>{t("col_resale")}</span>
                <span>{t("col_royalty")}</span>
                <span>{t("col_status")}</span>
              </div>

              {/* Rows */}
              {performanceTable.map((r, i) => (
                <div
                  key={r.event}
                  className="grid items-center gap-3 px-4 py-3 text-[12.5px] text-[var(--color-text-primary)]"
                  style={{
                    gridTemplateColumns:
                      "2fr 1fr 0.9fr 0.8fr 1fr 0.9fr 1fr 1fr 1fr",
                    borderTop:
                      i === 0
                        ? "none"
                        : "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span className="font-medium">{r.event}</span>
                  <span className="text-[var(--color-text-secondary)]">
                    {r.type}
                  </span>
                  <span>{r.sold}</span>
                  <span className="text-[var(--color-text-secondary)]">
                    {r.fill}
                  </span>
                  <span className="font-medium">{r.rev}</span>
                  <span className="text-[var(--color-text-secondary)]">
                    {r.checkin}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">
                    {r.resale}
                  </span>
                  <span className="text-[var(--color-badge-accent-text)]">
                    {r.royalty}
                  </span>
                  <span>
                    <OrganizerStatusBadge tone={r.tone}>
                      {r.status}
                    </OrganizerStatusBadge>
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Export panel */}
        <Panel title={t("export_panel_title")} subtitle={t("export_panel_subtitle")}>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("format")}
            </span>
            <div className="flex gap-2">
              <FormatBtn
                icon={<FileSpreadsheet size={13} />}
                label=".CSV"
                active
              />
              <FormatBtn
                icon={<FileSpreadsheet size={13} />}
                label=".XLSX"
              />
              <FormatBtn icon={<FileText size={13} />} label=".PDF" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("scope")}
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                t("scope_options.summary"),
                t("scope_options.revenue"),
                t("scope_options.checkin"),
                t("scope_options.resale"),
                t("scope_options.buyers"),
              ].map((label, i) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2 rounded-ds-md border px-2.5 py-2 text-[13px] text-[var(--color-text-primary)]"
                  style={{
                    background:
                      i === 0
                        ? "var(--color-action-brand-bg-pressed)"
                        : "transparent",
                    borderColor:
                      i === 0
                        ? "var(--color-action-brand-bg-default)"
                        : "var(--color-border-subtle)",
                  }}
                >
                  <input type="checkbox" defaultChecked={i === 0} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <button className="mt-2 flex items-center justify-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2.5 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
            <FileDown size={14} />
            {t("export_now")}
          </button>
        </Panel>
      </div>
    </div>
  );
}
