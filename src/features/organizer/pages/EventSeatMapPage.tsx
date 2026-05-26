import {
  EVENT_DETAIL_STATE,
  SEAT_ZONES,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerDataTable } from "@/src/features/organizer/components/common/OrganizerDataTable";
import { SeatMapPreview } from "@/src/features/organizer/components/event-detail/SeatMapPreview";
import { useTranslations } from "next-intl";

export default function EventSeatMapPage() {
  const t = useTranslations("Organizer.EventDetail.SeatMap");

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <EventSectionPanel title={t("title")} subtitle={t("subtitle")}>
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE["seat-map"]}
          rows={SEAT_ZONES}
          columns={[
            { key: "zone", label: t("col_zone") },
            { key: "capacity", label: t("col_capacity"), align: "right" },
            { key: "sold", label: t("col_sold"), align: "right" },
            { key: "held", label: t("col_held"), align: "right" },
            { key: "blocked", label: t("col_blocked"), align: "right" },
            { key: "price", label: t("col_price"), align: "right" },
          ]}
          emptyMessage={t("empty")}
        />
      </EventSectionPanel>
      <EventSectionPanel title={t("preview_title")} subtitle={t("preview_subtitle")}>
        <SeatMapPreview />
      </EventSectionPanel>
    </div>
  );
}
