import type { ReactNode } from "react";
import { OrganizerWorkspaceLayout } from "@/src/features/organizer/components/shell/OrganizerWorkspaceLayout";

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizerWorkspaceLayout>{children}</OrganizerWorkspaceLayout>;
}
