"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ANALYTICS_SERIES,
  ANALYTICS_ZONES,
  OVERVIEW_METRICS,
} from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { EventKpiGrid } from "@/src/components/organizer/EventKpiGrid";
import { EventSectionPanel } from "@/src/components/organizer/EventSectionPanel";
import { OrganizerDataTable } from "@/src/components/organizer/OrganizerDataTable";
import { useTokenColors } from "@/src/components/organizer/useTokenColor";

const CHART_COLORS = {
  brand: "--color-action-brand-bg-default",
  accent: "--color-action-accent-bg-default",
  grid: "--color-border-subtle",
  muted: "--color-text-muted",
  surface: "--color-bg-elevated",
  border: "--color-border-default",
  text: "--color-text-primary",
} as const;

export default function EventAnalyticsPage() {
  const colors = useTokenColors(CHART_COLORS);

  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={OVERVIEW_METRICS.slice(0, 4)} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <EventSectionPanel title="Doanh thu theo thời gian" subtitle="Đơn vị: triệu VND">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_SERIES}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke={colors.muted} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.muted} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: colors.surface, borderColor: colors.border, color: colors.text }} />
                <Area type="monotone" dataKey="revenue" stroke={colors.brand} fill={colors.brand} fillOpacity={0.22} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </EventSectionPanel>

        <EventSectionPanel title="Ticket velocity" subtitle="Số vé bán theo ngày">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_SERIES}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke={colors.muted} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.muted} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: colors.surface, borderColor: colors.border, color: colors.text }} />
                <Bar dataKey="tickets" fill={colors.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EventSectionPanel>
      </div>

      <EventSectionPanel title="Occupancy theo khu vực" subtitle="Theo dõi lấp đầy từng zone">
        <OrganizerDataTable
          state="loaded"
          rows={ANALYTICS_ZONES}
          columns={[
            { key: "zone", label: "Zone" },
            { key: "sold", label: "Đã bán" },
            { key: "fillRate", label: "Lấp đầy", align: "right" },
          ]}
        />
      </EventSectionPanel>
    </div>
  );
}
