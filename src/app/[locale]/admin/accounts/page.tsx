"use client";

import { useState } from "react";
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

// Mock data for the table
const accountsData = [
  {
    id: "ACC-10245",
    name: "VBC Entertainment",
    type: "Organizer",
    email: "ops@vbc.vn",
    phone: "+84 28 3822 1144",
    verification: "Verified",
    status: "Active",
    activity: 412,
    lastActive: "25/04 09:02",
    avatar: "VB"
  },
  {
    id: "ACC-10244",
    name: "Nguyễn Hoàng Anh",
    type: "Buyer",
    email: "anh.nh@gmail.com",
    phone: "+84 909 442 118",
    verification: "Verified",
    status: "Active",
    activity: 24,
    lastActive: "25/04 08:50",
    avatar: "NG"
  },
  {
    id: "ACC-10243",
    name: "Builder DAO",
    type: "Organizer",
    email: "hello@builderdao.io",
    phone: "+84 24 3556 0921",
    verification: "Pending",
    status: "Pending Approval",
    activity: 3,
    lastActive: "24/04 22:18",
    avatar: "BU"
  },
  {
    id: "ACC-10242",
    name: "Trần Mỹ Linh",
    type: "Buyer",
    email: "linh.tran@outlook.com",
    phone: "+84 935 110 882",
    verification: "Missing Docs",
    status: "Restricted",
    activity: 7,
    lastActive: "24/04 14:32",
    avatar: "TR"
  },
  {
    id: "ACC-10241",
    name: "Dalat Tourism",
    type: "Organizer",
    email: "events@dalattourism.vn",
    phone: "+84 263 3823 110",
    verification: "Verified",
    status: "Active",
    activity: 188,
    lastActive: "24/04 11:14",
    avatar: "DA"
  },
  {
    id: "ACC-10240",
    name: "Phạm Quốc Đạt",
    type: "Buyer",
    email: "dat.pq@yahoo.com",
    phone: "+84 902 884 552",
    verification: "Verified",
    status: "Suspended",
    activity: 41,
    lastActive: "23/04 19:45",
    avatar: "PH"
  },
  {
    id: "ACC-10239",
    name: "HN Sports JSC",
    type: "Organizer",
    email: "contact@hnsports.vn",
    phone: "+84 24 3733 5588",
    verification: "Pending",
    status: "Pending Approval",
    activity: 1,
    lastActive: "23/04 16:08",
    avatar: "HN"
  },
  {
    id: "ACC-10238",
    name: "Lê Thanh Hà",
    type: "Buyer",
    email: "ha.le@protonmail.com",
    phone: "+84 988 110 092",
    verification: "Verified",
    status: "Active",
    activity: 12,
    lastActive: "23/04 10:21",
    avatar: "LÊ"
  },
];

const pendingOrganizersData = [
  { id: "ACC-10243", name: "Builder DAO", representative: "Đỗ Minh Khôi", role: "CEO", sentAt: "24/04 22:18", verification: "Pending", priority: "High", avatar: "BU" },
  { id: "ACC-10239", name: "HN Sports JSC", representative: "Lương Tuấn Anh", role: "Giám đốc vận hành", sentAt: "23/04 16:08", verification: "Pending", priority: "Medium", avatar: "HN" },
  { id: "ACC-10231", name: "Saigon Indie Collective", representative: "Nguyễn Hoài Phương", role: "Founder", sentAt: "22/04 09:45", verification: "Missing Docs", priority: "High", avatar: "SA" },
  { id: "ACC-10227", name: "ESG Forum Vietnam", representative: "Phan Thanh Long", role: "Trưởng ban tổ chức", sentAt: "21/04 14:12", verification: "Pending", priority: "Low", avatar: "ES" },
  { id: "ACC-10219", name: "VietJazz Festival", representative: "Trần Bích Vân", role: "Producer", sentAt: "20/04 17:35", verification: "Pending", priority: "Medium", avatar: "VI" },
  { id: "ACC-10214", name: "Greenline Outdoor", representative: "Hồ Đăng Khoa", role: "COO", sentAt: "20/04 11:02", verification: "Pending", priority: "Low", avatar: "GR" },
  { id: "ACC-10208", name: "DanceLab Studio", representative: "Vũ Quỳnh Anh", role: "Owner", sentAt: "19/04 22:54", verification: "Missing Docs", priority: "High", avatar: "DA" },
  { id: "ACC-10201", name: "Code Camp Asia", representative: "Phạm Anh Tú", role: "Director", sentAt: "19/04 10:48", verification: "Pending", priority: "Medium", avatar: "CO" },
];

const restrictedAccountsData = [
  { id: "ACC-10242", name: "Trần Mỹ Linh", type: "Buyer", reason: "Nhiều giao dịch chargeback liên tiếp", restrictionType: "Payment", restrictedFrom: "22/04/2026", avatar: "TR" },
  { id: "ACC-10240", name: "Phạm Quốc Đạt", type: "Buyer", reason: "Nghi vấn dùng tài khoản chia sẻ", restrictionType: "Login", restrictedFrom: "21/04/2026", avatar: "PH" },
  { id: "ACC-10198", name: "Indie Vibes Co.", type: "Organizer", reason: "Vi phạm chính sách bán vé", restrictionType: "Org", restrictedFrom: "19/04/2026", avatar: "IN" },
  { id: "ACC-10187", name: "Bùi Khánh Linh", type: "Buyer", reason: "Phát hiện hoạt động bot bán lại", restrictionType: "Payment", restrictedFrom: "18/04/2026", avatar: "BÙ" },
  { id: "ACC-10172", name: "Resale Hunters", type: "Organizer", reason: "Báo cáo lừa đảo từ nhiều buyer", restrictionType: "Org", restrictedFrom: "16/04/2026", avatar: "RE" },
  { id: "ACC-10166", name: "Đặng Hoàng Vũ", type: "Buyer", reason: "KYC không khớp với tài khoản thanh toán", restrictionType: "Login", restrictedFrom: "15/04/2026", avatar: "ĐẶ" },
  { id: "ACC-10159", name: "Mai Phương Thảo", type: "Buyer", reason: "Spam yêu cầu hoàn tiền", restrictionType: "Payment", restrictedFrom: "14/04/2026", avatar: "MA" },
];

export default function AdminAccountsPage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const locale = useLocale();

  const navigateToDetail = (item: any) => {
    router.push(`/${locale}/admin/accounts/${item.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-02</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("accounts_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("accounts_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-xl font-bold border border-border shadow-sm transition-all">
          <Download size={18} />
          <span>{t("export_list")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<Users size={20} />} label={t("total_accounts")} value="24,182" color="indigo" />
        <StatsCard icon={<Building2 size={20} />} label={t("active_organizers")} value="46" color="emerald" />
        <StatsCard icon={<Clock size={20} />} label={t("pending_approval")} value="8" color="amber" />
        <StatsCard icon={<AlertCircle size={20} />} label={t("restricted_label")} value="11" color="rose" />
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
        {/* Tabs */}
        <div className="flex items-center border-b border-border px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabItem
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label={t("tab_all_accounts")}
            count={8}
          />
          <TabItem
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label={t("tab_org_pending")}
            count={8}
          />
          <TabItem
            active={activeTab === "restricted"}
            onClick={() => setActiveTab("restricted")}
            label={t("tab_restricted")}
            count={7}
          />
        </div>

        {/* Filters Bar */}
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
            <input
              type="text"
              placeholder={t("search_accounts_placeholder")}
              className="w-full pl-12 pr-4 py-2.5 bg-main border border-border rounded-2xl text-sm focus:bg-surface focus:border-primary outline-none transition-all text-txt-primary placeholder:text-txt-muted"
            />
          </div>

          <FilterSelect label={t("filter_type")} value={t("common.all")} />
          <FilterSelect label={t("filter_verification")} value={t("common.all")} />
          <FilterSelect label={t("filter_status")} value={t("common.all")} />
          <FilterSelect label={t("filter_created_at")} value={t("dashboard.time_ranges.30n")} />

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
              {activeTab === "all" && accountsData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${row.type === "Organizer" ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                        }`}>
                        {row.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${row.type === "Organizer"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                      }`}>
                      {row.type === "Organizer" ? <Building2 size={12} /> : <User size={12} />}
                      {row.type === "Organizer" ? t("type_organizer") : t("type_buyer")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[11px] font-bold">{row.email}</p>
                      <p className="text-[10px] text-txt-muted">{row.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4"><VerificationBadge status={row.verification} /></td>
                  <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold">{row.activity}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-xs font-medium text-txt-muted">{row.lastActive}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-lg hover:bg-main transition-all shadow-sm" onClick={() => navigateToDetail(row)}>{t("view_details")}</button>
                      <button className="w-8 h-8 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === "pending" && pendingOrganizersData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold"><Building2 size={18} /></div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div><p className="text-sm font-bold">{row.representative}</p><p className="text-[10px] text-txt-muted">{row.role}</p></div></td>
                  <td className="px-6 py-4"><span className="text-xs font-medium text-txt-secondary">{row.sentAt}</span></td>
                  <td className="px-6 py-4"><VerificationBadge status={row.verification} /></td>
                  <td className="px-6 py-4"><PriorityBadge priority={row.priority} /></td>
                  <td className="px-6 py-4"><button className="px-4 py-1.5 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-sm" onClick={() => navigateToDetail(row)}>{t("view_details")}</button></td>
                </tr>
              ))}
              {activeTab === "restricted" && restrictedAccountsData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${row.type === "Organizer" ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                        }`}>{row.avatar}</div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                          <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border ${row.type === "Organizer" ? "bg-primary/5 text-primary border-primary/10" : "bg-sky-500/5 text-sky-600 border-sky-500/10"
                            }`}>{row.type === "Organizer" ? t("type_organizer") : t("type_buyer")}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><p className="text-xs font-medium text-txt-secondary max-w-[250px] leading-relaxed">{row.reason}</p></td>
                  <td className="px-6 py-4"><RestrictionBadge type={row.restrictionType} /></td>
                  <td className="px-6 py-4"><span className="text-xs font-medium text-txt-muted">{row.restrictedFrom}</span></td>
                  <td className="px-6 py-4"><button className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-lg hover:bg-main transition-all shadow-sm" onClick={() => navigateToDetail(row)}>{t("view_details")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatusCard({ icon, label, value, color }: any) {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-02</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("accounts_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("accounts_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-xl font-bold border border-border shadow-sm transition-all">
          <Download size={18} />
          <span>{t("export_list")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<Users size={20} />} label={t("total_accounts")} value="24,182" color="indigo" />
        <StatsCard icon={<Building2 size={20} />} label={t("active_organizers")} value="46" color="emerald" />
        <StatsCard icon={<Clock size={20} />} label={t("pending_approval")} value="8" color="amber" />
        <StatsCard icon={<AlertCircle size={20} />} label={t("restricted_label")} value="11" color="rose" />
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
        {/* Tabs */}
        <div className="flex items-center border-b border-border px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabItem
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label={t("tab_all_accounts")}
            count={8}
          />
          <TabItem
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label={t("tab_org_pending")}
            count={8}
          />
          <TabItem
            active={activeTab === "restricted"}
            onClick={() => setActiveTab("restricted")}
            label={t("tab_restricted")}
            count={7}
          />
        </div>

        {/* Filters Bar */}
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
            <input
              type="text"
              placeholder={t("search_accounts_placeholder")}
              className="w-full pl-12 pr-4 py-2.5 bg-main border border-border rounded-2xl text-sm focus:bg-surface focus:border-primary outline-none transition-all text-txt-primary placeholder:text-txt-muted"
            />
          </div>

          <FilterSelect label={t("filter_type")} value={t("common.all")} />
          <FilterSelect label={t("filter_verification")} value={t("common.all")} />
          <FilterSelect label={t("filter_status")} value={t("common.all")} />
          <FilterSelect label={t("filter_created_at")} value={t("dashboard.time_ranges.30n")} />

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
              {activeTab === "all" && accountsData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${row.type === "Organizer" ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                        }`}>
                        {row.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${row.type === "Organizer"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-sky-500/10 text-sky-600 border-sky-500/20"
                      }`}>
                      {row.type === "Organizer" ? <Building2 size={12} /> : <User size={12} />}
                      {row.type === "Organizer" ? t("type_organizer") : t("type_buyer")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[11px] font-bold">{row.email}</p>
                      <p className="text-[10px] text-txt-muted">{row.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <VerificationBadge status={row.verification} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold">{row.activity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-txt-muted">{row.lastActive}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-lg hover:bg-main transition-all shadow-sm">
                        {t("view_details")}
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeTab === "pending" && pendingOrganizersData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold">{row.representative}</p>
                      <p className="text-[10px] text-txt-muted">{row.role}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-txt-secondary">{row.sentAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <VerificationBadge status={row.verification} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-1.5 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-sm">
                      {t("view_details")}
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === "restricted" && restrictedAccountsData.map((row) => (
                <tr key={row.id} className="hover:bg-main/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${row.type === "Organizer" ? "bg-primary/10 text-primary" : "bg-sky-500/10 text-sky-600"
                        }`}>
                        {row.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold line-clamp-1">{row.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-medium text-txt-muted">{row.id}</p>
                          <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border ${row.type === "Organizer"
                            ? "bg-primary/5 text-primary border-primary/10"
                            : "bg-sky-500/5 text-sky-600 border-sky-500/10"
                            }`}>
                            {row.type === "Organizer" ? t("type_organizer") : t("type_buyer")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-txt-secondary max-w-[250px] leading-relaxed">{row.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <RestrictionBadge type={row.restrictionType} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-txt-muted">{row.restrictedFrom}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-[10px] font-bold bg-surface border border-border rounded-lg hover:bg-main transition-all shadow-sm">
                      {t("view_details")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
          <p className="text-xs text-txt-muted">
            {t("pagination_info", { start: 1, end: 8, total: "24,182" })}
          </p>
          <div className="flex items-center gap-1">
            <PaginationButton disabled icon={<ChevronLeft size={16} />} />
            <PaginationButton active label="1" />
            <PaginationButton label="2" />
            <PaginationButton label="3" />
            <span className="px-2 text-txt-muted/30">...</span>
            <PaginationButton label="412" />
            <PaginationButton icon={<ChevronRight size={16} />} />
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
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
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
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-primary/10 text-primary" : "bg-main text-txt-muted"
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
    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl shadow-sm cursor-pointer hover:bg-main transition-colors">
      <span className="text-[11px] font-medium text-txt-muted">{label}:</span>
      <span className="text-[11px] font-bold text-txt-primary">{value}</span>
      <ChevronDown size={14} className="text-txt-muted" />
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  if (status === "Verified") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black">
        <CheckCircle2 size={10} />
        {t("status_verified").toUpperCase()}
      </div>
    );
  }
  if (status === "Pending") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black">
        <Clock size={10} />
        {t("status_pending").toUpperCase()}
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-black">
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
    <div className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-black ${styles[status] || styles["Suspended"]}`}>
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
    <div className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-black ${styles[priority]}`}>
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
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
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
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${active
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
