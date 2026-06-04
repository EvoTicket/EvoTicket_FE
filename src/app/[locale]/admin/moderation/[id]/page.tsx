"use client";

import { useState, useEffect } from "react";
import {
   ChevronLeft,
   ShieldAlert,
   Clock,
   CheckCircle2,
   XCircle,
   AlertTriangle,
   Info,
   Calendar,
   MapPin,
   Building2,
   ExternalLink,
   FileText,
   AlertCircle,
   ChevronRight,
   User,
   Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { adminEventsApi } from "@/src/lib/api/adminEventsApi";

export default function ModerationDetailPage() {
   const t = useTranslations("Admin");
   const locale = useLocale();
   const params = useParams();
   const idStr = params.id as string;
   const eventId = parseInt(idStr.replace("EVT-", ""), 10);

   const [activeTab, setActiveTab] = useState("content");
   const [event, setEvent] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   const loadDetail = async () => {
      try {
         setLoading(true);
         const res = await adminEventsApi.getEventDetail(eventId);
         setEvent(res);
      } catch (err) {
         console.error("Error loading event details:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (eventId) {
         loadDetail();
      }
   }, [eventId]);

   const handleApprove = async () => {
      if (!confirm(t("moderation_confirm_approve"))) return;
      try {
         await adminEventsApi.updateApprovalStatus(eventId, "PUBLISHED");
         alert(t("moderation_approve_success"));
         loadDetail();
      } catch (error) {
         console.error("Error approving event:", error);
         alert(t("moderation_approve_error"));
      }
   };

   const handleReject = async () => {
      if (!confirm(t("moderation_confirm_reject"))) return;
      try {
         await adminEventsApi.updateApprovalStatus(eventId, "REJECTED");
         alert(t("moderation_reject_success"));
         loadDetail();
      } catch (error) {
         console.error("Error rejecting event:", error);
         alert(t("moderation_reject_error"));
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-[400px] text-txt-muted text-sm">
            {t("loading_event_detail")}
         </div>
      );
   }

   if (!event) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="text-txt-muted text-sm">{t("event_detail_not_found")}</p>
            <Link href={`/${locale}/admin/moderation`} className="text-xs font-bold text-primary hover:underline">
               {t("btn_back_to_moderation")}
            </Link>
         </div>
      );
   }

   const formatDateRange = (showtimes: any[]) => {
      if (!showtimes || showtimes.length === 0) return t("status_unknown");
      const sorted = [...showtimes].sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime());
      const start = new Date(sorted[0].startDatetime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      const end = new Date(sorted[sorted.length - 1].endDatetime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      return `${start} - ${end}`;
   };

   const formatCategory = (cat?: string) => {
      const names: Record<string, string> = {
         WORKSHOP: t("cat_workshop"),
         LIVESTAGE: t("cat_livestage"),
         SPORTS: t("cat_sports"),
         EXHIBITION: t("cat_exhibition"),
      };
      return names[cat || ""] || cat || t("cat_unclassified");
   };

   const allTickets = event.showtimes?.flatMap((s: any) => s.ticketTypes || []) || [];

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
         {/* Breadcrumbs & Actions Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 p-4 rounded-ds-2xl border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold">
               <Link href={`/${locale}/admin/moderation`} className="text-txt-muted hover:text-primary transition-colors">{t("moderation_title")}</Link>
               <ChevronRight size={12} className="text-txt-muted/50" />
               <span className="text-txt-muted">{t("event_review_detail")}</span>
               <ChevronRight size={12} className="text-txt-muted/50" />
               <span className="text-primary uppercase">EVT-{event.eventId}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {event.approvalStatus === "PENDING_REVIEW" && (
                  <>
                     <button
                        onClick={handleReject}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-ds-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
                     >
                        <XCircle size={16} />
                        <span>{t("status_rejected")}</span>
                     </button>
                     <button
                        onClick={handleApprove}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-ds-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                     >
                        <CheckCircle2 size={16} />
                        <span>{t("status_approved")}</span>
                     </button>
                  </>
               )}
            </div>
         </div>

         {/* Profile Header */}
         <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-ds-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0 overflow-hidden">
               {event.thumbnailImage ? (
                  <img src={event.thumbnailImage} alt={event.eventName} className="w-full h-full object-cover" />
               ) : (
                  <ImageIcon size={32} />
               )}
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">ADM-05</p>
               <h1 className="text-3xl font-black text-txt-primary tracking-tight truncate">{event.eventName}</h1>
               <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-main border border-border rounded-ds-lg">
                     <Building2 size={12} className="text-txt-muted" />
                     <span className="text-[11px] font-bold text-txt-secondary">{event.orgInternalResponse?.organizationName || t("status_unknown")}</span>
                  </div>
                  <StatusBadge status={event.approvalStatus} />
                  <span className="text-[10px] font-medium text-txt-muted">ID: EVT-{event.eventId}</span>
               </div>
            </div>
         </div>

         {/* Top Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HeaderStatsCard
               icon={<Clock size={20} />}
               label={t("review_status")}
               value={event.approvalStatus === "PENDING_REVIEW" ? t("status_pending") : event.approvalStatus === "REJECTED" ? t("status_rejected") : t("status_approved")}
               subValue={`ID: EVT-${event.eventId}`}
               color="amber"
            />
            <HeaderStatsCard
               icon={<ImageIcon size={20} />}
               label={t("event_type")}
               value={event.eventType || "—"}
               subValue={formatCategory(event.category)}
               color="rose"
            />
            <HeaderStatsCard
               icon={<FileText size={20} />}
               label={t("total_seats")}
               value={event.totalSeats ? event.totalSeats.toString() : "—"}
               subValue={t("total_ticket_types", { count: allTickets.length })}
               color="indigo"
            />
            <HeaderStatsCard
               icon={<CheckCircle2 size={20} />}
               label={t("organizer_status")}
               value={event.orgInternalResponse ? t("status_linked") : t("status_unknown")}
               subValue={`ID: ORG-${event.organizerId}`}
               color="emerald"
            />
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
               <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                  {/* Tabs Navigation */}
                  <div className="flex items-center border-b border-border px-6 bg-main/5">
                     <DetailTab active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<FileText size={16} />} label={t("event_content")} />
                     <DetailTab active={activeTab === "risk"} onClick={() => setActiveTab("risk")} icon={<ShieldAlert size={16} />} label={t("event_risk_policy")} />
                  </div>

                  {/* Tab Content */}
                  <div className="p-8 flex-1">
                     {activeTab === "content" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                           {/* Images Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="aspect-[16/9] rounded-ds-2xl bg-indigo-900/10 border border-border flex flex-col items-center justify-center gap-2 text-txt-muted relative overflow-hidden">
                                 {event.bannerImage ? (
                                    <img src={event.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                 ) : (
                                    <>
                                       <ImageIcon size={24} className="opacity-20" />
                                       <span className="text-[10px] font-black uppercase">{t("image_banner")}</span>
                                    </>
                                 )}
                              </div>
                              <div className="aspect-[16/9] rounded-ds-2xl bg-amber-500/10 border border-border flex flex-col items-center justify-center gap-2 text-txt-muted relative overflow-hidden">
                                 {event.seatMapImage ? (
                                    <img src={event.seatMapImage} alt="Seat Map" className="w-full h-full object-cover" />
                                 ) : (
                                    <>
                                       <ImageIcon size={24} className="opacity-20" />
                                       <span className="text-[10px] font-black uppercase">{t("image_seat_map")}</span>
                                    </>
                                 )}
                              </div>
                           </div>

                           {/* Basic Info */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                 <div>
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("col_title")}</p>
                                    <div className="flex items-center gap-2 text-txt-primary">
                                       <FileText size={16} className="text-txt-muted" />
                                       <p className="text-sm font-bold">{event.eventName}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("event_type_venue")}</p>
                                    <div className="flex items-center gap-2 text-txt-primary">
                                       <MapPin size={16} className="text-txt-muted" />
                                       <p className="text-sm font-bold">{event.eventType} • {event.venue} ({event.address})</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-6">
                                 <div>
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("col_category")}</p>
                                    <div className="flex items-center gap-2 text-txt-primary">
                                       <Building2 size={16} className="text-txt-muted" />
                                       <p className="text-sm font-bold">{formatCategory(event.category)}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">{t("event_duration")}</p>
                                    <div className="flex items-center gap-2 text-txt-primary">
                                       <Clock size={16} className="text-txt-muted" />
                                       <p className="text-sm font-bold">{formatDateRange(event.showtimes)}</p>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Description */}
                           <div>
                              <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{t("event_description_label")}</p>
                              <div className="p-4 bg-main/30 border border-border rounded-ds-2xl">
                                 <p className="text-[11px] text-txt-secondary leading-relaxed whitespace-pre-line">
                                    {event.shortDescription || event.description}
                                 </p>
                              </div>
                           </div>

                           {/* Sessions */}
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("event_showtimes")}</p>
                              <div className="space-y-2">
                                 {event.showtimes?.map((showtime: any, idx: number) => {
                                    const totalQty = showtime.ticketTypes?.reduce((acc: number, t: any) => acc + (t.quantityTotal || 0), 0) || 0;
                                    return (
                                       <div key={showtime.showtimeId} className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-ds-lg bg-main flex items-center justify-center text-txt-muted">
                                                <Calendar size={16} />
                                             </div>
                                             <div>
                                                <p className="text-[11px] font-bold text-txt-primary">{t("showtime_idx", { idx: idx + 1 })}</p>
                                                <p className="text-[9px] text-txt-muted uppercase">
                                                   {new Date(showtime.startDatetime).toLocaleString("vi-VN")} • {showtime.venue}
                                                </p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-right">
                                             <div>
                                                <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">{t("event_capacity")}</p>
                                                <p className="text-[11px] font-bold text-txt-primary">{t("seats_count", { count: totalQty })}</p>
                                             </div>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>

                           {/* Tickets */}
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("ticket_config")}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                 {allTickets.map((ticket: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-surface border border-border rounded-ds-2xl">
                                       <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">{ticket.typeName}</p>
                                       <p className="text-sm font-black text-txt-primary">
                                          {ticket.price ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ticket.price) : t("ticket_free")}
                                       </p>
                                       <p className="text-[9px] text-txt-muted font-bold mt-1">{t("tickets_total_count", { count: ticket.quantityTotal || 0 })}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Organizer */}
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("event_issuer")}</p>
                              <div className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-ds-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                       <Building2 size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[11px] font-bold text-txt-primary">{event.orgInternalResponse?.organizationName || t("status_unknown")}</p>
                                       <p className="text-[9px] text-txt-muted uppercase font-bold">ORG-{event.organizerId} • {event.orgInternalResponse?.businessEmail}</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === "risk" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-ds-2xl flex items-start gap-3">
                              <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-indigo-700 leading-relaxed">
                                 {t("moderation_risk_info")}
                              </p>
                           </div>

                           <div className="border border-border rounded-ds-2xl overflow-hidden divide-y divide-border">
                              <div className="p-4 flex items-center justify-between group hover:bg-main/30 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-ds-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                                       <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-txt-primary">{t("org_kyc_verification")}</p>
                                       <p className="text-[10px] text-txt-muted mt-0.5">{t("org_kyc_success")}</p>
                                    </div>
                                 </div>
                                 <div className="px-2 py-0.5 rounded-ds-lg border text-[9px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                    Pass
                                 </div>
                              </div>
                              <div className="p-4 flex items-center justify-between group hover:bg-main/30 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-ds-xl bg-sky-500/10 text-sky-600 shrink-0">
                                       <ShieldAlert size={18} />
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-txt-primary">{t("risk_sensitive_keyword_scan")}</p>
                                       <p className="text-[10px] text-txt-muted mt-0.5">{t("risk_no_sensitive_keywords")}</p>
                                    </div>
                                 </div>
                                 <div className="px-2 py-0.5 rounded-ds-lg border text-[9px] font-black uppercase tracking-widest bg-sky-500/5 text-sky-600 border-sky-500/20">
                                    Pass
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Decision Card */}
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-6 sticky top-24">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black text-txt-primary uppercase tracking-tight">{t("review_decision")}</h3>
                     <ShieldAlert size={14} className="text-txt-muted" />
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">{t("current_review_status")}</p>
                     <div className={`w-full p-3 border rounded-ds-xl text-[11px] font-bold uppercase tracking-widest text-center ${
                        event.approvalStatus === "PENDING_REVIEW" ? "bg-amber-500/5 border-amber-500/20 text-amber-600" :
                        event.approvalStatus === "REJECTED" ? "bg-rose-500/5 border-rose-500/20 text-rose-600" :
                        "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                     }`}>
                        {event.approvalStatus === "PENDING_REVIEW" ? t("status_pending") : event.approvalStatus === "REJECTED" ? t("status_rejected") : t("status_approved")}
                     </div>
                  </div>

                  {event.approvalStatus === "PENDING_REVIEW" && (
                     <div className="space-y-2 pt-4 border-t border-border">
                        <button
                           onClick={handleApprove}
                           className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-ds-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                           <CheckCircle2 size={16} />
                           <span>{t("btn_approve_event")}</span>
                        </button>
                        <button
                           onClick={handleReject}
                           className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-ds-2xl text-xs font-black transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                        >
                           <XCircle size={16} />
                           <span>{t("btn_reject_event")}</span>
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

// Helper Components
function HeaderStatsCard({ icon, label, value, subValue, color }: any) {
   const colorStyles: any = {
      amber: "bg-amber-500/5 text-amber-600 border-amber-500/10",
      rose: "bg-rose-500/5 text-rose-600 border-rose-500/10",
      indigo: "bg-indigo-500/5 text-indigo-600 border-indigo-500/10",
      emerald: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
   };

   return (
      <div className="bg-surface border border-border rounded-ds-3xl p-5 shadow-sm">
         <div className="flex items-center gap-4">
            <div className={`p-3 rounded-ds-2xl border ${colorStyles[color] || colorStyles.indigo}`}>
               {icon}
            </div>
            <div>
               <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight mb-0.5">{label}</p>
               <p className="text-lg font-black text-txt-primary tracking-tight">{value}</p>
               <p className="text-[9px] text-txt-muted font-medium mt-0.5">{subValue}</p>
            </div>
         </div>
      </div>
   );
}

function DetailTab({ active, onClick, icon, label }: any) {
   return (
      <button
         onClick={onClick}
         className={`flex items-center gap-2 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${active ? "text-primary" : "text-txt-muted hover:text-txt-secondary"
            }`}
      >
         {icon}
         <span>{label}</span>
         {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full mx-6"></div>}
      </button>
   );
}

function StatusBadge({ status }: { status: string }) {
   const t = useTranslations("Admin");
   const styles: any = {
      "PENDING_REVIEW": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "REJECTED": "bg-rose-500/10 text-rose-600 border-rose-500/20",
      "PUBLISHED": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "DRAFT": "bg-gray-500/10 text-gray-600 border-gray-500/20",
   };

   const textMap: any = {
      "PENDING_REVIEW": t("status_pending"),
      "REJECTED": t("status_rejected"),
      "PUBLISHED": t("status_published"),
      "DRAFT": t("status_draft"),
   };

   return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[9px] font-black uppercase tracking-widest ${styles[status] || styles.DRAFT}`}>
         {textMap[status] || status}
      </div>
   );
}
