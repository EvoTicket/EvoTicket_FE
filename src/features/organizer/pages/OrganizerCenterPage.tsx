"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { OrganizerTabs } from "@/src/features/organizer/components/hub/OrganizerTabs";
import { OrganizerToolbar } from "@/src/features/organizer/components/common/OrganizerToolbar";
import { OrganizerMetricCard } from "@/src/features/organizer/components/common/OrganizerMetricCard";
import { OrganizerEventCard } from "@/src/features/organizer/components/hub/OrganizerEventCard";
import { OrganizerEmptyState } from "@/src/features/organizer/components/common/OrganizerEmptyState";
import {
  FIXTURE_EVENTS,
  FIXTURE_TABS,
  FIXTURE_SUMMARY,
  FIXTURE_PAGE_STATE,
} from "@/src/features/organizer/fixtures/events";

const FILTER_OPTIONS = [
  { label: "Loại sự kiện" },
  { label: "Hình thức" },
  { label: "Thời gian" },
  { label: "Trạng thái" },
];

export default function OrganizerCenterPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "vi";

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      FIXTURE_EVENTS.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const basePath = `/${locale}/organizer/events`;
  const createHref = `/${locale}/organizer/events/create`;

  /* ── Loading skeleton ──────────────────────────────────── */
  if (FIXTURE_PAGE_STATE === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]"
            />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]"
          />
        ))}
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────── */
  if (FIXTURE_PAGE_STATE === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
        <div className="text-base font-medium text-[var(--color-feedback-error-text)]">
          Không thể tải dữ liệu sự kiện
        </div>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
        </p>
      </div>
    );
  }

  return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">
              Sự kiện của tôi
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              Quản lý toàn bộ sự kiện của tổ chức, từ nháp đến đã kết thúc
            </p>
          </div>
        </div>

        {/* Tabs */}
        <OrganizerTabs
          tabs={FIXTURE_TABS}
          activeKey={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Search + Filters */}
        <OrganizerToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm kiếm theo tên sự kiện"
          filters={FILTER_OPTIONS}
          onClearFilters={() => setSearch("")}
        />

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {FIXTURE_SUMMARY.map((s) => (
            <OrganizerMetricCard
              key={s.label}
              label={s.label}
              value={s.value}
              tone={s.tone}
            />
          ))}
        </div>

        {/* Event list or empty state */}
        {filtered.length === 0 || FIXTURE_PAGE_STATE === "empty" ? (
          <OrganizerEmptyState
            onClear={() => setSearch("")}
            createHref={createHref}
          />
        ) : (
          <div className="flex flex-col overflow-hidden rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
            {/* Table header */}
            <div
              className="grid items-center gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-3 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]"
              style={{
                gridTemplateColumns:
                  "minmax(280px,2.2fr) 1.1fr 1.2fr 1fr 0.9fr 0.9fr auto",
              }}
            >
              <span>Sự kiện</span>
              <span>Thời gian &amp; Địa điểm</span>
              <span>Trạng thái</span>
              <span>Vé bán ra</span>
              <span>Doanh thu</span>
              <span>Checker</span>
              <span className="text-right">Hành động</span>
            </div>

            {/* Rows */}
            {filtered.map((event, idx) => (
              <OrganizerEventCard
                key={event.id}
                event={event}
                basePath={basePath}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
  );
}
