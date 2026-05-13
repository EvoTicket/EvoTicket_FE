"use client";

import { Calendar, MapPin, Users, Settings, Edit3, Eye, Copy, Archive, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";
import {
  eventStatusTone,
  eventStatusLabel,
  saleStatusTone,
  eventModeTone,
} from "@/src/features/organizer/constants/organizerStatusMapping";
import type { OrgFixtureEvent } from "@/src/features/organizer/types/organizer";

interface OrganizerEventCardProps {
  event: OrgFixtureEvent;
  /** Base path for event links, e.g. "/vi/organizer/events" */
  basePath: string;
  isLast?: boolean;
}

function ActionIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border-default)] bg-transparent text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)]"
    >
      {children}
    </button>
  );
}

/**
 * Table-row style event card matching the Figma design.
 * 7-column grid: Event | Date & Venue | Status | Tickets | Revenue | Checker | Actions
 */
export function OrganizerEventCard({ event, basePath, isLast }: OrganizerEventCardProps) {
  const percent =
    event.sold != null && event.total
      ? Math.round((event.sold / event.total) * 100)
      : 0;

  return (
    <div
      className="grid items-center gap-4 px-5 py-4"
      style={{
        gridTemplateColumns: "minmax(280px,2.2fr) 1.1fr 1.2fr 1fr 0.9fr 0.9fr auto",
        borderBottom: isLast
          ? "none"
          : "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Event info */}
      <a
        href={`${basePath}/${event.id}/overview`}
        className="flex min-w-0 items-center gap-3 rounded-md p-1 text-left transition-colors hover:bg-[var(--color-bg-elevated)]"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <Image
            src={event.thumbnailUrl}
            alt={event.title}
            width={56}
            height={56}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
            {event.title}
          </span>
          <div className="flex items-center gap-1.5">
            <OrganizerStatusBadge tone="neutral">{event.categoryName}</OrganizerStatusBadge>
            <OrganizerStatusBadge tone={eventModeTone(event.mode)}>{event.mode}</OrganizerStatusBadge>
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {event.updatedLabel}
          </span>
        </div>
      </a>

      {/* Date & venue */}
      <div className="flex flex-col gap-1 text-xs">
        <span className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
          <Calendar size={12} className="text-[var(--color-icon-muted)]" />
          {event.dateLabel}
        </span>
        <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
          <MapPin size={12} className="text-[var(--color-icon-muted)]" />
          {event.venue}
        </span>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <OrganizerStatusBadge tone={eventStatusTone(event.eventStatus)}>
          {eventStatusLabel(event.eventStatus)}
        </OrganizerStatusBadge>
        <OrganizerStatusBadge tone={saleStatusTone(event.saleStatus)}>
          {event.saleStatus}
        </OrganizerStatusBadge>
      </div>

      {/* Tickets */}
      <div className="flex flex-col gap-1">
        {event.sold == null ? (
          <span className="text-[13px] text-[var(--color-text-muted)]">—</span>
        ) : (
          <>
            <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
              {event.sold.toLocaleString()} / {event.total?.toLocaleString()}
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-badge-neutral-bg)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percent}%`,
                  background:
                    percent >= 70
                      ? "var(--color-feedback-success-icon)"
                      : "var(--color-action-brand-bg-default)",
                }}
              />
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {percent}% đã bán
            </span>
          </>
        )}
      </div>

      {/* Revenue */}
      <div className="text-[13px] font-medium text-[var(--color-text-primary)]">
        {event.revenue}
      </div>

      {/* Checker */}
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
        <Users size={13} className="text-[var(--color-icon-muted)]" />
        {event.checkerCount}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <ActionIcon label="Quản trị sự kiện"><Settings size={14} /></ActionIcon>
        <ActionIcon label="Chỉnh sửa"><Edit3 size={14} /></ActionIcon>
        <ActionIcon label="Xem trang public"><Eye size={14} /></ActionIcon>
        <ActionIcon label="Nhân bản"><Copy size={14} /></ActionIcon>
        <ActionIcon label="Lưu trữ"><Archive size={14} /></ActionIcon>
        <ActionIcon label="Thêm"><MoreHorizontal size={14} /></ActionIcon>
      </div>
    </div>
  );
}
