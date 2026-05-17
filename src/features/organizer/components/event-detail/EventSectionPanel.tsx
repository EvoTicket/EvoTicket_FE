import type { ReactNode } from "react";

type EventSectionPanelProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export function EventSectionPanel({
  title,
  subtitle,
  right,
  children,
}: EventSectionPanelProps) {
  return (
    <section className="flex flex-col gap-4 rounded-ds-lg border border-border-subtle bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
