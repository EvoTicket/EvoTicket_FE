"use client";

import { useState } from "react";
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  CalendarCheck,
  Ticket,
  ScanLine,
  Wallet,
  ShieldAlert,
  LifeBuoy,
  HelpCircle,
  Info,
  Download,
  Mail,
} from "lucide-react";
import { OrganizerStatusBadge } from "@/src/features/organizer/components/common/OrganizerStatusBadge";
import {
  OrganizerPolicySection,
  OrganizerPolicyRule,
} from "@/src/features/organizer/components/hub/OrganizerPolicySection";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";
import type { LucideIcon } from "lucide-react";

/* ── Sidebar sections ────────────────────────────────────── */

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Tổng quan", icon: Info },
  { id: "content", label: "Quy tắc nội dung & hình ảnh", icon: ImageIcon },
  { id: "create", label: "Quy tắc tạo sự kiện", icon: CalendarCheck },
  { id: "ticket", label: "Vé & resale", icon: Ticket },
  { id: "checkin", label: "Check-in & checker", icon: ScanLine },
  { id: "payout", label: "Thanh toán & đối soát", icon: Wallet },
  { id: "responsibility", label: "Trách nhiệm ban tổ chức", icon: FileText },
  { id: "violation", label: "Vi phạm & xử lý", icon: ShieldAlert },
  { id: "support", label: "Hỗ trợ", icon: LifeBuoy },
];

/* ── Highlight cards ─────────────────────────────────────── */

function HighlightCard({
  icon: Icon,
  label,
  desc,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  desc: string;
  tone: StatusTone;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-ds-md"
        style={{
          background: `var(--color-badge-${tone}-bg)`,
          color: `var(--color-badge-${tone}-text)`,
        }}
      >
        <Icon size={16} />
      </div>
      <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
        {label}
      </span>
      <span className="text-xs leading-snug text-[var(--color-text-muted)]">
        {desc}
      </span>
    </div>
  );
}

/* ── Support card ────────────────────────────────────────── */

function SupportCard({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button className="flex flex-col items-start gap-2 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3 text-left text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface)]">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-ds-md"
        style={{
          background: "var(--color-badge-brand-bg)",
          color: "var(--color-badge-brand-text)",
        }}
      >
        {icon}
      </div>
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-xs text-[var(--color-text-muted)]">{desc}</span>
    </button>
  );
}

/* ── Main page ───────────────────────────────────────────── */

export default function TermsPage() {
  const [active, setActive] = useState("overview");
  const [ack, setAck] = useState(true);

  const jump = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
            Điều khoản &amp; Quy định cho Ban tổ chức
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            Các quy tắc nội dung, vận hành và thanh toán khi tạo và quản lý
            sự kiện trên EvoTicket
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrganizerStatusBadge tone="info">
            v2026.04 · Cập nhật 12/04/2026
          </OrganizerStatusBadge>
          <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)]">
            <Download size={13} />
            Tải PDF
          </button>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-ds-lg border border-[var(--color-feedback-warning-border)] bg-[var(--color-feedback-warning-bg)] p-4">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-[var(--color-feedback-warning-icon)]"
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[var(--color-feedback-warning-text)]">
            Đọc kỹ trước khi công bố sự kiện
          </span>
          <span className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Một số vi phạm có thể dẫn đến từ chối duyệt, gỡ sự kiện hoặc tạm
            ngưng thanh toán đối soát. Ban tổ chức nên rà soát nội dung, cấu
            hình vé và thông tin thanh toán trước khi submit.
          </span>
        </div>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-5 gap-4">
        <HighlightCard
          icon={FileText}
          tone="brand"
          label="Nội dung"
          desc="Trung thực, đúng quyền lợi vé"
        />
        <HighlightCard
          icon={ImageIcon}
          tone="accent"
          label="Hình ảnh"
          desc="Đúng chuẩn, không phản cảm"
        />
        <HighlightCard
          icon={Ticket}
          tone="info"
          label="Vé & resale"
          desc="Tuân thủ chính sách nền tảng"
        />
        <HighlightCard
          icon={ScanLine}
          tone="success"
          label="Check-in"
          desc="Checker đúng phân công"
        />
        <HighlightCard
          icon={Wallet}
          tone="warning"
          label="Đối soát"
          desc="Payout chính xác, đúng hạn"
        />
      </div>

      {/* Two-column layout: sidebar nav + content */}
      <div className="grid grid-cols-[240px_minmax(0,1fr)] items-start gap-6">
        {/* Sticky sidebar nav */}
        <aside className="sticky top-6 self-start h-fit">
          <div className="flex flex-col gap-1 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
            <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              Mục lục
            </div>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => jump(s.id)}
                  className={`flex items-center gap-2 rounded-ds-md px-2.5 py-2 text-left text-[12.5px] transition-colors ${isActive
                    ? "border border-[var(--color-action-brand-bg-default)] bg-[var(--color-badge-brand-bg)] font-medium text-[var(--color-text-primary)]"
                    : "border border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
                    }`}
                >
                  <Icon
                    size={13}
                    className={
                      isActive
                        ? "text-[var(--color-icon-brand)]"
                        : "text-[var(--color-icon-muted)]"
                    }
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Policy content */}
        <div className="flex flex-col gap-4">
          {/* A. Overview */}
          <OrganizerPolicySection
            id="overview"
            title="A. Tổng quan"
            subtitle="Phạm vi công cụ và trách nhiệm sử dụng"
            tag={{ tone: "info", label: "Bắt buộc đọc" }}
          >
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              EvoTicket cung cấp cho Ban tổ chức công cụ tạo sự kiện, bán vé,
              báo cáo doanh thu, quản lý resale, và điều phối checker tại
              gate. Ban tổ chức chỉ được quản lý các sự kiện thuộc quyền sở
              hữu hoặc được phân quyền trong tổ chức của mình.
            </p>
            <OrganizerPolicyRule tone="brand" title="Phạm vi quản lý">
              Mỗi tài khoản Ban tổ chức chỉ thao tác trên sự kiện thuộc
              workspace của tổ chức đó. Việc truy cập sự kiện ngoài phạm vi là
              vi phạm điều khoản sử dụng.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* B. Content rules */}
          <OrganizerPolicySection
            id="content"
            title="B. Quy tắc nội dung & hình ảnh"
            subtitle="Chuẩn hoá nội dung hiển thị công khai trên EvoTicket"
          >
            <OrganizerPolicyRule
              tone="error"
              title="Không đưa thông tin liên hệ trái quy định"
            >
              Banner, poster và mô tả không được chứa số điện thoại, email,
              hay link ngoài nhằm lôi kéo giao dịch ngoài hệ thống.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Không dùng hình ảnh sai chuẩn, phản cảm, gây hiểu lầm"
            >
              Hình ảnh phải phù hợp quy chuẩn cộng đồng, không xâm phạm bản
              quyền và không giả mạo thương hiệu khác.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title="Poster / cover đúng kích thước"
            >
              Ảnh cover và poster phải đúng tỉ lệ hiển thị của EvoTicket,
              không để chi tiết quan trọng nằm trong vùng bị crop.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title="Mô tả trung thực về quyền lợi vé"
            >
              Nội dung mô tả vé phải phản ánh chính xác quyền lợi thực tế.
              Không mô tả mơ hồ gây hiểu lầm về hạng vé, khu vực, hoặc trải
              nghiệm đi kèm.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* C. Event creation rules */}
          <OrganizerPolicySection
            id="create"
            title="C. Quy tắc tạo sự kiện"
            subtitle="Các trường bắt buộc và điều kiện hợp lệ"
          >
            <OrganizerPolicyRule
              tone="brand"
              title="Dữ liệu sự kiện phải đầy đủ"
            >
              Tên, mô tả, loại sự kiện, hình thức (Offline / Online / Hybrid),
              và thời gian phải được khai báo đầy đủ trước khi submit duyệt.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="brand"
              title="Thời gian, địa điểm, loại vé phải hợp lệ"
            >
              Giờ bắt đầu không được trước thời điểm hiện tại. Loại vé phải có
              giá, số lượng, và khung thời gian mở bán rõ ràng.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title="Seat map phải đúng nếu sự kiện dùng sơ đồ ghế"
            >
              Khi sự kiện sử dụng seat map, mỗi ghế phải được gán zone và loại
              vé tương ứng. Ghế bị block phải được đánh dấu rõ ràng.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Hệ thống có thể từ chối publish nếu thiếu cấu hình bắt buộc"
            >
              Các sự kiện thiếu thông tin thanh toán, thiếu loại vé hợp lệ
              hoặc có nội dung vi phạm sẽ không được đưa lên public.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* D. Tickets & resale */}
          <OrganizerPolicySection
            id="ticket"
            title="D. Vé & resale"
            subtitle="Cấu hình vé và ràng buộc thị trường thứ cấp"
            tag={{ tone: "accent", label: "Blockchain" }}
          >
            <OrganizerPolicyRule
              tone="brand"
              title="Organizer cấu hình loại vé và seat map"
            >
              Ban tổ chức tự cấu hình loại vé, số lượng, quyền lợi, và gán
              ghế nếu cần. Thay đổi sau khi mở bán có thể bị giới hạn.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title="Resale chịu ràng buộc chính sách nền tảng"
            >
              EvoTicket áp dụng chính sách resale chung. Một số hạng vé có
              thể bị cấm resale hoặc giới hạn số lần sang nhượng.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title="Max resale price và royalty fee"
            >
              Giá bán lại tối đa và tỉ lệ royalty là cấu hình quan trọng, ảnh
              hưởng đến doanh thu thứ cấp của Ban tổ chức. Cần cấu hình trước
              khi mở bán.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Vé đang bị khóa resale"
            >
              Vé ở trạng thái{" "}
              <code className="text-[var(--color-badge-accent-text)]">
                locked
              </code>{" "}
              không thể giao dịch thứ cấp. Tình trạng này thường do transfer,
              xác minh, hoặc khoá vận hành.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* E. Check-in & checker */}
          <OrganizerPolicySection
            id="checkin"
            title="E. Check-in & checker"
            subtitle="Trách nhiệm gate và chế độ offline"
          >
            <OrganizerPolicyRule
              tone="brand"
              title="Quản lý checker thuộc event của mình"
            >
              Ban tổ chức có trách nhiệm phân công, thu hồi và giám sát
              checker. Danh sách checker được audit trong báo cáo đối soát.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title="Checker chỉ thao tác trên event/gate được phân công"
            >
              Checker không có quyền check-in cho sự kiện khác hoặc gate không
              được gán.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="success"
              title="Check-in online & offline"
            >
              Ứng dụng checker hoạt động được khi offline và sẽ đồng bộ lại
              khi có mạng. Dữ liệu xung đột được xử lý theo quy tắc nền
              tảng.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* F. Payout */}
          <OrganizerPolicySection
            id="payout"
            title="F. Thanh toán & đối soát"
            subtitle="Quy trình payout và yêu cầu dữ liệu"
          >
            <OrganizerPolicyRule
              tone="brand"
              title="Payout theo thông tin thanh toán đã cung cấp"
            >
              Ban tổ chức phải khai báo đúng chủ tài khoản, ngân hàng, và số
              tài khoản nhận payout.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title="Dữ liệu payout sai có thể làm chậm đối soát"
            >
              Thông tin không khớp giữa pháp nhân và tài khoản nhận tiền có
              thể dẫn đến hold payout cho đến khi xác minh lại.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title="Export phục vụ audit"
            >
              Ban tổ chức có thể xuất báo cáo doanh thu, check-in, resale, và
              danh sách người mua phục vụ mục đích audit cơ bản.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* G. Responsibilities */}
          <OrganizerPolicySection
            id="responsibility"
            title="G. Trách nhiệm ban tổ chức"
            subtitle="Các cam kết khi sử dụng nền tảng"
          >
            <OrganizerPolicyRule
              tone="brand"
              title="Tổ chức sự kiện đúng như mô tả"
            >
              Ban tổ chức đảm bảo sự kiện diễn ra đúng thời gian, địa điểm,
              nội dung đã công bố cho người mua vé.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="brand"
              title="Xử lý khiếu nại của người mua"
            >
              Mọi khiếu nại liên quan đến trải nghiệm tại sự kiện là trách
              nhiệm của Ban tổ chức, trong phạm vi chính sách nền tảng cho
              phép.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title="Bảo mật dữ liệu người mua"
            >
              Dữ liệu người mua chỉ được sử dụng cho mục đích vận hành sự
              kiện. Không được chia sẻ, bán, hoặc dùng cho mục đích ngoài phạm
              vi.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* H. Violations */}
          <OrganizerPolicySection
            id="violation"
            title="H. Vi phạm & xử lý"
            subtitle="Các mức xử lý tuỳ vào mức độ vi phạm"
            tag={{ tone: "error", label: "Quan trọng" }}
          >
            <OrganizerPolicyRule
              tone="warning"
              title="Từ chối duyệt sự kiện"
            >
              Event không đạt yêu cầu nội dung hoặc cấu hình sẽ bị trả lại
              trạng thái draft kèm lý do chi tiết.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Gỡ hoặc tạm khoá bán"
            >
              Event phát hiện vi phạm sau khi publish có thể bị khoá bán hoặc
              gỡ khỏi trang public.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Giữ payout để rà soát"
            >
              Các giao dịch nghi vấn hoặc khiếu nại lớn có thể dẫn đến việc
              giữ payout tạm thời cho đến khi hoàn tất rà soát.
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title="Xử lý hành vi gian lận"
            >
              Gian lận resale, gian lận checker, hoặc nội dung sai lệch sẽ bị
              xử lý theo chính sách nền tảng, bao gồm đình chỉ tài khoản tổ
              chức.
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* I. Support */}
          <OrganizerPolicySection
            id="support"
            title="I. Hỗ trợ"
            subtitle="Liên hệ khi cần giải thích thêm về chính sách"
          >
            <div className="grid grid-cols-3 gap-3">
              <SupportCard
                icon={<Mail size={16} />}
                label="Liên hệ hỗ trợ"
                desc="support@evoticket.vn · 24/7"
              />
              <SupportCard
                icon={<HelpCircle size={16} />}
                label="Xem câu hỏi thường gặp"
                desc="Trung tâm hỗ trợ Ban tổ chức"
              />
              <SupportCard
                icon={<Download size={16} />}
                label="Tải quy định dạng PDF"
                desc="Phiên bản ký số v2026.04"
              />
            </div>
          </OrganizerPolicySection>

          {/* Acknowledgement */}
          <div className="flex items-start justify-between gap-4 rounded-ds-lg border border-[var(--color-action-brand-bg-default)] bg-[var(--color-bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <input
                id="ack"
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-1"
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="ack"
                  className="text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Tôi đã đọc và hiểu quy định dành cho ban tổ chức
                </label>
                <div className="flex items-center gap-2">
                  <OrganizerStatusBadge tone="success">
                    Đã xác nhận
                  </OrganizerStatusBadge>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Lần cuối: 12/04/2026 · 14:22 bởi Nguyễn Lê Hoàng Phúc
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
              Xem quy định khi tạo sự kiện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
