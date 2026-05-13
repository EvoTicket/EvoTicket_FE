import {
  EVENT_DETAIL_STATE,
  FINANCE_ROWS,
} from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { EventSectionPanel } from "@/src/components/organizer/EventSectionPanel";
import { FinanceSummaryCard } from "@/src/components/organizer/FinanceSummaryCard";
import { OrganizerDataTable } from "@/src/components/organizer/OrganizerDataTable";

export default function EventFinancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceSummaryCard label="Gross revenue" value="5.38B đ" helper="Bao gồm phí dịch vụ người mua" />
        <FinanceSummaryCard label="Platform fee" value="269M đ" helper="5% trên doanh thu vé" />
        <FinanceSummaryCard label="Next payout" value="2.071B đ" helper="Dự kiến T+7 sau sự kiện" />
      </div>
      <EventSectionPanel title="Finance & Settlement" subtitle="Batch đối soát, phí nền tảng và payout">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.finance}
          rows={FINANCE_ROWS}
          columns={[
            { key: "batch", label: "Batch" },
            { key: "period", label: "Kỳ" },
            { key: "gross", label: "Gross", align: "right" },
            { key: "fee", label: "Fee", align: "right" },
            { key: "payout", label: "Payout", align: "right" },
            { key: "status", label: "Trạng thái" },
          ]}
          emptyMessage="Chưa có batch settlement nào."
        />
      </EventSectionPanel>
    </div>
  );
}
