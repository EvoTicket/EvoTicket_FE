import {
  EVENT_DETAIL_STATE,
  SEAT_ZONES,
} from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { EventSectionPanel } from "@/src/components/organizer/EventSectionPanel";
import { OrganizerDataTable } from "@/src/components/organizer/OrganizerDataTable";
import { SeatMapPreview } from "@/src/components/organizer/SeatMapPreview";

export default function EventSeatMapPage() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <EventSectionPanel title="Seat Map Management" subtitle="Quản lý khu vực, holds, blocked seats và pricing zone">
        <OrganizerDataTable
          state={EVENT_DETAIL_STATE["seat-map"]}
          rows={SEAT_ZONES}
          columns={[
            { key: "zone", label: "Zone" },
            { key: "capacity", label: "Sức chứa", align: "right" },
            { key: "sold", label: "Đã bán", align: "right" },
            { key: "held", label: "Held", align: "right" },
            { key: "blocked", label: "Blocked", align: "right" },
            { key: "price", label: "Giá", align: "right" },
          ]}
        />
      </EventSectionPanel>
      <EventSectionPanel title="Seat map preview" subtitle="Tổng quan tỷ lệ lấp đầy">
        <SeatMapPreview />
      </EventSectionPanel>
    </div>
  );
}
