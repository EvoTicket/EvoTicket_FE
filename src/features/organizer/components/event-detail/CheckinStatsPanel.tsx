import { CHECKIN_GATES } from "@/src/features/organizer/fixtures/eventDetail";
import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";

export function CheckinStatsPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {CHECKIN_GATES.map((gate) => (
        <div
          key={gate.gate}
          className="rounded-lg border border-border-subtle bg-bg-elevated p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">{gate.gate}</div>
              <div className="text-xs text-text-muted">{gate.staff}</div>
            </div>
            <OrganizerStatusBadge tone={gate.tone}>{gate.online}</OrganizerStatusBadge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-text-muted">Scanned</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">{gate.scanned}</div>
            </div>
            <div>
              <div className="text-text-muted">Rejected</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">{gate.rejected}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
