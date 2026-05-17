import {
  EVENT_DETAIL_STATE,
  TEAM_MEMBERS,
} from "@/src/features/organizer/fixtures/eventDetail";
import { OrganizerDataTable } from "../common/OrganizerDataTable";

export function TeamMemberTable() {
  return (
    <OrganizerDataTable
      state={EVENT_DETAIL_STATE.team}
      rows={TEAM_MEMBERS}
      columns={[
        { key: "name", label: "Thành viên" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò" },
        { key: "permissions", label: "Quyền" },
        { key: "status", label: "Trạng thái" },
      ]}
      emptyMessage="Chưa có thành viên nào trong event workspace."
    />
  );
}
