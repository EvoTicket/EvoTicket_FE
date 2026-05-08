"use client";

import { useState } from "react";
import {
  Shield,
  Users,
  Key,
  AlertCircle,
  Plus,
  ChevronRight,
  Lock,
  Eye,
  Settings,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Hash,
  Activity,
  History,
  LayoutDashboard,
  UserCog,
  FileSearch,
  Zap,
  ArrowRightLeft,
  Settings2,
  Download,
  Info
} from "lucide-react";
import { useTranslations } from "next-intl";

// Mock data for roles
const rolesList = [
  {
    id: "role-01",
    nameKey: "role_name_super_admin",
    descKey: "role_desc_super_admin",
    members: 2,
    lastUpdate: "26/04/2026 16:05",
    privileged: true,
    icon: <Shield size={18} className="text-indigo-600" />
  },
  {
    id: "role-02",
    nameKey: "role_name_ops_admin",
    descKey: "role_desc_ops_admin",
    members: 4,
    lastUpdate: "24/04/2026 09:32",
    privileged: false,
    icon: <Key size={18} className="text-gray-400" />
  },
  {
    id: "role-03",
    nameKey: "role_name_finance_admin",
    descKey: "role_desc_finance_admin",
    members: 3,
    lastUpdate: "23/04/2026 11:14",
    privileged: true,
    icon: <Activity size={18} className="text-[#5F4A9D]" />
  },
  {
    id: "role-04",
    nameKey: "role_name_moderation_admin",
    descKey: "role_desc_moderation_admin",
    members: 5,
    lastUpdate: "22/04/2026 15:48",
    privileged: false,
    icon: <Shield size={18} className="text-gray-400" />
  },
  {
    id: "role-05",
    nameKey: "role_name_blockchain_ops",
    descKey: "role_desc_blockchain_ops",
    members: 2,
    lastUpdate: "21/04/2026 18:10",
    privileged: false,
    icon: <Zap size={18} className="text-gray-400" />
  },
  {
    id: "role-06",
    nameKey: "role_name_support_admin",
    descKey: "role_desc_support_admin",
    members: 2,
    lastUpdate: "20/04/2026 14:22",
    privileged: false,
    icon: <Users size={18} className="text-gray-400" />
  },
];

const permissions = [
  { id: "p1", name: "perm_view_overview", icon: <LayoutDashboard size={16} /> },
  { id: "p2", name: "perm_manage_accounts", icon: <UserCog size={16} /> },
  { id: "p3", name: "perm_moderate_events", icon: <Shield size={16} /> },
  { id: "p4", name: "perm_access_support", icon: <FileSearch size={16} /> },
  { id: "p5", name: "perm_view_health", icon: <Activity size={16} /> },
  { id: "p6", name: "perm_manage_blockchain", icon: <Zap size={16} />, sensitive: true },
  { id: "p7", name: "perm_manage_resale", icon: <ArrowRightLeft size={16} /> },
  { id: "p8", name: "perm_edit_config", icon: <Settings2 size={16} />, sensitive: true },
  { id: "p9", name: "perm_manage_roles", icon: <Lock size={16} />, sensitive: true },
  { id: "p10", name: "perm_export_data", icon: <Download size={16} />, sensitive: true },
];

export default function AdminRolesPage() {
  const t = useTranslations("Admin");
  const [selectedRoleId, setSelectedRoleId] = useState("role-03"); // Finance Admin
  const [activeTab, setActiveTab] = useState("roles");

  const selectedRole = rolesList.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-10</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("roles_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("roles_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
          <Plus size={18} />
          <span>{t("btn_create_role")}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<Shield size={20} />} label={t("total_roles")} value="6" sub={t("common.roles_sub.privileged_count", { count: 2 })} color="gray" />
        <StatsCard icon={<Users size={20} />} label={t("active_members")} value="18" sub={t("common.roles_sub.pending_suspended", { pending: 1, suspended: 1 })} color="indigo" />
        <StatsCard icon={<Key size={20} />} label={t("privileged_roles_count")} value="2" sub={t("common.roles_sub.privileged_roles_example")} color="amber" />
        <StatsCard icon={<AlertCircle size={20} />} label={t("pending_access_issues")} value="1" sub={t("common.roles_sub.inactive_invite", { count: 1 })} color="rose" />
      </div>

      {/* Tabs Control */}
      <div className="flex items-center bg-surface border border-border rounded-2xl p-1 w-fit shadow-sm">
        <TabButton active={activeTab === "roles"} onClick={() => setActiveTab("roles")} icon={<Shield size={14} />} label={t("tab_roles")} />
        <TabButton active={activeTab === "internal_members"} onClick={() => setActiveTab("internal_members")} icon={<Users size={14} />} label={t("tab_internal_members")} />
        <TabButton active={activeTab === "sensitive_access"} onClick={() => setActiveTab("sensitive_access")} icon={<Lock size={14} />} label={t("tab_sensitive_access")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column - Roles List */}
        <div className="xl:col-span-5 space-y-4">
          {rolesList.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer group flex items-start gap-4 ${selectedRoleId === role.id
                  ? "bg-surface border-primary shadow-lg shadow-primary/5"
                  : "bg-surface/50 border-border hover:border-txt-muted/30 hover:bg-surface"
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${selectedRoleId === role.id ? "bg-primary text-white" : "bg-main text-txt-muted group-hover:bg-main/80"
                }`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-txt-primary">{t(`common.roles_sub.${(role as any).nameKey}`)}</h3>
                  {role.privileged && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase flex items-center gap-1">
                      <Zap size={8} /> {t("privileged")}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-txt-muted line-clamp-2 leading-relaxed mb-3">{t(`common.roles_sub.${role.descKey}`)}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-txt-muted font-medium">{t("common.roles_sub.members_updated", { count: role.members, date: role.lastUpdate.split(' ')[0] })}</p>
                  <ChevronRight size={14} className={`transition-transform ${selectedRoleId === role.id ? "translate-x-1 text-primary" : "text-txt-muted/30"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Permission Matrix */}
        <div className="xl:col-span-7 bg-surface border border-border rounded-3xl shadow-sm overflow-hidden sticky top-[104px] transition-colors duration-300">
          <div className="p-6 border-b border-border flex items-center justify-between bg-main/30">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-primary" />
              <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("role_permissions")}: {selectedRole && t(`common.roles_sub.${(selectedRole as any).nameKey}`)}</h3>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-txt-muted hover:text-txt-primary px-3 py-1.5 font-bold text-[10px] transition-colors">
                <History size={14} />
                {t("btn_summary")}
              </button>
              <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg font-bold text-[10px] shadow-sm transition-all">
                {t("common.save_changes")}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 mb-6">
              <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600/80 font-medium leading-relaxed italic">
                {selectedRole && t(`common.roles_sub.${(selectedRole as any).descKey}`)}
              </p>
            </div>

            {permissions.map((perm) => (
              <div
                key={perm.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${perm.sensitive
                    ? "border-orange-500/20 bg-orange-500/5"
                    : "border-border bg-surface"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${perm.sensitive ? "bg-orange-500/10 text-orange-600" : "bg-main text-txt-muted"
                    }`}>
                    {perm.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-txt-primary">{t(perm.name)}</p>
                    {perm.sensitive && <p className="text-[9px] font-black text-orange-600 uppercase mt-0.5">{t("sensitive_permission")}</p>}
                  </div>
                </div>

                <div className="flex bg-main rounded-lg p-1 border border-border">
                  <PermOption label={t("perm_none")} active={false} />
                  <PermOption label={t("perm_view")} active={perm.id === 'p1' || perm.id === 'p5'} />
                  <PermOption label={t("perm_manage")} active={!(perm.id === 'p1' || perm.id === 'p5')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Atomic UI Components
function StatsCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    gray: "bg-main text-txt-muted",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-txt-primary tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-xl transition-all ${active ? "bg-main text-primary shadow-sm border border-border" : "text-txt-muted hover:text-txt-secondary"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PermOption({ label, active }: { label: string, active: boolean }) {
  return (
    <button className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${active
        ? "bg-surface text-txt-primary shadow-sm"
        : "text-txt-muted hover:text-txt-secondary"
      }`}>
      {label}
    </button>
  );
}
