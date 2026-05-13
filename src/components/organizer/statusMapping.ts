/**
 * Centralised status-to-token mapping for all organizer badges.
 * Uses Figma token CSS classes — no hardcoded hex colours.
 */

export type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "brand"
  | "accent";

/** Tailwind class set for one badge tone. */
export interface ToneClasses {
  bg: string;
  text: string;
  border: string;
}

/**
 * Maps a `StatusTone` to the correct Figma badge token classes.
 * These classes resolve to CSS variables defined in figma-tokens.css.
 */
export function toneClasses(tone: StatusTone): ToneClasses {
  switch (tone) {
    case "success":
      return {
        bg: "bg-[var(--color-badge-success-bg)]",
        text: "text-[var(--color-badge-success-text)]",
        border: "border-[var(--color-badge-success-border)]",
      };
    case "warning":
      return {
        bg: "bg-[var(--color-badge-warning-bg)]",
        text: "text-[var(--color-badge-warning-text)]",
        border: "border-[var(--color-badge-warning-border)]",
      };
    case "error":
      return {
        bg: "bg-[var(--color-badge-error-bg)]",
        text: "text-[var(--color-badge-error-text)]",
        border: "border-[var(--color-badge-error-border)]",
      };
    case "info":
      return {
        bg: "bg-[var(--color-badge-info-bg)]",
        text: "text-[var(--color-badge-info-text)]",
        border: "border-[var(--color-badge-info-border)]",
      };
    case "brand":
      return {
        bg: "bg-[var(--color-badge-brand-bg)]",
        text: "text-[var(--color-badge-brand-text)]",
        border: "border-[var(--color-badge-brand-border)]",
      };
    case "accent":
      return {
        bg: "bg-[var(--color-badge-accent-bg)]",
        text: "text-[var(--color-badge-accent-text)]",
        border: "border-[var(--color-badge-accent-border)]",
      };
    case "neutral":
    default:
      return {
        bg: "bg-[var(--color-badge-neutral-bg)]",
        text: "text-[var(--color-badge-neutral-text)]",
        border: "border-[var(--color-badge-neutral-border)]",
      };
  }
}

/* ── Event-status helpers ─────────────────────────────────── */

import type { OrgEventStatus, SaleStatus, EventMode } from "@/src/app/[locale]/organizer/_fixtures/events";

export function eventStatusTone(s: OrgEventStatus): StatusTone {
  switch (s) {
    case "ON_SALE":
    case "APPROVED":
      return "success";
    case "PENDING_REVIEW":
      return "warning";
    case "DRAFT":
      return "neutral";
    case "COMPLETED":
      return "info";
    case "CANCELLED":
    case "REJECTED":
      return "error";
    default:
      return "neutral";
  }
}

export function eventStatusLabel(s: OrgEventStatus): string {
  switch (s) {
    case "ON_SALE":
      return "Published";
    case "APPROVED":
      return "Approved";
    case "PENDING_REVIEW":
      return "Pending review";
    case "DRAFT":
      return "Draft";
    case "COMPLETED":
      return "Ended";
    case "CANCELLED":
      return "Cancelled";
    case "REJECTED":
      return "Rejected";
    default:
      return s;
  }
}

export function saleStatusTone(s: SaleStatus): StatusTone {
  switch (s) {
    case "On sale":
      return "success";
    case "Not on sale":
      return "warning";
    case "Draft":
      return "neutral";
    case "Closed":
      return "neutral";
    default:
      return "neutral";
  }
}

export function eventModeTone(m: EventMode): StatusTone {
  switch (m) {
    case "Offline":
      return "brand";
    case "Online":
      return "info";
    case "Hybrid":
      return "accent";
    default:
      return "neutral";
  }
}
