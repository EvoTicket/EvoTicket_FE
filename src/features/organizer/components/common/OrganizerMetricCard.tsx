"use client";

import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";

interface OrganizerMetricCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: StatusTone;
}

/**
 * Compact KPI / summary metric card for the Organizer Hub.
 * Shows a label, large value, optional change badge, and a small dot indicator.
 */
export function OrganizerMetricCard({
  label,
  value,
  delta,
  tone = "brand",
}: OrganizerMetricCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: `var(--color-badge-${tone}-text)` }}
        />
      </div>
      <span className="text-[22px] font-semibold text-[var(--color-text-primary)]">
        {value}
      </span>
      {delta && (
        <OrganizerStatusBadge tone={tone}>{delta}</OrganizerStatusBadge>
      )}
    </div>
  );
}
