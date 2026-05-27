"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  ChevronRight,
  ShieldCheck,
  User,
  Building2,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Slash,
  X
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { adminAccountsApi, type AccountSummaryResponse, type AccountDetailsResponse } from "@/src/lib/api/adminAccountsApi";

export default function AdminAccountsPage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const locale = useLocale();

  const [summary, setSummary] = useState<AccountSummaryResponse | null>(null);
  const [accountsPage, setAccountsPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigateToDetail = (row: any) => {
    router.push(`/${locale}/admin/accounts/${row.id}`);
  };

  const fetchSummary = useCallback(async () => {
    try {
      const data = await adminAccountsApi.getAccountSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load account summary:", err);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let role = roleFilter || undefined;
      let verification = verificationFilter || undefined;
      let status = statusFilter || undefined;

      if (activeTab === "pending") {
        role = "ORGANIZER";
        verification = "PENDING";
        status = undefined;
      } else if (activeTab === "restricted") {
        role = undefined;
        verification = undefined;
        status = "BANNED";
      }

      const response = await adminAccountsApi.searchAccounts({
        page: currentPage,
        size: 10,
        keyword: searchQuery || undefined,
        role,
        verification,
        status,
        sortBy: "id",
        direction: "desc"
      });
      setAccountsPage(response);
    } catch (err) {
      console.error("Failed to load accounts:", err);
      setError("Không thể tải danh sách tài khoản. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, searchQuery, roleFilter, verificationFilter, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Reset page when tab/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, roleFilter, verificationFilter, statusFilter, searchQuery]);

  const totalElements = accountsPage?.totalElements || 0;
  const startElement = totalElements > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endElement = Math.min(currentPage * 10, totalElements);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-02</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("accounts_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("accounts_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-ds-xl font-bold border border-border shadow-sm transition-all">
          <Download size={18} />
          <span>{t("export_list")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<Users size={20} />} label={t("total_accounts")} value={summary?.totalAccounts?.toLocaleString() || "0"} color="indigo" />
        <StatsCard icon={<Building2 size={20} />} label={t("active_organizers")} value={summary?.activeOrganizers?.toLocaleString() || "0"} color="emerald" />
        <StatsCard icon={<Clock size={20} />} label={t("pending_approval")} value={summary?.pendingApprovals?.toLocaleString() || "0"} color="amber" />
        <StatsCard icon={<AlertCircle size={20} />} label={t("restricted_label")} value={summary?.restrictedAccounts?.toLocaleString() || "0"} color="rose" />
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden transition-colors duration-300">
        {/* Tabs */}
        <div className="flex items-center border-b border-border px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabItem
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label={t("tab_all_accounts")}
            count={summary?.totalAccounts || 0}
          />
          <TabItem
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label={t("tab_org_pending")}
            count={summary?.pendingApprovals || 0}
          />
          <TabItem
            active={activeTab === "restricted"}
            onClick={() => setActiveTab("restricted")}
            label={t("tab_restricted")}
            count={summary?.restrictedAccounts || 0}
          />
        </div>

        {/* Filters Bar */}
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
            <input
              type="text"
              placeholder={t("search_accounts_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-main border border-border rounded-ds-2xl text-sm focus:bg-surface focus:border-primary outline-none transition-all text-txt-primary placeholder:text-txt-muted"
            />
          </div>

          {activeTab === "all" && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-ds-2xl shadow-sm">
                <span className="text-[11px] font-medium text-txt-muted">{t("filter_type")}:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-[11px] font-bold text-txt-primary bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="">{t("common.all")}</option>
                  <option value="USER">{t("type_buyer")}</option>
                  <option value="ORGANIZER">{t("type_organizer")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-ds-2xl shadow-sm">
                <span className="text-[11px] font-medium text-txt-muted">{t("filter_verification")}:</span>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="text-[11px] font-bold text-txt-primary bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="">{t("common.all")}</option>
                  <option value="VERIFIED">{t("status_verified")}</option>
                  <option value="PENDING">{t("status_pending")}</option>
                  <option value="REJECTED">{t("status_rejected")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-ds-2xl shadow-sm">
                <span className="text-[11px] font-medium text-txt-muted">{t("filter_status")}:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-[11px] font-bold text-txt-primary bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="">{t("common.all")}</option>
                  <option value="ACTIVE">{t("status_active")}</option>
                  <option value="BANNED">{t("status_restricted")}</option>
                </select>
              </div>
            </>
          )}

          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-txt-muted hover:text-txt-primary transition-colors">
            <Filter size={18} />
            <span>{t("advanced_filters")}</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 border-y border-border">
                {activeTab === "all" && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_account")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_type")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_contact")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_verification")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_status")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_activity")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_last_active")}</th>
                  </>
                )}
                {activeTab === "pending" && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_org_name")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_representative")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_sent_at")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_verification")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_review_priority")}</th>
                  </>
                )}
                {activeTab === "restricted" && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_account")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_reason")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_restriction_type")}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        {t("col_restricted_from")} <MoreHorizontal size={12} className="rotate-90" />
                      </div>
                    </th>
                  </>
                )}
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-txt-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-txt-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : !accountsPage || accountsPage.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-txt-muted font-medium">
                    Không tìm thấy tài khoản nào khớp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              ) : (
                <>
                  {activeTab === "all" && accountsPage.content.map((row: any) => {
                    const avatar = row.fullName ? row.fullName.substring(0, 2).toUpperCase() : "US";
                    const isOrg = row.role === "ORGANIZER";
                    const lastActiveStr = row.lastActive
                      ? new Date(row.lastActive).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + " " + new Date(row.lastActive).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
                      : "—";

                    return (
                      <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isOrg ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                              }`}>
                              {avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold line-clamp-1">{row.fullName || "—"}</p>
                              <p className="text-[10px] font-medium text-txt-muted">ACC-{row.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-ds-lg text-[10px] font-bold border ${isOrg ? "bg-primary/10 text-primary border-primary/20" : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                            }`}>
                            {isOrg ? <Building2 size={12} /> : <User size={12} />}
                            {isOrg ? t("type_organizer") : t("type_buyer")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-[11px] font-bold">{row.email}</p>
                            <p className="text-[10px] text-txt-muted">{row.phoneNumber || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><VerificationBadge status={row.verificationStatus} /></td>
                        <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-6 py-4"><span className="text-sm font-bold">15</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-xs font-medium text-txt-muted">{lastActiveStr}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-ds-lg hover:bg-main transition-all shadow-sm"
                              onClick={() => navigateToDetail(row)}
                            >
                              {t("view_details")}
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {activeTab === "pending" && accountsPage.content.map((row: any) => {
                    const sentAtStr = row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + " " + new Date(row.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
                      : "—";

                    return (
                      <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-ds-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold line-clamp-1">{row.fullName || "—"}</p>
                              <p className="text-[10px] font-medium text-txt-muted">ACC-{row.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold">{row.fullName || "—"}</p>
                            <p className="text-[10px] text-txt-muted">Đại diện</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-txt-secondary">{sentAtStr}</span>
                        </td>
                        <td className="px-6 py-4">
                          <VerificationBadge status={row.verificationStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority="High" />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="px-4 py-1.5 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover rounded-ds-lg transition-all shadow-sm"
                            onClick={() => navigateToDetail(row)}
                          >
                            {t("view_details")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {activeTab === "restricted" && accountsPage.content.map((row: any) => {
                    const avatar = row.fullName ? row.fullName.substring(0, 2).toUpperCase() : "US";
                    const isOrg = row.role === "ORGANIZER";
                    const restrictedFromStr = row.lastActive
                      ? new Date(row.lastActive).toLocaleDateString("vi-VN")
                      : "—";

                    return (
                      <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${isOrg ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                              }`}>
                              {avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold line-clamp-1">{row.fullName || "—"}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-medium text-txt-muted">ACC-{row.id}</p>
                                <div className={`px-1.5 py-0.5 rounded-ds-md text-[8px] font-bold border ${isOrg ? "bg-primary/5 text-primary border-primary/10" : "bg-sky-500/5 text-sky-600 border-sky-500/10"
                                  }`}>
                                  {isOrg ? t("type_organizer") : t("type_buyer")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-txt-secondary max-w-[250px] leading-relaxed">
                            Nghi vấn hành vi gian lận tài khoản
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <RestrictionBadge type="Login" />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-txt-muted">{restrictedFromStr}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-ds-lg hover:bg-main transition-all shadow-sm"
                            onClick={() => navigateToDetail(row)}
                          >
                            {t("view_details")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {!isLoading && accountsPage && accountsPage.totalPages > 0 && (
          <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
            <p className="text-xs text-txt-muted">
              {t("pagination_info", { start: startElement, end: endElement, total: totalElements.toLocaleString() })}
            </p>
            <div className="flex items-center gap-1">
              <PaginationButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                icon={<ChevronLeft size={16} />}
              />
              {Array.from({ length: accountsPage.totalPages }).map((_, index) => {
                const pageNum = index + 1;
                if (pageNum === 1 || pageNum === accountsPage.totalPages || Math.abs(pageNum - currentPage) <= 2) {
                  return (
                    <PaginationButton
                      key={pageNum}
                      active={pageNum === currentPage}
                      label={pageNum.toString()}
                      onClick={() => setCurrentPage(pageNum)}
                    />
                  );
                }
                if (pageNum === 2 || pageNum === accountsPage.totalPages - 1) {
                  return <span key={pageNum} className="px-2 text-txt-muted/30">...</span>;
                }
                return null;
              })}
              <PaginationButton
                disabled={currentPage === accountsPage.totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, accountsPage.totalPages))}
                icon={<ChevronRight size={16} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
function StatsCard({ icon, label, value, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-ds-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-txt-muted mb-0.5">{label}</p>
          <p className="text-xl font-black text-txt-primary tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabItem({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-bold transition-all relative ${active ? "text-primary" : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-ds-md ${active ? "bg-primary/10 text-primary" : "bg-main text-txt-muted"
          }`}>
          {count}
        </span>
      </div>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
    </button>
  );
}

function FilterSelect({ label, value }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-ds-2xl shadow-sm cursor-pointer hover:bg-main transition-colors">
      <span className="text-[11px] font-medium text-txt-muted">{label}:</span>
      <span className="text-[11px] font-bold text-txt-primary">{value}</span>
      <ChevronDown size={14} className="text-txt-muted" />
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  if (status === "VERIFIED") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black">
        <CheckCircle2 size={10} />
        {t("status_verified").toUpperCase()}
      </div>
    );
  }
  if (status === "PENDING") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black">
        <Clock size={10} />
        {t("status_pending").toUpperCase()}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-ds-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-black">
      <AlertCircle size={10} />
      {t("status_missing_docs").toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    "Active": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Pending Approval": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Restricted": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Suspended": "bg-main text-txt-muted border-border",
  };

  const labels: any = {
    "Active": t("status_active"),
    "Pending Approval": t("status_pending_approval"),
    "Restricted": t("status_restricted"),
    "Suspended": t("status_suspended"),
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[10px] font-black ${styles[status] || styles["Suspended"]}`}>
      {labels[status]?.toUpperCase() || status.toUpperCase()}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    High: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  const labels: any = {
    High: t("priority_high"),
    Medium: t("priority_medium"),
    Low: t("priority_low"),
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[10px] font-black ${styles[priority]}`}>
      {labels[priority] || priority}
    </div>
  );
}

function RestrictionBadge({ type }: { type: string }) {
  const t = useTranslations("Admin");
  const labels: any = {
    Payment: t("restriction_payment"),
    Login: t("restriction_login"),
    Org: t("restriction_org"),
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-ds-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
      <Slash size={10} />
      {labels[type] || type}
    </div>
  );
}

function PaginationButton({ active, label, icon, disabled, onClick }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-ds-lg text-xs font-bold transition-all ${active
        ? "bg-primary text-white shadow-md shadow-primary/20"
        : disabled
          ? "text-txt-muted/30 cursor-not-allowed"
          : "text-txt-muted hover:bg-main"
        }`}
    >
      {icon || label}
    </button>
  );
}

function ChevronDown({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
