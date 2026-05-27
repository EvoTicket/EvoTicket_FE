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
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventKpiGrid } from "@/src/features/organizer/components/event-detail/EventKpiGrid";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTokenColors } from "@/src/features/organizer/hooks/useTokenColor";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Organizer.EventDetail.Analytics");

  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={OVERVIEW_METRICS.slice(0, 4)} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <EventSectionPanel title={t("revenue_chart_title")} subtitle={t("revenue_chart_subtitle")}>
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

        <EventSectionPanel title={t("velocity_chart_title")} subtitle={t("velocity_chart_subtitle")}>
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

      <EventSectionPanel title={t("occupancy_title")} subtitle={t("occupancy_subtitle")}>
        <OrganizerDataTable
          state="loaded"
          rows={ANALYTICS_ZONES}
          columns={[
            { key: "zone", label: t("col_zone") },
            { key: "sold", label: t("col_sold") },
            { key: "fillRate", label: t("col_fill"), align: "right" },
          ]}
        />
      </EventSectionPanel>
    </div>
  );
}
