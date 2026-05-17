import { OVERVIEW_METRICS } from "@/src/features/organizer/fixtures/eventDetail";
import { CheckinStatsPanel } from "@/src/features/organizer/components/event-detail/CheckinStatsPanel";
import { EventKpiGrid } from "@/src/features/organizer/components/event-detail/EventKpiGrid";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";

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
