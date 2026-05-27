import {
  EVENT_DETAIL_STATE,
  ORDERS,
  OVERVIEW_METRICS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventKpiGrid } from "@/src/features/organizer/components/event-detail/EventKpiGrid";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export default function EventOrdersPage() {
  const t = useTranslations("Organizer.EventDetail.Orders");

  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={[OVERVIEW_METRICS[0], OVERVIEW_METRICS[1], { label: t("refund_pending"), value: "4", helper: t("needs_processing"), tone: "warning" }]} />
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.orders}
          rows={ORDERS}
          columns={[
            { key: "id", label: t("col_order") },
            { key: "buyer", label: t("col_buyer") },
            { key: "summary", label: t("col_summary") },
            { key: "total", label: t("col_total"), align: "right" },
            { key: "method", label: t("col_method") },
            { key: "payment", label: t("col_payment") },
            { key: "mint", label: t("col_mint") },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
    </div>
  );
}
