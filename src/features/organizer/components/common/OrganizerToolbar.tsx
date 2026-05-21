"use client";

import { useRef, useState, useEffect } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";

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

// ─── Listbox ────────────────────────────────────────────────────────────────

interface ListboxProps {
  filterKey: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (key: string, value: string) => void;
}

function Listbox({ filterKey, label, options, value, onChange }: ListboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = value !== "";
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  return (
    <div ref={containerRef} className="relative" style={{ minWidth: 148 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-ds-md border px-3 py-2 text-[13px] outline-none transition-colors",
          isActive
            ? "border-[var(--color-action-brand-bg-default)] bg-[var(--color-action-brand-bg-pressed)] text-[var(--color-action-brand-text-default)] font-medium"
            : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)]",
        ].join(" ")}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={12}
          className={[
            "shrink-0 transition-transform duration-200",
            isActive
              ? "text-[var(--color-action-brand-text-default)]"
              : "text-[var(--color-icon-muted)]",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] py-1 shadow-lg"
          style={{ minWidth: 168 }}
        >
          {/* "All" option */}
          <li
            role="option"
            aria-selected={value === ""}
            onClick={() => {
              onChange(filterKey, "");
              setOpen(false);
            }}
            className={[
              "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] transition-colors",
              value === ""
                ? "bg-[var(--color-action-brand-bg-pressed)] text-[var(--color-action-brand-text-default)] font-medium"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]",
            ].join(" ")}
          >
            <span>{label}</span>
            {value === "" && (
              <Check size={12} className="shrink-0 text-[var(--color-action-brand-text-default)]" />
            )}
          </li>

          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(filterKey, opt.value);
                  setOpen(false);
                }}
                className={[
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] transition-colors",
                  isSelected
                    ? "bg-[var(--color-action-brand-bg-pressed)] text-[var(--color-action-brand-text-default)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]",
                ].join(" ")}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check
                    size={12}
                    className="shrink-0 text-[var(--color-action-brand-text-default)]"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

/**
 * Search + Listbox filter dropdowns + clear + optional action buttons.
 * Used in My Events and Reports pages.
 *
 * Filters are fully controlled: pass `selectedFilters` and `onFilterChange`
 * to make selects interactive. "Xóa bộ lọc" only appears when at least one
 * filter or the search box has a non-default value.
 */
export function OrganizerToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  // onClearFilters,
  actions,
}: OrganizerToolbarProps) {
  const t = useTranslations("Organizer.Common.Toolbar");
  const displaySearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");

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
          placeholder={displaySearchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border-none bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="shrink-0 text-[var(--color-icon-muted)] hover:text-[var(--color-text-primary)]"
            aria-label={t("clearSearch")}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Listbox filters */}
      {filters.map((f) => (
        <Listbox
          key={f.key}
          filterKey={f.key}
          label={f.label}
          options={f.options}
          value={selectedFilters[f.key] ?? ""}
          onChange={onFilterChange ?? (() => { })}
        />
      ))}

      {/* Clear filters — only shown when something is active */}
      {/* {hasActiveFilters && onClearFilters && (
        <button
          type="button"
          // onClick={onClearFilters}
          className="flex items-center gap-1.5 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:border-[var(--color-feedback-error-icon)] hover:text-[var(--color-feedback-error-text)] transition-colors"
        >
          <X size={13} />
          {t("clearFilter")}
        </button>
      )} */}

      {/* Right-aligned actions */}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
