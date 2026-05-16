"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  Briefcase,
  Calendar,
  Download,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  Search,
  Activity,
  Link as LinkIcon
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useTranslations } from "next-intl";

// Mock data for the chart
const chartData = [
  { name: "T2", revenue: 2000, tickets: 120 },
  { name: "T3", revenue: 3500, tickets: 210 },
  { name: "T4", revenue: 2800, tickets: 180 },
  { name: "T5", revenue: 5100, tickets: 350 },
  { name: "T6", revenue: 4200, tickets: 280 },
  { name: "T7", revenue: 7800, tickets: 520 },
  { name: "CN", revenue: 6500, tickets: 430 },
  { name: "T2", revenue: 2000, tickets: 120 },
  { name: "T3", revenue: 3500, tickets: 210 },
  { name: "T4", revenue: 2800, tickets: 180 },
  { name: "T5", revenue: 5100, tickets: 350 },
  { name: "T6", revenue: 4200, tickets: 280 },
  { name: "T7", revenue: 7800, tickets: 520 },
  { name: "CN", revenue: 6500, tickets: 430 },
  { name: "T2", revenue: 2000, tickets: 120 },
  { name: "T3", revenue: 3500, tickets: 210 },
  { name: "T4", revenue: 2800, tickets: 180 },
  { name: "T5", revenue: 5100, tickets: 350 },
  { name: "T6", revenue: 4200, tickets: 280 },
  { name: "T7", revenue: 7800, tickets: 520 },
  { name: "CN", revenue: 6500, tickets: 430 },
  { name: "T2", revenue: 2000, tickets: 120 },
  { name: "T3", revenue: 3500, tickets: 210 },
  { name: "T4", revenue: 2800, tickets: 180 },
  { name: "T5", revenue: 5100, tickets: 350 },
  { name: "T6", revenue: 4200, tickets: 280 },
  { name: "T7", revenue: 7800, tickets: 520 },
  { name: "11", revenue: 6500, tickets: 430 },
];

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const [dateRange, setDateRange] = useState("01/04/2026 - 25/04/2026");
  const [chartView, setChartView] = useState<"revenue" | "tickets">("revenue");
  const [chartTimeRange, setChartTimeRange] = useState("90");

  const filteredData = useMemo(() => {
    const count = parseInt(chartTimeRange);
    return chartData.slice(-count);
  }, [chartTimeRange]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">{t("page_id")}</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("overview_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("overview_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-ds-xl px-4 py-2.5 shadow-sm">
            <Calendar size={18} className="text-txt-muted" />
            <span className="text-sm font-bold text-txt-secondary">{dateRange}</span>
            <ChevronDown size={14} className="text-txt-muted ml-2" />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <Download size={18} />
            <span>{t("export_summary")}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label={t("gmv_label")}
          value="₫12.8B"
          trend="+11.4%"
          isUp={true}
          icon={<DollarSign size={20} />}
          color="amber"
          vsText={t("vs_7d_ago")}
        />
        <StatsCard
          label={t("revenue_label")}
          value="₫286M"
          trend="+6.2%"
          isUp={true}
          icon={<Briefcase size={20} />}
          color="amber"
          vsText={t("vs_7d_ago")}
        />
        <StatsCard
          label={t("tickets_label")}
          value="18,420"
          trend="+8.7%"
          isUp={true}
          icon={<Ticket size={20} />}
          color="purple"
          vsText={t("vs_7d_ago")}
        />
        <StatsCard
          label={t("users_label")}
          value="1,284"
          trend="+3.1%"
          isUp={true}
          icon={<Users size={20} />}
          color="purple"
          vsText={t("vs_7d_ago")}
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-surface border border-border rounded-ds-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-txt-primary">{t("platform_trend")}</h3>
            <p className="text-xs text-txt-muted">
              {chartView === "revenue" ? t("trend_revenue_subtitle") : t("trend_tickets_subtitle")}
            </p>
          </div>
          <div className="flex bg-main p-1 rounded-ds-xl border border-border self-start sm:self-auto">
            <button
              onClick={() => setChartView("revenue")}
              className={`px-4 py-1.5 text-xs font-bold rounded-ds-lg transition-all ${chartView === "revenue"
                ? "bg-surface text-primary shadow-sm border border-border"
                : "text-txt-muted hover:text-txt-secondary"
                }`}
            >
              {t("revenue_toggle")}
            </button>
            <button
              onClick={() => setChartView("tickets")}
              className={`px-4 py-1.5 text-xs font-bold rounded-ds-lg transition-all ${chartView === "tickets"
                ? "bg-surface text-primary shadow-sm border border-border"
                : "text-txt-muted hover:text-txt-secondary"
                }`}
            >
              {t("tickets_toggle")}
            </button>
            <div className="w-[1px] bg-border mx-1 my-1"></div>
            {["7", "30", "90"].map((range) => (
              <button
                key={range}
                onClick={() => setChartTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-ds-lg transition-all ${chartTimeRange === range
                  ? "bg-primary text-white shadow-sm"
                  : "text-txt-muted hover:text-txt-secondary"
                  }`}
              >
                {t(`range_${range}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-txt-muted)' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--color-txt-muted)' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'var(--color-surface)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ color: 'var(--color-txt-primary)', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--color-txt-muted)', fontWeight: 'bold', marginBottom: '4px' }}
                cursor={{ stroke: chartView === "revenue" ? 'var(--color-primary)' : '#8B5CF6', strokeWidth: 2, strokeDasharray: '5 5' }}
                formatter={(value: any) => [
                  chartView === "revenue" ? `₫${value.toLocaleString()}M` : `${value.toLocaleString()}`,
                  chartView === "revenue" ? t("revenue_toggle") : t("tickets_toggle")
                ]}
              />
              <Area
                type="monotone"
                dataKey={chartView}
                stroke={chartView === "revenue" ? "var(--color-primary)" : "#8B5CF6"}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color${chartView.charAt(0).toUpperCase() + chartView.slice(1)})`}
                dot={{ r: 4, fill: 'var(--color-surface)', stroke: chartView === "revenue" ? "var(--color-primary)" : "#8B5CF6", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: chartView === "revenue" ? "var(--color-primary)" : "#8B5CF6", stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance & Settlement */}
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-txt-primary">{t("finance_settlement")}</h3>
              <p className="text-xs text-txt-muted">{t("weekly_summary")}</p>
            </div>
            <div className="w-8 h-8 rounded-ds-lg bg-amber-500/10 flex items-center justify-center">
              <DollarSign size={16} className="text-amber-600" />
            </div>
          </div>
          <div className="space-y-4">
            <SummaryItem
              icon={<TrendingUp size={16} className="text-amber-600" />}
              label={t("payout_pending")}
              sub={t("dashboard.payout_pending_sub", { count: 14, batch: "PB-2604" })}
              value="₫2.16B"
              bg="bg-amber-500/5"
            />
            <SummaryItem
              icon={<ShieldCheck size={16} className="text-emerald-600" />}
              label={t("payout_settled")}
              sub={t("dashboard.payout_settled_sub", { count: 86 })}
              value="₫4.72B"
              bg="bg-emerald-500/5"
            />
            <SummaryItem
              icon={<AlertTriangle size={16} className="text-rose-600" />}
              label={t("disputes")}
              sub={t("dashboard.disputes_sub")}
              value="7"
              bg="bg-rose-500/5"
            />
          </div>
        </div>

        {/* Governance & Review */}
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-txt-primary">{t("governance_review")}</h3>
              <p className="text-xs text-txt-muted">{t("pending_processing")}</p>
            </div>
            <div className="w-8 h-8 rounded-ds-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={16} className="text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <SummaryItem
              icon={<Users size={16} className="text-indigo-600" />}
              label={t("org_pending")}
              sub={t("dashboard.kyc_new")}
              value="8"
              bg="bg-primary/5"
            />
            <SummaryItem
              icon={<Calendar size={16} className="text-amber-600" />}
              label={t("event_pending")}
              sub={t("dashboard.event_risk_sub", { count: 3 })}
              value="14"
              bg="bg-amber-500/5"
            />
            <SummaryItem
              icon={<Users size={16} className="text-rose-600" />}
              label={t("restricted_accounts")}
              sub={t("dashboard.monitoring_violation")}
              value="11"
              bg="bg-rose-500/5"
            />
          </div>
        </div>
      </div>

      {/* Operational Alerts */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ds-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-txt-primary">{t("operational_alerts")}</h3>
              <p className="text-xs text-txt-muted">{t("alerts_summary", { count: 4, critical: 1 })}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-rose-500/10 text-rose-600 text-[10px] font-bold rounded border border-rose-500/20 uppercase">{t("dashboard.alerts.critical", { count: 1 })}</span>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded border border-amber-500/20 uppercase">{t("dashboard.alerts.warning", { count: 2 })}</span>
            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded border border-blue-500/20 uppercase">{t("dashboard.alerts.info", { count: 1 })}</span>
          </div>
        </div>

        <div className="space-y-3">
          <AlertRow
            type="error"
            title={t("common.alert_items.gas_low")}
            status="ERROR"
            desc={t("common.alert_items.gas_low_desc")}
            meta={t("common.alert_items.gas_low_meta", { time: t("common.minutes_ago", { count: 5 }) })}
            t={t}
          />
          <AlertRow
            type="warning"
            title={t("common.alert_items.latency_high")}
            status="WARNING"
            desc={t("common.alert_items.latency_high_desc")}
            meta={t("common.alert_items.latency_high_meta", { time: t("common.minutes_ago", { count: 12 }) })}
            t={t}
          />
          <AlertRow
            type="warning"
            title={t("common.alert_items.payout_delayed")}
            status="WARNING"
            desc={t("common.alert_items.payout_delayed_desc")}
            meta={t("common.alert_items.payout_delayed_meta", { time: t("common.minutes_ago", { count: 32 }) })}
            t={t}
          />
          <AlertRow
            type="info"
            title={t("common.alert_items.resale_anomaly")}
            status="INFO"
            desc={t("common.alert_items.resale_anomaly_desc")}
            meta={t("common.alert_items.resale_anomaly_meta", { time: t("common.minutes_ago", { count: 60 }) })}
            t={t}
          />
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="text-lg font-bold text-txt-primary mb-6">{t("quick_access")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <QuickAccessCard icon={<Users size={24} />} title={t("sidebar.accounts")} sub={t("common.quick_access_items.accounts_desc")} />
          <QuickAccessCard icon={<ShieldCheck size={24} />} title={t("sidebar.moderation")} sub={t("common.quick_access_items.moderation_desc")} badge={t("coming_soon")} />
          <QuickAccessCard icon={<Search size={24} />} title={t("common.quick_access_items.support_title")} sub={t("common.quick_access_items.support_desc")} badge={t("coming_soon")} />
          <QuickAccessCard icon={<Activity size={24} />} title={t("common.quick_access_items.health_title")} sub={t("common.quick_access_items.health_desc")} badge={t("coming_soon")} />
          <QuickAccessCard icon={<LinkIcon size={24} />} title={t("common.quick_access_items.blockchain_title")} sub={t("common.quick_access_items.blockchain_desc")} badge={t("coming_soon")} />
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatsCard({ label, value, trend, isUp, icon, color, vsText }: any) {
  const colorClasses: any = {
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm group hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-ds-xl flex items-center justify-center ${colorClasses[color] || "bg-main text-txt-muted"}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold">
          <span className={isUp ? "text-emerald-500" : "text-rose-500"}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </span>
          <span className={isUp ? "text-emerald-500" : "text-rose-500"}>{trend}</span>
          <span className="text-txt-muted ml-1">{vsText}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-txt-muted">{label}</p>
        <p className="text-2xl font-black text-txt-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, sub, value, bg }: any) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-ds-2xl ${bg} transition-transform hover:scale-[1.02] cursor-pointer`}>
      <div className="w-10 h-10 rounded-ds-xl bg-surface shadow-sm flex items-center justify-center text-txt-secondary border border-border">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-txt-primary truncate">{label}</p>
        <p className="text-[10px] text-txt-muted truncate">{sub}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-txt-primary">{value}</p>
      </div>
    </div>
  );
}

function AlertRow({ type, title, status, desc, meta, t }: any) {
  const typeColors: any = {
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-ds-2xl bg-surface border border-border hover:border-primary/20 transition-all group">
      <div className={`w-10 h-10 rounded-ds-xl flex items-center justify-center ${typeColors[type]}`}>
        {type === 'error' ? <AlertTriangle size={20} /> : type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-txt-primary">{title}</h4>
          <span className={`px-2 py-0.5 text-[8px] font-black rounded border uppercase ${typeColors[type]}`}>{status}</span>
        </div>
        <p className="text-xs text-txt-secondary line-clamp-1">{desc}</p>
        <p className="text-[10px] text-txt-muted mt-1">{meta}</p>
      </div>
      <button className="px-4 py-2 text-xs font-bold text-txt-secondary bg-main hover:bg-border rounded-ds-xl border border-border transition-colors">
        {t("common.open_module")}
      </button>
    </div>
  );
}

function QuickAccessCard({ icon, title, sub, badge }: any) {
  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden">
      <div className="w-12 h-12 rounded-ds-xl bg-main flex items-center justify-center text-txt-muted group-hover:bg-primary/5 group-hover:text-primary transition-colors mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-txt-primary mb-1">{title}</h4>
      <p className="text-[10px] text-txt-muted">{sub}</p>
      {badge && (
        <span className="absolute bottom-4 left-4 bg-main text-txt-muted text-[8px] font-bold px-1.5 py-0.5 rounded border border-border uppercase">
          {badge}
        </span>
      )}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={14} className="text-txt-muted" />
      </div>
    </div>
  );
}

function ChevronDown({ size, className }: any) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
