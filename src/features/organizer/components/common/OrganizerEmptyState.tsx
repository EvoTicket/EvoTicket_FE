"use client";

import { Filter } from "lucide-react";
import { CreateEventButton } from "./CreateEventButton";
import { useTranslations } from "next-intl";

interface OrganizerEmptyStateProps {
  title?: string;
  description?: string;
  onClear?: () => void;
  createHref?: string;
  createLabel?: string;
}

/**
 * Empty-state placeholder shown when no events/data match the current filter.
 */
export function OrganizerEmptyState({
  title,
  description,
  onClear,
  createHref,
  createLabel,
}: OrganizerEmptyStateProps) {
  const t = useTranslations("Organizer.Common.EmptyState");
  
  const displayTitle = title ?? t("defaultTitle");
  const displayDescription = description ?? t("defaultDesc");
  const displayCreateLabel = createLabel ?? t("defaultCreateLabel");

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-ds-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-icon-muted)]">
        <Filter size={20} />
      </div>
      <div className="text-base font-medium text-[var(--color-text-primary)]">
        {displayTitle}
      </div>
      <div className="max-w-[360px] text-[13px] text-[var(--color-text-muted)]">
        {displayDescription}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {onClear && (
          <button
            onClick={onClear}
            className="rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)]"
          >
            {t("clearFilter")}
          </button>
        )}
        {createHref && (
          <CreateEventButton
            className="rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]"
          >
            {displayCreateLabel}
          </CreateEventButton>
        )}
      </div>
    </div>
  );
}
