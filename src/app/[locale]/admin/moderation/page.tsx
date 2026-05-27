"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  XCircle,
  ChevronDown,
  Image as ImageIcon,
  ShieldAlert,
  UserX,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { adminEventsApi, ListEventResponse } from "@/src/lib/api/adminEventsApi";

const triageGuide = [
  { id: "tg-1", title: "Asset compliance", description: "Kiểm tra banner, ảnh, video — đảm bảo không vi phạm bản quyền và đạt chuẩn kỹ thuật.", icon: "Image", color: "sky" },
  { id: "tg-2", title: "Nội dung cấm", description: "Đối chiếu mô tả với danh sách nội dung cấm: bạo lực, chính trị nhạy cảm, lừa đảo tài chính.", icon: "ShieldAlert", color: "amber" },
  { id: "tg-3", title: "Lịch sử tổ chức rủi ro", description: "Xem trước lịch sử tổ chức: từng bị từ chối, bị flag, hoặc tạm ngừng trong 90 ngày.", icon: "UserX", color: "rose" },
  { id: "tg-4", title: "Thiếu xác minh tổ chức", description: "Tổ chức cần Verified KYC trước khi sự kiện được phép phát hành vé công khai.", icon: "Clock", color: "amber" },
  { id: "tg-5", title: "Liên hệ ngoài hệ thống", description: "Cảnh giác với link Zalo / Telegram / số điện thoại cá nhân trong mô tả sự kiện.", icon: "Link2", color: "sky" }
];

const slaData = {
  high: { target: "< 2 giờ", current: "46 phút", color: "emerald", percentage: 85 },
  medium: { target: "< 8 giờ", current: "3 giờ 22 phút", color: "emerald", percentage: 60 },
  low: { target: "< 24 giờ", current: "14 giờ 08 phút", color: "amber", percentage: 40 }
};

export default function AdminModerationPage() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter state for API calls
  const [filters, setFilters] = useState({
    search: "",
    status: "Tất cả",
    category: "Tất cả",
    timeRange: "30 ngày"
  });

  const [events, setEvents] = useState<ListEventResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ pendingCount: 0, rejectedCount: 0 });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset page on filter change
  };

  const fetchSummary = async () => {
    try {
      const data = await adminEventsApi.getModerationSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching moderation summary:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Map status
      let approvalStatuses: string[] = [];
      if (filters.status === "Chờ duyệt") {
        approvalStatuses = ["PENDING_REVIEW"];
      } else if (filters.status === "Từ chối") {
        approvalStatuses = ["REJECTED"];
      }

      // Map category
      let categories: string[] | undefined = undefined;
      if (filters.category !== "Tất cả") {
        const catMap: Record<string, string> = {
          "Hội thảo": "WORKSHOP",
          "Lễ hội": "LIVESTAGE",
          "Âm nhạc": "LIVESTAGE",
          "Thể thao": "SPORTS",
          "Workshop": "WORKSHOP",
          "Triển lãm": "EXHIBITION",
        };
        const backendCat = catMap[filters.category];
        if (backendCat) {
          categories = [backendCat];
        }
      }

      const response = await adminEventsApi.searchEventsForModeration({
        keyword: filters.search || undefined,
        approvalStatuses,
        categories,
        page: currentPage,
        size: itemsPerPage,
        sort: "NEWEST",
      });

      setEvents(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error fetching moderation events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, filters.search, filters.status, filters.category]);

  const handleQuickApprove = async (eventId: number) => {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt sự kiện này?")) return;
    try {
      await adminEventsApi.updateApprovalStatus(eventId, "PUBLISHED");
      alert("Đã phê duyệt sự kiện thành công!");
      fetchSummary();
      fetchEvents();
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Không thể phê duyệt sự kiện.");
    }
  };

  const handleQuickReject = async (eventId: number) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) return;
    try {
      await adminEventsApi.updateApprovalStatus(eventId, "REJECTED");
      alert("Đã từ chối sự kiện thành công!");
      fetchSummary();
      fetchEvents();
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Không thể từ chối sự kiện.");
    }
  };

  const totalPages = Math.ceil(totalElements / itemsPerPage);

  const formatDate = (dateString?: string) => {
    if (!dateString) return { date: "—", time: "" };
    try {
      const d = new Date(dateString);
      const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      return { date, time };
    } catch {
      return { date: "—", time: "" };
    }
  };

  const formatCategory = (cat?: string) => {
    const names: Record<string, string> = {
      WORKSHOP: "Hội thảo",
      LIVESTAGE: "Âm nhạc / Lễ hội",
      SPORTS: "Thể thao",
      EXHIBITION: "Triển lãm",
    };
    return names[cat || ""] || cat || "Chưa phân loại";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-04</p>
          <h1 className="text-3xl font-black text-txt-primary tracking-tight">Kiểm duyệt sự kiện</h1>
          <p className="text-sm text-txt-secondary mt-1">Quản lý hàng chờ duyệt và các sự kiện bị từ chối</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-ds-xl text-xs font-bold border border-border shadow-sm transition-all whitespace-nowrap">
          <Download size={16} />
          <span>Xuất hàng chờ</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard icon={<Clock size={20} />} label="Đang chờ duyệt" value={summary.pendingCount.toString()} color="amber" />
        <StatsCard icon={<XCircle size={20} />} label="Bị từ chối" value={summary.rejectedCount.toString()} color="rose" />
        <StatsCard icon={<AlertTriangle size={20} />} label="Tổng sự kiện hàng chờ" value={(summary.pendingCount + summary.rejectedCount).toString()} color="indigo" />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Table Section - Full Width */}
        <div className="bg-surface border border-border rounded-ds-3xl shadow-sm overflow-hidden transition-colors duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-main/10">
            <h2 className="text-sm font-black text-txt-primary uppercase tracking-tight">Danh sách sự kiện hàng chờ</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-bold text-txt-muted uppercase">{summary.pendingCount} Chờ duyệt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-bold text-txt-muted uppercase">{summary.rejectedCount} Bị từ chối</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Tìm theo tên sự kiện, tổ chức, mã EVT"
                  className="w-full pl-11 pr-4 py-2.5 bg-main border border-border rounded-ds-2xl text-[13px] focus:bg-surface focus:border-primary outline-none transition-all text-txt-primary placeholder:text-txt-muted shadow-inner"
                />
              </div>

              <FilterSelect
                label="Trạng thái"
                value={filters.status}
                options={["Tất cả", "Chờ duyệt", "Từ chối"]}
                onChange={(val: string) => handleFilterChange("status", val)}
              />
              <FilterSelect
                label="Danh mục"
                value={filters.category}
                options={["Tất cả", "Hội thảo", "Lễ hội", "Âm nhạc", "Thể thao", "Workshop", "Triển lãm"]}
                onChange={(val: string) => handleFilterChange("category", val)}
              />
              <FilterSelect
                label="Gửi từ"
                value={filters.timeRange}
                options={["24 giờ", "7 ngày", "30 ngày", "Tất cả"]}
                onChange={(val: string) => handleFilterChange("timeRange", val)}
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <button className="flex items-center gap-2 text-xs font-bold text-txt-muted hover:text-txt-primary transition-colors">
                <Filter size={14} />
                <span>Bộ lọc nâng cao</span>
              </button>

              {(filters.search || filters.status !== "Tất cả" || filters.category !== "Tất cả" || filters.timeRange !== "30 ngày") && (
                <button
                  onClick={() => setFilters({ search: "", status: "Tất cả", category: "Tất cả", timeRange: "30 ngày" })}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-main/30 border-y border-border">
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Sự kiện</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Tổ chức</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Gửi lúc</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Danh mục</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-center">Trạng thái review</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-txt-muted text-xs">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-txt-muted text-xs">
                      Không tìm thấy sự kiện nào cần kiểm duyệt.
                    </td>
                  </tr>
                ) : (
                  events.map((row) => {
                    const submitted = formatDate(row.createdAt);
                    return (
                      <tr key={row.id} className="hover:bg-main/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-ds-xl bg-surface border border-border flex items-center justify-center text-txt-muted shadow-sm shrink-0">
                              {row.thumbnailImage ? (
                                <img src={row.thumbnailImage} alt={row.eventName} className="w-full h-full object-cover rounded-ds-xl" />
                              ) : (
                                <ImageIcon size={18} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-txt-primary truncate max-w-[280px]">{row.eventName}</p>
                              <p className="text-[10px] font-medium text-txt-muted uppercase tracking-tight">EVT-{row.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-txt-secondary">{row.organizerName || "Chưa xác định"}</p>
                            <p className="text-[9px] font-medium text-txt-muted uppercase tracking-tighter">ORG-{row.organizerId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-[11px] font-medium text-txt-secondary">{submitted.date}</p>
                          <p className="text-[11px] font-medium text-txt-muted">{submitted.time}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-txt-secondary">{formatCategory(row.category)}</span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <StatusBadge status={row.approvalStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${locale}/admin/moderation/${row.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-ds-xl text-[10px] font-black transition-all border border-indigo-500/20 shadow-sm uppercase tracking-tighter"
                            >
                              Xem chi tiết
                            </Link>
                            {row.approvalStatus === "PENDING_REVIEW" && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(row.id)}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-500/20 rounded-ds-xl text-[10px] font-black transition-all uppercase tracking-tighter"
                                >
                                  Duyệt nhanh
                                </button>
                                <button
                                  onClick={() => handleQuickReject(row.id)}
                                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/20 rounded-ds-xl text-[10px] font-black transition-all uppercase tracking-tighter"
                                >
                                  Từ chối nhanh
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
            <p className="text-[10px] font-medium text-txt-muted uppercase tracking-widest">
              Hiển thị {totalElements > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, totalElements)} trên tổng {totalElements}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages <= 1}
                className={`w-8 h-8 flex items-center justify-center rounded-ds-lg transition-all ${currentPage === 1 || totalPages <= 1 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationButton
                  key={page}
                  active={currentPage === page}
                  label={page.toString()}
                  onClick={() => setCurrentPage(page)}
                />
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className={`w-8 h-8 flex items-center justify-center rounded-ds-lg transition-all ${currentPage === totalPages || totalPages <= 1 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Context Sections - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Triage Guide */}
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-txt-primary uppercase tracking-tight">Hướng dẫn triage</h3>
            <ShieldAlert size={14} className="text-txt-muted" />
          </div>
          <p className="text-[10px] text-txt-muted mb-6 leading-relaxed">
            Dùng để rà soát nhanh trước khi mở chi tiết review (ADM-05).
          </p>

          <div className="space-y-4">
            {triageGuide.map((guide) => (
              <div key={guide.id} className={`p-4 rounded-ds-2xl border transition-all hover:shadow-md group cursor-help ${guide.color === "sky" ? "bg-sky-500/5 border-sky-500/10" :
                guide.color === "amber" ? "bg-amber-500/5 border-amber-500/10" :
                  guide.color === "rose" ? "bg-rose-500/5 border-rose-500/10" :
                    "bg-indigo-500/5 border-indigo-500/10"
                }`}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-ds-xl shrink-0 transition-transform group-hover:scale-110 ${guide.color === "sky" ? "bg-sky-500/10 text-sky-600" :
                    guide.color === "amber" ? "bg-amber-500/10 text-amber-600" :
                      guide.color === "rose" ? "bg-rose-500/10 text-rose-600" :
                        "bg-indigo-500/10 text-indigo-600"
                    }`}>
                    <IconComponent name={guide.icon} size={16} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-txt-primary mb-1">{guide.title}</h4>
                    <p className="text-[10px] text-txt-muted leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                      {guide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Section */}
        <div className="bg-surface border border-border rounded-ds-3xl p-6 shadow-sm overflow-hidden relative h-fit ">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={16} className="text-txt-muted" />
            <h3 className="text-xs font-black text-txt-primary uppercase tracking-tight">SLA xử lý duyệt</h3>
          </div>

          <div className="space-y-6">
            <SLACard label="High" target={slaData.high.target} current={slaData.high.current} color={slaData.high.color} percentage={slaData.high.percentage} />
            <SLACard label="Medium" target={slaData.medium.target} current={slaData.medium.current} color={slaData.medium.color} percentage={slaData.medium.percentage} />
            <SLACard label="Low" target={slaData.low.target} current={slaData.low.current} color={slaData.low.color} percentage={slaData.low.percentage} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatsCard({ icon, label, value, color }: any) {
  const colors: any = {
    indigo: "bg-primary/5 text-primary border-primary/10",
    amber: "bg-amber-500/5 text-amber-600 border-amber-500/10",
    rose: "bg-rose-500/5 text-rose-600 border-rose-500/10",
  };

  return (
    <div className="bg-surface border border-border rounded-ds-3xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-ds-2xl ${colors[color] || colors.indigo} border`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-tight mb-0.5">{label}</p>
          <p className="text-2xl font-black text-txt-primary tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: any) {
  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-ds-2xl shadow-sm cursor-pointer hover:bg-main transition-colors text-[11px]">
        <span className="font-bold text-txt-muted">{label}:</span>
        <span className="font-black text-txt-primary">{value}</span>
        <ChevronDown size={14} className="text-txt-muted ml-1" />
      </div>

      {/* Mini Dropdown */}
      <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-ds-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
        {options?.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange?.(opt)}
            className={`w-full text-left px-3 py-2 rounded-ds-lg text-[11px] font-bold transition-colors ${value === opt ? "bg-primary text-white" : "text-txt-secondary hover:bg-main"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "PENDING_REVIEW": "bg-amber-500/10 text-amber-600 border-amber-500/10",
    "REJECTED": "bg-rose-500/10 text-rose-600 border-rose-500/10",
    "PUBLISHED": "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
    "DRAFT": "bg-gray-500/10 text-gray-600 border-gray-500/10",
  };

  const textMap: any = {
    "PENDING_REVIEW": "Chờ duyệt",
    "REJECTED": "Từ chối",
    "PUBLISHED": "Đã duyệt",
    "DRAFT": "Bản nháp",
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-ds-lg border text-[8px] font-black uppercase tracking-widest ${styles[status] || styles.DRAFT}`}>
      {textMap[status] || status}
    </div>
  );
}

function PaginationButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-ds-xl text-[11px] font-black transition-all ${active
        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
        : "text-txt-muted bg-surface border border-border hover:bg-main"
        }`}
    >
      {label}
    </button>
  );
}

function SLACard({ label, target, current, color, percentage }: any) {
  const colorStyles: any = {
    emerald: "text-emerald-600 bg-emerald-500/10 bg-emerald-500/20",
    amber: "text-amber-600 bg-amber-500/10 bg-amber-500/20",
    rose: "text-rose-600 bg-rose-500/10 bg-rose-500/20",
  };

  const progressColors: any = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className={`p-4 rounded-ds-2xl border ${colorStyles[color].split(" ")[2]} flex flex-col gap-2 relative overflow-hidden group`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${progressColors[color]}`}></div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[11px] font-black text-txt-primary uppercase tracking-tight">{label}</h4>
          <p className="text-[9px] text-txt-muted uppercase font-bold tracking-tighter">Mục tiêu {target}</p>
        </div>
        <p className={`text-xs font-black ${colorStyles[color].split(" ")[0]}`}>{current}</p>
      </div>
      <div className="w-full h-1.5 bg-main/50 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full ${progressColors[color]} rounded-full transition-all duration-1000 group-hover:opacity-80`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function IconComponent({ name, size }: { name: string, size: number }) {
  const icons: any = {
    Image: <ImageIcon size={size} />,
    ShieldAlert: <ShieldAlert size={size} />,
    UserX: <UserX size={size} />,
    Clock: <Clock size={size} />,
    Link2: <Link2 size={size} />,
  };
  return icons[name] || <ImageIcon size={size} />;
}
