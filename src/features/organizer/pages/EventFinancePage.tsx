import {
  EVENT_DETAIL_STATE,
  FINANCE_ROWS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { FinanceSummaryCard } from "@/src/features/organizer/components/event-detail/FinanceSummaryCard";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export default function EventFinancePage() {
  const t = useTranslations("Organizer.EventDetail.Finance");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceSummaryCard label={t("gross_revenue")} value="5.38B đ" helper={t("gross_helper")} />
        <FinanceSummaryCard label={t("platform_fee")} value="269M đ" helper={t("platform_helper")} />
        <FinanceSummaryCard label={t("next_payout")} value="2.071B đ" helper={t("next_payout_helper")} />
      </div>
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.finance}
          rows={FINANCE_ROWS}
          columns={[
            { key: "batch", label: t("col_batch") },
            { key: "period", label: t("col_period") },
            { key: "gross", label: t("col_gross"), align: "right" },
            { key: "fee", label: t("col_fee"), align: "right" },
            { key: "payout", label: t("col_payout"), align: "right" },
            { key: "status", label: t("col_status") },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
    </div>
  );
}
