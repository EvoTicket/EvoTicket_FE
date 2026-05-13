import {
  EVENT_DETAIL_STATE,
  VOUCHERS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";

export default function EventVouchersPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title="Voucher & Promotion" subtitle="Chiến dịch mã giảm giá và giới hạn sử dụng">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.vouchers}
          rows={VOUCHERS}
          columns={[
            { key: "code", label: "Code" },
            { key: "campaign", label: "Campaign" },
            { key: "discount", label: "Discount" },
            { key: "used", label: "Used", align: "right" },
            { key: "status", label: "Trạng thái" },
          ]}
          emptyMessage="Chưa có voucher nào cho sự kiện này."
        />
      </EventSectionPanel>
    </div>
  );
}
