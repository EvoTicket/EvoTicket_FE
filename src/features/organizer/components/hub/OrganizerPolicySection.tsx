"use client";

import { CheckCircle2 } from "lucide-react";
import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";

/* ── Section wrapper ─────────────────────────────────── */

interface PolicySectionProps {
  id: string;
  title: string;
  subtitle?: string;
  tag?: { tone: StatusTone; label: string };
  children: React.ReactNode;
}

export function OrganizerPolicySection({
  id,
  title,
  subtitle,
  tag,
  children,
}: PolicySectionProps) {
  return (
    <section
      id={id}
      className="flex flex-col gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {tag && (
          <OrganizerStatusBadge tone={tag.tone}>{tag.label}</OrganizerStatusBadge>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/* ── Rule item ─────────────────────────────────────────── */

interface PolicyRuleProps {
  tone?: StatusTone;
  title: string;
  children: React.ReactNode;
}

export function OrganizerPolicyRule({
  tone = "neutral",
  title,
  children,
}: PolicyRuleProps) {
  return (
    <div className="flex gap-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `var(--color-badge-${tone}-bg)`,
          color: `var(--color-badge-${tone}-text)`,
        }}
      >
        <CheckCircle2 size={14} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
          {title}
        </span>
        <span className="text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          {children}
        </span>
      </div>
    </div>
  );
}
