"use client";

import { toneClasses, type StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";

interface OrganizerStatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

/**
 * Pill-shaped status badge using Figma badge tokens.
 * Works across all Organizer pages for event status, sale status, mode, etc.
 */
export function OrganizerStatusBadge({
  tone,
  children,
  className = "",
}: OrganizerStatusBadgeProps) {
  const tc = toneClasses(tone);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-snug ${tc.bg} ${tc.text} ${tc.border} ${className}`}
    >
      {children}
    </span>
  );
}
