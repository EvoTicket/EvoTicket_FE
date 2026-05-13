import {
  OVERVIEW_METRICS,
  OVERVIEW_SNAPSHOTS,
  RECENT_ACTIVITY,
} from "@/src/features/organizer/fixtures/eventDetail";
import { EventKpiGrid } from "@/src/features/organizer/components/event-detail/EventKpiGrid";
import { EventSectionPanel } from "@/src/features/organizer/components/event-detail/EventSectionPanel";
import { OrganizerStatusBadge } from "@/src/features/organizer/components/common/OrganizerStatusBadge";

export default function EventOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <EventKpiGrid metrics={OVERVIEW_METRICS} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {OVERVIEW_SNAPSHOTS.map((snapshot) => (
          <EventSectionPanel
            key={snapshot.title}
            title={snapshot.title}
            subtitle="Tình trạng vận hành hiện tại"
          >
            <div className="flex flex-col gap-3">
              {snapshot.rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-elevated px-3 py-2"
                >
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className="text-sm font-medium text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </EventSectionPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <EventSectionPanel title="Hoạt động gần đây" subtitle="Luồng sự kiện vận hành theo thời gian thực">
          <div className="flex flex-col divide-y divide-border-subtle">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.event} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <div className="font-medium text-text-primary">{item.event}</div>
                  <div className="mt-1 text-sm text-text-muted">{item.meta}</div>
                </div>
                <div className="flex items-center gap-3">
                  <OrganizerStatusBadge tone={item.tone}>Live</OrganizerStatusBadge>
                  <span className="whitespace-nowrap text-xs text-text-muted">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </EventSectionPanel>

        <EventSectionPanel title="Truy cập nhanh" subtitle="Chuyển sang các màn hình vận hành khác">
          <div className="grid gap-2">
            {[
              "Event Analytics",
              "Orders & Transactions",
              "Attendees & Tickets",
              "Check-in Management",
              "Voucher & Promotion",
              "Event Finance & Settlement",
            ].map((label) => (
              <div key={label} className="rounded-md border border-border-subtle bg-bg-elevated px-3 py-3 text-sm font-medium text-text-primary">
                {label}
              </div>
            ))}
          </div>
        </EventSectionPanel>
      </div>
    </div>
  );
}
