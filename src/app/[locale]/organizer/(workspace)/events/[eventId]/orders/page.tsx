import {
  EVENT_DETAIL_STATE,
  ORDERS,
  OVERVIEW_METRICS,
} from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { EventKpiGrid } from "@/src/components/organizer/EventKpiGrid";
import { EventSectionPanel } from "@/src/components/organizer/EventSectionPanel";
import { OrganizerDataTable } from "@/src/components/organizer/OrganizerDataTable";

export default function EventOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={[OVERVIEW_METRICS[0], OVERVIEW_METRICS[1], { label: "Refund pending", value: "4", helper: "Cần xử lý", tone: "warning" }]} />
      <EventSectionPanel title="Orders & Transactions" subtitle="Đơn hàng, thanh toán và trạng thái mint vé">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.orders}
          rows={ORDERS}
          columns={[
            { key: "id", label: "Order" },
            { key: "buyer", label: "Người mua" },
            { key: "summary", label: "Vé" },
            { key: "total", label: "Tổng", align: "right" },
            { key: "method", label: "Cổng" },
            { key: "payment", label: "Thanh toán" },
            { key: "mint", label: "Mint" },
          ]}
          emptyMessage="Chưa có đơn hàng nào cho sự kiện này."
        />
      </EventSectionPanel>
    </div>
  );
}
