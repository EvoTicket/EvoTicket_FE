"use client";

import { useState } from "react";
import {
   ChevronLeft,
   ShieldAlert,
   Clock,
   Flag,
   CheckCircle2,
   XCircle,
   AlertTriangle,
   Info,
   Calendar,
   MapPin,
   Building2,
   ExternalLink,
   MessageSquare,
   History,
   FileText,
   AlertCircle,
   Link as LinkIcon,
   ChevronRight,
   User,
   Save,
   PenTool,
   Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { moderationDetailMock } from "../../datamockadmin/mockdata_moderation_detail";

export default function ModerationDetailPage() {
   const t = useTranslations("Admin");
   const locale = useLocale();
   const params = useParams();
   const id = params.id;
   const [activeTab, setActiveTab] = useState("risk");
   const [data] = useState(moderationDetailMock);

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
         {/* Breadcrumbs & Actions Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 p-4 rounded-ds-2xl border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold">
               <Link href={`/${locale}/admin/moderation`} className="text-txt-muted hover:text-primary transition-colors">Kiểm duyệt sự kiện</Link>
               <ChevronRight size={12} className="text-txt-muted/50" />
               <span className="text-txt-muted">Chi tiết review sự kiện</span>
               <ChevronRight size={12} className="text-txt-muted/50" />
               <span className="text-primary uppercase">{id}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-main border border-border rounded-ds-xl text-xs font-bold text-txt-primary transition-all">
                  <Save size={16} />
                  <span>Lưu ghi chú</span>
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/20 rounded-ds-xl text-xs font-bold transition-all">
                  <PenTool size={16} />
                  <span>Yêu cầu chỉnh sửa</span>
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-ds-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20">
                  <XCircle size={16} />
                  <span>Từ chối</span>
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-ds-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                  <CheckCircle2 size={16} />
                  <span>Phê duyệt</span>
               </button>
            </div>
         </div>

         {/* Profile Header */}
         <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-ds-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0">
               <ImageIcon size={32} />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">ADM-05</p>
               <h1 className="text-3xl font-black text-txt-primary tracking-tight truncate">{data.name}</h1>
               <div className="flex flex-wrap items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-main border border-border rounded-ds-lg">
                     <Building2 size={12} className="text-txt-muted" />
                     <span className="text-[11px] font-bold text-txt-secondary">{data.organizer.name}</span>
                  </div>
                  <StatusBadge status={data.reviewStatus} />
                  <PriorityBadge level={data.priority} />
                  <span className="text-[10px] font-medium text-txt-muted">ID: {data.id} • Gửi lúc {data.submittedAt}</span>
               </div>
            </div>
         </div>

         {/* Top Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HeaderStatsCard
               icon={<Clock size={20} />}
               label="Trạng thái review"
               value={data.reviewStatus}
               subValue={`Trong hàng đợi: ${data.reviewTimeElapsed}`}
               color="amber"
            />
            <HeaderStatsCard
               icon={<Flag size={20} />}
               label="Mức ưu tiên"
               value={data.priority}
               subValue={`SLA xử lý: ${data.slaTarget}`}
               color="rose"
            />
            <HeaderStatsCard
               icon={<AlertTriangle size={20} />}
               label="Cờ cảnh báo"
               value={data.riskAnalysis.filter(r => r.status === "Warning").length.toString()}
               subValue={`${data.riskAnalysis.filter(r => r.status === "Warning").length} warning • ${data.riskAnalysis.filter(r => r.status === "Info").length} info`}
               color="amber"
            />
            <HeaderStatsCard
               icon={<CheckCircle2 size={20} />}
               label="Trạng thái organizer"
               value={data.organizer.status}
               subValue={data.organizer.id}
               color="emerald"
            />
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
               <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                  {/* Tabs Navigation */}
                  <div className="flex items-center border-b border-border px-6 bg-main/5">
                     <DetailTab active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<FileText size={16} />} label="Nội dung sự kiện" />
                     <DetailTab active={activeTab === "risk"} onClick={() => setActiveTab("risk")} icon={<ShieldAlert size={16} />} label="Rủi ro & Policy" />
                     <DetailTab active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<History size={16} />} label="Lịch sử review" />
                  </div>

                  {/* Tab Content */}
                  <div className="p-8 flex-1">
                     {activeTab === "content" && <ContentTab data={data.content} organizer={data.organizer} />}
                     {activeTab === "risk" && <RiskTab items={data.riskAnalysis} />}
                     {activeTab === "history" && <HistoryTab history={data.history} />}
                  </div>
               </div>

               {/* Organizer Context Section */}
               <div className="bg-surface border border-border rounded-ds-3xl p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-sm font-black text-txt-primary uppercase tracking-tight">Bối cảnh tổ chức liên quan</h3>
                        <p className="text-[11px] text-txt-muted mt-1">Ngữ cảnh hỗ trợ quyết định review</p>
                     </div>
                     <button className="p-2 text-txt-muted hover:bg-main rounded-ds-xl transition-all">
                        <ExternalLink size={18} />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <ContextStatCard label="Sự kiện cũ tạo" value={data.organizer.stats.totalEvents} />
                     <ContextStatCard label="Lần bị từ chối" value={data.organizer.stats.rejectedEvents} color="emerald" />
                     <ContextStatCard label="Submissions 30 ngày" value={data.organizer.stats.last30DaysSubmissions} color="sky" />
                     <ContextStatCard label="Ghi chú hỗ trợ" value={data.organizer.stats.activeNotes} color="amber" />
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Sự kiện gần đây của tổ chức</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.organizer.recentEvents.map(event => (
                           <div key={event.id} className="flex items-center justify-between p-3 bg-main/30 border border-border rounded-ds-xl group hover:border-primary/30 transition-all cursor-pointer">
                              <div className="min-w-0">
                                 <p className="text-[11px] font-bold text-txt-primary truncate">{event.name}</p>
                                 <p className="text-[9px] text-txt-muted uppercase">{event.id} • {event.date}</p>
                              </div>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-ds-md border shrink-0 ${event.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                 event.status === "Completed" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                                    event.status === "Needs Edit" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                       "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                 }`}>
                                 {event.status === "Approved" ? "Đã duyệt" : event.status === "Completed" ? "Hoàn tất" : event.status === "Needs Edit" ? "Yêu cầu chỉnh sửa" : "Từ chối"}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-ds-2xl flex items-start gap-3">
                     <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-amber-700 leading-relaxed">
                        Tổ chức hiện đang ở trạng thái <strong>Pending Approval</strong> — cần phê duyệt tổ chức trước khi sự kiện có thể được công bố công khai.
                     </p>
                  </div>
               </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Decision Card */}
               <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm space-y-6 sticky top-24">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black text-txt-primary uppercase tracking-tight">Quyết định review</h3>
                     <ShieldAlert size={14} className="text-txt-muted" />
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">Trạng thái review hiện tại</p>
                     <div className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-ds-xl text-[11px] font-bold text-amber-600">
                        Pending Review
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">Tóm tắt cờ cảnh báo</p>
                     <div className="space-y-2">
                        {data.riskAnalysis.filter(r => r.status !== "Pass").map(flag => (
                           <div key={flag.id} className="flex gap-2 p-2 bg-main/50 border border-border rounded-ds-xl">
                              {flag.status === "Warning" ? <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" /> : <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />}
                              <div>
                                 <p className="text-[11px] font-bold text-txt-primary">{flag.title}</p>
                                 <p className="text-[9px] text-txt-muted leading-tight mt-0.5">{flag.description}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight">Ghi chú nội bộ</p>
                     <textarea
                        placeholder="Nhập ghi chú review nội bộ..."
                        className="w-full h-32 p-4 bg-main/50 border border-border rounded-ds-2xl text-[11px] outline-none focus:border-primary/50 transition-all resize-none text-txt-primary placeholder:text-txt-muted"
                     ></textarea>
                     <button className="w-full py-3 bg-surface border border-border hover:bg-main rounded-ds-xl text-xs font-black text-txt-primary transition-all shadow-sm">
                        Lưu ghi chú
                     </button>
                  </div>

                  {data.reviewer && (
                     <div className="pt-6 border-t border-border">
                        <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight mb-3">Reviewer hiện tại</p>
                        <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-ds-2xl">
                           <div className="w-10 h-10 rounded-ds-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                              <User size={20} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-indigo-600">@{data.reviewer.name}</p>
                              <p className="text-[9px] text-txt-muted uppercase font-bold">{data.reviewer.role}</p>
                              <p className="text-[9px] text-txt-muted mt-0.5">Ghi chú lần cuối: {data.reviewer.assignedAt}</p>
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-ds-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>Phê duyệt sự kiện</span>
                     </button>
                     <button className="w-full py-3.5 bg-surface hover:bg-main border border-border rounded-ds-2xl text-xs font-black text-txt-primary transition-all shadow-sm flex items-center justify-center gap-2">
                        <PenTool size={16} className="text-amber-500" />
                        <span>Yêu cầu chỉnh sửa</span>
                     </button>
                     <button className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-ds-2xl text-xs font-black transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                        <XCircle size={16} />
                        <span>Từ chối sự kiện</span>
                     </button>
                  </div>
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
      emerald: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
      sky: "bg-sky-500/5 text-sky-600 border-sky-500/10",
   };

   return (
      <div className="bg-surface border border-border rounded-ds-3xl p-5 shadow-sm">
         <div className="flex items-center gap-4">
            <div className={`p-3 rounded-ds-2xl border ${colorStyles[color]}`}>
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

function ContextStatCard({ label, value, color = "indigo" }: any) {
   const colors: any = {
      indigo: "text-indigo-600 bg-indigo-500/5 border-indigo-500/10",
      emerald: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10",
      amber: "text-amber-600 bg-amber-500/5 border-amber-500/10",
      sky: "text-sky-600 bg-sky-500/5 border-sky-500/10",
   };

   return (
      <div className={`p-4 rounded-ds-2xl border ${colors[color].split(" ")[1]} ${colors[color].split(" ")[2]}`}>
         <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">{label}</p>
         <p className={`text-2xl font-black tracking-tighter ${colors[color].split(" ")[0]}`}>{value}</p>
      </div>
   );
}

function StatusBadge({ status }: { status: string }) {
   const styles: any = {
      "Pending Review": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "Flagged": "bg-rose-500/10 text-rose-600 border-rose-500/20",
      "Rejected": "bg-gray-500/10 text-gray-600 border-gray-500/20",
      "Approved": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
   };

   return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
         {status}
      </div>
   );
}

function PriorityBadge({ level }: { level: string }) {
   const styles: any = {
      "High": "bg-rose-500/5 text-rose-600 border-rose-500/20",
      "Medium": "bg-amber-500/5 text-amber-600 border-amber-500/20",
      "Low": "bg-sky-500/5 text-sky-600 border-sky-500/20",
   };

   return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded-ds-lg border text-[9px] font-black ${styles[level]}`}>
         {level}
      </div>
   );
}

// Tab Components
function ContentTab({ data, organizer }: any) {
   return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Images Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="aspect-[3/4] rounded-ds-2xl bg-indigo-900/10 border border-border flex flex-col items-center justify-center gap-2 text-txt-muted relative group overflow-hidden">
               <ImageIcon size={24} className="opacity-20" />
               <span className="text-[10px] font-black uppercase">{data.images.poster}</span>
               <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="aspect-[16/9] md:col-span-2 rounded-ds-2xl bg-amber-500/10 border border-border flex flex-col items-center justify-center gap-2 text-txt-muted relative group overflow-hidden">
               <ImageIcon size={24} className="opacity-20" />
               <span className="text-[10px] font-black uppercase">{data.images.cover}</span>
               <div className="absolute inset-0 bg-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="aspect-[4/3] rounded-ds-2xl bg-indigo-900/10 border border-border flex flex-col items-center justify-center gap-2 text-txt-muted relative group overflow-hidden">
               <ImageIcon size={24} className="opacity-20" />
               <span className="text-[10px] font-black uppercase">{data.images.lineup}</span>
               <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
         </div>

         {/* Basic Info */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">Tiêu đề</p>
                  <div className="flex items-center gap-2 text-txt-primary">
                     <FileText size={16} className="text-txt-muted" />
                     <p className="text-sm font-bold">{data.name}</p>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">Hình thức tổ chức</p>
                  <div className="flex items-center gap-2 text-txt-primary">
                     <MapPin size={16} className="text-txt-muted" />
                     <p className="text-sm font-bold">{data.type} • {data.location}</p>
                  </div>
               </div>
            </div>
            <div className="space-y-6">
               <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">Danh mục</p>
                  <div className="flex items-center gap-2 text-txt-primary">
                     <LinkIcon size={16} className="text-txt-muted" />
                     <p className="text-sm font-bold">{data.category}</p>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-1">Thời gian</p>
                  <div className="flex items-center gap-2 text-txt-primary">
                     <Clock size={16} className="text-txt-muted" />
                     <p className="text-sm font-bold">{data.time}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Description */}
         <div>
            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">Mô tả ngắn</p>
            <div className="p-4 bg-main/30 border border-border rounded-ds-2xl relative group">
               <p className="text-[11px] text-txt-secondary leading-relaxed pr-24">
                  {data.shortDescription}
               </p>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-ds-lg text-[9px] font-black text-amber-600">
                  <LinkIcon size={10} />
                  <span>% Phát hiện liên hệ ngoài</span>
               </div>
            </div>
         </div>

         {/* Sessions */}
         <div className="space-y-3">
            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Suất diễn</p>
            <div className="space-y-2">
               {data.sessions.map((session: any, idx: number) => (
                  <div key={idx} className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-ds-lg bg-main flex items-center justify-center text-txt-muted">
                           <Calendar size={16} />
                        </div>
                        <div>
                           <p className="text-[11px] font-bold text-txt-primary">{session.name}</p>
                           <p className="text-[9px] text-txt-muted uppercase">{session.time} • {session.location}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-right">
                        <div>
                           <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">Sức chứa</p>
                           <p className="text-[11px] font-bold text-txt-primary">{session.capacity}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">Loại vé</p>
                           <p className="text-[11px] font-bold text-txt-primary">{session.ticketsSold}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Tickets */}
         <div className="space-y-3">
            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Cấu hình vé</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {data.tickets.map((ticket: any, idx: number) => (
                  <div key={idx} className="p-4 bg-surface border border-border rounded-ds-2xl">
                     <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">{ticket.type}</p>
                     <p className="text-sm font-black text-txt-primary">{ticket.price}</p>
                     <p className="text-[9px] text-txt-muted font-bold mt-1">{ticket.quantity}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Organizer */}
         <div className="space-y-3">
            <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Tổ chức phát hành</p>
            <div className="p-4 bg-surface border border-border rounded-ds-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-ds-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                     <Building2 size={20} />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-txt-primary">{organizer.name}</p>
                     <p className="text-[9px] text-txt-muted uppercase font-bold">{organizer.id} • Đăng ký 18/04/2026</p>
                  </div>
               </div>
               <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-ds-lg text-[9px] font-black text-amber-600 uppercase">
                  Pending Approval
               </div>
            </div>
         </div>
      </div>
   );
}

function RiskTab({ items }: any) {
   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-ds-2xl flex items-start gap-3">
            <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-700 leading-relaxed">
               Đây là kết quả tự động từ hệ thống — admin cần xác nhận lại trước khi ra quyết định.
            </p>
         </div>

         <div className="border border-border rounded-ds-2xl overflow-hidden divide-y divide-border">
            {items.map((item: any) => (
               <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-main/30 transition-all">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-ds-xl shrink-0 ${item.status === "Pass" ? "bg-emerald-500/10 text-emerald-600" :
                        item.status === "Warning" ? "bg-amber-500/10 text-amber-600" :
                           "bg-sky-500/10 text-sky-600"
                        }`}>
                        {item.title.includes("asset") ? <ImageIcon size={18} /> :
                           item.title.includes("liên hệ") ? <LinkIcon size={18} /> :
                              item.title.includes("hiểu lầm") ? <ShieldAlert size={18} /> :
                                 item.title.includes("xác minh") ? <CheckCircle2 size={18} /> :
                                    item.title.includes("resale") ? <AlertCircle size={18} /> : <FileText size={18} />}
                     </div>
                     <div>
                        <p className="text-xs font-bold text-txt-primary">{item.title}</p>
                        <p className="text-[10px] text-txt-muted mt-0.5">{item.description}</p>
                     </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-ds-lg border text-[9px] font-black uppercase tracking-widest ${item.status === "Pass" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
                     item.status === "Warning" ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
                        "bg-sky-500/5 text-sky-600 border-sky-500/20"
                     }`}>
                     {item.status}
                  </div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-ds-2xl">
               <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">Pass</p>
               <p className="text-2xl font-black text-emerald-600 leading-none">4</p>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-ds-2xl">
               <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">Warning</p>
               <p className="text-2xl font-black text-amber-600 leading-none">2</p>
            </div>
            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-ds-2xl">
               <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">Info</p>
               <p className="text-2xl font-black text-sky-600 leading-none">1</p>
            </div>
         </div>
      </div>
   );
}

function HistoryTab({ history }: any) {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border before:rounded-full">
            {history.map((item: any) => (
               <div key={item.id} className="relative">
                  <div className={`absolute -left-[31px] top-1 w-8 h-8 rounded-ds-xl border flex items-center justify-center bg-surface z-10 ${item.type === "Note" ? "text-indigo-600 border-indigo-100" :
                     item.type === "Warning" ? "text-amber-600 border-amber-100" :
                        item.type === "Submission" ? "text-sky-600 border-sky-100" :
                           "text-emerald-600 border-emerald-100"
                     }`}>
                     {item.type === "Note" ? <FileText size={16} /> :
                        item.type === "Warning" ? <LinkIcon size={16} /> :
                           item.type === "Submission" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div>
                     <p className="text-[10px] font-medium text-txt-muted mb-1">{item.date} • {item.time}</p>
                     <p className="text-xs font-bold text-txt-primary">{item.title}</p>
                     <p className="text-[10px] text-txt-muted mt-1 leading-relaxed">{item.description}</p>
                  </div>
               </div>
            ))}
         </div>

         <div className="p-4 bg-main/30 border border-border rounded-ds-2xl flex items-center gap-2">
            <History size={14} className="text-txt-muted" />
            <p className="text-[9px] font-medium text-txt-muted italic uppercase tracking-widest">Toàn bộ hành động review được ghi vào audit log nền tảng.</p>
         </div>
      </div>
   );
}
