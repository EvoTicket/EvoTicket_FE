import { EVENT_DETAIL } from "@/src/features/organizer/fixtures/eventDetail";
import { useTranslations } from "next-intl";

export function EventEditForm() {
  const t = useTranslations("Organizer.EventDetail.Edit");

  return (
    <form className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        {t("form_name")}
        <input
          defaultValue={EVENT_DETAIL.title}
          className="rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        {t("form_category")}
        <input
          defaultValue={EVENT_DETAIL.categoryName}
          className="rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        {t("form_time")}
        <input
          defaultValue={EVENT_DETAIL.dateLabel}
          className="rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary">
        {t("form_venue")}
        <input
          defaultValue={EVENT_DETAIL.venue}
          className="rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary lg:col-span-2">
        {t("form_address")}
        <input
          defaultValue={EVENT_DETAIL.address}
          className="rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-text-secondary lg:col-span-2">
        {t("form_notes")}
        <textarea
          rows={4}
          defaultValue=""
          placeholder={t("form_notes_placeholder")}
          className="resize-y rounded-ds-md border border-border-default bg-bg-elevated px-3 py-2 text-text-primary outline-none focus:border-field-border-focus"
        />
      </label>
      <div className="flex justify-end gap-2 lg:col-span-2">
        <button
          type="button"
          className="rounded-ds-md border border-border-default bg-transparent px-4 py-2 text-sm text-text-primary hover:bg-bg-elevated"
        >
          {t("save_draft")}
        </button>
        <button
          type="button"
          className="rounded-ds-md border border-action-brand-bg-hover bg-action-brand-bg-default px-4 py-2 text-sm font-medium text-action-brand-text-default hover:bg-action-brand-bg-hover"
        >
          {t("submit_review")}
        </button>
      </div>
    </form>
  );
}
