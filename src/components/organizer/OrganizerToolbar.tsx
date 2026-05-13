"use client";

import { Search, X } from "lucide-react";

interface FilterOption {
  label: string;
}

interface OrganizerToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onClearFilters?: () => void;
  /** Slot for right-aligned buttons (e.g. export, refresh) */
  actions?: React.ReactNode;
}

function FilterSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-[13px] text-[var(--color-text-secondary)]"
      style={{ minWidth: 150, justifyContent: "space-between" }}
    >
      <span>{label}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * Search + filter dropdowns + clear + optional action buttons.
 * Used in My Events and Reports pages.
 */
export function OrganizerToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm…",
  filters = [],
  onClearFilters,
  actions,
}: OrganizerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div
        className="flex flex-1 items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
        style={{ minWidth: 320, maxWidth: 420 }}
      >
        <Search size={14} className="text-[var(--color-icon-muted)]" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {/* Filter selects */}
      {filters.map((f) => (
        <FilterSelect key={f.label} label={f.label} />
      ))}

      {/* Clear */}
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)]"
        >
          <X size={13} />
          Xóa bộ lọc
        </button>
      )}

      {/* Right-aligned actions */}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
