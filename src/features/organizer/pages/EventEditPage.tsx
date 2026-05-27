import { EventEditForm } from "@/src/features/organizer/components/event-detail/EventEditForm";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { useTranslations } from "next-intl";

export default function EventEditPage() {
  const t = useTranslations("Organizer.EventDetail.Edit");

  return (
    <div className="flex flex-col gap-6">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <EventEditForm />
      </EventSectionPanel>
    </div>
  );
}
