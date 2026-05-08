"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  Building2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Flag,
  XCircle,
  Star,
  ChevronDown,
  Image as ImageIcon,
  ShieldAlert,
  UserX,
  Link2,
  MoreHorizontal
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
/**
 * Interfaces & Mock Data
 */
export interface IModerationFlag {
  reason: string;
  description: string;
  type: "warning" | "danger" | "info" | "secondary";
}

export interface IModerationItem {
  id: string;
  name: string;
  organizer: {
    name: string;
    id: string;
  };
  submittedAt: string;
  category: string;
  reviewStatus: "Pending Review" | "Flagged" | "Rejected" | "Needs Edit";
  priority: "High" | "Medium" | "Low";
  flags: IModerationFlag[];
}

const moderationDataItems: IModerationItem[] = [
  {
    id: "EVT-20416",
    name: "Tech Future Summit 2026",
    organizer: { name: "Công ty TNHH Sự kiện Ánh Dương", id: "ACC-10245" },
    submittedAt: "25/04 09:12",
    category: "Hội thảo",
    reviewStatus: "Pending Review",
    priority: "High",
    flags: [{ reason: "Thiếu xác minh", description: "Tổ chức chưa hoàn tất KYC", type: "warning" }]
  },
  {
    id: "EVT-20415",
    name: "Lễ hội ẩm thực Đà Lạt 2026",
    organizer: { name: "DaLat Tourism", id: "ACC-10241" },
    submittedAt: "25/04 08:40",
    category: "Lễ hội",
    reviewStatus: "Pending Review",
    priority: "Medium",
    flags: []
  },
  {
    id: "EVT-20414",
    name: "Hội thảo Web3 Builders",
    organizer: { name: "Builder DAO", id: "ACC-10243" },
    submittedAt: "24/04 22:05",
    category: "Hội thảo",
    reviewStatus: "Flagged",
    priority: "High",
    flags: [
      { reason: "Tổ chức rủi ro", description: "Tổ chức mới - có link liên hệ ngoài hệ thống", type: "danger" },
      { reason: "Thông tin liên hệ ngoài", description: "Link Zalo/Telegram trong mô tả", type: "info" }
    ]
  },
  {
    id: "EVT-20413",
    name: "Giải chạy Marathon Hà Nội",
    organizer: { name: "HN Sports JSC", id: "ACC-10239" },
    submittedAt: "24/04 18:33",
    category: "Thể thao",
    reviewStatus: "Pending Review",
    priority: "Medium",
    flags: []
  },
  {
    id: "EVT-20410",
    name: "Đêm nhạc Acoustic Sài Gòn",
    organizer: { name: "VBC Entertainment", id: "ACC-10245" },
    submittedAt: "24/04 09:05",
    category: "Âm nhạc",
    reviewStatus: "Pending Review",
    priority: "Low",
    flags: []
  },
  {
    id: "EVT-20407",
    name: "Workshop Yoga & Wellness",
    organizer: { name: "Greenline Outdoor", id: "ACC-10214" },
    submittedAt: "23/04 17:20",
    category: "Workshop",
    reviewStatus: "Pending Review",
    priority: "Low",
    flags: [{ reason: "Asset không hợp lệ", description: "Banner chưa đạt độ phân giải tối thiểu", type: "warning" }]
  },
  {
    id: "EVT-20405",
    name: "Đại nhạc hội EDM 2026",
    organizer: { name: "Mega Event", id: "ACC-10250" },
    submittedAt: "22/04 14:10",
    category: "Âm nhạc",
    reviewStatus: "Rejected",
    priority: "High",
    flags: [{ reason: "Nội dung cấm", description: "Vi phạm chính sách an toàn công cộng", type: "danger" }]
  },
  {
    id: "EVT-20402",
    name: "Triển lãm Art Tech",
    organizer: { name: "Art Hub", id: "ACC-10255" },
    submittedAt: "21/04 11:45",
    category: "Triển lãm",
    reviewStatus: "Needs Edit",
    priority: "Medium",
    flags: [{ reason: "Thiếu mô tả", description: "Cần bổ sung thông tin nghệ sĩ tham gia", type: "info" }]
  }
];

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
  const itemsPerPage = 8; // Increased slightly for full width

  // Filter state for API calls
  const [filters, setFilters] = useState({
    search: "",
    status: "Tất cả",
    category: "Tất cả",
    timeRange: "30 ngày",
    priority: "Tất cả"
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset page on filter change
  };

  // Filter items based on filters
  const filteredItems = useMemo(() => {
    let result = moderationDataItems;

    // Filter by Status
    if (filters.status !== "Tất cả") {
      const statusMap: any = {
        "Chờ duyệt": "Pending Review",
        "Bị gắn cờ": "Flagged",
        "Từ chối": "Rejected",
        "Yêu cầu chỉnh sửa": "Needs Edit"
      };
      result = result.filter(item => item.reviewStatus === statusMap[filters.status]);
    }

    // Filter by Keyword
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.organizer.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by Category
    if (filters.category !== "Tất cả") {
      result = result.filter(item => item.category === filters.category);
    }

    // Filter by Priority
    if (filters.priority !== "Tất cả") {
      result = result.filter(item => item.priority === filters.priority);
    }

    return result;
  }, [filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Tab counts
  const counts = useMemo(() => ({
    pending: moderationDataItems.filter(item => item.reviewStatus === "Pending Review").length,
    flagged: moderationDataItems.filter(item => item.reviewStatus === "Flagged").length,
    processed: moderationDataItems.filter(item => item.reviewStatus === "Rejected" || item.reviewStatus === "Needs Edit").length
  }), []);

  // Reset page when any filter changes
  useMemo(() => setCurrentPage(1), [filters]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mb-1">ADM-04</p>
          <h1 className="text-3xl font-black text-txt-primary tracking-tight">Kiểm duyệt sự kiện</h1>
          <p className="text-sm text-txt-secondary mt-1">Quản lý hàng chờ duyệt, sự kiện bị gắn cờ và các yêu cầu chỉnh sửa</p>
        </div>
        <button className="flex items-center gap-2 bg-surface hover:bg-main text-txt-primary px-5 py-2.5 rounded-xl text-xs font-bold border border-border shadow-sm transition-all whitespace-nowrap">
          <Download size={16} />
          <span>Xuất hàng chờ</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<Clock size={20} />} label="Đang chờ duyệt" value={counts.pending.toString()} color="amber" />
        <StatsCard icon={<Flag size={20} />} label="Bị gắn cờ" value={counts.flagged.toString()} color="rose" />
        <StatsCard icon={<XCircle size={20} />} label="Từ chối / yêu cầu chỉnh sửa" value={counts.processed.toString()} color="indigo" />
        <StatsCard icon={<Star size={20} />} label="Lượt flag cao" value="3" color="amber" />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Table Section - Full Width */}
        <div className="bg-surface border border-border rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-main/10">
            <h2 className="text-sm font-black text-txt-primary uppercase tracking-tight">Danh sách sự kiện hàng chờ</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-bold text-txt-muted uppercase">{counts.pending} Chờ duyệt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-bold text-txt-muted uppercase">{counts.flagged} Bị gắn cờ</span>
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
                  className="w-full pl-11 pr-4 py-2.5 bg-main border border-border rounded-2xl text-[13px] focus:bg-surface focus:border-primary outline-none transition-all text-txt-primary placeholder:text-txt-muted shadow-inner"
                />
              </div>

              <FilterSelect
                label="Trạng thái"
                value={filters.status}
                options={["Tất cả", "Chờ duyệt", "Bị gắn cờ", "Từ chối", "Yêu cầu chỉnh sửa"]}
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
              <FilterSelect
                label="Ưu tiên"
                value={filters.priority}
                options={["Tất cả", "High", "Medium", "Low"]}
                onChange={(val: string) => handleFilterChange("priority", val)}
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <button className="flex items-center gap-2 text-xs font-bold text-txt-muted hover:text-txt-primary transition-colors">
                <Filter size={14} />
                <span>Bộ lọc nâng cao</span>
              </button>

              {(filters.search || filters.status !== "Tất cả" || filters.category !== "Tất cả" || filters.priority !== "Tất cả" || filters.timeRange !== "30 ngày") && (
                <button
                  onClick={() => setFilters({ search: "", status: "Tất cả", category: "Tất cả", timeRange: "30 ngày", priority: "Tất cả" })}
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
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-center">Ưu tiên</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest">Flag</th>
                  <th className="px-6 py-4 text-[10px] font-black text-txt-muted uppercase tracking-widest text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-main/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-txt-muted shadow-sm shrink-0">
                          <ImageIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-txt-primary truncate max-w-[180px]">{row.name}</p>
                          <p className="text-[10px] font-medium text-txt-muted uppercase tracking-tight">{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-txt-secondary">{row.organizer.name}</p>
                        <p className="text-[9px] font-medium text-txt-muted uppercase tracking-tighter">{row.organizer.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-[11px] font-medium text-txt-secondary">{row.submittedAt.split(" ")[0]}</p>
                      <p className="text-[11px] font-medium text-txt-muted">{row.submittedAt.split(" ")[1]}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-txt-secondary">{row.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StatusBadge status={row.reviewStatus} />
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <PriorityBadge level={row.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 min-w-[150px]">
                        {row.flags.length > 0 ? (
                          row.flags.map((flag, idx) => (
                            <div key={idx} className="group/flag relative">
                              <FlagReasonBadge flag={flag} />
                              <p className="text-[9px] text-txt-muted mt-0.5 leading-tight">{flag.description}</p>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-txt-muted/40">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/moderation/${row.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-xl text-[10px] font-black transition-all border border-indigo-500/20 shadow-sm uppercase tracking-tighter"
                        >
                          Xem chi tiết
                        </Link>
                        <button className="p-2 text-txt-muted hover:text-amber-500 transition-colors">
                          <Star size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-main/30 border-t border-border flex items-center justify-between">
            <p className="text-[10px] font-medium text-txt-muted uppercase tracking-widest">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} trên tổng {filteredItems.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${currentPage === 1 ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
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
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${currentPage === totalPages ? "text-txt-muted/30 cursor-not-allowed" : "text-txt-muted hover:bg-main"}`}
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
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-txt-primary uppercase tracking-tight">Hướng dẫn triage</h3>
            <ShieldAlert size={14} className="text-txt-muted" />
          </div>
          <p className="text-[10px] text-txt-muted mb-6 leading-relaxed">
            Dùng để rà soát nhanh trước khi mở chi tiết review (ADM-05).
          </p>

          <div className="space-y-4">
            {triageGuide.map((guide) => (
              <div key={guide.id} className={`p-4 rounded-2xl border transition-all hover:shadow-md group cursor-help ${guide.color === "sky" ? "bg-sky-500/5 border-sky-500/10" :
                guide.color === "amber" ? "bg-amber-500/5 border-amber-500/10" :
                  guide.color === "rose" ? "bg-rose-500/5 border-rose-500/10" :
                    "bg-indigo-500/5 border-indigo-500/10"
                }`}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${guide.color === "sky" ? "bg-sky-500/10 text-sky-600" :
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
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative h-fit ">
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
    // </div >
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
    <div className="bg-surface border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colors[color] || colors.indigo} border`}>
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
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl shadow-sm cursor-pointer hover:bg-main transition-colors text-[11px]">
        <span className="font-bold text-txt-muted">{label}:</span>
        <span className="font-black text-txt-primary">{value}</span>
        <ChevronDown size={14} className="text-txt-muted ml-1" />
      </div>

      {/* Mini Dropdown (Simple implementation) */}
      <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
        {options?.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange?.(opt)}
            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors ${value === opt ? "bg-primary text-white" : "text-txt-secondary hover:bg-main"
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
    "Pending Review": "bg-amber-500/10 text-amber-600 border-amber-500/10",
    "Flagged": "bg-rose-500/10 text-rose-600 border-rose-500/10",
    "Rejected": "bg-gray-500/10 text-gray-600 border-gray-500/10",
    "Needs Edit": "bg-sky-500/10 text-sky-600 border-sky-500/10",
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status}
    </div>
  );
}

function PriorityBadge({ level }: { level: string }) {
  const styles: any = {
    "High": "bg-rose-500/5 text-rose-600 border-rose-500/10",
    "Medium": "bg-amber-500/5 text-amber-600 border-amber-500/10",
    "Low": "bg-sky-500/5 text-sky-600 border-sky-500/10",
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black ${styles[level]}`}>
      {level}
    </div>
  );
}

function FlagReasonBadge({ flag }: { flag: IModerationFlag }) {
  const styles: any = {
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    secondary: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[8px] font-black leading-none ${styles[flag.type]}`}>
      <Flag size={8} />
      {flag.reason}
    </div>
  );
}

function PaginationButton({ active, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${active
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
    <div className={`p-4 rounded-2xl border ${colorStyles[color].split(" ")[2]} flex flex-col gap-2 relative overflow-hidden group`}>
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
