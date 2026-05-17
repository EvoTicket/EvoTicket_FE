import type { ReactNode } from "react";
import { EventDetailLayout } from "@/src/features/organizer/components/event-detail/EventDetailLayout";

export default function EventWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <EventDetailLayout>{children}</EventDetailLayout>;
}
