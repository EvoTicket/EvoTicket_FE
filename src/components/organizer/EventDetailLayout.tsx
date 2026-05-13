"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  ExternalLink,
  MapPin,
  Pencil,
} from "lucide-react";
import { EVENT_DETAIL } from "@/src/app/[locale]/organizer/_fixtures/eventDetail";
import { OrganizerStatusBadge } from "./OrganizerStatusBadge";

type EventDetailLayoutProps = {
  children: ReactNode;
};

export function EventDetailLayout({ children }: EventDetailLayoutProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "vi";
  const eventId = (params?.eventId as string) ?? EVENT_DETAIL.id;
  const basePath = `/${locale}/organizer/events/${eventId}`;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-border-subtle bg-bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                Event workspace
                <OrganizerStatusBadge tone={EVENT_DETAIL.statusTone}>
                  {EVENT_DETAIL.status}
                </OrganizerStatusBadge>
                <span>ID #{eventId}</span>
              </div>
              <h1 className="truncate text-2xl font-semibold text-text-primary">
                {EVENT_DETAIL.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-md border border-border-default bg-transparent px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-elevated">
              <ExternalLink size={15} />
              Mở trang public
            </button>
            <Link
              href={`${basePath}/edit`}
              className="flex items-center gap-2 rounded-md border border-action-brand-bg-hover bg-action-brand-bg-default px-3 py-2 text-sm font-medium text-action-brand-text-default transition-colors hover:bg-action-brand-bg-hover"
            >
              <Pencil size={15} />
              Chỉnh sửa sự kiện
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border-subtle px-5 py-4 text-sm text-text-secondary">
          <span className="flex items-center gap-2">
            <Calendar size={15} className="text-icon-muted" />
            {EVENT_DETAIL.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-icon-muted" />
            {EVENT_DETAIL.venue}
          </span>
          <span>{EVENT_DETAIL.categoryName}</span>
          <span>{EVENT_DETAIL.sold} / {EVENT_DETAIL.capacity} vé</span>
          <span>{EVENT_DETAIL.settlementStatus}</span>
        </div>
      </section>

      {children}
    </div>
  );
}
