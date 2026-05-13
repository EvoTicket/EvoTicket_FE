import type {
  EventTableColumn,
  FixtureState,
} from "@/src/features/organizer/types/organizer";
import { OrganizerStatusBadge } from "../common/OrganizerStatusBadge";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";

type TableRow = Record<string, string | StatusTone>;

type OrganizerDataTableProps<T extends TableRow> = {
  columns: EventTableColumn<T>[];
  rows: T[];
  state: FixtureState;
  emptyMessage?: string;
  errorMessage?: string;
};

function alignClass(align?: "left" | "right" | "center") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function OrganizerDataTable<T extends TableRow>({
  columns,
  rows,
  state,
  emptyMessage = "Chưa có dữ liệu.",
  errorMessage = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
}: OrganizerDataTableProps<T>) {
  if (state === "loading") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-md bg-bg-elevated"
          />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-lg border border-feedback-error-border bg-feedback-error-bg p-5 text-sm text-feedback-error-text">
        {errorMessage}
      </div>
    );
  }

  if (state === "empty" || rows.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center text-sm text-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-bg-elevated text-[11px] uppercase tracking-wide text-text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`border-b border-border-subtle px-4 py-3 font-medium ${alignClass(
                    column.align
                  )}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={String(row.id ?? row.ticket ?? row.name ?? row.batch ?? index)}
                className="border-b border-border-subtle last:border-b-0"
              >
                {columns.map((column) => {
                  const value = row[column.key as keyof T];
                  const isStatus = column.key === "status" || column.key === "payment";
                  return (
                    <td
                      key={String(column.key)}
                      className={`px-4 py-3 text-text-secondary ${alignClass(
                        column.align
                      )}`}
                    >
                      {isStatus && row.tone ? (
                        <OrganizerStatusBadge tone={row.tone as StatusTone}>
                          {String(value)}
                        </OrganizerStatusBadge>
                      ) : (
                        <span className="text-text-primary">{String(value)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
