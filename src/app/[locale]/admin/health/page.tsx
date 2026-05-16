"use client";

import { useState } from "react";
import {
  Activity,
  Zap,
  AlertTriangle,
  Layers,
  ShieldCheck,
  RefreshCw,
  Server,
  Cpu,
  Database,
  Network,
  Bell,
  Brain,
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
  ExternalLink,
  Info
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from "recharts";
import { useTranslations } from "next-intl";
import { healthMockData } from "../datamockadmin/mockdata_health";

export default function AdminHealthPage() {
  const t = useTranslations("Admin");
  const [timeRange, setTimeRange] = useState("1h");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-05</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("health_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("health_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-ds-xl p-1 shadow-sm">
            {["15m", "1h", "24h", "7d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-ds-lg transition-all ${timeRange === range ? "bg-main text-txt-primary shadow-sm" : "text-txt-muted hover:text-txt-secondary"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <RefreshCw size={18} />
            <span>{t("btn_refresh")}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatusCard
          icon={<Activity size={20} />}
          label={t("platform_status")}
          value={t("common.service_status.degraded")}
          sub={t("common.health_sub.services_status", { warning: 2, down: 1 })}
          color="amber"
        />
        <StatusCard
          icon={<Zap size={20} />}
          label={t("api_latency_label")}
          value="420 ms"
          sub={t("common.health_sub.latency_p95", { time: `15 ${t("common.minutes")}` })}
          color="rose"
        />
        <StatusCard
          icon={<AlertTriangle size={20} />}
          label={t("open_incidents")}
          value="3"
          sub={t("common.health_sub.incident_breakdown", { critical: 1, high: 1, medium: 1 })}
          color="rose"
        />
        <StatusCard
          icon={<Layers size={20} />}
          label={t("queue_backlog")}
          value={`128 ${t("common.jobs")}`}
          sub={t("common.health_sub.mint_queue_slow")}
          color="amber"
        />
        <StatusCard
          icon={<ShieldCheck size={20} />}
          label={t("service_availability")}
          value="98.7%"
          sub={t("common.health_sub.availability_24h", { count: 8 })}
          color="emerald"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface border border-border rounded-ds-2xl p-1 w-fit shadow-sm">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label={t("common.tabs.overview")} />
        <TabButton active={activeTab === "services"} onClick={() => setActiveTab("services")} label={t("common.tabs.services_queues")} />
        <TabButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} label={t("common.tabs.alerts_incidents")} />
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "overview" && <OverviewTab t={t} />}
        {activeTab === "services" && <ServicesTab t={t} />}
        {activeTab === "alerts" && <AlertsTab t={t} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-bold rounded-ds-xl transition-all ${active
          ? "bg-main text-primary shadow-sm border border-border"
          : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      {label}
    </button>
  );
}

function OverviewTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Service Health Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Server size={18} className="text-txt-muted" />
              <h3 className="text-lg font-bold text-txt-primary">{t("service_health_title")}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthMockData.services.map((s, i) => (
              <ServiceItem key={i} name={s.name} status={s.status} latency={s.latency} lastCheck={s.lastCheck} />
            ))}
          </div>
        </div>

        {/* Platform Performance Charts */}
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-txt-muted" />
              <h3 className="text-lg font-bold text-txt-primary">{t("platform_performance")}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ChartSmall label={t("request_volume")} value="12.8k req/m" sub={t("common.health_sub.vs_last_hour", { percent: 6 })} data={healthMockData.perfData} dataKey="requests" color="#6366f1" />
            <ChartSmall label={t("api_latency_label")} value="420 ms" sub={t("common.health_sub.p95_threshold", { ms: 350 })} data={healthMockData.perfData} dataKey="latency" color="#f59e0b" />
            <ChartSmall label={t("error_rate")} value="0.12%" sub={t("common.health_sub.under_threshold_1h", { percent: 0.5 })} data={healthMockData.perfData} dataKey="errors" color="#f43f5e" />
          </div>
        </div>
      </div>

      {/* Queue Health List */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm h-fit transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Network size={18} className="text-txt-muted" />
              <h3 className="text-lg font-bold text-txt-primary">{t("queue_health_title")}</h3>
            </div>
          </div>
          <div className="space-y-4">
            {healthMockData.queues.map((q, i) => (
              <QueueItem key={i} name={q.name} queued={q.queued} failed={q.failed} delayed={q.delayed} status={q.status} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesTab({ t }: any) {
  return (
    <div className="space-y-6">
      {/* Service Status Table */}
      <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Server size={18} className="text-txt-muted" />
          <h3 className="text-lg font-bold text-txt-primary">Service status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">Uptime (24h)</th>
                <th className="px-6 py-4 text-right">Sự cố gần nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {healthMockData.services.map((s, i) => (
                <tr key={i} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Cpu size={14} className="text-txt-muted opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs font-black text-txt-primary">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{s.latency}</td>
                  <td className="px-6 py-4 text-xs font-black text-txt-primary">{s.uptime}</td>
                  <td className="px-6 py-4 text-right text-xs font-medium text-txt-muted">{s.lastIncident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Status Table */}
      <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Network size={18} className="text-txt-muted" />
          <h3 className="text-lg font-bold text-txt-primary">Queue status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Queue</th>
                <th className="px-6 py-4">Backlog</th>
                <th className="px-6 py-4">Retry</th>
                <th className="px-6 py-4">Failed</th>
                <th className="px-6 py-4">Oldest job</th>
                <th className="px-6 py-4 text-right">Processing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {healthMockData.queues.map((q, i) => (
                <tr key={i} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Layers size={14} className="text-txt-muted opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs font-black text-txt-primary">{q.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{q.backlog}</td>
                  <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{q.retry}</td>
                  <td className="px-6 py-4 text-xs font-black text-rose-500">{q.failed}</td>
                  <td className="px-6 py-4 text-xs font-medium text-txt-muted">{q.oldest}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Incident List */}
      <div className="lg:col-span-2 bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm h-fit">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <AlertTriangle size={18} className="text-txt-muted" />
          <h3 className="text-lg font-bold text-txt-primary">Sự cố đang mở</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Sự cố</th>
                <th className="px-6 py-4">Nguồn</th>
                <th className="px-6 py-4">Bắt đầu</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {healthMockData.incidents.map((inc, i) => (
                <tr key={i} className="hover:bg-main/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${inc.severity === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                        inc.severity === 'High' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                          inc.severity === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-sky-500/10 text-sky-600 border-sky-500/20'
                      }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-xs font-black text-txt-primary">{inc.title}</p>
                      <p className="text-[10px] text-txt-muted font-bold tracking-tighter opacity-60 uppercase">{inc.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{inc.source}</td>
                  <td className="px-6 py-4 text-xs font-medium text-txt-muted">{inc.start}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface border border-border rounded-ds-lg text-[9px] font-black text-txt-primary uppercase">
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-black text-primary hover:underline">Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details Sidebar */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm h-fit space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-txt-primary">Chi tiết sự cố</h3>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-ds-lg text-[10px] font-black uppercase tracking-tighter">
            Investigating
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-ds-2xl">
            <span className="text-[9px] font-black text-rose-600 uppercase border border-rose-500/20 px-1.5 py-0.5 rounded bg-rose-500/10">High</span>
            <h4 className="text-sm font-black text-txt-primary mt-2">High latency on API Gateway</h4>
          </div>

          <div className="space-y-3">
            <DetailItem label="Nguồn" value="API Gateway" />
            <DetailItem label="Bắt đầu" value="Hôm nay 14:22" />
            <DetailItem label="Mã sự cố" value="INC-3041" />
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-2">Tác động hiện tại</p>
            <div className="p-3 bg-main rounded-ds-xl text-xs text-txt-secondary leading-relaxed">
              Một số request mua vé bị chậm trên 800ms, ảnh hương ~6% người dùng.
            </div>
          </div>

          <div className="pt-4">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-2">Bước xử lý đề xuất</p>
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-ds-xl text-xs text-amber-700 font-medium leading-relaxed">
              Kiểm tra autoscaler và tăng số instance Gateway.
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-ds-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Nhận xử lý</button>
            <button className="px-4 py-2.5 bg-surface border border-border text-txt-primary rounded-ds-xl text-xs font-black hover:bg-main transition-all">Snooze</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable sub-components
function StatusBadge({ status }: any) {
  const colors: any = {
    Healthy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Degraded: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    Down: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-ds-lg text-[9px] font-black border uppercase ${colors[status]}`}>
      <div className={`w-1 h-1 rounded-full ${status === 'Healthy' ? 'bg-emerald-500' : status === 'Down' ? 'bg-rose-500' : 'bg-amber-500'}`} />
      {status}
    </span>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-[10px] font-bold text-txt-muted uppercase">{label}</span>
      <span className="text-[10px] font-black text-txt-primary">{value}</span>
    </div>
  );
}

function StatusCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-ds-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-black tracking-tight mb-1 ${color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-amber-600'}`}>
        {value}
      </p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function ServiceItem({ name, status, latency, lastCheck }: any) {
  const t = useTranslations("Admin");
  const statusConfig: any = {
    Healthy: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 size={12} />, label: t("common.service_status.healthy") },
    Warning: { color: "text-amber-500", bg: "bg-amber-500/10", icon: <AlertTriangle size={12} />, label: t("common.service_status.warning") },
    Degraded: { color: "text-orange-500", bg: "bg-orange-500/10", icon: <Layers size={12} />, label: t("common.service_status.degraded") },
    Down: { color: "text-rose-500", bg: "bg-rose-500/10", icon: <XCircle size={12} />, label: t("common.service_status.down") },
  };

  const config = statusConfig[status] || statusConfig.Healthy;

  return (
    <div className="flex flex-col p-4 rounded-ds-2xl bg-main border border-border hover:border-txt-muted/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-txt-secondary">{name}</span>
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-ds-lg text-[9px] font-black border ${config.color} ${config.bg} border-current/10`}>
          {config.icon}
          {config.label.toUpperCase()}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] text-txt-muted font-bold uppercase tracking-widest">Latency</p>
          <p className="text-xs font-black text-txt-primary">{latency}</p>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-[9px] text-txt-muted font-bold uppercase tracking-widest">Last check</p>
          <p className="text-xs font-medium text-txt-muted">{lastCheck}</p>
        </div>
      </div>
    </div>
  );
}

function QueueItem({ name, queued, failed, delayed, status }: any) {
  const t = useTranslations("Admin");
  const isHealthy = status === "Healthy";
  return (
    <div className="p-4 rounded-ds-2xl bg-main border border-border transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-txt-secondary line-clamp-1">{name}</span>
        <div className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${isHealthy ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }`}>
          {isHealthy ? t("common.service_status.healthy") : t("common.service_status.warning")}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-0.5">
          <p className="text-[8px] text-txt-muted font-bold uppercase">Queued</p>
          <p className="text-xs font-black text-txt-primary">{queued}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[8px] text-txt-muted font-bold uppercase">Failed</p>
          <p className="text-xs font-black text-rose-500">{failed}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[8px] text-txt-muted font-bold uppercase">Delayed</p>
          <p className="text-xs font-black text-amber-500">{delayed}</p>
        </div>
      </div>
    </div>
  );
}

function ChartSmall({ label, value, sub, data, dataKey, color }: any) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-txt-muted">{label}</p>
        <p className="text-lg font-black text-txt-primary">{value}</p>
      </div>
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}
