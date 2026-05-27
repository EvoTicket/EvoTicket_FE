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
import { useTranslations } from "next-intl";

/* ── Sidebar sections ────────────────────────────────────── */

const SECTIONS: { id: string; key: string; icon: LucideIcon }[] = [
  { id: "overview", key: "overview", icon: Info },
  { id: "content", key: "content", icon: ImageIcon },
  { id: "create", key: "create", icon: CalendarCheck },
  { id: "ticket", key: "ticket", icon: Ticket },
  { id: "checkin", key: "checkin", icon: ScanLine },
  { id: "payout", key: "payout", icon: Wallet },
  { id: "responsibility", key: "responsibility", icon: FileText },
  { id: "violation", key: "violation", icon: ShieldAlert },
  { id: "support", key: "support", icon: LifeBuoy },
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
  const t = useTranslations("Organizer.Terms");
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
            {t("title")}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrganizerStatusBadge tone="info">
            {t("version_info")}
          </OrganizerStatusBadge>
          <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)]">
            <Download size={13} />
            {t("download_pdf")}
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
            {t("warning_title")}
          </span>
          <span className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            {t("warning_desc")}
          </span>
        </div>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-5 gap-4">
        <HighlightCard
          icon={FileText}
          tone="brand"
          label={t("highlights.content")}
          desc={t("highlights.content_desc")}
        />
        <HighlightCard
          icon={ImageIcon}
          tone="accent"
          label={t("highlights.image")}
          desc={t("highlights.image_desc")}
        />
        <HighlightCard
          icon={Ticket}
          tone="info"
          label={t("highlights.ticket")}
          desc={t("highlights.ticket_desc")}
        />
        <HighlightCard
          icon={ScanLine}
          tone="success"
          label={t("highlights.checkin")}
          desc={t("highlights.checkin_desc")}
        />
        <HighlightCard
          icon={Wallet}
          tone="warning"
          label={t("highlights.payout")}
          desc={t("highlights.payout_desc")}
        />
      </div>

      {/* Two-column layout: sidebar nav + content */}
      <div className="grid grid-cols-[240px_minmax(0,1fr)] items-start gap-6">
        {/* Sticky sidebar nav */}
        <aside className="sticky top-6 self-start h-fit">
          <div className="flex flex-col gap-1 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
            <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              {t("toc")}
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
                  {t(`sections.${s.key}`)}
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
            title={t("content.a.title")}
            subtitle={t("content.a.subtitle")}
            tag={{ tone: "info", label: t("content.a.tag") }}
          >
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              {t("content.a.desc")}
            </p>
            <OrganizerPolicyRule tone="brand" title={t("content.a.r1_title")}>
              {t("content.a.r1_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* B. Content rules */}
          <OrganizerPolicySection
            id="content"
            title={t("content.b.title")}
            subtitle={t("content.b.subtitle")}
          >
            <OrganizerPolicyRule
              tone="error"
              title={t("content.b.r1_title")}
            >
              {t("content.b.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.b.r2_title")}
            >
              {t("content.b.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title={t("content.b.r3_title")}
            >
              {t("content.b.r3_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title={t("content.b.r4_title")}
            >
              {t("content.b.r4_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* C. Event creation rules */}
          <OrganizerPolicySection
            id="create"
            title={t("content.c.title")}
            subtitle={t("content.c.subtitle")}
          >
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.c.r1_title")}
            >
              {t("content.c.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.c.r2_title")}
            >
              {t("content.c.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title={t("content.c.r3_title")}
            >
              {t("content.c.r3_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.c.r4_title")}
            >
              {t("content.c.r4_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* D. Tickets & resale */}
          <OrganizerPolicySection
            id="ticket"
            title={t("content.d.title")}
            subtitle={t("content.d.subtitle")}
            tag={{ tone: "accent", label: t("content.d.tag") }}
          >
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.d.r1_title")}
            >
              {t("content.d.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title={t("content.d.r2_title")}
            >
              {t("content.d.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title={t("content.d.r3_title")}
            >
              {t("content.d.r3_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.d.r4_title")}
            >
              {t("content.d.r4_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* E. Check-in & checker */}
          <OrganizerPolicySection
            id="checkin"
            title={t("content.e.title")}
            subtitle={t("content.e.subtitle")}
          >
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.e.r1_title")}
            >
              {t("content.e.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title={t("content.e.r2_title")}
            >
              {t("content.e.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="success"
              title={t("content.e.r3_title")}
            >
              {t("content.e.r3_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* F. Payout */}
          <OrganizerPolicySection
            id="payout"
            title={t("content.f.title")}
            subtitle={t("content.f.subtitle")}
          >
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.f.r1_title")}
            >
              {t("content.f.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="warning"
              title={t("content.f.r2_title")}
            >
              {t("content.f.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title={t("content.f.r3_title")}
            >
              {t("content.f.r3_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* G. Responsibilities */}
          <OrganizerPolicySection
            id="responsibility"
            title={t("content.g.title")}
            subtitle={t("content.g.subtitle")}
          >
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.g.r1_title")}
            >
              {t("content.g.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="brand"
              title={t("content.g.r2_title")}
            >
              {t("content.g.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="info"
              title={t("content.g.r3_title")}
            >
              {t("content.g.r3_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* H. Violations */}
          <OrganizerPolicySection
            id="violation"
            title={t("content.h.title")}
            subtitle={t("content.h.subtitle")}
            tag={{ tone: "error", label: t("content.h.tag") }}
          >
            <OrganizerPolicyRule
              tone="warning"
              title={t("content.h.r1_title")}
            >
              {t("content.h.r1_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.h.r2_title")}
            >
              {t("content.h.r2_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.h.r3_title")}
            >
              {t("content.h.r3_desc")}
            </OrganizerPolicyRule>
            <OrganizerPolicyRule
              tone="error"
              title={t("content.h.r4_title")}
            >
              {t("content.h.r4_desc")}
            </OrganizerPolicyRule>
          </OrganizerPolicySection>

          {/* I. Support */}
          <OrganizerPolicySection
            id="support"
            title={t("content.i.title")}
            subtitle={t("content.i.subtitle")}
          >
            <div className="grid grid-cols-3 gap-3">
              <SupportCard
                icon={<Mail size={16} />}
                label={t("content.i.contact_support")}
                desc={t("content.i.contact_desc")}
              />
              <SupportCard
                icon={<HelpCircle size={16} />}
                label={t("content.i.faq")}
                desc={t("content.i.faq_desc")}
              />
              <SupportCard
                icon={<Download size={16} />}
                label={t("content.i.download")}
                desc={t("content.i.download_desc")}
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
                  {t("ack")}
                </label>
                <div className="flex items-center gap-2">
                  <OrganizerStatusBadge tone="success">
                    {t("ack_status")}
                  </OrganizerStatusBadge>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {t("ack_meta")}
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
              {t("view_guidelines")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
