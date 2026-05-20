import {
  EVENT_DETAIL_STATE,
  VOUCHERS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export default function EventVouchersPage() {
  const t = useTranslations("Organizer.EventDetail.Vouchers");

  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.vouchers}
          rows={VOUCHERS}
          columns={[
            { key: "code", label: t("col_code") },
            { key: "campaign", label: t("col_campaign") },
            { key: "discount", label: t("col_discount") },
            { key: "used", label: t("col_used"), align: "right" },
            { key: "status", label: t("col_status") },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
    </div>
  );
}
