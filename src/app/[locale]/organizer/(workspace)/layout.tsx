import type { ReactNode } from "react";
import { OrganizerWorkspaceLayout } from "@/src/components/organizer/OrganizerWorkspaceLayout";

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizerWorkspaceLayout>{children}</OrganizerWorkspaceLayout>;
}
