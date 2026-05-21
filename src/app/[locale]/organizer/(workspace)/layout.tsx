import type { ReactNode } from "react";
import { OrganizerWorkspaceLayout } from "@/src/features/organizer/components/shell/OrganizerWorkspaceLayout";
import { RoleGuard } from "@/src/components/RoleGuard";

export default function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard requireOrganizer>
      <OrganizerWorkspaceLayout>{children}</OrganizerWorkspaceLayout>
    </RoleGuard>
  );
}
