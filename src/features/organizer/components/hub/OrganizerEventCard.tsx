"use client";

import { Archive, Calendar, Copy, Edit3, Eye, MapPin, MoreHorizontal, Settings, Users } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";
import {
  eventStatusTone,
  eventStatusLabel,
  eventModeTone,
} from "@/src/features/organizer/constants/organizerStatusMapping";
import type { OrgFixtureEvent } from "@/src/features/organizer/types/organizer";
import { useTranslations } from "next-intl";

interface OrganizerEventCardProps {
  event: OrgFixtureEvent;
  /** Base path for event links, e.g. "/vi/organizer/events" */
  basePath: string;
  isLast?: boolean;
}

const EVENT_TABLE_GRID =
  "minmax(220px,2.2fr) minmax(160px,1.35fr) minmax(110px,0.75fr) minmax(120px,0.9fr) minmax(96px,0.7fr) 64px 112px";

function ActionIcon({ label, children, onClick, as: Component = "button", href }: { label: string; children: React.ReactNode; onClick?: () => void; as?: any; href?: string }) {
  const props = Component === "a" ? { href } : { onClick, type: "button" };
  return (
    <Component
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-ds-md border border-[var(--color-border-default)] bg-transparent text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)]"
      {...props}
    >
      {children}
    </Component>
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
  const displayStatusLabel =
    event.displayStatusLabel ?? eventStatusLabel(event.eventStatus);
  const displayStatusTone =
    event.displayStatusTone ?? eventStatusTone(event.eventStatus);
  const t = useTranslations("Organizer.EventCard");

  return (
    <div
      className="grid min-w-[980px] items-center gap-4 px-5 py-4"
      style={{
        gridTemplateColumns: EVENT_TABLE_GRID,
        borderBottom: isLast
          ? "none"
          : "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Event info */}
      <a
        href={event.eventStatus === "DRAFT" ? `${basePath}/create?draftId=${event.id}` : `${basePath}/${event.id}/overview`}
        className="flex min-w-0 items-center gap-3 rounded-ds-md p-1 text-left transition-colors hover:bg-[var(--color-bg-elevated)]"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
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
      <div className="flex min-w-0 flex-col gap-1 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 text-[var(--color-text-primary)]">
          <Calendar size={12} className="text-[var(--color-icon-muted)]" />
          <span className="truncate">{event.dateLabel}</span>
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-[var(--color-text-secondary)]">
          <MapPin size={12} className="text-[var(--color-icon-muted)]" />
          <span className="truncate">{event.venue}</span>
        </span>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <OrganizerStatusBadge tone={displayStatusTone}>
          {displayStatusLabel}
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
              {t("soldPercent", { percent })}
            </span>
          </>
        )}
      </div>

      {/* Revenue */}
      <div className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
        {event.revenue}
      </div>

      {/* Checker */}
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
        <Users size={13} className="text-[var(--color-icon-muted)]" />
        {event.checkerCount}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <ActionIcon label={t("manageEvent")}><Settings size={14} /></ActionIcon>
        
        {event.eventStatus === "DRAFT" ? (
          <ActionIcon as="a" href={`${basePath}/create?draftId=${event.id}`} label={t("editDraft")}>
            <Edit3 size={14} />
          </ActionIcon>
        ) : (
          <ActionIcon label={t("edit")}>
            <Edit3 size={14} />
          </ActionIcon>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={t("moreActions")}
              className="flex h-8 w-8 items-center justify-center rounded-ds-md border border-[var(--color-border-default)] bg-transparent text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
          >
            <DropdownMenuItem className="cursor-pointer">
              <Eye size={14} />
              {t("viewPublic")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Copy size={14} />
              {t("duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-[var(--color-feedback-error-text)]">
              <Archive size={14} />
              {t("archive")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
