import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { TeamMemberTable } from "@/src/features/organizer/components/event-detail/TeamMemberTable";

export default function EventTeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title="Team & Permissions" subtitle="Phân quyền theo event cho editor, finance và checker manager">
        <TeamMemberTable />
      </EventSectionPanel>
    </div>
  );
}
