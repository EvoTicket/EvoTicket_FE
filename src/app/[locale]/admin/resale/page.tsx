"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Scale,
  Download,
  ChevronRight,
  Activity,
  Zap,
  Flag,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
  Search,
  ShieldAlert,
  MoreHorizontal,
  User,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { resaleMockData } from "../datamockadmin/mockdata_resale";

export default function AdminResalePage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("monitoring");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-08</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("resale_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("resale_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-xl p-1 shadow-sm text-xs font-bold transition-colors">
            {["24h", "7d", "30d", t("common.custom")].map((range) => (
              <button key={range} className={`px-4 py-1.5 rounded-lg transition-all ${range === '7d' ? 'bg-main text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}>{range}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <Download size={18} />
            <span>{t("btn_export_report")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatsCard icon={<Activity size={20} />} label={t("resale_volume")} value="214" sub={t("common.resale_sub.days_count", { count: 7 })} color="gray" />
        <StatsCard icon={<TrendingUp size={20} />} label={t("avg_resale_price")} value={`1,420,000 ${t("common.currency_vnd")}`} sub={t("common.resale_sub.vs_last_week", { percent: 3 })} color="indigo" />
        <StatsCard icon={<DollarSign size={20} />} label={t("royalty_collected")} value={`36,500,000 ${t("common.currency_vnd")}`} sub={t("common.resale_sub.for_organizers", { count: 12 })} color="emerald" />
        <StatsCard icon={<Flag size={20} />} label={t("flagged_listings")} value="7" sub={t("common.resale_sub.over_cap_anomaly", { over: 3, anomaly: 4 })} color="rose" />
        <StatsCard icon={<Scale size={20} />} label={t("open_disputes")} value="4" sub={t("common.resale_sub.incident_short", { critical: 1, high: 1 })} color="rose" />
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface border border-border rounded-2xl p-1 w-fit shadow-sm">
        {["monitoring", "listings_review", "disputes_exceptions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? "bg-main text-primary shadow-sm border border-border" : "text-txt-muted hover:text-txt-secondary"
              }`}
          >
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "monitoring" && <MonitoringTab t={t} />}
        {activeTab === "listings_review" && <ListingsReviewTab t={t} />}
        {activeTab === "disputes_exceptions" && <DisputesTab t={t} />}
      </div>
    </div>
  );
}

function MonitoringTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column - Charts & Activity */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title={t("resale_volume")} value="34" sub={t("common.resale_sub.transactions_day")} data={resaleMockData.volumeData} dataKey="volume" color="#6366f1" />
          <ChartCard title={t("avg_resale_price")} value="1.42M" sub={t("common.resale_sub.million_vnd")} data={resaleMockData.priceTrendData} dataKey="price" color="#8b5cf6" />
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Layers size={18} className="text-txt-muted" />
            <h3 className="text-lg font-bold text-txt-primary">{t("top_resale_events")}</h3>
          </div>
          <div className="space-y-6">
            {resaleMockData.topEvents.map((e, i) => (
              <EventResaleItem key={i} name={e.name} transactions={e.transactions} flags={e.flags} percentage={e.percentage} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Compliance & Spikes */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-primary" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("price_cap_compliance")}</h3>
          </div>
          <div className="space-y-6 mb-8">
            <ComplianceBar label={t("within_cap")} count={193} total={214} color="bg-emerald-500" />
            <ComplianceBar label={t("near_cap")} count={14} total={214} color="bg-amber-500" />
            <ComplianceBar label={t("over_cap")} count={7} total={214} color="bg-rose-500" />
          </div>
          <div className="bg-main border border-border rounded-2xl p-4 flex gap-3">
            <Info size={16} className="text-txt-muted flex-shrink-0" />
            <p className="text-[10px] text-txt-muted font-medium leading-relaxed italic">{t("price_cap_info")}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-rose-500" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("suspicious_spikes")}</h3>
          </div>
          <div className="space-y-3">
            {resaleMockData.spikes.map((s, i) => (
              <SpikeAlert key={i} level={s.level} title={s.title} desc={t(`common.resale_sub.${s.desc}`, { percent: s.percent, time: s.time, count: s.count, source: s.source ? t(`common.${s.source}`) : "" })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingsReviewTab({ t }: any) {
  const [selectedListing, setSelectedListing] = useState<any>(resaleMockData.listings[1]);
  const [filter, setFilter] = useState("Tất cả");

  const filteredListings = useMemo(() => {
    if (filter === "Tất cả") return resaleMockData.listings;
    return resaleMockData.listings.filter(l => l.status === filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-surface border border-border rounded-3xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
          <input
            type="text"
            placeholder="Tìm theo Listing ID, event hoặc seller"
            className="w-full pl-12 pr-4 py-2.5 bg-main border border-border rounded-2xl text-sm focus:bg-surface focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex bg-main border border-border rounded-xl p-1">
          {["Tất cả", "Active", "Locked", "Over cap", "Under review", "Removed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-txt-muted hover:text-txt-secondary'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Listings Table */}
        <div className="xl:col-span-8 bg-surface border border-border rounded-3xl overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <Layers size={18} className="text-txt-muted" />
            <h3 className="text-sm font-black text-txt-primary">Listings cần rà soát</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                  <th className="px-6 py-4">Listing</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4 text-right">Giá</th>
                  <th className="px-6 py-4">Cap</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Flag</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredListings.map((l, i) => (
                  <tr key={i} onClick={() => setSelectedListing(l)} className={`hover:bg-main/30 transition-colors group cursor-pointer ${selectedListing?.id === l.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-1 py-4 text-[11px] font-black text-txt-primary">{l.id}</td>
                    <td className="px-1 py-4 text-xs font-bold text-txt-secondary">{l.event}</td>
                    <td className="px-1 py-4 text-[10px] font-medium text-txt-muted">{l.seller}</td>
                    <td className="px-1 py-4 text-[10px] font-bold text-txt-muted">{l.tier}</td>
                    <td className="px-1 py-4 text-right text-xs font-black text-txt-primary">{l.price}</td>
                    <td className="px-1 py-4">
                      <Badge color={l.cap === 'Within cap' ? 'emerald' : 'rose'}>
                        {l.cap}
                      </Badge>
                    </td>
                    <td className="px-1 py-4">
                      <Badge color={l.status === 'Active' ? 'indigo' : 'amber'}>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-1 py-4 text-[10px] font-medium text-rose-500 italic">{l.flag}</td>
                    <td className="px-1 py-4 text-right">
                      <button className="text-[10px] font-black text-primary hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Listing Detail Sidebar */}
        {selectedListing && (
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-2">
                <DatabaseIcon size={18} className="text-txt-muted" />
                <h3 className="text-sm font-black text-txt-primary">Chi tiết {selectedListing.id}</h3>
              </div>

              <div className="space-y-4">
                <DetailItemSidebar icon={<Calendar size={14} />} label="Event" value={selectedListing.event} />
                <DetailItemSidebar icon={<Layers size={14} />} label="Hạng vé" value={selectedListing.tier} />
                <DetailItemSidebar icon={<User size={14} />} label="Người bán" value={selectedListing.seller} />
                <DetailItemSidebar icon={<Activity size={14} />} label="Chủ sở hữu trước" value={selectedListing.previousOwner} />
                <DetailItemSidebar icon={<DollarSign size={14} />} label="Giá niêm yết" value={selectedListing.price} />
                <DetailItemSidebar icon={<DollarSign size={14} />} label="Giá trần" value={selectedListing.listingLimit} />
              </div>

              <div className="flex gap-2">
                <Badge color={selectedListing.status === 'Active' ? 'indigo' : 'amber'}>
                  {selectedListing.status}
                </Badge>
                <Badge color={selectedListing.cap === 'Within cap' ? 'emerald' : 'rose'}>
                  {selectedListing.cap}
                </Badge>
              </div>

              {selectedListing.flag !== '—' && (

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3">
                  <Flag size={16} className="text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-orange-900 uppercase">System flag</p>
                    <p className="text-xs font-medium text-orange-800">Price cap exceeded</p>
                  </div>
                </div>
              )
              }
              <div className="pt-6 border-t border-border">
                <h4 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} /> Lịch sử listing
                </h4>
                <div className="space-y-4">
                  {selectedListing.hisListings?.map((h: any, idx: number) => (
                    <HistoryItem key={idx} time={h.time} text={h.text} />
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h4 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MoreHorizontal size={14} /> Hành động admin
                </h4>
                <textarea
                  placeholder="Ghi chú nội bộ về listing này..."
                  defaultValue={selectedListing.note}
                  className="w-full p-4 bg-main border border-border rounded-2xl text-xs outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                ></textarea>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all">Thêm ghi chú</button>
                  <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all">Mark under review</button>
                  <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all text-amber-600">Escalate</button>
                  <button className="py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">Remove listing</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisputesTab({ t }: any) {
  const [selectedCase, setSelectedCase] = useState<any>(resaleMockData.disputes[0]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Disputes Table */}
      <div className="xl:col-span-8 bg-surface border border-border rounded-3xl overflow-hidden shadow-sm h-fit">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Scale size={18} className="text-txt-muted" />
          <h3 className="text-sm font-black text-txt-primary">Hàng đợi disputes resale</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border">
                <th className="px-6 py-4">Case</th>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Liên quan</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cập nhật</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resaleMockData.disputes.map((d, i) => (
                <tr key={i} onClick={() => setSelectedCase(d)} className={`hover:bg-main/30 transition-colors group cursor-pointer ${selectedCase?.id === d.id ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4 text-xs font-black text-txt-primary">{d.id}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-txt-muted">{d.ticket}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-txt-secondary">{d.event}</td>
                  <td className="px-6 py-4 text-[10px] font-medium text-txt-muted italic">{d.parties}</td>
                  <td className="px-6 py-4 text-xs font-black text-txt-primary">{d.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${d.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      d.priority === 'High' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                      {d.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface border border-border rounded-lg text-[9px] font-black uppercase">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-txt-muted">{d.lastUpdate}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-black text-primary hover:underline">Mở</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Sidebar */}
      {selectedCase && (
        <div className="xl:col-span-4 bg-surface border border-border rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-txt-primary">Case {selectedCase.id}</h3>
            </div>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded text-[9px] font-black uppercase">High</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded text-[9px] font-black uppercase">Investigating</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-black text-txt-primary">{selectedCase.type}</h4>
            </div>

            <div className="space-y-4">
              <DetailItemSidebar icon={<Layers size={14} />} label="Vé liên quan" value={selectedCase.ticket} />
              <DetailItemSidebar icon={<Calendar size={14} />} label="Sự kiện" value={selectedCase.event} />
              <DetailItemSidebar icon={<User size={14} />} label="Bên liên quan" value={selectedCase.parties} />
              <DetailItemSidebar icon={<Clock size={14} />} label="Cập nhật" value={selectedCase.lastUpdate} />
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-2">Mô tả</p>
              <div className="p-4 bg-main rounded-2xl text-xs text-txt-secondary leading-relaxed font-medium">
                {selectedCase.description}
              </div>
            </div>

            <div className="pt-2">
              <textarea
                placeholder="Ghi chú nội bộ về case..."
                defaultValue={selectedCase.note}
                className="w-full p-4 bg-main border border-border rounded-2xl text-xs outline-none focus:border-primary transition-all min-h-[100px] resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all">Thêm ghi chú</button>
              <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all text-amber-600">Escalate</button>
              <button className="py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black hover:bg-main transition-all text-rose-600">Remove listing</button>
              <button className="py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Resolve case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable sub-components
function StatsCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    gray: "bg-main text-txt-muted border-border",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-lg font-black text-txt-primary tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function ChartCard({ title, value, sub, data, dataKey, color }: any) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-txt-muted flex items-center gap-2">
          <Activity size={14} />
          {title}
        </h4>
      </div>
      <div className="flex items-end gap-2 mb-6">
        <span className="text-2xl font-black text-txt-primary tracking-tight">{value}</span>
        <span className="text-[10px] text-txt-muted font-bold mb-1 uppercase tracking-widest">{sub}</span>
      </div>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComplianceBar({ label, count, total, color }: any) {
  const percentage = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px]">
        <span className="font-medium text-txt-secondary">{label}</span>
        <span className="font-black text-txt-primary">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-1.5 w-full bg-main rounded-full overflow-hidden border border-border">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function EventResaleItem({ name, transactions, flags, percentage }: any) {
  const t = useTranslations("Admin");
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-txt-secondary group-hover:text-primary transition-colors">{name}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-txt-muted">{transactions} {t("common.resale_sub.transactions_count", { count: transactions })}</span>
          {flags > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[9px] font-black border border-rose-500/20 flex items-center gap-1">
              <Flag size={10} /> {flags} {t("common.resale_sub.flags_count", { count: flags })}
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 w-full bg-main rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-primary/60 group-hover:bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function SpikeAlert({ level, title, desc }: any) {
  const t = useTranslations("Admin");
  const styles: any = {
    High: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low: "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`p-3.5 rounded-2xl border ${styles[level]} flex items-center justify-between group cursor-pointer hover:shadow-sm transition-all`}>
      <div className="flex items-center gap-3">
        <div className="text-[9px] font-black uppercase tracking-widest">{level}</div>
        <div className="w-px h-3 bg-current/20"></div>
        <div className="text-xs font-bold">{title} - <span className="opacity-80 font-medium">{desc}</span></div>
      </div>
      <ChevronRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function DetailItemSidebar({ icon, label, value }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-txt-muted">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-black text-txt-primary ml-6">{value}</p>
    </div>
  );
}

function HistoryItem({ time, text }: any) {
  return (
    <div className="flex gap-3 relative before:absolute before:left-[5px] before:top-4 before:bottom-[-20px] before:w-[1px] before:bg-border last:before:hidden">
      <div className="w-[11px] h-[11px] rounded-full bg-indigo-500 border-2 border-surface z-10 flex-shrink-0 mt-1"></div>
      <div>
        <p className="text-[10px] font-bold text-txt-muted mb-0.5">{time}</p>
        <p className="text-[11px] font-medium text-txt-secondary leading-snug">{text}</p>
      </div>
    </div>
  );
}

function DatabaseIcon({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function Badge({ children, color }: { children: React.ReactNode, color: 'emerald' | 'rose' | 'indigo' | 'amber' | 'orange' | 'gray' }) {
  const styles: any = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    gray: "bg-main text-txt-muted border-border",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${styles[color]}`}>
      {children}
    </span>
  );
}
