"use client";

import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  ShieldAlert, 
  User, 
  ExternalLink,
  Save,
  MessageSquare,
  Slash,
  XCircle,
  Check,
  AlertTriangle,
  CreditCard,
  History,
  Activity as ActivityIcon
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { adminAccountsApi, type AccountDetailResponse } from "@/src/lib/api/adminAccountsApi";

/**
 * Interfaces for Account Detail Data
 */
export interface IDocument {
  name: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected";
}

export interface IEventSummary {
  id: string;
  name: string;
  date: string;
  status: string;
  isFlagged: boolean;
}

export interface IAdminLog {
  user: string;
  timestamp: string;
  content: string;
  role: "support" | "moderation";
}

export interface IActivity {
  timestamp: string;
  title: string;
  description: string;
  icon: "file" | "shield" | "calendar" | "paper";
}

export interface IProcessingHistory {
  timestamp: string;
  actor: string;
  action: string;
  note: string;
  actionType: "warning" | "info" | "system";
}

export interface IAccountDetail {
  id: string;
  name: string;
  type: "Organizer" | "Buyer";
  status: "Active" | "Pending Approval" | "Restricted" | "Suspended";
  registeredDate: string;
  stats: {
    verificationStatus: string;
    documentsSubmitted: number;
    totalDocuments: number;
    eventsCreated: number;
    pendingEvents: number;
    lastActive: string;
    riskLevel: "Low" | "Medium" | "High";
    riskReason: string;
  };
  profile: {
    representative: string;
    orgType: string;
    email: string;
    phone: string;
    taxId: string;
  };
  documents: IDocument[];
  payoutAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
    status: string;
  };
  operationalContext: {
    summary: {
      recentEventsCount: number;
      flaggedEventsCount: number;
      pendingPayoutCount: number;
      openSupportNotesCount: number;
    };
    recentEvents: IEventSummary[];
    adminLogs: IAdminLog[];
    activities: IActivity[];
    history: IProcessingHistory[];
  };
  adminContext: {
    internalNote: string;
    lastAction?: {
      adminUser: string;
      timestamp: string;
      description: string;
    };
  };
}

/**
 * MOCK DATA
 */
const accountDetailMock: IAccountDetail = {
  id: "ACC-10245",
  name: "Công ty TNHH Sự kiện Ánh Dương",
  type: "Organizer",
  status: "Pending Approval",
  registeredDate: "18/04/2026",
  stats: {
    verificationStatus: "Missing Documents",
    documentsSubmitted: 3,
    totalDocuments: 4,
    eventsCreated: 3,
    pendingEvents: 1,
    lastActive: "2 giờ trước",
    riskLevel: "Medium",
    riskReason: "Tăng do hồ sơ thiếu"
  },
  profile: {
    representative: "Lê Quang Minh - Tổng Giám đốc",
    orgType: "Doanh nghiệp tổ chức sự kiện",
    email: "contact@anhduongevents.vn",
    phone: "+84 28 3911 4422",
    taxId: "0314 992 188"
  },
  documents: [
    { name: "Giấy phép kinh doanh", status: "Verified" },
    { name: "CMND/CCCD đại diện", status: "Verified" },
    { name: "Hợp đồng tài khoản thanh toán", status: "Missing" },
    { name: "Cam kết tuân thủ chính sách", status: "Pending" }
  ],
  payoutAccount: {
    bank: "Vietcombank",
    accountNumber: "0701 4488 9921",
    accountName: "CTY TNHH SU KIEN ANH DUONG",
    status: "Hợp đồng thiếu"
  },
  operationalContext: {
    summary: {
      recentEventsCount: 3,
      flaggedEventsCount: 1,
      pendingPayoutCount: 2,
      openSupportNotesCount: 2
    },
    recentEvents: [
      { id: "EVT-20418", name: "Tech Future Summit 2026", date: "12/06/2026", status: "Đang chờ duyệt", isFlagged: true },
      { id: "EVT-20381", name: "Ánh Dương Music Night", date: "28/05/2026", status: "Đã duyệt", isFlagged: false },
      { id: "EVT-20342", name: "Workshop UX cho doanh nghiệp", date: "10/04/2026", status: "Hoàn tất", isFlagged: false }
    ],
    adminLogs: [
      { user: "support.minh", timestamp: "24/04 10:12", content: "Buyer phản ánh việc xác nhận thanh toán chậm cho sự kiện draft.", role: "support" },
      { user: "moderation.hoa", timestamp: "22/04 16:48", content: "Cần kiểm tra lại tính hợp lệ của giấy phép tổ chức ngoài trời.", role: "moderation" }
    ],
    activities: [
      { timestamp: "25/04/2026 · 09:24", title: "Internal note added by admin", description: "admin.linh để lại ghi chú: yêu cầu cập nhật hợp đồng thanh toán.", icon: "file" },
      { timestamp: "25/04/2026 · 08:02", title: "Requested approval review", description: "Tổ chức gửi yêu cầu xét duyệt lại sau khi cập nhật hồ sơ.", icon: "shield" },
      { timestamp: "24/04/2026 · 18:35", title: "Created event draft: Tech Future Summit", description: "Tạo bản nháp sự kiện EVT-20416, đang ở trạng thái chờ duyệt.", icon: "calendar" },
      { timestamp: "24/04/2026 · 10:12", title: "Submitted organizer documents", description: "Hồ sơ tổ chức được tải lên — thiếu hợp đồng tài khoản thanh toán.", icon: "paper" },
    ],
    history: [
      { timestamp: "23/04/2026 · 14:18", actor: "@admin.linh", action: "Yêu cầu bổ sung hồ sơ", note: "Yêu cầu cập nhật hợp đồng thanh toán hợp lệ.", actionType: "warning" },
      { timestamp: "20/04/2026 · 11:02", actor: "@admin.duy", action: "Tạo ghi chú nội bộ", note: "Cần verify tài liệu giấy phép trước khi phê duyệt.", actionType: "info" },
      { timestamp: "18/04/2026 · 09:30", actor: "@system", action: "Khởi tạo hồ sơ Organizer", note: "Tài khoản đăng ký chuyển trạng thái thành Pending Approval.", actionType: "system" },
    ]
  },
  adminContext: {
    internalNote: "Cần xác minh lại hợp đồng tài khoản thanh toán trước khi phê duyệt.",
    lastAction: {
      adminUser: "admin.linh",
      timestamp: "23/04",
      description: "yêu cầu bổ sung hợp đồng thanh toán"
    }
  }
};

export default function AccountDetailPage() {
  const t = useTranslations("Admin");
  const router = useRouter();
  const { id: paramId } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [account, setAccount] = useState<AccountDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paramId) return;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await adminAccountsApi.getAccountDetail(paramId as string);
        setAccount(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch account details:", err);
        setError(t("accounts_detail_not_found"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [paramId]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-rose-500 font-bold">{error || t("accounts_detail_not_found")}</p>
        <button onClick={handleBack} className="px-4 py-2 border border-border rounded-ds-xl text-xs font-bold hover:bg-main">
          {t("accounts_detail_back")}
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return {
          label: t("status_active") || "Active",
          classes: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/10"
        };
      case "Pending Approval":
        return {
          label: t("status_pending_approval") || "Pending Approval",
          classes: "bg-amber-500/10 text-amber-600 border border-amber-500/10"
        };
      case "Restricted":
        return {
          label: t("status_restricted") || "Restricted",
          classes: "bg-rose-500/10 text-rose-600 border border-rose-500/10"
        };
      case "Suspended":
        return {
          label: t("status_suspended") || "Suspended",
          classes: "bg-rose-500/10 text-rose-600 border border-rose-500/10"
        };
      default:
        return {
          label: status,
          classes: "bg-surface text-txt-muted border border-border"
        };
    }
  };

  const statusInfo = getStatusBadge(account.status);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">
            <button onClick={handleBack} className="hover:text-primary transition-colors flex items-center gap-1">
              {t("accounts_title")}
            </button>
            <span>/</span>
            <span className="text-txt-secondary">{t("view_details")}</span>
            <span className="text-primary/40 font-medium lowercase">{account.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-ds-2xl bg-surface border border-border flex items-center justify-center text-primary shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-tighter">ADM-03</p>
              <h1 className="text-2xl font-black text-txt-primary tracking-tight">{account.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-ds-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/10">
                  {account.type === "Organizer" ? t("type_organizer") : t("type_buyer")}
                </span>
                <span className={`px-2 py-0.5 rounded-ds-md text-[10px] font-bold ${statusInfo.classes}`}>
                  {statusInfo.label}
                </span>
                <span className="text-[10px] font-medium text-txt-muted">
                  ID: {account.id} · {t("accounts_detail_registered")} {account.registeredDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton icon={<Save size={16} />} label={t("accounts_detail_save_note")} />
          <ActionButton icon={<MessageSquare size={16} />} label={t("accounts_detail_request_info")} />
          <ActionButton icon={<ShieldAlert size={16} />} label={t("accounts_detail_restrict")} color="rose" />
          <ActionButton icon={<XCircle size={16} />} label={t("accounts_detail_reject")} color="rose" variant="solid" />
          <ActionButton icon={<Check size={16} />} label={t("accounts_detail_approve")} color="indigo" variant="solid" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard 
          label={t("accounts_detail_verification_status")} 
          value={account.stats.verificationStatus} 
          subValue={t("accounts_detail_docs_submitted_sub", { submitted: account.stats.documentsSubmitted, total: account.stats.totalDocuments })}
          icon={<ShieldAlert size={20} />}
          color="amber"
        />
        <QuickStatCard 
          label={t("accounts_detail_events_created")} 
          value={account.stats.eventsCreated.toString()} 
          subValue={t("accounts_detail_pending_events_sub", { count: account.stats.pendingEvents })}
          icon={<Calendar size={20} />}
          color="indigo"
        />
        <QuickStatCard 
          label={t("accounts_detail_last_active")} 
          value={account.stats.lastActive} 
          subValue={t("accounts_detail_event_draft_sub")}
          icon={<Clock size={20} />}
          color="sky"
        />
        <QuickStatCard 
          label={t("accounts_detail_risk_level")} 
          value={account.stats.riskLevel} 
          subValue={account.stats.riskReason}
          icon={<AlertTriangle size={20} />}
          color="amber"
        />
      </div>

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border px-6">
              <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label={t("accounts_detail_profile")} icon={<User size={16} />} />
              <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} label={t("accounts_detail_activity")} icon={<ActivityIcon size={16} />} />
              <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label={t("accounts_detail_history")} icon={<History size={16} />} />
            </div>

            <div className="p-8">
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <InfoField label={t("accounts_detail_org_name")} value={account.name} />
                    <InfoField label={t("accounts_detail_org_type")} value={account.profile.orgType} />
                    <InfoField label={t("accounts_detail_representative")} value={account.profile.representative} />
                    <InfoField label="Email" value={account.profile.email} isLink icon={<Mail size={14} />} />
                    <InfoField label={t("accounts_detail_phone")} value={account.profile.phone} icon={<Phone size={14} />} />
                    <InfoField label={t("accounts_detail_tax_id")} value={account.profile.taxId} />
                  </div>

                  {/* Documents Section */}
                  <div>
                    <h4 className="text-sm font-bold text-txt-primary mb-4 flex items-center gap-2">
                      {t("accounts_detail_submitted_docs")}
                    </h4>
                    {account.documents && account.documents.length > 0 ? (
                      <div className="bg-main/30 rounded-ds-2xl border border-border overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <tbody className="divide-y divide-border">
                            {account.documents.map((doc, idx) => (
                              <tr key={idx} className="hover:bg-main/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-ds-lg bg-surface border border-border flex items-center justify-center text-txt-muted">
                                      <FileText size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-txt-primary">{doc.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={doc.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => doc.url && window.open(doc.url, "_blank")}
                                    disabled={!doc.url}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ds-lg border border-border bg-surface text-[10px] font-bold text-txt-primary hover:bg-main transition-all disabled:opacity-50"
                                  >
                                    <ExternalLink size={12} />
                                    Xem
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-txt-muted">{t("accounts_detail_no_docs")}</p>
                    )}
                  </div>

                  {/* Payout Account */}
                  <div>
                    <h4 className="text-sm font-bold text-txt-primary mb-4">{t("accounts_detail_payout_account")}</h4>
                    {account.payoutAccount ? (
                      <div className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-ds-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-txt-primary">
                              {account.payoutAccount.bank} - {account.payoutAccount.accountNumber}
                            </p>
                            <p className="text-[10px] text-txt-muted uppercase font-medium">
                              Chủ tài khoản: {account.payoutAccount.accountName}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-ds-md bg-amber-500/5 text-amber-600 text-[8px] font-black border border-amber-500/10">
                          {account.payoutAccount.status.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-txt-muted">{t("accounts_detail_no_payout")}</p>
                    )}
                  </div>

                  {/* Internal Warning */}
                  {account.type === "Organizer" && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-ds-2xl">
                      <div className="flex gap-3">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-700">{t("accounts_detail_internal_note")}</p>
                          <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">
                            {account.adminContext?.internalNote || t("accounts_detail_no_internal_note")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-0 ml-4">
                  {account.operationalContext.activities.map((activity, idx) => (
                    <ActivityTimelineItem 
                      key={idx} 
                      activity={activity} 
                      isLast={idx === account.operationalContext.activities.length - 1} 
                    />
                  ))}
                </div>
              )}

              {activeTab === "history" && (
                <div className="overflow-hidden border border-border rounded-ds-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-main/50 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("accounts_detail_col_time")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("accounts_detail_col_actor")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("accounts_detail_col_action")}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("accounts_detail_col_note")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {account.operationalContext.history.map((row, idx) => (
                        <tr key={idx} className="hover:bg-main/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-[11px] font-medium text-txt-secondary">{row.timestamp}</td>
                          <td className="px-6 py-4 text-xs font-bold text-txt-primary">{row.actor}</td>
                          <td className="px-6 py-4">
                            <ProcessingActionBadge action={row.action} type={row.actionType} />
                          </td>
                          <td className="px-6 py-4 text-xs text-txt-secondary leading-relaxed">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Operation Context Section */}
          <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-txt-primary">{t("accounts_detail_operational_context")}</h3>
                <p className="text-[10px] text-txt-muted uppercase font-medium mt-0.5 tracking-tight">{t("accounts_detail_operational_context_desc")}</p>
              </div>
              <span className="px-2 py-0.5 rounded-ds-md bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/10 uppercase">
                Pending Review
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MiniStat label={t("accounts_detail_recent_events")} value={account.operationalContext.summary.recentEventsCount.toString()} color="indigo" />
              <MiniStat label={t("accounts_detail_flagged_events")} value={account.operationalContext.summary.flaggedEventsCount.toString()} color="rose" />
              <MiniStat label={t("accounts_detail_pending_payout")} value={account.operationalContext.summary.pendingPayoutCount.toString()} color="amber" />
              <MiniStat label={t("accounts_detail_open_support_notes")} value={account.operationalContext.summary.openSupportNotesCount.toString()} color="sky" />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-txt-primary">{t("accounts_detail_recent_events")}</h4>
              <div className="space-y-2">
                {account.operationalContext.recentEvents.map((evt) => (
                  <EventRow 
                    key={evt.id}
                    name={evt.name}
                    id={evt.id}
                    date={evt.date}
                    status={evt.status}
                    isFlagged={evt.isFlagged}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border space-y-4">
              <h4 className="text-xs font-bold text-txt-primary">{t("accounts_detail_support_notes")}</h4>
              <div className="space-y-4">
                {account.operationalContext.adminLogs.map((log, idx) => (
                  <LogEntry 
                    key={idx}
                    user={log.user}
                    time={log.timestamp}
                    content={log.content}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-txt-primary uppercase tracking-tight">{t("accounts_detail_admin_panel")}</h3>
              <ShieldAlert size={18} className="text-txt-muted" />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-txt-muted uppercase mb-2">{t("platform_status") || "Platform Status"}</p>
                <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-ds-xl text-center">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending Approval</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-txt-muted uppercase">{t("accounts_detail_verification_summary")}</p>
                {account.documents.map((doc, idx) => (
                  <ChecklistItem key={idx} label={doc.name} status={doc.status} />
                ))}
              </div>

              <div>
                <p className="text-[10px] font-bold text-txt-muted uppercase mb-2">{t("accounts_detail_internal_note_title")}</p>
                <textarea 
                  placeholder={t("accounts_detail_note_placeholder")}
                  className="w-full h-32 p-4 bg-main border border-border rounded-ds-2xl text-xs text-txt-primary placeholder:text-txt-muted focus:border-primary outline-none transition-all resize-none"
                  defaultValue={account.adminContext.internalNote}
                />
                <button className="w-full mt-3 py-2.5 bg-surface border border-border rounded-ds-xl text-[10px] font-bold text-txt-primary hover:bg-main transition-all">
                  {t("accounts_detail_save_note")}
                </button>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                {account.adminContext.lastAction && (
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-ds-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <p className="text-[10px] font-bold text-indigo-600">{t("accounts_detail_last_admin_action")}</p>
                    </div>
                    <p className="text-[10px] text-indigo-600/70">
                      {account.adminContext.lastAction.timestamp} · {account.adminContext.lastAction.adminUser} {account.adminContext.lastAction.description}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <AdminActionButton color="indigo" label={t("accounts_detail_approve_org")} icon={<Check size={14} />} />
                  <AdminActionButton color="default" label={t("accounts_detail_request_info_docs")} icon={<MessageSquare size={14} />} />
                  <AdminActionButton color="default" label={t("accounts_detail_restrict_account")} icon={<Slash size={14} />} />
                  <AdminActionButton color="rose" label={t("accounts_detail_reject_docs")} icon={<XCircle size={14} />} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components
function ActionButton({ icon, label, color = "default", variant = "outline" }: any) {
  const colors: any = {
    default: "text-txt-primary border-border bg-surface hover:bg-main",
    rose: variant === "solid" ? "bg-rose-500 text-white hover:bg-rose-600" : "text-rose-600 border-rose-500/30 bg-surface hover:bg-rose-50",
    indigo: variant === "solid" ? "bg-primary text-white hover:bg-primary-hover" : "text-primary border-primary/30 bg-surface hover:bg-primary/5",
  };

  return (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-ds-xl text-[11px] font-bold border transition-all shadow-sm ${colors[color]}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function QuickStatCard({ label, value, subValue, icon, color }: any) {
  const colorStyles: any = {
    amber: "bg-amber-500/5 border-amber-500/10 text-amber-600",
    indigo: "bg-primary/5 border-primary/10 text-primary",
    sky: "bg-sky-500/5 border-sky-500/10 text-sky-600",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-3xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">{label}</p>
        <div className={`p-2 rounded-ds-xl ${colorStyles[color] || colorStyles.indigo}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-black text-txt-primary">{value}</p>
      <p className="text-[10px] font-medium text-txt-muted mt-0.5">{subValue}</p>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all relative ${active ? "text-primary" : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
    </button>
  );
}

function InfoField({ label, value, icon, isLink }: any) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-txt-muted">{icon}</span>}
        <p className={`text-xs font-bold ${isLink ? "text-primary cursor-pointer hover:underline" : "text-txt-primary"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Missing: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-md text-[8px] font-black border uppercase ${styles[status]}`}>
      {status}
    </div>
  );
}

function MiniStat({ label, value, color }: any) {
  const styles: any = {
    indigo: "bg-primary/5 border-primary/10",
    rose: "bg-rose-500/5 border-rose-500/10",
    amber: "bg-amber-500/5 border-amber-500/10",
    sky: "bg-sky-500/5 border-sky-500/10",
  };

  return (
    <div className={`p-3 rounded-ds-2xl border ${styles[color]}`}>
      <p className="text-[8px] font-bold text-txt-muted uppercase mb-1">{label}</p>
      <p className="text-lg font-black text-txt-primary leading-none">{value}</p>
    </div>
  );
}

function EventRow({ name, id, date, status, isFlagged }: any) {
  const t = useTranslations("Admin");
  return (
    <div className="flex items-center justify-between p-3 bg-main/20 rounded-ds-2xl hover:bg-main/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-ds-lg bg-surface border border-border flex items-center justify-center text-txt-muted">
          <Calendar size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-txt-primary">{name}</p>
            {isFlagged && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 text-[8px] font-black border border-rose-500/10 uppercase">
                Flagged
              </span>
            )}
          </div>
          <p className="text-[10px] text-txt-muted">{id} · {date}</p>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded-ds-md text-[8px] font-black border uppercase ${
        status === "Đã duyệt" || status === "APPROVED" || status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" :
        status === "Đang chờ duyệt" || status === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/10" :
        "bg-surface text-txt-muted border-border"
      }`}>
        {status === "Đã duyệt" || status === "APPROVED" || status === "VERIFIED" ? t("status_verified") :
         status === "Đang chờ duyệt" || status === "PENDING" ? t("status_pending") :
         status}
      </span>
    </div>
  );
}

function LogEntry({ user, time, content }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-bold text-txt-primary">@{user}</p>
        <p className="text-[10px] text-txt-muted">{time}</p>
      </div>
      <p className="text-xs text-txt-secondary leading-relaxed p-3 bg-main/30 rounded-ds-2xl">
        {content}
      </p>
    </div>
  );
}

function ChecklistItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-txt-secondary">{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}

function AdminActionButton({ color, label, icon }: any) {
  const styles: any = {
    indigo: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20",
    rose: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20",
    default: "bg-surface border border-border text-txt-primary hover:bg-main"
  };

  return (
    <button className={`w-full py-3 px-4 rounded-ds-2xl flex items-center justify-between text-xs font-bold transition-all ${styles[color]}`}>
      <span>{label}</span>
      {icon}
    </button>
  );
}

function ActivityTimelineItem({ activity, isLast }: { activity: IActivity, isLast: boolean }) {
  const icons: any = {
    file: <FileText size={16} />,
    shield: <ShieldAlert size={16} />,
    calendar: <Calendar size={16} />,
    paper: <FileText size={16} />,
  };

  const colors: any = {
    file: "bg-primary/10 text-primary",
    shield: "bg-amber-500/10 text-amber-600",
    calendar: "bg-indigo-500/10 text-indigo-600",
    paper: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="relative flex gap-6 pb-10">
      {!isLast && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border -translate-x-1/2" />}
      
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-surface ${colors[activity.icon]}`}>
        {icons[activity.icon]}
      </div>
      
      <div className="space-y-1.5 pt-1">
        <p className="text-[10px] font-bold text-txt-muted">{activity.timestamp}</p>
        <p className="text-sm font-bold text-txt-primary">{activity.title}</p>
        <p className="text-xs text-txt-secondary leading-relaxed">{activity.description}</p>
      </div>
    </div>
  );
}

function ProcessingActionBadge({ action, type }: { action: string, type: string }) {
  const styles: any = {
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    system: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

  return (
    <div className={`inline-flex px-2 py-1 rounded-ds-lg border text-[10px] font-bold ${styles[type]}`}>
      {action}
    </div>
  );
}
