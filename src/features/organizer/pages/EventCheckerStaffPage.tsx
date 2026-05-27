import {
  CHECKER_STAFF,
  EVENT_DETAIL_STATE,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export default function CheckerStaffPage() {
  const t = useTranslations("Organizer.EventDetail.Checker");

  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE["checker-staff"]}
          rows={CHECKER_STAFF}
          columns={[
            { key: "name", label: t("col_name") },
            { key: "role", label: t("col_role") },
            { key: "gate", label: t("col_gate") },
            { key: "device", label: t("col_device") },
            { key: "status", label: t("col_status") },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
    </div>
  );
}
