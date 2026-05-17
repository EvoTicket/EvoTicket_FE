import { EventEditForm } from "@/src/features/organizer/components/event-detail/EventEditForm";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";

export default function EventEditPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title="Event Edit" subtitle="Cập nhật thông tin sự kiện và gửi lại để admin review nếu cần">
        <EventEditForm />
      </EventSectionPanel>
    </div>
  );
}
