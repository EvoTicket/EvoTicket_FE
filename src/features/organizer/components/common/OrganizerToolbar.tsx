"use client";

import { Search, X, ChevronDown } from "lucide-react";

export interface FilterOption {
  /** Unique machine key, e.g. "eventType" */
  key: string;
  /** Human-readable label shown as the placeholder */
  label: string;
  /** Selectable values. First entry can be "" to mean "all" */
  options: { value: string; label: string }[];
}

interface OrganizerToolbarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Controlled filter definitions */
  filters?: FilterOption[];
  /** Map of filterKey → selected value (empty string = "all" / unselected) */
  selectedFilters?: Record<string, string>;
  /** Called when a single filter changes */
  onFilterChange?: (key: string, value: string) => void;
  /** Called to reset every filter + search back to default */
  onClearFilters?: () => void;
  /** Slot for right-aligned buttons (e.g. export, refresh) */
  actions?: React.ReactNode;
}

/**
 * Search + filter dropdowns + clear + optional action buttons.
 * Used in My Events and Reports pages.
 *
 * Filters are fully controlled: pass `selectedFilters` and `onFilterChange`
 * to make selects interactive. "Xóa bộ lọc" only appears when at least one
 * filter or the search box has a non-default value.
 */
export function OrganizerToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm…",
  filters = [],
  selectedFilters = {},
  onFilterChange,
  onClearFilters,
  actions,
}: OrganizerToolbarProps) {
  const hasActiveFilters =
    searchValue.trim() !== "" ||
    filters.some((f) => {
      const v = selectedFilters[f.key];
      return v !== undefined && v !== "";
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div
        className="flex flex-1 items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
        style={{ minWidth: 280, maxWidth: 420 }}
      >
        <Search size={14} className="shrink-0 text-[var(--color-icon-muted)]" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="shrink-0 text-[var(--color-icon-muted)] hover:text-[var(--color-text-primary)]"
            aria-label="Xóa tìm kiếm"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter selects */}
      {filters.map((f) => {
        const current = selectedFilters[f.key] ?? "";
        const isActive = current !== "";

        return (
          <div key={f.key} className="relative">
            <select
              value={current}
              onChange={(e) => onFilterChange?.(f.key, e.target.value)}
              className={[
                "flex cursor-pointer appearance-none items-center gap-2 rounded-ds-md border px-3 py-2 pr-8 text-[13px] outline-none transition-colors",
                isActive
                  ? "border-[var(--color-action-brand-bg-default)] bg-[var(--color-action-brand-bg-pressed)] text-[var(--color-action-brand-text-default)] font-medium"
                  : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover,var(--color-border-default))] hover:bg-[var(--color-bg-elevated)]",
              ].join(" ")}
              style={{ minWidth: 148 }}
            >
              {/* Placeholder option */}
              <option value="">{f.label}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Custom chevron overlay (pointer-events-none so the select is still clickable) */}
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-icon-muted)]"
            />
          </div>
        );
      })}

      {/* Clear filters — only shown when something is active */}
      {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:border-[var(--color-feedback-error-icon)] hover:text-[var(--color-feedback-error-text)] transition-colors"
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
