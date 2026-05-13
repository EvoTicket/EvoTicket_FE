import type { StatusTone } from "./statusMapping";

type EventMetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: StatusTone;
};

export function EventMetricCard({
  label,
  value,
  helper,
  tone = "brand",
}: EventMetricCardProps) {
  return (
    <div className="flex min-h-32 flex-col justify-between rounded-lg border border-border-subtle bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs text-text-muted">{label}</span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: `var(--color-badge-${tone}-text)` }}
        />
      </div>
      <div>
        <div className="text-2xl font-semibold text-text-primary">{value}</div>
        {helper && <div className="mt-2 text-xs text-text-muted">{helper}</div>}
      </div>
    </div>
  );
}
