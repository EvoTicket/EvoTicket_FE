import { OVERVIEW_METRICS } from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { CheckinStatsPanel } from "@/src/components/organizer/CheckinStatsPanel";
import { EventKpiGrid } from "@/src/components/organizer/EventKpiGrid";
import { EventSectionPanel } from "@/src/components/organizer/EventSectionPanel";

export default function EventCheckinPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={[OVERVIEW_METRICS[2], { label: "Rejected scans", value: "17", helper: "Cần kiểm tra", tone: "error" }, { label: "Offline queue", value: "3", helper: "Chờ đồng bộ", tone: "warning" }]} />
      <EventSectionPanel title="Check-in Management" subtitle="Theo dõi gate, lượt quét và đồng bộ thiết bị">
        <CheckinStatsPanel />
      </EventSectionPanel>
    </div>
  );
}
