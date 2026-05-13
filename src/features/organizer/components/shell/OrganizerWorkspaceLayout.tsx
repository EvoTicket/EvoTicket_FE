"use client";

import type { ReactNode } from "react";
import { OrganizerHeader } from "./OrganizerHeader";
import { OrganizerSidebar } from "./OrganizerSidebar";

type OrganizerWorkspaceLayoutProps = {
  children: ReactNode;
};

export function OrganizerWorkspaceLayout({
  children,
}: OrganizerWorkspaceLayoutProps) {
  return (
    <div className="h-screen min-h-0 bg-bg-page text-text-primary">
      <OrganizerSidebar />

      <div className="ml-[280px] flex h-screen min-h-0 min-w-0 flex-col">
        <OrganizerHeader />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
