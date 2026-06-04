"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
   ChevronLeft,
   Clock,
   User,
   Calendar,
   CreditCard,
   Ticket,
   MessageSquare,
   ShieldCheck,
   AlertCircle,
   Copy,
   ExternalLink,
   Flag,
   Share2,
   FileText,
   UserCheck,
   Send,
   Building2,
   Link2,
   Zap,
   MoreHorizontal
} from "lucide-react";
import {
   supportDetailMock,
   transactionDetailMock,
   ticketDetailMock
} from "../../datamockadmin/mockdata_support_detail";

export default function SupportDetailPage() {
   const t = useTranslations("Admin");
   const locale = useLocale();
   const params = useParams();
   const id = (params?.id as string) || "";

   const [activeTab, setActiveTab] = useState("overview");

   // Determine which mock data to use based on ID prefix
   const data = useMemo(() => {
      if (id.startsWith("ORD-")) return transactionDetailMock;
      if (id.startsWith("TIX-")) return ticketDetailMock;
      return supportDetailMock;
   }, [id]);

   const typeLabel = useMemo(() => {
      if (data.type === "transaction") return t("support_detail_transaction");
      if (data.type === "ticket") return t("support_detail_ticket");
      return t("support_detail_case");
   }, [data.type, t]);

   const displayStatus = useMemo(() => {
      if (data.type === "ticket") return (data as any).access;
      return (data as any).status;
   }, [data]);

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {/* Breadcrumbs & Header Actions */}
         <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-bold text-txt-muted uppercase tracking-widest">
               <Link href={`/${locale}/admin/support`} className="hover:text-primary transition-colors flex items-center gap-1">
                  {t("support_title")}
               </Link>
               <span className="opacity-30">/</span>
               <span className="text-txt-primary">{typeLabel}</span>
            </div>

            <div className="flex items-center gap-2">
               <ActionButton icon={<FileText size={14} />} label={t("accounts_detail_internal_note")} />
               <ActionButton icon={<Flag size={14} />} label={t("action_flag")} />
               <ActionButton icon={<Share2 size={14} />} label={t("action_assign_transfer")} />
               <ActionButton icon={<Copy size={14} />} label={t("action_copy_id")} />
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-ds-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                  <ExternalLink size={14} />
                  <span>{t("action_view_related_account")}</span>
               </button>
            </div>
         </div>

         {/* Main Header */}
         <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-black text-txt-primary tracking-tight">
                  {data.type === "transaction" ? t("type_transaction") : data.type === "ticket" ? t("type_ticket") : t("type_case")} #{id || data.id}
               </h1>
               <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 border rounded-ds-lg text-[10px] font-black uppercase tracking-tighter ${displayStatus === "Success" || displayStatus === "Active"
                     ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                     : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                     }`}>
                     {displayStatus}
                  </span>
                  {data.type === "case" && (
                     <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-ds-lg text-[10px] font-black uppercase tracking-tighter">
                        Priority {(data as any).priority}
                     </span>
                  )}
               </div>
            </div>
            <p className="text-sm text-txt-secondary font-medium">
               {data.type === "transaction" ? t("support_transaction_by", { name: (data as any).buyer.name }) : data.type === "ticket" ? t("support_owner_label", { owner: (data as any).owner }) : (data as any).subject}
            </p>
         </div>

         {/* Quick Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stats.map((stat, idx) => (
               <div key={idx} className="bg-surface border border-border rounded-ds-2xl p-4 flex flex-col gap-1 transition-all hover:border-primary/30">
                  <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">{stat.label}</span>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${stat.color === 'amber' ? 'bg-amber-500' : stat.color === 'rose' ? 'bg-rose-500' : stat.color === 'indigo' ? 'bg-indigo-500' : 'bg-txt-muted'}`} />
                     <span className="text-sm font-black text-txt-primary">{stat.value}</span>
                  </div>
                  <span className="text-[10px] text-txt-muted">{stat.sub}</span>
               </div>
            ))}
         </div>

         {/* Content Layout */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-8 space-y-6">
               <div className="bg-surface border border-border rounded-ds-3xl overflow-hidden shadow-sm">
                  {/* Tabs Header */}
                  <div className="flex items-center border-b border-border px-6">
                     <DetailTab active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label={t("tab_overview")} />
                     <DetailTab active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")} label={t("tab_timeline")} />
                     <DetailTab active={activeTab === "related"} onClick={() => setActiveTab("related")} label={t("tab_related_links")} />
                  </div>

                  {/* Tab Content */}
                  <div className="p-8">
                     {activeTab === "overview" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                           {data.type === "case" && (
                              <section>
                                 <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest mb-4">{t("support_case_info")}</h3>
                                 <div className="space-y-4">
                                    <InfoRow label={t("col_case_id")} value={data.id} />
                                    <InfoRow label={t("col_subject")} value={(data as any).subject} />
                                    <InfoRow label={t("support_related_user")} value={data.user.email} />
                                    <InfoRow label={t("support_related_event")} value={data.event} />
                                    <InfoRow label={t("support_description")} value={(data as any).description} />
                                    <InfoRow label={t("support_processing_status")} value={t("support_status_reconciling_finance")} />
                                    <InfoRow label={t("support_related_ticket_tx")} value={data.relatedLinks.transaction} />
                                 </div>
                              </section>
                           )}

                           {data.type === "transaction" && (
                              <section>
                                 <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest mb-4">{t("support_tx_info")}</h3>
                                 <div className="space-y-4">
                                    <InfoRow label={t("col_order_id")} value={data.id} />
                                    <InfoRow label={t("support_buyer_name")} value={(data as any).buyer.name} />
                                    <InfoRow label="Email" value={(data as any).buyer.email} />
                                    <InfoRow label={t("support_wallet")} value={(data as any).buyer.wallet} />
                                    <InfoRow label={t("support_related_event")} value={data.event} />
                                    <InfoRow label={t("support_payment_method")} value={(data as any).paymentMethod} />
                                    <InfoRow label={t("col_total_amount")} value={(data as any).amount} />
                                    <div className="pt-4 border-t border-border/50">
                                       <p className="text-[10px] font-bold text-txt-muted uppercase mb-2">{t("support_product_details")}</p>
                                       {(data as any).items.map((item: any, i: number) => (
                                          <div key={i} className="flex justify-between items-center bg-main/30 p-3 rounded-ds-xl">
                                             <span className="text-[11px] font-bold text-txt-primary">{item.name} x {item.qty}</span>
                                             <span className="text-[11px] font-black text-primary">{item.total}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </section>
                           )}

                           {data.type === "ticket" && (
                              <section>
                                 <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest mb-4">{t("support_ticket_info")}</h3>
                                 <div className="space-y-4">
                                    <InfoRow label={t("col_ticket_id")} value={data.id} />
                                    <InfoRow label={t("support_nft_id")} value={(data as any).nftId} />
                                    <InfoRow label={t("support_owner")} value={(data as any).owner} />
                                    <InfoRow label={t("support_owner_type")} value={(data as any).ownerType} />
                                    <InfoRow label={t("support_related_event")} value={data.event} />
                                    <InfoRow label={t("col_ticket_tier")} value={(data as any).tier} />
                                    <InfoRow label={t("support_ticket_price")} value={(data as any).price} />
                                    <InfoRow label={t("support_blockchain_ref")} value={(data as any).blockchainRef} />
                                 </div>
                              </section>
                           )}

                           {data.type === "case" && (
                              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-ds-2xl flex gap-3">
                                 <div className="mt-0.5 text-amber-500">
                                    <AlertCircle size={18} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-amber-700">{t("support_need_payment_reconciliation")}</p>
                                    <p className="text-[11px] text-amber-600/80 mt-1">{t("support_vnpay_reconciliation_desc")}</p>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     {activeTab === "timeline" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                           <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest mb-4">{t("support_record_history")}</h3>
                           <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
                              {data.timeline.map((item, idx) => (
                                 <div key={idx} className="relative">
                                    <div className="absolute -left-8 w-7 h-7 bg-surface border border-border rounded-full flex items-center justify-center z-10">
                                       {item.type === 'event' && <Zap size={12} className="text-indigo-500" />}
                                       {item.type === 'assign' && <UserCheck size={12} className="text-emerald-500" />}
                                       {item.type === 'flag' && <Flag size={12} className="text-rose-500" />}
                                       {item.type === 'note' && <MessageSquare size={12} className="text-sky-500" />}
                                    </div>
                                    <div className="space-y-1">
                                       <div className="flex items-center justify-between">
                                          <p className="text-xs font-black text-txt-primary">{item.title}</p>
                                          <p className="text-[10px] text-txt-muted">{item.time}</p>
                                       </div>
                                       <p className="text-[11px] text-txt-secondary leading-relaxed">{item.desc}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {activeTab === "related" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                           <h3 className="text-xs font-black text-txt-primary uppercase tracking-widest mb-4">{t("tab_related_links")}</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RelatedCard icon={<User size={16} />} label={t("support_related_account")} value={data.relatedLinks.account} />
                              <RelatedCard icon={<Calendar size={16} />} label={t("support_related_event")} value={data.relatedLinks.event} />
                              <RelatedCard icon={<CreditCard size={16} />} label={t("support_payment_ticket")} value={data.relatedLinks.transaction} />
                              <RelatedCard icon={<Building2 size={16} />} label={t("support_organizer_unit")} value={data.relatedLinks.organizer} />
                              <RelatedCard icon={<ShieldCheck size={16} />} label={t("support_flag_alerts")} value={data.relatedLinks.flag} />
                              <RelatedCard icon={<Link2 size={16} />} label={t("support_blockchain_ref_label")} value={data.relatedLinks.blockchain} />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="xl:col-span-4 space-y-6">
               {/* Related Links Widget */}
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
                  <h3 className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("tab_related_links")}</h3>
                  <div className="space-y-3">
                     <SidebarLink icon={<User size={14} />} label={t("support_sidebar_account")} value={(data as any).user.email} />
                     <SidebarLink icon={<Calendar size={14} />} label={t("support_sidebar_event")} value={data.event} />
                     <SidebarLink icon={<CreditCard size={14} />} label={t("support_sidebar_payment")} value={data.relatedLinks.transaction} />
                     <SidebarLink icon={<Building2 size={14} />} label={t("support_sidebar_organizer")} value={data.relatedLinks.organizer} />
                  </div>
               </div>

               {/* Recent Notes Widget */}
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
                  <h3 className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("support_sidebar_recent_notes")}</h3>
                  <div className="space-y-4">
                     {data.notes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-ds-2xl space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-600">{note.author}</span>
                              <span className="text-[9px] text-txt-muted opacity-60">{note.time}</span>
                           </div>
                           <p className="text-[11px] text-txt-secondary leading-tight">{note.content}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Support Actions Widget */}
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-4 transition-colors duration-300">
                  <h3 className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("support_sidebar_actions")}</h3>
                  <div className="space-y-2">
                     <SidebarAction label={t("support_action_add_note")} />
                     <SidebarAction label={t("support_action_escalate")} />
                     <SidebarAction label={t("support_action_pending_finance")} />
                     <SidebarAction label={t("support_action_pending_blockchain")} />
                     <button className="w-full flex items-center justify-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-ds-xl text-[11px] font-bold transition-all shadow-md shadow-indigo-600/10">
                        <span>{t("action_view_related_account")}</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function ActionButton({ icon, label }: any) {
   return (
      <button className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-main text-txt-primary border border-border rounded-ds-xl text-[11px] font-bold transition-all shadow-sm">
         {icon}
         <span>{label}</span>
      </button>
   );
}

function DetailTab({ active, onClick, label }: any) {
   return (
      <button
         onClick={onClick}
         className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'border-primary text-primary' : 'border-transparent text-txt-muted hover:text-txt-primary'}`}
      >
         {label}
      </button>
   );
}

function InfoRow({ label, value }: any) {
   return (
      <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
         <span className="text-[11px] font-bold text-txt-muted uppercase">{label}</span>
         <div className="col-span-2 text-[11px] font-black text-txt-primary">
            {value}
         </div>
      </div>
   );
}

function RelatedCard({ icon, label, value }: any) {
   return (
      <div className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center gap-4 transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
         <div className="w-10 h-10 bg-main rounded-ds-xl flex items-center justify-center text-txt-muted">
            {icon}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tighter">{label}</p>
            <p className="text-xs font-black text-txt-primary truncate">{value}</p>
         </div>
         <MoreHorizontal size={14} className="text-txt-muted opacity-30" />
      </div>
   );
}

function SidebarLink({ icon, label, value }: any) {
   const t = useTranslations("Admin");
   return (
      <div className="flex items-center gap-3 p-2 hover:bg-main rounded-ds-xl transition-all cursor-pointer group">
         <div className="w-8 h-8 bg-surface border border-border rounded-ds-lg flex items-center justify-center text-txt-muted group-hover:text-primary transition-colors">
            {icon}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">{label}</p>
            <p className="text-[10px] font-black text-txt-primary truncate">{value}</p>
         </div>
         <button className="text-[9px] font-black text-primary px-2 py-1 bg-primary/5 rounded-ds-md opacity-0 group-hover:opacity-100 transition-all">
            {t("action_view")}
         </button>
      </div>
   );
}

function SidebarAction({ label }: any) {
   return (
      <button className="w-full text-left px-4 py-2.5 bg-surface border border-border rounded-ds-xl text-[11px] font-bold text-txt-secondary hover:bg-main hover:text-txt-primary transition-all shadow-sm">
         {label}
      </button>
   );
}
