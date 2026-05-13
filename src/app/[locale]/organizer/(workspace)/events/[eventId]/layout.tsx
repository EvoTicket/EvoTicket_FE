import type { ReactNode } from "react";
import { EventDetailLayout } from "@/src/components/organizer/EventDetailLayout";

export default function EventWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <EventDetailLayout>{children}</EventDetailLayout>;
}
