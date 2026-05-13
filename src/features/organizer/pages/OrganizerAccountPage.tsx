"use client";

import {
  Mail, Phone, Lock, ShieldCheck, Building2, Globe, Landmark,
  Users, Camera, ExternalLink, CreditCard, KeyRound, LogOut, Pencil,
} from "lucide-react";
import Image from "next/image";
import { OrganizerStatusBadge } from "@/src/features/organizer/components/common/OrganizerStatusBadge";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";

/* ── Local helpers ───────────────────────────────────────── */

function Panel({ title, subtitle, right, children }: {
  title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, icon, editable = true, helper }: {
  label: string; value: string; icon?: React.ReactNode; editable?: boolean; helper?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</label>
      <div className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2">
        {icon && <span className="flex text-[var(--color-icon-muted)]">{icon}</span>}
        <input defaultValue={value} readOnly={!editable}
          className="flex-1 border-none bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none" />
        {editable && <Pencil size={13} className="text-[var(--color-icon-muted)]" />}
      </div>
      {helper && <span className="text-[11px] text-[var(--color-text-muted)]">{helper}</span>}
    </div>
  );
}

function SummaryStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-badge-${tone}-text)` }} />
      </div>
      <span className="text-lg font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span className="relative inline-flex h-5 w-9 items-center rounded-full border transition-colors"
      style={{
        background: on ? "var(--color-action-brand-bg-default)" : "var(--color-bg-elevated)",
        borderColor: on ? "var(--color-action-brand-bg-hover)" : "var(--color-border-default)",
      }}>
      <span className="block h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </span>
  );
}

function NotifRow({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{label}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{desc}</span>
      </div>
      <Toggle on={defaultOn} />
    </div>
  );
}

function SecurityAction({ icon, title, desc, tone = "brand" }: {
  icon: React.ReactNode; title: string; desc: string; tone?: StatusTone;
}) {
  return (
    <button className="flex items-start gap-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3 text-left">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ background: `var(--color-badge-${tone}-bg)`, color: `var(--color-badge-${tone}-text)` }}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{title}</span>
        <span className="text-[11.5px] text-[var(--color-text-muted)]">{desc}</span>
      </div>
    </button>
  );
}

function SummaryLine({ icon, label, value, tone = "neutral" }: {
  icon: React.ReactNode; label: string; value: string; tone?: StatusTone;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--color-badge-brand-bg)", color: "var(--color-badge-brand-text)" }}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{value}</span>
      </div>
      {tone === "success" && <OrganizerStatusBadge tone="success">✓</OrganizerStatusBadge>}
    </div>
  );
}

function HistoryItem({ icon, label, time, meta, tone = "neutral" }: {
  icon: React.ReactNode; label: string; time: string; meta?: string; tone?: StatusTone;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: `var(--color-badge-${tone}-bg)`, color: `var(--color-badge-${tone}-text)` }}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{label}</span>
          <span className="text-[11px] text-[var(--color-text-muted)]">{time}</span>
        </div>
        {meta && <span className="text-xs text-[var(--color-text-muted)]">{meta}</span>}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */

export default function AccountPage() {
  return (
      <div className="flex flex-col gap-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">Tài khoản &amp; Hồ sơ tổ chức</h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">Quản lý thông tin tài khoản, hồ sơ ban tổ chức và trạng thái xác minh cơ bản</p>
        </div>

        {/* Profile summary */}
        <div className="flex items-center gap-5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
              <Image src="https://images.unsplash.com/photo-1557683316-973673baf926?w=160&q=80" alt="Evo Culture Studio" width={80} height={80} className="h-full w-full object-cover" unoptimized />
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-action-brand-bg-default)] text-white">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-xl font-semibold text-[var(--color-text-primary)]">Evo Culture Studio</h2>
              <OrganizerStatusBadge tone="success">Active</OrganizerStatusBadge>
              <OrganizerStatusBadge tone="info">Basic verified</OrganizerStatusBadge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5"><Building2 size={13} className="text-[var(--color-icon-muted)]" />Doanh nghiệp tổ chức sự kiện</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span>Thành viên từ 03/2026</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span>Liên hệ chính: <span className="font-medium text-[var(--color-text-primary)]">Nguyễn Lê Hoàng Phúc</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
              <ExternalLink size={13} />Xem trang public
            </button>
            <button className="flex items-center gap-2 rounded-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
              <ShieldCheck size={13} />Nâng cấp xác minh
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left 2/3 */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Account owner */}
            <Panel title="Chủ tài khoản" subtitle="Thông tin đăng nhập và bảo mật" right={<OrganizerStatusBadge tone="warning">2FA chưa bật</OrganizerStatusBadge>}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Họ và tên" value="Nguyễn Lê Hoàng Phúc" />
                <Field label="Email" value="phuc.organizer@evoticket.vn" icon={<Mail size={13} />} />
                <Field label="Số điện thoại" value="09xx xxx xxx" icon={<Phone size={13} />} />
                <Field label="Mã nhân viên" value="EVO-OP-0042" editable={false} />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <SecurityAction icon={<KeyRound size={14} />} title="Đổi mật khẩu" desc="Lần cuối 2 tháng trước" />
                <SecurityAction icon={<Lock size={14} />} title="Bật xác thực 2 bước" desc="Tăng bảo mật tài khoản" tone="warning" />
                <SecurityAction icon={<LogOut size={14} />} title="Phiên đăng nhập" desc="3 thiết bị đang hoạt động" />
              </div>
            </Panel>

            {/* Organization profile */}
            <Panel title="Thông tin ban tổ chức" subtitle="Hiển thị công khai trên trang sự kiện"
              right={<button className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"><Pencil size={12} />Chỉnh sửa</button>}>
              <div className="relative h-[120px] overflow-hidden rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
                <Image src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80" alt="cover" fill className="object-cover" unoptimized />
                <button className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-[var(--color-border-default)] px-2.5 py-1.5 text-xs text-white backdrop-blur-sm" style={{ background: "rgba(15,10,24,0.7)" }}>
                  <Camera size={12} />Đổi cover
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên ban tổ chức" value="Evo Culture Studio" />
                <Field label="Website / Social" value="https://evoculture.vn" icon={<Globe size={13} />} />
                <Field label="Email hỗ trợ người mua" value="support@evoculture.vn" icon={<Mail size={13} />} />
                <Field label="Số điện thoại hỗ trợ" value="1900 6868" icon={<Phone size={13} />} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Mô tả ngắn</label>
                <textarea defaultValue="Evo Culture Studio là đơn vị tổ chức các sự kiện văn hoá - giải trí hiện đại, ứng dụng blockchain cho vé và resale minh bạch." rows={2}
                  className="resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Public organizer bio</label>
                <textarea defaultValue="Chúng tôi mang đến những trải nghiệm âm nhạc, triển lãm và hội thảo chất lượng cao tại Việt Nam — từ sân khấu Livestage đến các không gian sáng tạo đa ngành." rows={3}
                  className="resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none" />
              </div>
            </Panel>

            {/* Legal / payout */}
            <Panel title="Thông tin thanh toán & pháp lý" subtitle="Dùng cho đối soát doanh thu và xuất hoá đơn" right={<OrganizerStatusBadge tone="success">Đã xác minh</OrganizerStatusBadge>}>
              <div className="grid grid-cols-2 gap-4">
                <SummaryLine icon={<Landmark size={14} />} label="Chủ tài khoản payout" value="CONG TY TNHH EVO CULTURE" />
                <SummaryLine icon={<CreditCard size={14} />} label="Ngân hàng" value="Vietcombank · CN Sài Gòn" />
                <SummaryLine icon={<CreditCard size={14} />} label="Số tài khoản" value="•••• •••• 4892" />
                <SummaryLine icon={<Building2 size={14} />} label="Loại hình kinh doanh" value="Công ty TNHH" />
                <SummaryLine icon={<ShieldCheck size={14} />} label="Mã số thuế" value="0316xxxxxx · Đã xác minh" tone="success" />
                <SummaryLine icon={<Building2 size={14} />} label="Địa chỉ xuất hoá đơn" value="Tầng 7, Toà nhà Sonatus, Q.1, TP.HCM" />
              </div>
              <div className="flex items-center justify-end pt-1">
                <button className="flex items-center gap-2 rounded-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
                  <CreditCard size={13} />Cập nhật thông tin thanh toán
                </button>
              </div>
            </Panel>

            {/* Notifications */}
            <Panel title="Tuỳ chọn thông báo" subtitle="Cấu hình email và cảnh báo vận hành">
              <div className="grid grid-cols-2 gap-3">
                <NotifRow label="Thông báo qua email" desc="Tổng hợp hoạt động hằng ngày" defaultOn />
                <NotifRow label="Thông báo payout" desc="Khi có đối soát và chuyển khoản" defaultOn />
                <NotifRow label="Review / Approval" desc="Khi sự kiện được duyệt hoặc từ chối" defaultOn />
                <NotifRow label="Checker incident" desc="Cảnh báo từ gate và checker app" defaultOn={false} />
              </div>
            </Panel>
          </div>

          {/* Right 1/3 */}
          <div className="flex flex-col gap-5">
            {/* Team */}
            <Panel title="Thành viên & phân quyền" subtitle="Nhân sự thuộc workspace tổ chức">
              <div className="grid grid-cols-3 gap-2">
                <SummaryStat label="Tổng thành viên" value="6" tone="brand" />
                <SummaryStat label="Organizer admin" value="2" tone="info" />
                <SummaryStat label="Checker manager" value="1" tone="success" />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-2.5">
                <div className="flex -space-x-2">
                  {["NP", "TH", "LM", "QA"].map((n, i) => (
                    <div key={n} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg-elevated)] text-[11px] font-semibold text-white"
                      style={{ background: ["var(--color-action-brand-bg-default)", "var(--color-action-brand-bg-pressed)", "var(--color-action-accent-bg-default)", "var(--color-feedback-info-icon)"][i] }}>
                      {n}
                    </div>
                  ))}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg-elevated)] bg-[var(--color-bg-surface)] text-[11px] text-[var(--color-text-secondary)]">+2</div>
                </div>
                <span className="ml-1 text-xs text-[var(--color-text-muted)]">đang hoạt động</span>
              </div>
              <button className="flex items-center justify-center gap-2 rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)]">
                <Users size={13} />Quản lý thành viên
              </button>
            </Panel>

            {/* History */}
            <Panel title="Lịch sử tài khoản" subtitle="Các thay đổi gần đây">
              <div className="flex flex-col gap-3">
                <HistoryItem icon={<Pencil size={13} />} label="Cập nhật hồ sơ tổ chức" time="2 giờ trước" meta="Sửa mô tả ngắn và cover image" tone="brand" />
                <HistoryItem icon={<CreditCard size={13} />} label="Cập nhật tài khoản payout" time="3 ngày trước" meta="Đổi ngân hàng sang Vietcombank CN Sài Gòn" tone="accent" />
                <HistoryItem icon={<Users size={13} />} label="Mời thành viên mới" time="5 ngày trước" meta="quan.le@evoticket.vn · Checker manager" tone="info" />
                <HistoryItem icon={<ShieldCheck size={13} />} label="Đăng nhập thành công" time="Hôm nay · 08:04" meta="Chrome trên macOS · TP.HCM" tone="success" />
              </div>
            </Panel>

            {/* Danger zone */}
            <Panel title="Vùng nguy hiểm" subtitle="Hành động không thể hoàn tác">
              <div className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-feedback-error-border)] bg-[var(--color-feedback-error-bg)] p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-[var(--color-feedback-error-text)]">Yêu cầu đóng tài khoản tổ chức</span>
                  <span className="text-xs leading-snug text-[var(--color-text-secondary)]">Sau khi gửi yêu cầu, các sự kiện đang mở bán sẽ được xử lý theo chính sách nền tảng trước khi tài khoản bị đóng.</span>
                </div>
                <button className="whitespace-nowrap rounded-md border border-[var(--color-feedback-error-border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--color-feedback-error-text)]">Gửi yêu cầu</button>
              </div>
            </Panel>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 mt-2 flex items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] px-6 py-4 backdrop-blur-md" style={{ background: "var(--color-bg-overlay)" }}>
          <span className="text-xs text-[var(--color-text-muted)]">Thay đổi của bạn chỉ được áp dụng sau khi nhấn &quot;Lưu thay đổi&quot;.</span>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-[var(--color-border-default)] bg-transparent px-4 py-2 text-[13px] text-[var(--color-text-secondary)]">Hủy</button>
            <button className="rounded-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-4 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">Lưu thay đổi</button>
          </div>
        </div>
      </div>
  );
}
