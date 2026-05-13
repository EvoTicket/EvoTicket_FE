import {
  CHECKER_STAFF,
  EVENT_DETAIL_STATE,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";

export default function CheckerStaffPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title="Checker Staff" subtitle="Nhân sự kiểm soát vé và thiết bị đang hoạt động">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE["checker-staff"]}
          rows={CHECKER_STAFF}
          columns={[
            { key: "name", label: "Nhân sự" },
            { key: "role", label: "Vai trò" },
            { key: "gate", label: "Gate" },
            { key: "device", label: "Thiết bị" },
            { key: "status", label: "Trạng thái" },
          ]}
          emptyMessage="Chưa có checker staff nào."
        />
      </EventSectionPanel>
    </div>
  );
}
