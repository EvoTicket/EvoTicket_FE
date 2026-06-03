"use client";

import { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  ShieldAlert,
  AlertCircle,
  Settings,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Lock,
  Tag
} from "lucide-react";
import { useTranslations } from "next-intl";
import { adminAuditApi, AdminAuditDashboardResponse, AuditLogDto } from "@/src/lib/api/adminAuditApi";

export default function AdminAuditPage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("all");
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState<AdminAuditDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  // Debounce search input to avoid hitting backend on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(1); // Reset page index on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Load audit dashboard data from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const response = await adminAuditApi.getAuditDashboard({
          tab: activeTab,
          search: search || undefined,
          page,
          size: pageSize,
        });

        if (isMounted) {
          setData(response);
          setError(null);
          
          const logsList = response.logs.content;
          if (logsList.length > 0) {
            // Re-select currently selected log if it exists in the new list, otherwise select first item
            const found = logsList.find(log => log.id === selectedLog?.id);
            if (found) {
              setSelectedLog(found);
            } else {
              setSelectedLog(logsList[0]);
            }
          } else {
            setSelectedLog(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching audit logs:", err);
          setError("Không thể tải danh sách nhật ký hệ thống.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAuditLogs();

    return () => {
      isMounted = false;
    };
  }, [activeTab, search, page, pageSize]);

  // Tab shift clears search and page index back to 1
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchVal("");
    setSearch("");
    setPage(1);
  };

  const statsList = data?.stats || [
    { label: "total_logs", value: "0", sub: "logs_30d", color: "indigo" },
    { label: "sensitive_actions", value: "0", sub: "require_mfa", color: "rose" },
    { label: "failed_actions", value: "0", sub: "failed_rate_low", color: "rose" },
    { label: "system_changes", value: "0", sub: "changes_applied", color: "amber" }
  ];

  const logsList = data?.logs.content || [];
  const totalPages = data?.logs.totalPages || 0;
  const totalElements = data?.logs.totalElements || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-06</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("audit_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("audit_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface border border-border rounded-ds-xl p-1 shadow-sm text-xs font-bold transition-colors">
            {["24h", "7d", "30d", t("common.custom")].map((range) => (
              <button key={range} className={`px-4 py-1.5 rounded-ds-lg transition-all ${range === '30d' ? 'bg-main text-txt-primary shadow-sm' : 'text-txt-muted hover:text-txt-secondary'}`}>{range}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all">
            <Download size={18} />
            <span>{t("btn_export_log")}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, i) => (
          <StatsCard key={i} icon={
            stat.label === "total_logs" ? <History size={20} /> :
              stat.label === "sensitive_actions" ? <ShieldAlert size={20} /> :
                stat.label === "failed_actions" ? <AlertCircle size={20} /> :
                  <Settings size={20} />
          } label={t(stat.label)} value={stat.value} sub={t(stat.sub)} color={stat.color} />
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-ds-2xl p-4 flex items-center gap-4 transition-colors">
        <Info size={20} className="text-primary" />
        <p className="text-xs font-bold text-txt-primary">{t("audit_banner_text")}</p>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Log Master */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden transition-colors duration-300">
            {/* Tabs & Search */}
            <div className="flex items-center justify-between border-b border-border px-6">
              <div className="flex items-center">
                <TabItem active={activeTab === "all"} onClick={() => handleTabChange("all")} label={t("tab_all_logs")} />
                <TabItem active={activeTab === "sensitive"} onClick={() => handleTabChange("sensitive")} label={t("tab_sensitive")} />
                <TabItem active={activeTab === "config"} onClick={() => handleTabChange("config")} label={t("tab_config")} />
              </div>
            </div>

            {/* Local Filters */}
            <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border bg-surface transition-colors">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={t("search_logs_placeholder")}
                  className="w-full pl-10 pr-4 py-2 bg-main border border-border rounded-ds-xl text-xs outline-none focus:bg-surface focus:border-primary text-txt-primary placeholder:text-txt-muted transition-all"
                />
              </div>
              <FilterSelect label={t("filter_module")} value={t("common.all")} />
              <FilterSelect label={t("filter_severity")} value={t("common.all")} />
              <FilterSelect label={t("filter_result")} value={t("common.all")} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-main/50">
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_timestamp")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_actor")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_action")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_target")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("filter_severity")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("filter_result")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-xs font-bold text-txt-muted">
                        <div className="flex items-center justify-center gap-2">
                          <Clock size={16} className="animate-spin text-primary" />
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-xs font-bold text-rose-500">
                        {error}
                      </td>
                    </tr>
                  ) : logsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-xs font-bold text-txt-muted italic">
                        {t("common.no_data")}
                      </td>
                    </tr>
                  ) : (
                    logsList.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`hover:bg-main/30 transition-all cursor-pointer group ${selectedLog?.id === log.id ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">{log.timestamp}</td>
                        <td className="px-6 py-4">
                          <div className="min-w-[100px]">
                            <p className="text-[11px] font-bold text-txt-primary">{log.actor}</p>
                            <p className="text-[9px] text-txt-muted font-medium">{log.role}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-txt-secondary">{log.action}</span>
                            {log.sensitive && <Lock size={12} className="text-amber-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[11px] font-medium text-txt-muted line-clamp-1">{log.target}</p>
                        </td>
                        <td className="px-6 py-4">
                          <SeverityBadge level={log.severity} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ResultBadge result={log.result} />
                            <ChevronRight size={14} className={`text-txt-muted/30 transition-transform ${selectedLog?.id === log.id ? 'translate-x-1 text-primary' : 'group-hover:translate-x-1'}`} />
                          </div>
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
                  Hiển thị {totalElements > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, totalElements)} trên tổng {totalElements}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
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
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className={`w-8 h-8 flex items-center justify-center rounded-ds-lg transition-all ${page === totalPages ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Log Detail */}
        <div className="xl:col-span-4 space-y-6">
          {selectedLog ? (
            <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm sticky top-[104px] animate-in slide-in-from-right-4 duration-300 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-txt-primary">{selectedLog.action}</h3>
                <DetailResultBadge result={selectedLog.result} />
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                <SeverityBadge level={selectedLog.severity} />
                <span className="px-2 py-0.5 rounded bg-main text-txt-muted text-[9px] font-black border border-border uppercase">{selectedLog.module}</span>
                {selectedLog.sensitive && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black border border-amber-500/20 uppercase flex items-center gap-1">
                  <Lock size={10} /> {t("common.sensitive")}
                </span>}
              </div>

              <div className="space-y-6">
                <p className="text-sm font-medium text-txt-secondary leading-relaxed italic">
                  "{selectedLog.description || t("log_default_desc")}"
                </p>

                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-border">
                  <DetailRow icon={<Clock size={16} />} label={t("log_time")} value={selectedLog.timestamp} />
                  <DetailRow icon={<User size={16} />} label={t("log_actor")} value={`${selectedLog.actor} · ${selectedLog.role}`} />
                  <DetailRow icon={<Tag size={16} />} label={t("log_target")} value={selectedLog.target} sub={selectedLog.targetType} />
                  <DetailRow icon={<HashIcon size={16} />} label={t("correlation_id")} value={selectedLog.correlationId || "N/A"} />
                  <DetailRow icon={<ShieldAlert size={16} />} label={t("audit_id")} value={selectedLog.auditId || "N/A"} />
                </div>

                {selectedLog.note && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-ds-2xl p-4 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-amber-600" />
                      <span className="text-[10px] font-black text-amber-900 dark:text-amber-500 uppercase tracking-wider">{t("internal_note")}</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-600 font-medium">{selectedLog.note}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-ds-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center transition-colors h-fit">
              <div className="w-16 h-16 rounded-ds-2xl bg-main flex items-center justify-center text-txt-muted/20 mb-4">
                <History size={32} />
              </div>
              <h4 className="text-sm font-bold text-txt-muted">{t("common.select_to_view")}</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatsCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary border-primary/20",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    gray: "bg-main text-txt-muted border-border",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-ds-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-black text-txt-primary tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function TabItem({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-xs font-bold transition-all relative ${active ? "text-primary" : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      <span>{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
    </button>
  );
}

function FilterSelect({ label, value }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-ds-xl shadow-sm cursor-pointer hover:bg-main transition-all text-[10px] text-txt-primary">
      <span className="font-medium text-txt-muted">{label}:</span>
      <span className="font-bold">{value}</span>
      <ChevronDownIcon size={12} className="text-txt-muted" />
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    "Critical": "bg-rose-500/10 text-rose-700 border-rose-500/20 font-black",
    "High": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Medium": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Low": "bg-main text-txt-muted border-border",
  };

  const label = t(`common.severity.${level.toLowerCase()}`);

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] border uppercase ${styles[level] || styles["Low"]}`}>
      {label}
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    "Success": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    "Partial": "text-amber-500 bg-amber-500/10 border-amber-500/20",
    "Failed": "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[result] || styles["Failed"]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${result === "Success" ? "bg-emerald-500" : result === "Partial" ? "bg-amber-500" : "bg-rose-500"
        }`}></div>
      {t(`common.result.${result.toLowerCase()}`).toUpperCase()}
    </div>
  );
}

function DetailResultBadge({ result }: { result: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    "Success": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Partial": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Failed": "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-ds-lg text-[10px] font-black border uppercase ${styles[result] || styles["Failed"]}`}>
      {result === "Success" ? <CheckCircle2 size={12} /> : result === "Partial" ? <Info size={12} /> : <XCircle size={12} />}
      {t(`common.result.${result.toLowerCase()}`).toUpperCase()}
    </div>
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

function DetailRow({ icon, label, value, sub }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-ds-lg bg-main flex items-center justify-center text-txt-muted flex-shrink-0 border border-border">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-txt-primary break-all">{value}</p>
        {sub && <p className="text-[10px] font-medium text-primary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// SVG helper icons
function HashIcon({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function ChevronDownIcon({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
