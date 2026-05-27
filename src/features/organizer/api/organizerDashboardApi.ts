import api from "@/src/lib/axios";
import { unwrapBaseResponse } from "./helpers";
import type { BaseResponse, OrganizerDashboardMetricsResponse, ExportReportRequest } from "../types/api";

const MIME_MAP: Record<string, string> = {
  CSV: "text/csv",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PDF: "application/pdf",
};

const EXT_MAP: Record<string, string> = {
  CSV: "csv",
  XLSX: "xlsx",
  PDF: "pdf",
};

export const organizerDashboardApi = {
  async getDashboard(days = 30): Promise<OrganizerDashboardMetricsResponse> {
    const response = await api.get<BaseResponse<OrganizerDashboardMetricsResponse>>(
      "/inventory-service/api/v1/dashboard/organizer",
      {
        params: { days },
      }
    );

    return unwrapBaseResponse(response.data);
  },

  /**
   * Export organizer report.
   * Backend returns a binary file — we trigger a browser download automatically.
   *
   * Sample requests:
   *
   * CSV:
   *   POST /inventory-service/api/v1/dashboard/organizer/export
   *   { format: "CSV", days: 30, sections: ["summary","revenue"], separator: ",", includeHeaders: true }
   *
   * XLSX:
   *   POST /inventory-service/api/v1/dashboard/organizer/export
   *   { format: "XLSX", days: 30, sections: ["summary","revenue","tickets"], includeHeaders: true }
   *
   * PDF:
   *   POST /inventory-service/api/v1/dashboard/organizer/export
   *   { format: "PDF", days: 60, sections: ["summary","checkin","resale"] }
   */
  async exportReport(payload: ExportReportRequest): Promise<void> {
    // Strip CSV-only fields when format is not CSV
    const body: ExportReportRequest = { ...payload };
    if (body.format !== "CSV") {
      delete body.separator;
    }
    if (body.format === "PDF") {
      delete body.includeHeaders;
    }

    const response = await api.post(
      "/inventory-service/api/v1/dashboard/organizer/export",
      body,
      { responseType: "blob" }
    );

    // Build filename: evoticket-report-2026-05-21.csv
    const date = new Date().toISOString().split("T")[0];
    const ext = EXT_MAP[payload.format] ?? "bin";
    const filename = `evoticket-report-${date}.${ext}`;

    // Trigger browser download
    const mime = MIME_MAP[payload.format] ?? "application/octet-stream";
    const blob = new Blob([response.data as BlobPart], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
