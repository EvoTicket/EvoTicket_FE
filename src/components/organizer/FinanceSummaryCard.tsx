type FinanceSummaryCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function FinanceSummaryCard({ label, value, helper }: FinanceSummaryCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
      <div className="text-sm text-text-muted">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-text-primary">{value}</div>
      <div className="mt-2 text-xs text-text-secondary">{helper}</div>
    </div>
  );
}
