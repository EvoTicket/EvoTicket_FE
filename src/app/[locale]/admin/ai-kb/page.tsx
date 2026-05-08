"use client";

import { useState } from "react";
import {
  Database,
  Search,
  Plus,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Settings,
  MoreHorizontal,
  LayoutGrid,
  History,
  Activity,
  Edit3,
  Save,
  Trash2,
  XCircle,
  Hash,
  User,
  Filter,
  Tag,
  ArrowLeftRight,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { useTranslations } from "next-intl";
import { aikbMockData } from "../datamockadmin/mockdata_aikb";

export default function AdminAIKBPage() {
  const t = useTranslations("Admin");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedId, setSelectedId] = useState("KB-1042");
  const [statusFilter, setStatusFilter] = useState("all");

  const selectedItem = aikbMockData.kbItems.find(item => item.id === selectedId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-11</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("aikb_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("aikb_subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
          <Plus size={18} />
          <span>{t("btn_add_kb_item")}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={<Database size={20} />} label={t("total_kb_items")} value="126" sub={t("aikb_sub.platform_total")} color="gray" />
        <StatsCard icon={<CheckCircle2 size={20} />} label={t("published_items")} value="102" sub={t("aikb_sub.serving_ai")} color="emerald" />
        <StatsCard icon={<Clock size={20} />} label={t("draft_review_items")} value="14" sub={t("aikb_sub.not_active")} color="amber" />
        <StatsCard icon={<AlertCircle size={20} />} label={t("low_confidence_topics")} value="10" sub={t("aikb_sub.improve_content")} color="rose" />
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-4 items-center shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Info size={18} />
        </div>
        <div className="min-w-0">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{t("ai_content_convention")}</h4>
          <p className="text-[11px] text-primary/80 font-medium leading-relaxed italic">
            {t.rich("aikb_sub.convention_desc", {
              0: (chunks) => <span className="font-bold">{chunks}</span>,
              1: (chunks) => <span className="font-bold">{chunks}</span>,
              2: (chunks) => <span className="font-bold">{chunks}</span>,
              3: (chunks) => <span className="font-bold">{chunks}</span>
            })}
          </p>
        </div>
      </div>

      {/* Tabs & Search Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-surface border border-border rounded-2xl p-1 shadow-sm">
          <TabButton active={activeTab === "items"} onClick={() => setActiveTab("items")} icon={<LayoutGrid size={14} />} label={t("tab_kb_items")} />
          <TabButton active={activeTab === "review"} onClick={() => setActiveTab("review")} icon={<History size={14} />} label={t("tab_review_version")} />
          <TabButton active={activeTab === "quality"} onClick={() => setActiveTab("quality")} icon={<Activity size={14} />} label={t("tab_usage_quality")} />
        </div>

        {activeTab === "items" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
              <input type="text" placeholder={t("aikb_sub.search_placeholder")} className="pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-xs outline-none focus:border-primary shadow-sm min-w-[280px] text-txt-primary placeholder:text-txt-muted" />
            </div>
            <div className="flex items-center bg-surface border border-border rounded-xl p-1 shadow-sm text-[10px] font-bold">
              {["all", "Published", "Draft", "Needs Review", "Disabled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-lg transition-all ${statusFilter === f ? "bg-main text-txt-primary" : "text-txt-muted hover:text-txt-secondary uppercase"}`}
                >
                  {f === 'all' ? t("common.all") : f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeTab === "items" && <KBItemsTab selectedId={selectedId} setSelectedId={setSelectedId} t={t} selectedItem={selectedItem} />}
      {activeTab === "review" && <ReviewTab t={t} />}
      {activeTab === "quality" && <QualityTab t={t} />}
    </div>
  );
}

// Sub-component: KB Items Tab
function KBItemsTab({ selectedId, setSelectedId, t, selectedItem }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Column - KB Table */}
      <div className="xl:col-span-8 bg-surface border border-border rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-main/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_title")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_category")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_source")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_status")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_updated")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_editor")}</th>
              <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-right">Action</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {aikbMockData.kbItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`hover:bg-main/50 transition-all cursor-pointer group ${selectedId === item.id ? 'bg-primary/5' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="min-w-[180px]">
                    <p className="text-xs font-bold text-txt-primary group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[10px] text-txt-muted font-medium mt-0.5">{item.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[11px] font-medium text-txt-muted italic">
                  {item.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">
                  {item.updatedAt.split(' ')[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-txt-primary">
                  {item.editor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">{item.action}</button>
                </td>
                <td className="px-6 py-4">
                  <ChevronRight size={14} className={`text-txt-muted/30 transition-transform ${selectedId === item.id ? 'translate-x-1 text-primary' : 'group-hover:translate-x-1'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Column - Detail Preview */}
      <div className="xl:col-span-4 space-y-6 sticky top-[104px]">
        {selectedItem ? (
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm animate-in slide-in-from-right-4 duration-300 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-txt-primary">{selectedItem.title}</h3>
              <MoreHorizontal size={18} className="text-txt-muted cursor-pointer hover:text-txt-primary" />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <StatusBadge status={selectedItem.status} />
              <span className="px-2.5 py-1 rounded-lg bg-main text-txt-secondary text-[10px] font-bold border border-border">
                {selectedItem.category}
              </span>
              {selectedItem.version && (
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black border border-primary/20">
                  {selectedItem.version}
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <DetailRow icon={<Hash size={16} />} label={t("kb_id")} value={selectedItem.id} />
                <DetailRow icon={<FileText size={16} />} label={t("col_source")} value={selectedItem.sourceFile || "Manual entry"} />
                <DetailRow icon={<User size={16} />} label={t("col_editor")} value={selectedItem.editor} />
                <DetailRow icon={<Clock size={16} />} label={t("col_updated")} value={selectedItem.updatedAt} />
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-3">{t("kb_summary")}</p>
                <div className="bg-main border border-border rounded-2xl p-4">
                  <p className="text-xs text-txt-secondary font-medium leading-relaxed italic">
                    "{selectedItem.summary || t("aikb_sub.no_summary")}"
                  </p>
                </div>
              </div>

              {selectedItem.versionNote && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-amber-600">
                    <Tag size={14} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{t("version_note")}</p>
                  </div>
                  <p className="text-xs text-amber-600/80 font-medium">{selectedItem.versionNote}</p>
                </div>
              )}

              <div className="pt-6 border-t border-border space-y-4">
                <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("admin_actions")}</p>
                <textarea
                  placeholder={t("aikb_sub.internal_note_placeholder")}
                  className="w-full p-4 bg-main border border-border rounded-2xl text-xs outline-none focus:bg-surface focus:border-primary transition-all min-h-[100px] text-txt-primary placeholder:text-txt-muted"
                />
                <div className="grid grid-cols-3 gap-3">
                  <ActionButton icon={<Edit3 size={14} />} label={t("btn_edit_content")} color="indigo" />
                  <ActionButton icon={<Save size={14} />} label={t("btn_save_note")} color="gray" />
                  <ActionButton icon={<XCircle size={14} />} label={t("btn_disable")} color="rose" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center transition-colors">
            <Database size={48} className="mx-auto text-txt-muted/10 mb-4" />
            <p className="text-sm font-bold text-txt-muted">{t("aikb_sub.select_to_view")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component: Review & Version Tab
function ReviewTab({ t }: any) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Column - Version History */}
      <div className="xl:col-span-8 bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <History size={18} className="text-primary" />
          <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">
            {t("version_history")} - <span className="text-primary">Chính sách hoàn tiền</span>
          </h3>
          <span className="ml-auto text-[10px] font-medium text-txt-muted italic">Đang phục vụ AI: v3</span>
        </div>

        <div className="space-y-4 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-border">
          {aikbMockData.versions.map((v, i) => (
            <div key={i} className="flex gap-6 group relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-4 border-surface z-10 flex-shrink-0 transition-colors ${v.isServing ? 'bg-primary text-white' : 'bg-main text-txt-muted'}`}>
                <Edit3 size={16} />
              </div>
              <div className="flex-1 bg-main/30 border border-border rounded-2xl p-4 group-hover:bg-main transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-black text-txt-primary">{v.v}</span>
                  <StatusBadge status={v.status} />
                  {v.isServing && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[8px] font-black uppercase">Đang phục vụ</span>}
                </div>
                <p className="text-xs text-txt-secondary font-medium mb-4 leading-relaxed italic">"{v.desc}"</p>
                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-txt-primary font-bold">
                    <User size={12} className="text-txt-muted" /> {v.author}
                  </div>
                  <div className="flex items-center gap-1.5 text-txt-muted font-medium">
                    <Clock size={12} /> {v.date}
                  </div>
                  <div className="text-primary font-black uppercase tracking-widest">{v.stats}</div>
                </div>
                {/* <div className="flex gap-2 mt-4">
                  <button className="px-4 py-1.5 bg-surface border border-border rounded-lg text-[10px] font-black hover:bg-main transition-all">Xem chi tiết</button>
                  {i > 0 && <button className="px-4 py-1.5 bg-surface border border-border rounded-lg text-[10px] font-black hover:bg-main transition-all flex items-center gap-1">
                    <RotateCcw size={10} /> Rollback
                  </button>}
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Diff Comparison */}
      <div className="xl:col-span-4 bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-6 sticky top-[104px]">
        <div className="flex items-center gap-2 mb-2">
          <ArrowLeftRight size={18} className="text-indigo-500" />
          <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">So sánh thay đổi (v3 vs v2)</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Cũ</p>
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-xs text-rose-700/80 font-medium leading-relaxed italic line-through decoration-rose-500/30">
              {aikbMockData.comparison.old}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Mới</p>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs text-emerald-700 font-bold leading-relaxed italic">
              {aikbMockData.comparison.new}
            </div>
          </div>
        </div>

        <div className="p-4 bg-main border border-border rounded-2xl flex gap-3">
          <Info size={16} className="text-txt-muted flex-shrink-0" />
          <p className="text-[10px] text-txt-muted font-medium leading-relaxed italic">
            {aikbMockData.comparison.stats}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Usage & Quality Tab
function QualityTab({ t }: any) {
  const data = aikbMockData.usageStats;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Most Used Topics */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">Topic được dùng nhiều nhất</h3>
          </div>
          <div className="space-y-6">
            {data.mostUsed.map((item, i) => (
              <UsageBar key={i} topic={item.topic} usage={item.usage} percentage={item.percentage} />
            ))}
          </div>
        </div>

        {/* High Fallback Topics */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">Topic dùng nhiều fallback</h3>
          </div>
          <div className="space-y-3">
            {data.highFallback.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-main rounded-2xl border border-border group hover:bg-main/80 cursor-pointer transition-all">
                <span className="text-xs font-bold text-txt-primary">{item.topic}</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[9px] font-black">{item.count} fallback</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Confidence Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-3xl overflow-hidden shadow-sm h-fit">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-500" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">Topic confidence thấp</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-main/50 border-b border-border">
                  <th className="px-6 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">Topic</th>
                  <th className="px-6 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">Confidence</th>
                  <th className="px-6 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest text-center">Fallback (7N)</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.lowConfidence.map((item, i) => (
                  <tr key={i} className="hover:bg-main/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-txt-primary">{item.topic}</td>
                    <td className="px-6 py-4 min-w-[140px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-main rounded-full overflow-hidden border border-border">
                          <div className={`h-full rounded-full ${item.confidence < 50 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${item.confidence}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-txt-primary">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-txt-secondary">{item.fallback}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Đánh dấu cải thiện</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Updated Poor Performance */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={18} className="text-txt-muted" />
            <h3 className="text-sm font-black text-txt-primary uppercase tracking-widest">Mới cập nhật nhưng tín hiệu kém</h3>
          </div>
          <div className="space-y-6">
            {data.poorPerformance.map((item, i) => (
              <div key={i} className="space-y-2 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-txt-primary group-hover:text-primary transition-colors">{item.topic}</span>
                  <span className="text-[9px] font-black text-rose-500">{item.confidence}%</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-medium text-txt-muted">
                  <span>Cập nhật: {item.updated}</span>
                </div>
                <div className="h-1 w-full bg-main rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-rose-500/50 group-hover:bg-rose-500 transition-colors" style={{ width: `${item.confidence}%` }}></div>
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
function UsageBar({ topic, usage, percentage }: any) {
  return (
    <div className="space-y-2 group cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-txt-primary group-hover:text-primary transition-colors">{topic}</span>
        <div className="flex items-center gap-1 text-[10px] font-bold text-txt-muted uppercase tracking-widest">
          {usage} lượt dùng <TrendingUp size={10} className="text-emerald-500" />
        </div>
      </div>
      <div className="h-1.5 w-full bg-main rounded-full overflow-hidden border border-border shadow-inner">
        <div
          className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, sub, color }: any) {
  const colors: any = {
    indigo: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
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

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  const styles: any = {
    "Published": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Needs Review": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Draft": "bg-primary/10 text-primary border-primary/20",
    "Disabled": "bg-main text-txt-muted border-border",
  };

  const labels: any = {
    "Published": t("kb_status_published"),
    "Needs Review": t("kb_status_needs_review"),
    "Draft": t("kb_status_draft"),
    "Disabled": t("kb_status_disabled"),
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border uppercase ${styles[status] || styles["Draft"]}`}>
      {labels[status] || status}
    </div>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-lg bg-main border border-border flex items-center justify-center text-txt-muted flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-bold text-txt-primary break-all">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color }: any) {
  const colors: any = {
    indigo: "text-primary hover:bg-primary/10 border-primary/20 bg-primary/5",
    gray: "text-txt-muted hover:bg-main border-border bg-main/50",
    rose: "text-rose-600 hover:bg-rose-500/10 border-rose-500/20 bg-rose-500/5",
  };

  return (
    <button className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${colors[color]}`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}
