"use client";

import { OrganizerSidebar } from "./OrganizerSidebar";
import { OrganizerHeader } from "./OrganizerHeader";

interface OrganizerPageShellProps {
  children: React.ReactNode;
}

/**
 * Shared wrapper for all 4 Organizer Hub pages.
 * Renders the sidebar + top header + scrollable content area.
 */
export function OrganizerPageShell({ children }: OrganizerPageShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-page)]">
      <OrganizerSidebar />
      <div className="ml-[280px] flex flex-1 flex-col">
        <OrganizerHeader />
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
