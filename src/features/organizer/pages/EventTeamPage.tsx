import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { TeamMemberTable } from "@/src/features/organizer/components/event-detail/TeamMemberTable";
import { useTranslations } from "next-intl";

export default function EventTeamPage() {
  const t = useTranslations("Organizer.EventDetail.Team");

  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <TeamMemberTable />
      </EventSectionPanel>
    </div>
  );
}
