"use client";

interface TabItem {
  key: string;
  label: string;
  count: number;
}

interface OrganizerTabsProps {
  tabs: TabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
}

/**
 * Pill-style filter tab bar for the My Events page.
 * Active tab uses brand tokens; inactive uses surface tokens.
 */
export function OrganizerTabs({ tabs, activeKey, onTabChange }: OrganizerTabsProps) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">
      {tabs.map((t) => {
        const active = activeKey === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex items-center gap-2 rounded-ds-md px-3 py-1.5 text-[13px] transition-colors ${
              active
                ? "border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] font-medium text-[var(--color-action-brand-text-default)]"
                : "border border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 text-[11px] ${
                active
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
              }`}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
