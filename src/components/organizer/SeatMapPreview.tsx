import { SEAT_ZONES } from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { OrganizerStatusBadge } from "./OrganizerStatusBadge";

export function SeatMapPreview() {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
      <div className="mb-4 flex justify-center">
        <div className="rounded-b-full border border-border-default bg-bg-surface px-16 py-3 text-xs uppercase tracking-wide text-text-muted">
          Stage
        </div>
      </div>
      <div className="grid gap-3">
        {SEAT_ZONES.map((zone, index) => (
          <div
            key={zone.zone}
            className="grid grid-cols-[120px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border-subtle bg-bg-surface p-3"
          >
            <div className="text-sm font-medium text-text-primary">{zone.zone}</div>
            <div className="h-3 overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-action-brand-bg-default"
                style={{
                  width: `${Math.max(24, 95 - index * 9)}%`,
                }}
              />
            </div>
            <OrganizerStatusBadge tone={zone.tone}>{zone.sold} sold</OrganizerStatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}
