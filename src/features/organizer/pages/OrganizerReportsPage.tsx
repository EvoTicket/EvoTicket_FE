"use client";

import { useMemo } from "react";
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
import { OrganizerToolbar } from "@/src/features/organizer/components/common/OrganizerToolbar";
import { useTokenColors } from "@/src/features/organizer/hooks/useTokenColor";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";
import {
  FIXTURE_KPIS,
  FIXTURE_REVENUE_SERIES,
  FIXTURE_TICKET_BY_EVENT,
  FIXTURE_OCCUPANCY,
  FIXTURE_CHECKIN,
  FIXTURE_RESALE,
  FIXTURE_PERFORMANCE_TABLE,
} from "@/src/features/organizer/fixtures/reports";
import { useState } from "react";

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
    <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
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
    <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
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
    <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium ${
        active
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
  const [search, setSearch] = useState("");
  const c = useTokenColors(CHART_VARS);

  // Memoize occupancy data with resolved colors
  const occupancyData = useMemo(
    () =>
      FIXTURE_OCCUPANCY.map((o) => ({
        ...o,
        color: c[o.cssVar === CHART_VARS.brand ? "brand" : o.cssVar === CHART_VARS.accent ? "accent" : o.cssVar === CHART_VARS.info ? "info" : "success"],
      })),
    [c]
  );

  return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
            Quản lý báo cáo
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            Theo dõi doanh thu, hiệu quả bán vé và tình trạng check-in trên
            toàn bộ sự kiện
          </p>
        </div>

        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
          <button className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[13px] text-[var(--color-text-primary)]">
            <Calendar size={14} className="text-[var(--color-icon-muted)]" />
            01/04 – 21/04/2026
          </button>
          <OrganizerToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm sự kiện…"
            filters={[
              { label: "Tất cả sự kiện" },
              { label: "Loại sự kiện" },
              { label: "Hình thức" },
              { label: "Trạng thái" },
            ]}
            actions={
              <>
                <button className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
                  <RefreshCw size={13} />
                  Làm mới
                </button>
                <button className="flex items-center gap-2 rounded-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
                  <Download size={13} />
                  Xuất dữ liệu
                </button>
              </>
            }
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-4">
          {FIXTURE_KPIS.map((kpi) => (
            <OrganizerMetricCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              tone={kpi.tone}
            />
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left 2/3 */}
          <div className="col-span-2 flex flex-col gap-4">
            {/* Revenue chart */}
            <Panel
              title="Doanh thu theo thời gian"
              subtitle="So với 30 ngày gần nhất"
              right={
                <div className="flex items-center gap-2">
                  <OrganizerStatusBadge tone="success">
                    +12.4%
                  </OrganizerStatusBadge>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    VND · triệu
                  </span>
                </div>
              }
            >
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={FIXTURE_REVENUE_SERIES}
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
              title="Số vé bán theo sự kiện"
              subtitle="Top 6 sự kiện trong kỳ"
            >
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={FIXTURE_TICKET_BY_EVENT}
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
            <Panel title="Tỷ lệ lấp đầy theo loại" subtitle="Occupancy rate %">
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
                  <span className="text-[22px] font-semibold">71%</span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    TB toàn org
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
                        className="h-2 w-2 rounded-sm"
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
              title="Tình trạng check-in"
              subtitle="Dữ liệu theo thời gian thực"
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
                      Đã check-in
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                      {FIXTURE_CHECKIN.checked.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {FIXTURE_CHECKIN.checked.pct}%
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
                      Chưa check-in
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                      {FIXTURE_CHECKIN.unchecked.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {FIXTURE_CHECKIN.unchecked.pct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-badge-neutral-bg)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${FIXTURE_CHECKIN.checked.pct}%`,
                      background: "var(--color-feedback-success-icon)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <MiniStat
                    label="Tỷ lệ vào cổng"
                    value={FIXTURE_CHECKIN.gateRate}
                  />
                  <MiniStat
                    label="Peak gate time"
                    value={FIXTURE_CHECKIN.peakTime}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Resale / blockchain */}
        <Panel
          title="Thị trường bán lại"
          subtitle="Giao dịch thứ cấp và royalty on-chain"
          right={
            <OrganizerStatusBadge tone="accent">Blockchain</OrganizerStatusBadge>
          }
        >
          <div className="grid grid-cols-4 gap-4">
            {FIXTURE_RESALE.map((r) => (
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
              title="Hiệu suất chi tiết theo sự kiện"
              subtitle="Tổng hợp các chỉ số chính"
            >
              <div className="overflow-hidden rounded-md border border-[var(--color-border-subtle)]">
                {/* Header */}
                <div
                  className="grid gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]"
                  style={{
                    gridTemplateColumns:
                      "2fr 1fr 0.9fr 0.8fr 1fr 0.9fr 1fr 1fr 1fr",
                    background: "var(--color-bg-elevated)",
                  }}
                >
                  <span>Sự kiện</span>
                  <span>Loại</span>
                  <span>Vé đã bán</span>
                  <span>Lấp đầy</span>
                  <span>Doanh thu</span>
                  <span>Check-in</span>
                  <span>Resale</span>
                  <span>Royalty fee</span>
                  <span>Trạng thái</span>
                </div>

                {/* Rows */}
                {FIXTURE_PERFORMANCE_TABLE.map((r, i) => (
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
          <Panel title="Xuất dữ liệu" subtitle="Chọn phạm vi và định dạng">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                Định dạng
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
                Phạm vi
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  "Tổng hợp",
                  "Doanh thu",
                  "Check-in",
                  "Resale",
                  "Danh sách người mua",
                ].map((label, i) => (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-[13px] text-[var(--color-text-primary)]"
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
            <button className="mt-2 flex items-center justify-center gap-2 rounded-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2.5 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
              <FileDown size={14} />
              Xuất file ngay
            </button>
          </Panel>
        </div>
      </div>
  );
}
