import {
  ATTENDEES,
  EVENT_DETAIL_STATE,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export default function EventAttendeesPage() {
  const t = useTranslations("Organizer.EventDetail.Attendees");

  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.attendees}
          rows={ATTENDEES}
          columns={[
            { key: "ticket", label: t("col_ticket") },
            { key: "holder", label: t("col_holder") },
            { key: "type", label: t("col_type") },
            { key: "status", label: t("col_status") },
            { key: "checkin", label: t("col_checkin") },
            { key: "resale", label: t("col_resale") },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
    </div>
  );
}
