"use client";

import { useState } from "react";
import {
   Settings,
   Globe,
   CreditCard,
   Percent,
   Lock,
   Save,
   RotateCcw,
   Eye,
   EyeOff,
   Info,
   ShieldCheck,
   AlertTriangle,
   Zap,
   Mail,
   MessageSquare,
   Activity,
   History,
   ChevronRight,
   ChevronDown,
   Monitor,
   ToggleLeft,
   ArrowRightLeft
} from "lucide-react";
import { useTranslations } from "next-intl";
import { settingsMockData } from "../datamockadmin/mockdata_settings";

export default function AdminSettingsPage() {
   const t = useTranslations("Admin");
   const [activeTab, setActiveTab] = useState("platform");

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         {/* Header */}
         <div className="flex items-end justify-between">
            <div>
               <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-09</p>
               <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("settings_title")}</h1>
               <p className="text-sm text-txt-secondary mt-1">{t("settings_subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 text-txt-muted hover:text-txt-secondary px-4 py-2.5 font-bold text-xs transition-colors">
                  <RotateCcw size={16} />
                  {t("revert")}
               </button>
               <button className="flex items-center gap-2 text-txt-secondary bg-surface border border-border hover:bg-main px-4 py-2.5 rounded-ds-xl font-bold text-xs shadow-sm transition-all">
                  <Eye size={16} />
                  {t("review_changes")}
               </button>
               <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-ds-xl font-bold text-xs shadow-lg shadow-primary/20 transition-all">
                  <Lock size={16} />
                  {t("save_changes")}
               </button>
            </div>
         </div>

         {/* Tabs Control */}
         <div className="flex items-center bg-surface border border-border rounded-ds-2xl p-1 w-fit shadow-sm">
            <TabButton active={activeTab === "platform"} onClick={() => setActiveTab("platform")} icon={<Monitor size={14} />} label={t("tab_platform_config")} />
            <TabButton active={activeTab === "payments"} onClick={() => setActiveTab("payments")} icon={<CreditCard size={14} />} label={t("tab_payments")} />
            <TabButton active={activeTab === "fees"} onClick={() => setActiveTab("fees")} icon={<Percent size={14} />} label={t("tab_fees")} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Configuration Forms */}
            <div className="lg:col-span-8 space-y-6">
               {activeTab === "platform" && <PlatformConfigTab t={t} />}
               {activeTab === "payments" && <PaymentsTab t={t} />}
               {activeTab === "fees" && <FeesTab t={t} />}
            </div>

            {/* Sidebar - Impact & History */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                     <AlertTriangle size={18} className="text-amber-500" />
                     <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("change_impact")}</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-xs font-medium text-txt-muted">{t("common.unsaved")}</span>
                        <span className="text-xs font-black text-txt-primary">{t("common.zero_changes")}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-xs font-medium text-txt-muted">{t("common.high_impact")}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-orange-500/20">{t("common.items_count", { count: 0 })}</span>
                     </div>
                     <div className="pt-2">
                        <p className="text-[9px] font-bold text-txt-muted uppercase tracking-widest mb-1">{t("common.settings_sub.last_updated")}</p>
                        <p className="text-xs font-black text-txt-primary">26/04/2026 16:05</p>
                        <p className="text-[10px] text-txt-muted font-medium mt-0.5">@admin.linh</p>
                     </div>
                  </div>
               </div>

               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                     <History size={18} className="text-primary" />
                     <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">{t("change_history")}</h3>
                  </div>
                  <p className="text-[11px] text-txt-secondary leading-relaxed mb-4">
                     {t("common.settings_sub.change_history_desc")}
                  </p>
                  <div className="bg-primary/10 border border-primary/20 rounded-ds-2xl p-4 flex gap-3 cursor-pointer hover:bg-primary/20 transition-colors group">
                     <ShieldCheck size={16} className="text-primary flex-shrink-0" />
                     <div className="min-w-0">
                        <p className="text-[10px] font-black text-txt-primary mb-0.5">{t("common.settings_sub.audit_logs_cta_title")}</p>
                        <p className="text-[9px] text-primary">{t("common.settings_sub.audit_logs_cta_sub")}</p>
                     </div>
                     <ChevronRight size={14} className="text-primary/60 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

// Sub-component for Tabs
function TabButton({ active, onClick, icon, label }: any) {
   return (
      <button
         onClick={onClick}
         className={`flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-ds-xl transition-all ${active ? "bg-main text-primary shadow-sm border border-border" : "text-txt-muted hover:text-txt-secondary"
            }`}
      >
         {icon}
         {label}
      </button>
   );
}

// Sub-component: Platform Config
function PlatformConfigTab({ t }: any) {
   const data = settingsMockData.platform;
   return (
      <div className="space-y-6">
         <ConfigSection title={t("platform_info")} icon={<Info size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputField label={t("platform_name")} value={data.info.name} sub={t("common.settings_sub.platform_name_sub")} />
               <InputField label={t("environment")} value={data.info.environment} sub={t("common.settings_sub.environment_sub")} readonly />
               <SelectField label={t("default_language")} value={data.info.language} sub={t("common.settings_sub.default_lang_sub")} />
               <SelectField label={t("default_currency")} value={data.info.currency} sub={t("common.settings_sub.default_currency_sub")} />
            </div>
         </ConfigSection>

         <ConfigSection title={t("ops_status")} icon={<Activity size={16} />}>
            <div className="space-y-4">
               {data.ops.map((op, i) => (
                  <SwitchRow key={i} label={t(op.label)} sub={t(op.sub)} active={op.active} highImpact={op.highImpact} t={t} />
               ))}
            </div>
         </ConfigSection>

         <ConfigSection title={t("ticketing_features")} icon={<Zap size={16} />}>
            <div className="space-y-4">
               {data.features.map((f, i) => (
                  <SwitchRow key={i} label={t(f.label)} sub={t(f.sub)} active={f.active} highImpact={f.highImpact} t={t} />
               ))}
            </div>
         </ConfigSection>

         <ConfigSection title={t("support_notifications")} icon={<Mail size={16} />}>
            <div className="grid grid-cols-1 gap-6">
               <InputField label={t("support_email")} value={data.support.email} sub={t("common.settings_sub.support_email_sub")} />
               <InputField label={t("internal_ops_channel")} value={data.support.channel} sub={t("common.settings_sub.ops_slack_sub")} />
            </div>
         </ConfigSection>
      </div>
   );
}

// Sub-component: Payments Tab
function PaymentsTab({ t }: any) {
   const data = settingsMockData.payments;
   return (
      <div className="space-y-6">
         <ConfigSection title={t("payment_gateways")} icon={<CreditCard size={16} />}>
            <div className="space-y-4">
               {data.integrations.map((item, i) => (
                  <IntegrationRow key={i} name={item.name} sub={t(item.sub, { time: item.time ? `${item.time} ${t("common.minutes")}` : "" })} status={t(`common.service_status.${item.status}`)} active={item.active} t={t} />
               ))}
            </div>
         </ConfigSection>

         <ConfigSection title={t("api_keys_secrets")} icon={<Lock size={16} />}>
            <div className="space-y-4">
               {data.secrets.map((s, i) => (
                  <SecretField key={i} label={s.label} value={s.value} sub={t(s.sub)} t={t} />
               ))}
            </div>
         </ConfigSection>

         <ConfigSection title={t("webhook_endpoints")} icon={<Activity size={16} />}>
            <div className="space-y-3">
               {data.webhooks.map((w, i) => (
                  <WebhookRow key={i} name={w.name} url={w.url} lastSeen={t(w.lastSeen, { time: `${w.time} ${t("common.minutes")}` })} status={t(`common.service_status.${w.status}`)} t={t} />
               ))}
            </div>
         </ConfigSection>
      </div>
   );
}

// Sub-component: Fees Tab
function FeesTab({ t }: any) {
   const data = settingsMockData.fees;
   return (
      <div className="space-y-6">
         <ConfigSection title={t("platform_fee_royalty")} icon={<Percent size={16} />}>
            <div className="grid grid-cols-1 gap-6">
               {data.platform.map((f, i) => (
                  <InputField key={i} label={t(f.label)} value={f.value} suffix={f.suffix} highImpact={f.highImpact} sub={t(f.sub)} t={t} />
               ))}
            </div>
         </ConfigSection>

         <ConfigSection title={t("resale_config")} icon={<ArrowRightLeft size={16} />}>
            <div className="space-y-6">
               {data.resale.map((item: any, i) => (
                  item.label === "fallback_rules" ? (
                     <SelectField key={i} label={t(item.label)} value={t(item.value)} sub={t(item.sub)} />
                  ) : item.active !== undefined ? (
                     <SwitchRow key={i} label={t(item.label)} sub={t(item.sub)} active={item.active} highImpact={item.highImpact} t={t} />
                  ) : (
                     <InputField key={i} label={t(item.label)} value={item.value} suffix={item.suffix} highImpact={item.highImpact} sub={t(item.sub)} t={t} />
                  )
               ))}
            </div>
         </ConfigSection>
      </div>
   );
}

// Atomic UI Components
function ConfigSection({ title, icon, children }: any) {
   return (
      <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm overflow-hidden transition-colors duration-300">
         <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-ds-lg bg-main text-txt-muted border border-border">
               {icon}
            </div>
            <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest">{title}</h3>
         </div>
         {children}
      </div>
   );
}

function InputField({ label, value, sub, readonly, highImpact, suffix, t }: any) {
   return (
      <div className="space-y-1.5">
         <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-txt-secondary">{label}</label>
            {highImpact && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 uppercase">{t("common.high_impact")}</span>}
         </div>
         <div className="relative">
            <input
               type="text"
               defaultValue={value}
               readOnly={readonly}
               className={`w-full px-4 py-2.5 rounded-ds-xl border text-sm transition-all outline-none ${readonly
                  ? "bg-main border-border text-txt-muted cursor-not-allowed"
                  : "bg-surface border-border text-txt-primary focus:border-primary focus:ring-4 focus:ring-primary/5"
                  } ${suffix ? "pr-10" : ""}`}
            />
            {suffix && (
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-txt-muted">{suffix}</span>
            )}
         </div>
         {sub && <p className="text-[10px] text-txt-muted font-medium">{sub}</p>}
      </div>
   );
}

function SelectField({ label, value, sub }: any) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-bold text-txt-secondary">{label}</label>
         <div className="relative">
            <div className="w-full px-4 py-2.5 rounded-ds-xl border border-border text-sm flex items-center justify-between cursor-pointer hover:bg-main transition-colors text-txt-primary">
               <span className="font-medium">{value}</span>
               <ChevronDown size={16} className="text-txt-muted" />
            </div>
         </div>
         {sub && <p className="text-[10px] text-txt-muted font-medium">{sub}</p>}
      </div>
   );
}

function SwitchRow({ label, sub, active, highImpact, t }: any) {
   return (
      <div className="flex items-center justify-between py-4 border-b border-border last:border-0 last:pb-0">
         <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <p className="text-xs font-bold text-txt-primary">{label}</p>
               {highImpact && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 uppercase">{t("common.high_impact")}</span>}
            </div>
            <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
         </div>
         <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${active ? "bg-primary" : "bg-border"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "right-1 shadow-md" : "left-1"}`}></div>
         </div>
      </div>
   );
}

function IntegrationRow({ name, sub, status, active, t }: any) {
   return (
      <div className="flex items-center justify-between p-4 rounded-ds-2xl bg-main border border-border">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-ds-xl bg-surface border border-border flex items-center justify-center text-txt-muted shadow-sm">
               <Settings size={20} />
            </div>
            <div>
               <p className="text-xs font-bold text-txt-primary">{name}</p>
               <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${status === t("common.service_status.connected") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
               }`}>
               {status}
            </span>
            <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${active ? "bg-primary" : "bg-border"}`}>
               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "right-1 shadow-md" : "left-1"}`}></div>
            </div>
         </div>
      </div>
   );
}

function SecretField({ label, value, sub, t }: any) {
   const [isVisible, setIsVisible] = useState(false);

   const maskedValue = value.replace(/.(?=.{4})/g, '*');

   return (
      <div className="p-4 rounded-ds-2xl border border-border bg-main group">
         <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{label}</label>
            <button
               onClick={() => setIsVisible(!isVisible)}
               className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline transition-all"
            >
               {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
               {isVisible ? t("common.hide_code") : t("common.show_code")}
            </button>
         </div>
         <p className="text-sm font-mono text-txt-primary tracking-wider mb-2 select-all overflow-x-auto whitespace-nowrap scrollbar-hide">
            {isVisible ? value : maskedValue}
         </p>
         <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
      </div>
   );
}

function WebhookRow({ name, url, lastSeen, status, t }: any) {
   return (
      <div className="p-4 rounded-ds-2xl border border-border bg-surface shadow-sm flex items-center justify-between">
         <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
               <p className="text-xs font-bold text-txt-primary">{name}</p>
               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${status === t("common.service_status.healthy") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}>
                  {status}
               </span>
            </div>
            <p className="text-[10px] font-mono text-txt-muted truncate">{url}</p>
            <p className="text-[10px] text-txt-muted font-medium mt-1">{lastSeen}</p>
         </div>
         <button className="p-2 text-txt-muted hover:bg-main rounded-ds-lg transition-all border border-transparent hover:border-border">
            <RotateCcw size={16} />
         </button>
      </div>
   );
}
