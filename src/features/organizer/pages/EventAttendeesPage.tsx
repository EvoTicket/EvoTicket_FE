import {
  ATTENDEES,
  EVENT_DETAIL_STATE,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";

export default function EventAttendeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title="Attendees & Tickets" subtitle="Danh sách chủ vé, quyền sở hữu và trạng thái check-in">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE.attendees}
          rows={ATTENDEES}
          columns={[
            { key: "ticket", label: "Ticket ID" },
            { key: "holder", label: "Người giữ vé" },
            { key: "type", label: "Loại vé" },
            { key: "status", label: "Trạng thái" },
            { key: "checkin", label: "Check-in" },
            { key: "resale", label: "Resale" },
          ]}
          emptyMessage="Chưa có vé nào được phát hành."
        />
      </EventSectionPanel>
    </div>
  );
}
