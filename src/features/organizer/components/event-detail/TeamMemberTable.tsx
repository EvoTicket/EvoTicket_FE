import {
  EVENT_DETAIL_STATE,
  TEAM_MEMBERS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { OrganizerDataTable } from "../common/OrganizerDataTable";
import { useTranslations } from "next-intl";

export function TeamMemberTable() {
  const t = useTranslations("Organizer.EventDetail.Team");

  return (
    <OrganizerDataTable
      state={EVENT_DETAIL_STATE.team}
      rows={TEAM_MEMBERS}
      columns={[
        { key: "name", label: t("col_member") },
        { key: "email", label: t("col_email") },
        { key: "role", label: t("col_role") },
        { key: "permissions", label: t("col_permissions") },
        { key: "status", label: t("col_status") },
      ]}
      emptyMessage={t("empty")}
    />
  );
}
