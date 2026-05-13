import { EVENT_DETAIL } from "@/src/app/[locale]/organizer/_fixtures/eventDetail";

export function EventEditForm() {
  return (
    <form className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        Tên sự kiện
        <input
          defaultValue={EVENT_DETAIL.title}
          className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        Danh mục
        <input
          defaultValue={EVENT_DETAIL.categoryName}
          className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        Thời gian
        <input
          defaultValue={EVENT_DETAIL.dateLabel}
          className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        Địa điểm
        <input
          defaultValue={EVENT_DETAIL.venue}
          className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary lg:col-span-2">
        Địa chỉ
        <input
          defaultValue={EVENT_DETAIL.address}
          className="rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary lg:col-span-2">
        Ghi chú submit duyệt
        <textarea
          rows={4}
          defaultValue="Cập nhật layout sân khấu, xác nhận lại rule resale và thông tin gate."
          className="resize-y rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <div className="flex justify-end gap-2 lg:col-span-2">
        <button
          type="button"
          className="rounded-md border border-border-default bg-transparent px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          className="rounded-md border border-action-brand-bg-hover bg-action-brand-bg-default px-4 py-2 text-sm font-medium text-action-brand-text-default hover:bg-action-brand-bg-hover"
        >
          Gửi duyệt thay đổi
        </button>
      </div>
    </form>
  );
}
