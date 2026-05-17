"use client";

import { Filter } from "lucide-react";

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
  title = "Không tìm thấy sự kiện phù hợp",
  description = "Thử điều chỉnh lại bộ lọc hoặc tạo sự kiện đầu tiên để bắt đầu bán vé.",
  onClear,
  createHref,
  createLabel = "Tạo sự kiện đầu tiên",
}: OrganizerEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-ds-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-icon-muted)]">
        <Filter size={20} />
      </div>
      <div className="text-base font-medium text-[var(--color-text-primary)]">
        {title}
      </div>
      <div className="max-w-[360px] text-[13px] text-[var(--color-text-muted)]">
        {description}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {onClear && (
          <button
            onClick={onClear}
            className="rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-primary)]"
          >
            Xóa bộ lọc
          </button>
        )}
        {createHref && (
          <a
            href={createHref}
            className="rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]"
          >
            {createLabel}
          </a>
        )}
      </div>
    </div>
  );
}
