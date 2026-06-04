"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Database,
  Search,
  Plus,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  LayoutGrid,
  Edit3,
  Trash2,
  XCircle,
  Hash,
  User,
  Tag,
  AlertTriangle,
  Upload,
  X,
  RefreshCw,
  Loader2,
  Brain,
  FilePlus2,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { adminKbApi, KbItemDto } from "@/src/lib/api/adminKbApi";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAIKBPage() {
  const t = useTranslations("Admin");

  // ── Data state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<KbItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // ── Filter/Search ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Upload modal ─────────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState(false);

  // ── Action states ─────────────────────────────────────────────────────────
  const [deletingSource, setDeletingSource] = useState<string | null>(null);
  const [togglingSource, setTogglingSource] = useState<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const selectedItem = items.find((i) => i.source === selectedSource) ?? null;

  const filteredItems = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPublished = items.filter((i) => i.status === "Published").length;
  const totalDraft = items.filter(
    (i) => i.status === "Draft"
  ).length;

  // ── Load data ────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminKbApi.listItems();
      setItems(data);
      if (data.length > 0 && !selectedSource) {
        setSelectedSource(data[0].source);
      }
    } catch (err: any) {
      console.error("KB fetch error:", err);
      setError(t("kb_load_error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (source: string, title: string) => {
    if (!window.confirm(t("kb_delete_confirm", { title }))) return;
    setDeletingSource(source);
    try {
      await adminKbApi.deleteItem(source);
      toast.success(t("kb_delete_success", { title }));
      if (selectedSource === source) setSelectedSource(null);
      await fetchItems();
    } catch {
      toast.error(t("kb_delete_error"));
    } finally {
      setDeletingSource(null);
    }
  };

  // ── Toggle status ────────────────────────────────────────────────────────
  const handleToggleStatus = async (item: KbItemDto) => {
    const newStatus = item.status === "Published" ? "Draft" : "Published";
    setTogglingSource(item.source);
    try {
      await adminKbApi.updateStatus(item.source, newStatus as "Published" | "Draft");
      toast.success(`"${item.title}" → ${newStatus}`);
      await fetchItems();
    } catch {
      toast.error(t("kb_status_update_error"));
    } finally {
      setTogglingSource(null);
    }
  };

  // ── After successful upload ───────────────────────────────────────────────
  const handleIngestSuccess = async (newItem: KbItemDto) => {
    setShowUpload(false);
    await fetchItems();
    setSelectedSource(newItem.source);
    toast.success(t("kb_ingest_success", { title: newItem.title, chunkCount: newItem.chunkCount }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-11</p>
          <h1 className="text-3xl font-extrabold text-txt-primary tracking-tight">{t("aikb_title")}</h1>
          <p className="text-sm text-txt-secondary mt-1">{t("aikb_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-ds-xl border border-border bg-surface hover:bg-main text-txt-muted hover:text-txt-primary transition-all shadow-sm"
            title={t("btn_refresh")}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-ds-xl font-bold shadow-lg shadow-primary/20 transition-all"
          >
            <FilePlus2 size={18} />
            <span>{t("btn_add_kb_item")}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid — 3 cards only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={<Database size={20} />}
          label={t("total_kb_items")}
          value={String(items.length)}
          sub={t("aikb_sub.platform_total")}
          color="gray"
        />
        <StatsCard
          icon={<CheckCircle2 size={20} />}
          label={t("published_items")}
          value={String(totalPublished)}
          sub={t("aikb_sub.serving_ai")}
          color="emerald"
        />
        <StatsCard
          icon={<Clock size={20} />}
          label={t("draft_review_items")}
          value={String(totalDraft)}
          sub={t("aikb_sub.not_active")}
          color="amber"
        />
      </div>

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-ds-2xl p-4 flex gap-4 items-start shadow-sm">
        <div className="w-8 h-8 rounded-ds-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          <Brain size={16} />
        </div>
        <div className="min-w-0">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t("ai_content_convention")}</h4>
          <p className="text-[11px] text-primary/80 font-medium leading-relaxed italic">
            {t.rich("aikb_sub.convention_desc", {
              0: (chunks) => <span className="font-bold">{chunks}</span>,
              1: (chunks) => <span className="font-bold">{chunks}</span>,
              2: (chunks) => <span className="font-bold">{chunks}</span>,
              3: (chunks) => <span className="font-bold">{chunks}</span>,
            })}
          </p>
          <p className="text-[10px] text-primary/60 font-medium mt-2 flex items-center gap-1.5">
            <ShieldAlert size={11} />
            {t.rich("kb_convention_warning", { codeNode: (chunks: any) => <code className="font-mono font-black">{chunks}</code> })}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("aikb_sub.search_placeholder")}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-ds-xl text-xs outline-none focus:border-primary shadow-sm text-txt-primary placeholder:text-txt-muted transition-all"
          />
        </div>
        <div className="flex items-center bg-surface border border-border rounded-ds-xl p-1 shadow-sm text-[10px] font-bold">
          {["all", "Published", "Draft"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-ds-lg transition-all uppercase ${
                statusFilter === f
                  ? "bg-main text-txt-primary shadow-sm"
                  : "text-txt-muted hover:text-txt-secondary"
              }`}
            >
              {f === "all" ? t("common.all") : f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left — KB Table */}
        <div className="xl:col-span-8 bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-main/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_title")}</th>
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_category")}</th>
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Chunks</th>
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_status")}</th>
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">{t("col_updated")}</th>
                <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-right">Actions</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-txt-muted">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-xs font-bold">{t("kb_loading")}</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-xs font-bold text-rose-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle size={24} />
                      <span>{error}</span>
                      <button onClick={fetchItems} className="text-primary underline font-bold text-xs">{t("btn_retry")}</button>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-txt-muted">
                      <Database size={40} className="opacity-20" />
                      <p className="text-xs font-bold">
                        {items.length === 0 ? t("kb_empty_state_intro") : t("kb_empty_state_no_match")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.source}
                    onClick={() => setSelectedSource(item.source)}
                    className={`hover:bg-main/50 transition-all cursor-pointer group ${
                      selectedSource === item.source ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="min-w-[160px]">
                        <p className="text-xs font-bold text-txt-primary group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-[10px] text-txt-muted font-mono mt-0.5 opacity-70">{item.source}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-ds-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[11px] font-black text-txt-primary">{item.chunkCount ?? "—"}</span>
                      <span className="text-[9px] text-txt-muted ml-1">chunks</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-medium text-txt-muted">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={togglingSource === item.source}
                          className="text-[9px] font-black text-txt-muted hover:text-primary uppercase tracking-widest border border-border rounded-ds-lg px-2.5 py-1 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
                          title={item.status === "Published" ? t("kb_action_draft") : t("kb_action_publish")}
                        >
                          {togglingSource === item.source ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : item.status === "Published" ? "Draft" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(item.source, item.title)}
                          disabled={deletingSource === item.source}
                          className="w-7 h-7 flex items-center justify-center rounded-ds-lg text-txt-muted/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-40"
                          title={t("kb_delete_item")}
                        >
                          {deletingSource === item.source ? (
                            <Loader2 size={12} className="animate-spin text-rose-500" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight
                        size={14}
                        className={`text-txt-muted/30 transition-transform ${
                          selectedSource === item.source ? "translate-x-1 text-primary" : "group-hover:translate-x-1"
                        }`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right — Detail Panel */}
        <div className="xl:col-span-4 sticky top-[104px] space-y-4">
          {selectedItem ? (
            <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm animate-in slide-in-from-right-4 duration-300 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-txt-primary leading-snug">{selectedItem.title}</h3>
                  <p className="text-[10px] font-mono text-txt-muted mt-0.5 opacity-70">{selectedItem.source}</p>
                </div>
                <StatusBadge status={selectedItem.status} />
              </div>

              {/* Category pill */}
              {selectedItem.category && (
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-ds-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                    {selectedItem.category}
                  </span>
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <DetailRow icon={<Hash size={14} />} label="Source slug" value={selectedItem.source} mono />
                <DetailRow icon={<FileText size={14} />} label={t("kb_source_file")} value={selectedItem.filename || t("kb_manual_entry")} />
                <DetailRow
                  icon={<Database size={14} />}
                  label="Vector chunks"
                  value={t("kb_chunks_in_vectorstore", { count: selectedItem.chunkCount ?? 0 })}
                />
                <DetailRow icon={<User size={14} />} label={t("col_editor")} value={selectedItem.updatedBy || "—"} />
                <DetailRow
                  icon={<Clock size={14} />}
                  label={t("col_updated")}
                  value={selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString("vi-VN") : "—"}
                />
              </div>

              {/* Ingest info box */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-ds-2xl flex gap-3">
                <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary/80 font-medium leading-relaxed">
                  {t.rich("kb_update_info_desc", {
                    source: selectedItem.source,
                    count: selectedItem.chunkCount ?? 0,
                    mono: (chunks: any) => <span className="font-mono font-black">{chunks}</span>
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-ds-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-[11px] font-black"
                >
                  <Upload size={14} />
                  Re-ingest
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.source, selectedItem.title)}
                  disabled={deletingSource === selectedItem.source}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-ds-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 transition-all text-[11px] font-black disabled:opacity-40"
                >
                  {deletingSource === selectedItem.source ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {t("kb_action_delete")}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-ds-3xl p-12 text-center transition-colors">
              <div className="w-16 h-16 rounded-ds-2xl bg-main flex items-center justify-center text-txt-muted/20 mx-auto mb-4">
                <Database size={32} />
              </div>
              <p className="text-xs font-bold text-txt-muted">{t("aikb_sub.select_to_view")}</p>
              <p className="text-[10px] text-txt-muted/60 mt-1">{t("kb_select_detail_desc")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <IngestModal
          existingSources={items.map((i) => i.source)}
          onClose={() => setShowUpload(false)}
          onSuccess={handleIngestSuccess}
          prefillSource={selectedSource ?? undefined}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IngestModal — Upload + Conflict Warning
// ─────────────────────────────────────────────────────────────────────────────
const KB_CATEGORIES = ["Policy", "FAQ", "Guide", "Payment", "Check-in", "Organizer", "Blockchain", "General"];

function IngestModal({
  existingSources,
  onClose,
  onSuccess,
  prefillSource,
}: {
  existingSources: string[];
  onClose: () => void;
  onSuccess: (item: KbItemDto) => void;
  prefillSource?: string;
}) {
  const t = useTranslations("Admin");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState(prefillSource ?? "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Policy");
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sourceExists = source.trim() !== "" && existingSources.includes(source.trim());
  const isReingest = sourceExists;

  const canSubmit = file && source.trim() && title.trim();

  const handleFile = (f: File) => setFile(f);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await adminKbApi.ingestFile(file!, source.trim(), title.trim(), category, status);
      onSuccess(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("kb_ingest_failed");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "kb-modal-backdrop") onClose();
  };

  return (
    <div
      id="kb-modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-ds-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-base font-black text-txt-primary">
              {isReingest ? t("kb_reingest_item") : t("kb_add_item")}
            </h2>
            <p className="text-[11px] text-txt-muted mt-0.5">
              {isReingest
                ? t("kb_add_item_reingest_desc")
                : t("kb_add_item_new_desc")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-ds-lg text-txt-muted hover:bg-main hover:text-txt-primary transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Replace Warning */}
          {isReingest && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-ds-2xl p-4 flex gap-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-amber-700 dark:text-amber-500 mb-1">
                  {t.rich("kb_source_exists_warning", {
                    source: source,
                    mono: (chunks: any) => <span className="font-mono">{chunks}</span>
                  })}
                </p>
                <p className="text-[10px] text-amber-600/80 leading-relaxed">
                  {t("kb_source_exists_detail")}
                </p>
              </div>
            </div>
          )}

          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-ds-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary/10"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-ds-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <FileText size={20} />
                </div>
                <p className="text-xs font-bold text-emerald-600">{file.name}</p>
                <p className="text-[10px] text-txt-muted">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-[10px] font-bold text-rose-500 hover:underline mt-1"
                >
                  {t("kb_delete_file")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-txt-muted">
                <div className="w-10 h-10 rounded-ds-xl bg-main border border-border flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <p className="text-xs font-bold">{t("kb_drag_drop_file")}</p>
                <p className="text-[10px]">{t("kb_file_specs")}</p>
              </div>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block mb-1.5">
              Source Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="vd: fee_policy, checkin_guide"
              className={`w-full px-4 py-2.5 rounded-ds-xl border text-xs font-mono outline-none transition-all bg-main text-txt-primary placeholder:text-txt-muted ${
                sourceExists ? "border-amber-500/50 focus:border-amber-500" : "border-border focus:border-primary"
              }`}
            />
            <p className="text-[10px] text-txt-muted mt-1">
              {t("kb_slug_description")}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block mb-1.5">
              {t("kb_display_name")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("kb_display_name_placeholder")}
              className="w-full px-4 py-2.5 rounded-ds-xl border border-border focus:border-primary text-xs outline-none transition-all bg-main text-txt-primary placeholder:text-txt-muted"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-ds-xl border border-border focus:border-primary text-xs outline-none bg-main text-txt-primary"
              >
                {KB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Published" | "Draft")}
                className="w-full px-4 py-2.5 rounded-ds-xl border border-border focus:border-primary text-xs outline-none bg-main text-txt-primary"
              >
                <option value="Published">{t("kb_status_published_desc")}</option>
                <option value="Draft">{t("kb_status_draft_desc")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-ds-xl border border-border text-txt-muted hover:bg-main text-xs font-bold transition-all"
          >
            {t("kb_cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-ds-xl text-xs font-black transition-all shadow-lg ${
              isReingest
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                : "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t("kb_ingest_loading")}
              </>
            ) : (
              <>
                <Upload size={14} />
                {isReingest ? t("kb_reingest_action") : t("kb_ingest_action")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Atomic UI Components
// ─────────────────────────────────────────────────────────────────────────────
function StatsCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
    gray: "bg-main text-txt-muted",
  };
  return (
    <div className="bg-surface border border-border rounded-ds-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-ds-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-txt-primary tracking-tight mb-1">{value}</p>
      <p className="text-[10px] text-txt-muted font-medium">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Draft: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border uppercase ${styles[status] ?? "bg-main text-txt-muted border-border"}`}>
      {status}
    </div>
  );
}

function DetailRow({ icon, label, value, mono }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-ds-lg bg-main border border-border flex items-center justify-center text-txt-muted flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-xs font-bold text-txt-primary break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
