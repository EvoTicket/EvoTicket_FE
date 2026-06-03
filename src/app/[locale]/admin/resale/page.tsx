"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Scale,
  Download,
  ChevronRight,
  ChevronLeft,
  Activity,
  Zap,
  Flag,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
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
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { adminResaleApi, AdminResaleDashboardResponse, ResaleListingDto, DisputeDto } from "@/src/lib/api/adminResaleApi";

export default function AdminResalePage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("monitoring");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<AdminResaleDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ResaleListingDto | null>(null);
  const [selectedCase, setSelectedCase] = useState<DisputeDto | null>(null);

  // Debounce search input to avoid hitting database on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(1); // Reset page index on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Load resale dashboard data from API
  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await adminResaleApi.getResaleDashboard({
          tab: activeTab,
          statusFilter,
          search: search || undefined,
          page,
          size: pageSize,
        });

        if (isMounted) {
          setData(res);
          setError(null);

          // Update selection bindings safely
          if (res.listings && res.listings.content.length > 0) {
            const foundListing = res.listings.content.find(l => l.id === selectedListing?.id);
            setSelectedListing(foundListing || res.listings.content[0]);
          } else {
            setSelectedListing(null);
          }

          if (res.disputes && res.disputes.length > 0) {
            const foundCase = res.disputes.find(c => c.id === selectedCase?.id);
            setSelectedCase(foundCase || res.disputes[0]);
          } else {
            setSelectedCase(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching resale dashboard:", err);
          setError("Không thể tải thông tin resale dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [activeTab, statusFilter, search, page, pageSize]);

  // Shifting tabs resets search and page
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchVal("");
    setSearch("");
    setStatusFilter("Tất cả");
    setPage(1);
  };

  const statsList = data?.stats || [
    { label: "resale_volume", value: "0", sub: "common.resale_sub.days_count", color: "gray" },
    { label: "avg_resale_price", value: "0 VND", sub: "common.resale_sub.vs_last_week", color: "indigo" },
    { label: "royalty_collected", value: "0 VND", sub: "common.resale_sub.for_organizers", color: "emerald" },
    { label: "flagged_listings", value: "0", sub: "common.resale_sub.over_cap_anomaly", color: "rose" },
    { label: "open_disputes", value: "0", sub: "common.resale_sub.incident_short", color: "rose" }
  ];

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
          <div className="flex bg-surface border border-border rounded-ds-xl p-1 shadow-sm text-xs font-bold transition-colors">
            {["24h", "7d", "30d", t("common.custom")].map((range) => (
              <button key={range} className={`px-4 py-1.5 rounded-ds-lg transition-all ${range === '7d' ? 'bg-main text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}>{range}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <Download size={18} />
            <span>{t("btn_export_report")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statsList.map((stat, i) => (
          <StatsCard
            key={i}
            icon={
              stat.label === "resale_volume" ? <Activity size={20} /> :
              stat.label === "avg_resale_price" ? <TrendingUp size={20} /> :
              stat.label === "royalty_collected" ? <DollarSign size={20} /> :
              stat.label === "flagged_listings" ? <Flag size={20} /> :
              <Scale size={20} />
            }
            label={t(stat.label)}
            value={stat.value}
            sub={stat.label === "resale_volume" ? t(stat.sub, { count: 7 }) :
                 stat.label === "avg_resale_price" ? t(stat.sub, { percent: 3 }) :
                 stat.label === "royalty_collected" ? t(stat.sub, { count: 12 }) :
                 stat.label === "flagged_listings" ? t(stat.sub, { over: 3, anomaly: 4 }) :
                 t(stat.sub, { critical: 1, high: 1 })}
            color={stat.color}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-surface border border-border rounded-ds-2xl p-1 w-fit shadow-sm">
        {["monitoring", "listings_review", "disputes_exceptions"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-ds-xl transition-all ${activeTab === tab ? "bg-main text-primary shadow-sm border border-border" : "text-txt-muted hover:text-txt-secondary"
              }`}
          >
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {error ? (
          <div className="p-8 text-center text-xs font-bold text-rose-500 bg-rose-500/5 rounded-ds-3xl border border-rose-500/10">
            {error}
          </div>
        ) : (
          <>
            {activeTab === "monitoring" && (
              <MonitoringTab
                t={t}
                data={data}
                loading={loading}
              />
            )}
            {activeTab === "listings_review" && (
              <ListingsReviewTab
                t={t}
                data={data}
                loading={loading}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                page={page}
                setPage={setPage}
                selectedListing={selectedListing}
                setSelectedListing={setSelectedListing}
              />
            )}
            {activeTab === "disputes_exceptions" && (
              <DisputesTab
                t={t}
                data={data}
                loading={loading}
                selectedCase={selectedCase}
                setSelectedCase={setSelectedCase}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MonitoringTab({ t, data, loading }: any) {
  if (loading || !data) {
    return (
      <div className="text-center py-20 text-xs font-bold text-txt-muted flex items-center justify-center gap-2">
        <Clock size={16} className="animate-spin text-primary" />
        <span>Đang tải số liệu monitoring...</span>
      </div>
    );
  }

  const latestVolume = data.volumeData?.length ? String(data.volumeData[data.volumeData.length - 1].volume) : "0";
  const latestPrice = data.priceTrendData?.length ? `${data.priceTrendData[data.priceTrendData.length - 1].price}M` : "0M";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column - Charts & Activity */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title={t("resale_volume")} value={latestVolume} sub={t("common.resale_sub.transactions_day")} data={data.volumeData} dataKey="volume" color="#6366f1" />
          <ChartCard title={t("avg_resale_price")} value={latestPrice} sub={t("common.resale_sub.million_vnd")} data={data.priceTrendData} dataKey="price" color="#8b5cf6" />
        </div>

        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Layers size={18} className="text-txt-muted" />
            <h3 className="text-lg font-bold text-txt-primary">{t("top_resale_events")}</h3>
          </div>
          <div className="space-y-6">
            {data.topEvents?.map((e: any, i: number) => (
              <EventResaleItem key={i} name={e.name} transactions={e.transactions} flags={e.flags} percentage={e.percentage} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Compliance & Spikes */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-primary" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("price_cap_compliance")}</h3>
          </div>
          <div className="space-y-6 mb-8">
            {data.compliance?.map((c: any, i: number) => (
              <ComplianceBar key={i} label={t(c.label)} count={c.count} total={c.total} color={c.color} />
            ))}
          </div>
          <div className="bg-main border border-border rounded-ds-2xl p-4 flex gap-3">
            <Info size={16} className="text-txt-muted flex-shrink-0" />
            <p className="text-[10px] text-txt-muted font-medium leading-relaxed italic">{t("price_cap_info")}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-rose-500" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("suspicious_spikes")}</h3>
          </div>
          <div className="space-y-3">
            {data.spikes?.map((s: any, i: number) => (
              <SpikeAlert key={i} level={s.level} title={s.title} desc={t(`common.resale_sub.${s.desc}`, { percent: s.percent, time: s.time, count: s.count, source: s.source ? t(`common.${s.source}`) : "" })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingsReviewTab({
  t,
  data,
  loading,
  statusFilter,
  setStatusFilter,
  searchVal,
  setSearchVal,
  page,
  setPage,
  selectedListing,
  setSelectedListing
}: any) {
  const listingsList = data?.listings?.content || [];
  const totalElements = data?.listings?.totalElements || 0;
  const totalPages = data?.listings?.totalPages || 0;
  const pageSize = data?.listings?.size || 10;

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-surface border border-border rounded-ds-3xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Tìm theo Listing ID, event hoặc seller"
            className="w-full pl-12 pr-4 py-2.5 bg-main border border-border rounded-ds-2xl text-sm focus:bg-surface focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex bg-main border border-border rounded-ds-xl p-1">
          {["Tất cả", "Active", "Locked", "Over cap", "Under review", "Removed"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-[10px] font-black rounded-ds-lg transition-all ${statusFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-txt-muted hover:text-txt-secondary'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Listings Table */}
        <div className="xl:col-span-8 bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm h-fit">
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
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-20 text-xs font-bold text-txt-muted">
                      <div className="flex items-center justify-center gap-2">
                        <Clock size={16} className="animate-spin text-primary" />
                        <span>Đang tải danh sách listings...</span>
                      </div>
                    </td>
                  </tr>
                ) : listingsList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-txt-muted text-xs font-bold italic">
                      Không tìm thấy listing nào cần rà soát.
                    </td>
                  </tr>
                ) : (
                  listingsList.map((l: any, i: number) => (
                    <tr key={i} onClick={() => setSelectedListing(l)} className={`hover:bg-main/30 transition-colors group cursor-pointer ${selectedListing?.id === l.id ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4 text-[11px] font-black text-txt-primary">{l.id}</td>
                      <td className="px-6 py-4 text-xs font-bold text-txt-secondary">{l.event}</td>
                      <td className="px-6 py-4 text-[10px] font-medium text-txt-muted truncate max-w-[120px]">{l.seller}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-txt-muted">{l.tier}</td>
                      <td className="px-6 py-4 text-right text-xs font-black text-txt-primary whitespace-nowrap">{l.price}</td>
                      <td className="px-6 py-4">
                        <Badge color={l.cap === 'Within cap' ? 'emerald' : 'rose'}>
                          {l.cap}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={l.status === 'Active' ? 'indigo' : l.status === 'Locked' ? 'amber' : l.status === 'Over cap' ? 'rose' : 'gray'}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-medium text-rose-500 italic whitespace-nowrap">{l.flag}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[10px] font-black text-primary hover:underline">Review</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalElements > 0 && (
            <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
              <p className="text-[10px] font-medium text-txt-muted uppercase tracking-widest">
                Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalElements)} trên tổng {totalElements}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((prev: number) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-ds-lg transition-all ${page === 1 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <PaginationButton
                    key={pageNum}
                    active={page === pageNum}
                    label={pageNum.toString()}
                    onClick={() => setPage(pageNum)}
                  />
                ))}

                <button
                  onClick={() => setPage((prev: number) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className={`w-8 h-8 flex items-center justify-center rounded-ds-lg transition-all ${page === totalPages ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Listing Detail Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          {selectedListing ? (
            <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-2">
                <DatabaseIcon size={18} className="text-txt-muted" />
                <h3 className="text-sm font-black text-txt-primary">Chi tiết {selectedListing.id}</h3>
              </div>

              <div className="space-y-4">
                <DetailItemSidebar icon={<Calendar size={14} />} label="Event" value={selectedListing.event} />
                <DetailItemSidebar icon={<Layers size={14} />} label="Hạng vé" value={selectedListing.tier} />
                <DetailItemSidebar icon={<User size={14} />} label="Người bán" value={selectedListing.seller} />
                <DetailItemSidebar icon={<Activity size={14} />} label="Chủ sở hữu trước" value={selectedListing.previousOwner || "N/A"} />
                <DetailItemSidebar icon={<DollarSign size={14} />} label="Giá niêm yết" value={selectedListing.price} />
                <DetailItemSidebar icon={<DollarSign size={14} />} label="Giá trần" value={String(selectedListing.listingLimit)} />
              </div>

              <div className="flex gap-2">
                <Badge color={selectedListing.status === 'Active' ? 'indigo' : selectedListing.status === 'Locked' ? 'amber' : selectedListing.status === 'Over cap' ? 'rose' : 'gray'}>
                  {selectedListing.status}
                </Badge>
                <Badge color={selectedListing.cap === 'Within cap' ? 'emerald' : 'rose'}>
                  {selectedListing.cap}
                </Badge>
              </div>

              {selectedListing.flag !== '—' && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-ds-2xl flex gap-3">
                  <Flag size={16} className="text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-orange-900 uppercase">System flag</p>
                    <p className="text-xs font-medium text-orange-800">{selectedListing.flag}</p>
                  </div>
                </div>
              )}

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
                  className="w-full p-4 bg-main border border-border rounded-ds-2xl text-xs outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                ></textarea>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all">Thêm ghi chú</button>
                  <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all">Mark under review</button>
                  <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all text-amber-600">Escalate</button>
                  <button className="py-2.5 bg-rose-600 text-white rounded-ds-xl text-[10px] font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">Remove listing</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-ds-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center transition-colors h-fit">
              <div className="w-16 h-16 rounded-ds-2xl bg-main flex items-center justify-center text-txt-muted/20 mb-4">
                <Activity size={32} />
              </div>
              <h4 className="text-sm font-bold text-txt-muted">Chọn một listing để xem chi tiết</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DisputesTab({ t, data, loading, selectedCase, setSelectedCase }: any) {
  if (loading || !data) {
    return (
      <div className="text-center py-20 text-xs font-bold text-txt-muted flex items-center justify-center gap-2">
        <Clock size={16} className="animate-spin text-primary" />
        <span>Đang tải danh sách disputes...</span>
      </div>
    );
  }

  const disputesList = data.disputes || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Disputes Table */}
      <div className="xl:col-span-8 bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm h-fit">
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
              {disputesList.map((d: any, i: number) => (
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
                    <span className="px-2 py-1 bg-surface border border-border rounded-ds-lg text-[9px] font-black uppercase">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-txt-muted">{d.lastUpdate}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[10px] font-black text-primary hover:underline">Mở</button>
                  </td>
                </tr>
              ))}
              {disputesList.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-txt-muted text-xs font-bold italic">
                    Không có case dispute nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Sidebar */}
      <div className="xl:col-span-4">
        {selectedCase ? (
          <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm h-fit space-y-6 sticky top-[104px] animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-500" />
                <h3 className="text-sm font-black text-txt-primary">Case {selectedCase.id}</h3>
              </div>
              <div className="flex gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                  selectedCase.priority === "Critical" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                  selectedCase.priority === "High" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>{selectedCase.priority}</span>
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded text-[9px] font-black uppercase">{selectedCase.status}</span>
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
                <div className="p-4 bg-main rounded-ds-2xl text-xs text-txt-secondary leading-relaxed font-medium">
                  {selectedCase.description}
                </div>
              </div>

              <div className="pt-2">
                <textarea
                  placeholder="Ghi chú nội bộ về case..."
                  defaultValue={selectedCase.note}
                  className="w-full p-4 bg-main border border-border rounded-ds-2xl text-xs outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all">Thêm ghi chú</button>
                <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all text-amber-600">Escalate</button>
                <button className="py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-black hover:bg-main transition-all text-rose-600">Remove listing</button>
                <button className="py-2.5 bg-indigo-600 text-white rounded-ds-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Resolve case</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-ds-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center transition-colors h-fit">
            <div className="w-16 h-16 rounded-ds-2xl bg-main flex items-center justify-center text-txt-muted/20 mb-4">
              <Scale size={32} />
            </div>
            <h4 className="text-sm font-bold text-txt-muted">Chọn một case dispute để xem chi tiết</h4>
          </div>
        )}
      </div>
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
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm transition-colors animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-ds-xl flex items-center justify-center ${colors[color] || colors.gray}`}>
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
    <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm transition-colors">
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
  const percentage = total > 0 ? (count / total) * 100 : 0;
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
  const styles: any = {
    High: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low: "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`p-3.5 rounded-ds-2xl border ${styles[level]} flex items-center justify-between group cursor-pointer hover:shadow-sm transition-all`}>
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
      <p className="text-xs font-black text-txt-primary ml-6 break-all">{value}</p>
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
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
}

function PaginationButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-ds-xl text-[11px] font-black transition-all ${active
        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
        : "text-txt-muted bg-surface border border-border hover:bg-main"
        }`}
    >
      {label}
    </button>
  );
}

function ChevronDownIcon({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
