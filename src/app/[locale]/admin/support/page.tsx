"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  ChevronRight,
  History,
  Tag,
  Hash,
  Mail,
  Zap,
  HelpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  CreditCard,
  Ticket,
  MessageSquare,
  ChevronLeft,
  ChevronDown as ChevronDownIcon
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { supportMockData } from "../datamockadmin/mockdata_support";



export default function AdminSupportPage() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-04</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("support_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("support_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-ds-xl font-bold border border-border shadow-sm transition-all">
          <Download size={18} />
          <span>{t("export_results")}</span>
        </button>
      </div>

      {/* Quick Lookup Bar */}
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
        <div className="flex items-center gap-2 text-xs font-bold text-txt-muted uppercase tracking-wider">
          <Zap size={14} className="text-amber-500" />
          {t("quick_search_label")}
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
            <input
              type="text"
              placeholder={t("quick_search_placeholder")}
              className="w-full pl-12 pr-4 py-3.5 bg-main border border-border rounded-ds-2xl text-sm focus:bg-surface focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-txt-primary placeholder:text-txt-muted"
            />
          </div>
          <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-ds-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Search size={18} />
            {t("btn_search")}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-txt-muted uppercase">{t("recent_searches")}:</span>
          <div className="flex gap-2">
            {["ORD-220411", "TIX-998120", "anh.nh@gmail.com", "+84 909 442 118", "Anh Trai Say Hi"].map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-main text-txt-muted text-[10px] font-bold rounded-ds-lg border border-border cursor-pointer hover:bg-main/80 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(supportMockData.stats as any)[activeTab].map((stat: any, idx: number) => {
          const iconMap: Record<string, any> = {
            FileText, CreditCard, Ticket, AlertCircle, ShieldCheck, CheckCircle2, Zap, MessageSquare, Clock
          };
          const Icon = iconMap[stat.icon as string] || AlertCircle;

          return (
            <StatsCard
              key={idx}
              icon={<Icon size={20} />}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Tabs & Table */}
        <div className="xl:col-span-9 space-y-6">
          <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden transition-colors duration-300">
            <div className="flex items-center border-b border-border px-6">
              <TabItem
                active={activeTab === "transactions"}
                onClick={() => setActiveTab("transactions")}
                label={t("tab_transactions")}
                icon={<CreditCard size={16} />}
              />
              <TabItem
                active={activeTab === "tickets"}
                onClick={() => setActiveTab("tickets")}
                label={t("tab_tickets")}
                icon={<Ticket size={16} />}
              />
              <TabItem
                active={activeTab === "cases"}
                onClick={() => setActiveTab("cases")}
                label={t("tab_support_cases")}
                icon={<MessageSquare size={16} />}
              />
            </div>

            {/* Filters */}
            <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
              <FilterSelect label={t("filter_date_range")} value={t("dashboard.time_ranges.30n")} />
              <FilterSelect label={t("filter_event")} value={t("common.all")} />
              <FilterSelect label={t("filter_organizer")} value={t("common.all")} />

              {activeTab === "transactions" && (
                <>
                  <FilterSelect label="Payment status" value={t("common.all")} />
                  <FilterSelect label="Mint status" value={t("common.all")} />
                </>
              )}

              {activeTab === "tickets" && (
                <>
                  <FilterSelect label="Access status" value={t("common.all")} />
                  <FilterSelect label="Sở hữu" value={t("common.all")} />
                  <FilterSelect label="Check-in" value={t("common.all")} />
                </>
              )}

              {activeTab === "cases" && (
                <>
                  <FilterSelect label="Trạng thái case" value={t("common.all")} />
                  <FilterSelect label="Ưu tiên" value={t("common.all")} />
                  <FilterSelect label="Admin xử lý" value={t("common.all")} />
                </>
              )}

              <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-txt-muted hover:text-txt-primary">
                <Filter size={16} />
                <span>{t("advanced_filters")}</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-main/50">
                    {activeTab === "transactions" && (
                      <>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_order_id")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_buyer")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("support_sub.col_event")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_total_amount")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_payment")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_mint")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_updated_at")}</th>
                      </>
                    )}
                    {activeTab === "tickets" && (
                      <>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Mã vé</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Chủ sở hữu hiện tại</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Sự kiện</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Hạng vé</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Access</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Check-in</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Hoạt động</th>
                      </>
                    )}
                    {activeTab === "cases" && (
                      <>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Mã case</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Chủ đề</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">User liên quan</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Sự kiện</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Ưu tiên</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Trạng thái</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Người xử lý</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Cập nhật</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("support_sub.col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeTab === "transactions" && supportMockData.transactions.map((row) => (
                    <tr key={row.id} className="hover:bg-main/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-txt-muted/30" />
                          <span className="text-xs font-bold text-txt-secondary">{row.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[140px]">
                          <p className="text-[11px] font-bold text-txt-primary">{row.buyer}</p>
                          <p className="text-[10px] text-txt-muted">{row.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-medium text-txt-secondary line-clamp-1">{row.event}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-txt-primary text-xs">
                        {row.amount}
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge status={row.payment} />
                      </td>
                      <td className="px-6 py-4">
                        <MintBadge status={row.mint} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">
                        {row.updatedAt}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/${locale}/admin/support/${row.id}`} className="px-3 py-1.5 bg-surface border border-border rounded-ds-lg text-[10px] font-bold text-txt-primary hover:bg-main transition-all shadow-sm flex items-center gap-1 w-fit">
                          {t("support_sub.view_detail")}
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {activeTab === "tickets" && supportMockData.tickets.map((row) => (
                    <tr key={row.id} className="hover:bg-main/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Ticket size={14} className="text-txt-muted/30" />
                          <span className="text-xs font-bold text-txt-secondary">{row.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[140px]">
                          <p className="text-[11px] font-bold text-txt-primary">{row.owner}</p>
                          <p className="text-[10px] text-txt-muted">{row.ownerType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-medium text-txt-secondary line-clamp-1">{row.event}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-txt-primary">{row.tier}</span>
                      </td>
                      <td className="px-6 py-4">
                        <AccessBadge status={row.access} />
                      </td>
                      <td className="px-6 py-4">
                        <CheckInBadge status={row.checkin} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">
                        {row.activity}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/${locale}/admin/support/${row.id}`} className="px-3 py-1.5 bg-surface border border-border rounded-ds-lg text-[10px] font-bold text-txt-primary hover:bg-main transition-all shadow-sm flex items-center gap-1 w-fit">
                          {t("support_sub.view_detail")}
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {activeTab === "cases" && supportMockData.cases.map((row) => (
                    <tr key={row.id} className="hover:bg-main/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} className="text-txt-muted/30" />
                          <span className="text-xs font-bold text-txt-secondary">{row.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-txt-primary line-clamp-1">{row.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-[120px]">
                          <p className="text-[11px] font-bold text-txt-primary">{row.user}</p>
                          <p className="text-[10px] text-txt-muted">{row.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-medium text-txt-secondary line-clamp-1">{row.event}</p>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge level={row.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <CaseStatusBadge status={row.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-indigo-600">
                        {row.assignee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">
                        {row.updatedAt}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/${locale}/admin/support/${row.id}`} className="px-3 py-1.5 bg-surface border border-border rounded-ds-lg text-[10px] font-bold text-txt-primary hover:bg-main transition-all shadow-sm flex items-center gap-1 w-fit">
                          {t("support_sub.view_detail")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
              <p className="text-xs text-txt-muted">
                {activeTab === "transactions" && t("support_sub.pagination_showing", { start: 1, end: 7, total: "2,184" })}
                {activeTab === "tickets" && t("support_sub.pagination_showing", { start: 1, end: 6, total: "6,028" })}
                {activeTab === "cases" && t("support_sub.pagination_showing", { start: 1, end: 6, total: "318" })}
              </p>
              <div className="flex items-center gap-1">
                <PaginationButton disabled icon={<ChevronLeft size={16} />} />
                <PaginationButton active label="1" />
                <PaginationButton label="2" />
                <PaginationButton label="3" />
                <span className="px-2 text-txt-muted/30">...</span>
                <PaginationButton icon={<ChevronRight size={16} />} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="xl:col-span-3 space-y-6">
          {/* Search Tips */}
          <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-txt-primary">{t("search_tips")}</h3>
            </div>
            <div className="space-y-4">
              <TipItem
                icon={<Hash size={16} className="text-primary" />}
                title={t("tip_order_ticket")}
                desc={t("tip_order_ticket_desc")}
                bg="bg-primary/5"
              />
              <TipItem
                icon={<Mail size={16} className="text-sky-600" />}
                title={t("tip_email_phone")}
                desc={t("tip_email_phone_desc")}
                bg="bg-sky-500/5"
              />
              <TipItem
                icon={<Zap size={16} className="text-amber-600" />}
                title={t("support_sub.tip_anomaly_title")}
                desc={t("support_sub.tip_anomaly_desc")}
                bg="bg-amber-500/5"
              />
              <TipItem
                icon={<Clock size={16} className="text-txt-muted" />}
                title={t("support_sub.tip_rules_title")}
                desc={t("support_sub.tip_rules_desc")}
                bg="bg-main/50"
              />
            </div>
          </div>

          {/* Common Anomalies */}
          <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle size={18} className="text-rose-500" />
              <h3 className="text-sm font-bold text-txt-primary">{t("support_sub.tip_anomaly_title")}</h3>
            </div>
            <div className="space-y-3">
              <AnomalyCard
                title={t("anomaly_payment_mint")}
                desc={t("anomaly_payment_mint_desc")}
                type="warning"
              />
              <AnomalyCard
                title={t("anomaly_email_not_received")}
                desc={t("anomaly_email_not_received_desc")}
                type="info"
              />
              <AnomalyCard
                title={t("anomaly_resale_200")}
                desc={t("anomaly_resale_200_desc")}
                type="error"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatsCard({ icon, label, value, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    sky: "bg-sky-500/10 text-sky-600",
    gray: "bg-main text-txt-muted",
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

function TabItem({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-xs font-bold transition-all relative flex items-center gap-2 ${active ? "text-primary" : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
    </button>
  );
}

function FilterSelect({ label, value }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-ds-xl shadow-sm cursor-pointer hover:bg-main transition-colors text-[10px]">
      <span className="font-medium text-txt-muted">{label}:</span>
      <span className="font-bold text-txt-primary">{value}</span>
      <ChevronDownIcon size={12} className="text-txt-muted" />
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: any = {
    "Success": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Pending": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Failed": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Expired": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Cancelled": "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[status] || styles["Cancelled"]}`}>
      {status.toUpperCase()}
    </div>
  );
}

function MintBadge({ status }: { status: string }) {
  const styles: any = {
    "Minted": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Mint Pending": "bg-primary/10 text-primary border-primary/20",
    "Mint Failed": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Not started": "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`inline-flex items-center text-center leading-tight px-2 py-0.5 rounded-ds-lg border text-[8px] font-black max-w-[60px] ${styles[status] || styles["Not started"]}`}>
      {status.toUpperCase()}
    </div>
  );
}

function AccessBadge({ status }: { status: string }) {
  const styles: any = {
    "Active": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Used": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    "Resold": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "Locked": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Refunded": "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[status] || "bg-main"}`}>
      {status.toUpperCase()}
    </div>
  );
}

function CheckInBadge({ status }: { status: string }) {
  const styles: any = {
    "Checked-in": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Denied": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Not yet": "bg-main text-txt-muted border-border",
    "—": "text-txt-muted opacity-30",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[status] || "bg-main"}`}>
      {status}
    </div>
  );
}

function PriorityBadge({ level }: { level: string }) {
  const styles: any = {
    "High": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "Medium": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Low": "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[level] || "bg-main"}`}>
      {level}
    </div>
  );
}

function CaseStatusBadge({ status }: { status: string }) {
  const styles: any = {
    "Escalated": "bg-rose-500/10 text-rose-600 border-rose-500/20",
    "In Progress": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "Open": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Resolved": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Waiting": "bg-main text-txt-muted border-border",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[8px] font-black ${styles[status] || "bg-main"}`}>
      {status.toUpperCase()}
    </div>
  );
}

function TipItem({ icon, title, desc, bg }: any) {
  return (
    <div className={`flex gap-3 p-4 rounded-ds-2xl ${bg} border border-border`}>
      <div className="w-8 h-8 rounded-ds-lg bg-surface shadow-sm flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-[11px] font-black text-txt-primary mb-1">{title}</h4>
        <p className="text-[10px] text-txt-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AnomalyCard({ title, desc, type }: any) {
  const colors: any = {
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <div className={`p-4 rounded-ds-2xl border ${colors[type]}`}>
      <h4 className="text-[11px] font-black mb-1">{title}</h4>
      <p className="text-[10px] opacity-80 leading-relaxed">{desc}</p>
    </div>
  );
}

function PaginationButton({ active, label, icon, disabled, onClick }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-ds-lg text-[10px] font-bold transition-all ${active
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
