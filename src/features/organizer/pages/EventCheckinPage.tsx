import { OVERVIEW_METRICS } from "@/src/features/organizer/fixtures/eventDetail";
import { CheckinStatsPanel } from "@/src/features/organizer/components/event-detail/CheckinStatsPanel";
import { EventKpiGrid } from "@/src/features/organizer/components/event-detail/EventKpiGrid";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { useTranslations } from "next-intl";

export default function EventCheckinPage() {
  const t = useTranslations("Organizer.EventDetail.Checkin");

  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={[
        OVERVIEW_METRICS[2],
        { label: t("rejected_scans"), value: "17", helper: t("needs_check"), tone: "error" },
        { label: t("offline_queue"), value: "3", helper: t("sync_pending"), tone: "warning" }
      ]} />
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <CheckinStatsPanel />
      </EventSectionPanel>
    </div>
  );
}
