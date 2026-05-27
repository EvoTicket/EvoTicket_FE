import { useState } from "react";
import { AlertCircle, Calendar, Edit3, LayoutGrid, Plus, Ticket, Trash2, Upload, X } from "lucide-react";
import { CreateEventState, ShowtimeInput, TicketTypeInput } from "./useCreateEventWizard";
import { getStep2Warnings, validateStep2, type StepErrors } from "./createEventValidation";
import { CustomDatePicker } from "@/src/components/ui/CustomDatePicker";
import { CustomTimePicker } from "@/src/components/ui/CustomTimePicker";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
    errors?: StepErrors;
}

const initialTicketForm: Partial<TicketTypeInput> = {
    typeName: "",
    description: "",
    price: 100000,
    isFree: false,
    quantityTotal: 100,
    minPurchase: 1,
    maxPurchase: 10,
    saleStartDate: "",
    saleEndDate: "",
    status: "AVAILABLE",
};

function parseDatetimeLocal(value: string): { date: Date | null; time: string } {
    if (!value) return { date: null, time: "" };
    const parts = value.split(/[T ]/);
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].substring(0, 5) : "00:00";
    
    if (!datePart) return { date: null, time: "" };
    const date = new Date(datePart);
    return { date: isNaN(date.getTime()) ? null : date, time: timePart };
}

function combineDateTime(date: Date | null, time: string): string {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const timeStr = time || "00:00";
    return `${yyyy}-${mm}-${dd}T${timeStr}`;
}

export function CreateEventStep2Showtimes({ formData, updateField, errors = {} }: Props) {
    const t = useTranslations("CreateEvent.Step2");
    const tValidation = useTranslations("CreateEvent.Validation");
    const { locale } = useParams();

    const formatDate = (value: string) => {
        if (!value) return t("not_set");
        return new Date(value).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN");
    };

    const formatShowtimeRange = (start: string, end: string) => {
        if (!start && !end) return t("no_time");
        const formatItem = (val: string) => {
            if (!val) return "??";
            const date = new Date(val);
            if (isNaN(date.getTime())) return "??";
            
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const mMonth = String(date.getMonth() + 1).padStart(2, "0");
            return `${hh}:${mm} ${dd}/${mMonth}`;
        };
        return `${formatItem(start)} - ${formatItem(end)}`;
    };

    const displayWarning = (msg: string) => {
        if (locale === "en") {
            if (msg.includes("kết thúc bán sau thời gian bắt đầu suất diễn")) {
                const name = msg.split('"')[1] || "A ticket type";
                return `"${name}" ends sale after the showtime starts. Please check the timeline.`;
            }
            if (msg.includes("kết thúc bán rất sát giờ diễn")) {
                const name = msg.split('"')[1] || "A ticket type";
                return `"${name}" ends sale very close to showtime. Consider extending the timeline.`;
            }
        }
        return msg;
    };

    const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>(formData.showtimes[0]?.id || "");
    const [editingShowtimeId, setEditingShowtimeId] = useState<string | null>(null);
    const [isEditingTicket, setIsEditingTicket] = useState(false);
    const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
    const [ticketDraft, setTicketDraft] = useState<Partial<TicketTypeInput>>(initialTicketForm);
    const [ticketDraftErrors, setTicketDraftErrors] = useState<StepErrors>({});

    const activeShowtime = formData.showtimes.find((showtime) => showtime.id === selectedShowtimeId) || formData.showtimes[0];
    const activeTickets = formData.ticketTypes.filter((ticket) => ticket.showtimeId === activeShowtime?.id);
    const warningMessages = getStep2Warnings(formData);
    const mergedErrors = { ...errors, ...ticketDraftErrors };

    const getTicketFieldKey = (field: keyof TicketTypeInput) => `ticket-${editingTicketId ?? "draft"}-${field}`;

    const fieldClass = (fieldKey: string) =>
        `w-full p-2 border rounded-ds-lg bg-field-bg-default text-sm outline-none ${
            mergedErrors[fieldKey]
                ? "border-feedback-error-border focus:border-feedback-error-border"
                : "border-border-default focus:border-field-border-focus"
        }`;

    const renderError = (fieldKey: string) => (
        mergedErrors[fieldKey] ? (
            <p className="mt-1 text-xs text-feedback-error-text">
                {tValidation(mergedErrors[fieldKey].replace("Validation.", ""))}
            </p>
        ) : null
    );

    const handleAddShowtime = () => {
        const newId = `st-${Date.now()}`;
        const newShowtime: ShowtimeInput = {
            id: newId,
            name: t("showtime_default_name", { index: formData.showtimes.length + 1 }),
            startDatetime: "",
            endDatetime: "",
        };
        updateField("showtimes", [...formData.showtimes, newShowtime]);
        setSelectedShowtimeId(newId);
        setEditingShowtimeId(newId);
    };

    const handleRemoveShowtime = (id: string) => {
        if (formData.showtimes.length <= 1) return;
        const nextShowtimes = formData.showtimes.filter((showtime) => showtime.id !== id);
        updateField("showtimes", nextShowtimes);
        updateField("ticketTypes", formData.ticketTypes.filter((ticket) => ticket.showtimeId !== id));
        if (selectedShowtimeId === id) {
            setSelectedShowtimeId(nextShowtimes[0].id);
        }
    };

    const handleUpdateShowtime = (id: string, field: keyof ShowtimeInput, value: string) => {
        updateField(
            "showtimes",
            formData.showtimes.map((showtime) => showtime.id === id ? { ...showtime, [field]: value } : showtime),
        );
    };

    const resetTicketEditor = () => {
        setIsEditingTicket(false);
        setEditingTicketId(null);
        setTicketDraft(initialTicketForm);
        setTicketDraftErrors({});
    };

    const startCreateTicket = () => {
        setEditingTicketId(null);
        setTicketDraft(initialTicketForm);
        setTicketDraftErrors({});
        setIsEditingTicket(true);
    };

    const startEditTicket = (ticket: TicketTypeInput) => {
        setSelectedShowtimeId(ticket.showtimeId);
        setEditingTicketId(ticket.id);
        setTicketDraft({ ...ticket, isFree: false });
        setTicketDraftErrors({});
        setIsEditingTicket(true);
    };

    const buildTicket = (id: string): TicketTypeInput => ({
        id,
        showtimeId: activeShowtime?.id ?? "",
        typeName: ticketDraft.typeName || "",
        description: ticketDraft.description || "",
        price: ticketDraft.isFree ? 0 : Number(ticketDraft.price ?? 0),
        isFree: Boolean(ticketDraft.isFree),
        quantityTotal: Number(ticketDraft.quantityTotal ?? 0),
        minPurchase: Number(ticketDraft.minPurchase ?? 1),
        maxPurchase: Number(ticketDraft.maxPurchase ?? 1),
        saleStartDate: ticketDraft.saleStartDate || "",
        saleEndDate: ticketDraft.saleEndDate || "",
        status: ticketDraft.status || "AVAILABLE",
    });

    const handleSaveTicket = () => {
        if (!activeShowtime) return;

        const draftId = editingTicketId ?? "draft";
        const draftTicket = buildTicket(draftId);
        const nextTicketTypes = editingTicketId
            ? formData.ticketTypes.map((ticket) => ticket.id === editingTicketId ? draftTicket : ticket)
            : [...formData.ticketTypes, draftTicket];
        const validation = validateStep2({ ...formData, ticketTypes: nextTicketTypes });
        const relevantErrors = Object.fromEntries(
            Object.entries(validation.errors).filter(([key]) => key.startsWith(`ticket-${draftId}-`)),
        );

        if (Object.keys(relevantErrors).length > 0) {
            setTicketDraftErrors(relevantErrors);
            return;
        }

        updateField(
            "ticketTypes",
            editingTicketId
                ? nextTicketTypes
                : nextTicketTypes.map((ticket) => ticket.id === "draft" ? { ...ticket, id: `tk-${Date.now()}` } : ticket),
        );
        resetTicketEditor();
    };

    const handleRemoveTicket = (id: string) => {
        updateField("ticketTypes", formData.ticketTypes.filter((ticket) => ticket.id !== id));
        if (editingTicketId === id) resetTicketEditor();
    };

    const handleSeatMapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            updateField("seatMapImage", file);
            updateField("seatMapPreview", url);
        }
    };

    const handleRemoveSeatMap = () => {
        updateField("seatMapImage", null);
        updateField("seatMapPreview", "");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">{t("total_tickets")}</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">
                        {formData.ticketTypes.reduce((acc, ticket) => acc + ticket.quantityTotal, 0)}
                    </span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">{t("total_ticket_types")}</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">{formData.ticketTypes.length}</span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">{t("showtimes_count")}</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">{formData.showtimes.length}</span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">{t("use_seat_map_label")}</span>
                    <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className={`w-10 h-5 rounded-full relative transition-colors ${formData.useSeatMap ? "bg-action-brand-bg-default" : "bg-border-default"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg-surface transition-transform ${formData.useSeatMap ? "translate-x-5" : ""}`} />
                            </span>
                            <span className="text-sm font-medium">{formData.useSeatMap ? t("yes") : t("no")}</span>
                            <input type="checkbox" className="sr-only" checked={formData.useSeatMap} onChange={(event) => updateField("useSeatMap", event.target.checked)} />
                        </label>
                    </div>
                </div>
            </div>

            {/* Seat Map Upload - shown when useSeatMap is enabled */}
            {formData.useSeatMap && (
                <div
                    className={`bg-bg-surface border rounded-ds-xl p-6 shadow-sm ${
                        mergedErrors.seatMapImage ? "border-feedback-error-border" : "border-border-default"
                    }`}
                    data-field="seatMapImage"
                    tabIndex={-1}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <LayoutGrid className="text-action-brand-text-default" size={18} />
                        <h3 className="text-base font-bold text-text-primary">{t("seat_map_title")}</h3>
                        <span className="ml-auto text-xs text-feedback-error-text font-medium">*</span>
                    </div>
                    <p className="text-sm text-text-muted mb-4">{t("seat_map_desc")}</p>

                    {formData.seatMapPreview ? (
                        <div className="relative group w-full rounded-ds-lg overflow-hidden border border-border-default bg-bg-subtle">
                            <img
                                src={formData.seatMapPreview}
                                alt="Seat map"
                                className="w-full max-h-[320px] object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="relative cursor-pointer flex items-center gap-2 px-4 py-2 bg-bg-surface text-text-primary rounded-ds-lg text-sm font-medium hover:bg-bg-subtle transition-colors">
                                    <Upload size={14} />
                                    {t("seat_map_change")}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSeatMapFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRemoveSeatMap}
                                    className="flex items-center gap-2 px-4 py-2 bg-feedback-error-bg text-feedback-error-text rounded-ds-lg text-sm font-medium hover:bg-feedback-error-bg/80 transition-colors"
                                >
                                    <X size={14} /> Xóa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label
                            className={`relative flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed rounded-ds-xl cursor-pointer transition-colors hover:bg-bg-subtle ${
                                mergedErrors.seatMapImage ? "border-feedback-error-border bg-feedback-error-bg/5" : "border-border-default"
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSeatMapFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="text-center text-text-muted p-6">
                                <div className="w-12 h-12 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-3 border border-border-default">
                                    <Upload size={20} />
                                </div>
                                <p className="text-sm font-medium">{t("seat_map_upload_click")}</p>
                                <p className="text-xs mt-1 opacity-70">{t("seat_map_limits")}</p>
                            </div>
                        </label>
                    )}

                    {mergedErrors.seatMapImage && (
                        <p className="mt-2 text-xs text-feedback-error-text flex items-center gap-1">
                            <AlertCircle size={12} />
                            {tValidation(mergedErrors.seatMapImage.replace("Validation.", ""))}
                        </p>
                    )}
                </div>
            )}


            {formData.ticketTypes.length === 0 && (
                <div className="p-3 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-lg flex items-start gap-2 text-sm" data-field="showtime">
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                    <span>{t("no_tickets_warning")}</span>
                </div>
            )}

            {warningMessages.length > 0 && (
                <div className="p-4 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-xl flex items-start justify-between gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <div className="font-bold mb-1">{t("invalid_sale_window")}</div>
                            <p>{displayWarning(warningMessages[0])}</p>
                        </div>
                    </div>
                    <button type="button" className="shrink-0 rounded-ds-lg border border-feedback-warning-border px-3 py-1.5 text-sm font-medium">
                        {t("view_details")}
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">{t("showtimes_list")}</h3>
                        <button
                            type="button"
                            onClick={handleAddShowtime}
                            className="p-1.5 rounded-ds-md hover:bg-bg-subtle border border-border-default text-text-secondary"
                            aria-label="Thêm suất diễn"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.showtimes.map((showtime) => {
                            const isSelected = selectedShowtimeId === showtime.id;
                            const isEditing = editingShowtimeId === showtime.id || Object.keys(errors).some((key) => key.startsWith(`showtime-${showtime.id}-`));
                            const ticketCount = formData.ticketTypes.filter((ticket) => ticket.showtimeId === showtime.id).length;
                            const hasError = Object.keys(errors).some((key) => key.startsWith(`showtime-${showtime.id}-`));

                            if (isEditing) {
                                return (
                                    <div
                                        key={showtime.id}
                                        onClick={() => setSelectedShowtimeId(showtime.id)}
                                        className={`p-4 rounded-ds-xl border transition-all cursor-pointer relative ${
                                            isSelected
                                                ? "border-action-brand-bg-default bg-action-brand-bg-default/5 shadow-sm"
                                                : "border-border-default bg-bg-surface hover:border-border-strong"
                                        } ${hasError ? "border-feedback-error-border bg-feedback-error-bg/5" : ""}`}
                                    >
                                        <div className="flex items-center justify-between mb-3 border-b border-border-default pb-2">
                                            <span className="text-xs font-bold text-action-brand-text-default uppercase">{t("editing")}</span>
                                            {formData.showtimes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleRemoveShowtime(showtime.id);
                                                    }}
                                                    className="text-text-muted hover:text-feedback-error-text p-1 cursor-pointer"
                                                    aria-label="Xóa suất diễn"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            value={showtime.name}
                                            onChange={(event) => handleUpdateShowtime(showtime.id, "name", event.target.value)}
                                            className="w-full bg-bg-surface border border-border-default focus:border-border-strong outline-none font-bold text-text-primary mb-3 px-2 py-1 rounded-ds-md text-sm"
                                            placeholder={t("showtime_name")}
                                            onClick={(event) => event.stopPropagation()}
                                        />

                                        <div className="space-y-3 mt-2" onClick={(event) => event.stopPropagation()}>
                                            <div>
                                                <label className="block text-[11px] font-bold text-text-secondary mb-1">{t("start_time")}</label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <CustomDatePicker
                                                            selectedDate={parseDatetimeLocal(showtime.startDatetime).date}
                                                            onChange={(date) => {
                                                                 const time = parseDatetimeLocal(showtime.startDatetime).time || "00:00";
                                                                 const combined = combineDateTime(date, time);
                                                                 handleUpdateShowtime(showtime.id, "startDatetime", combined);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <CustomTimePicker
                                                            selectedTime={parseDatetimeLocal(showtime.startDatetime).time}
                                                            onChange={(time) => {
                                                                const date = parseDatetimeLocal(showtime.startDatetime).date;
                                                                const combined = combineDateTime(date, time);
                                                                handleUpdateShowtime(showtime.id, "startDatetime", combined);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {renderError(`showtime-${showtime.id}-startDatetime`)}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-text-secondary mb-1">{t("end_time")}</label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <CustomDatePicker
                                                            selectedDate={parseDatetimeLocal(showtime.endDatetime).date}
                                                            onChange={(date) => {
                                                                 const time = parseDatetimeLocal(showtime.endDatetime).time || "00:00";
                                                                 const combined = combineDateTime(date, time);
                                                                 handleUpdateShowtime(showtime.id, "endDatetime", combined);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <CustomTimePicker
                                                            selectedTime={parseDatetimeLocal(showtime.endDatetime).time}
                                                            onChange={(time) => {
                                                                const date = parseDatetimeLocal(showtime.endDatetime).date;
                                                                const combined = combineDateTime(date, time);
                                                                handleUpdateShowtime(showtime.id, "endDatetime", combined);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {renderError(`showtime-${showtime.id}-endDatetime`)}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setEditingShowtimeId(null);
                                            }}
                                            className="w-full mt-3 py-1.5 bg-action-brand-bg-default hover:bg-action-brand-bg-hover text-action-brand-text-default rounded-ds-lg text-xs font-bold transition-colors text-center cursor-pointer"
                                        >
                                            {t("done")}
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={showtime.id}
                                    onClick={() => setSelectedShowtimeId(showtime.id)}
                                    className={`p-4 rounded-ds-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                                        isSelected
                                            ? "border-action-brand-bg-default bg-action-brand-bg-default/5 shadow-sm"
                                            : "border-border-default bg-bg-surface hover:border-border-strong hover:shadow-xs"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-8">
                                            <h4 className="font-bold text-sm text-text-primary truncate">{showtime.name || t("unnamed")}</h4>
                                            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-medium flex items-center gap-1">
                                                <Calendar size={13} className="text-text-muted shrink-0" />
                                                <span>{formatShowtimeRange(showtime.startDatetime, showtime.endDatetime)}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-bg-surface rounded-full p-0.5 shadow-sm border border-border-default">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setEditingShowtimeId(showtime.id);
                                                    setSelectedShowtimeId(showtime.id);
                                                }}
                                                className="p-1 text-text-muted hover:text-action-brand-text-default rounded-full hover:bg-bg-subtle transition-colors cursor-pointer"
                                                title={t("edit")}
                                            >
                                                <Edit3 size={13} />
                                            </button>
                                            {formData.showtimes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleRemoveShowtime(showtime.id);
                                                    }}
                                                    className="p-1 text-text-muted hover:text-feedback-error-text rounded-full hover:bg-feedback-error-bg/10 transition-colors cursor-pointer"
                                                    title={t("edit")}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-3 border-t border-border-default border-dashed flex items-center justify-between">
                                        <span className="text-[11px] text-text-muted">{t("tickets_count", { count: ticketCount })}</span>
                                        {isSelected && <span className="text-[10px] font-bold text-action-brand-text-default uppercase bg-action-brand-bg-default/10 px-1.5 py-0.5 rounded-sm">{t("viewing_tickets")}</span>}
                                    </div>
                                    {renderError(`showtime-${showtime.id}-tickets`)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full md:w-2/3 bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                <Ticket size={20} />
                                {t("tickets_of_showtime")}
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">{activeShowtime?.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={startCreateTicket}
                            className="flex items-center gap-2 px-4 py-2 bg-button-primary-bg-default text-button-primary-text-default rounded-ds-lg text-sm font-medium hover:bg-button-primary-bg-hover"
                        >
                            <Plus size={16} />
                            {t("create_ticket")}
                        </button>
                    </div>

                    {isEditingTicket ? (
                        <div className="bg-bg-page border border-action-brand-bg-default/30 rounded-ds-xl p-5 shadow-sm" data-field={`ticket-${editingTicketId ?? "draft"}-typeName`}>
                            <h4 className="font-bold text-text-primary mb-4 border-b border-border-default pb-2">
                                {editingTicketId ? t("edit_ticket_title") : t("add_ticket_title")}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("ticket_name_label")}</label>
                                    <input
                                        type="text"
                                        value={ticketDraft.typeName}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, typeName: event.target.value })}
                                        data-field={getTicketFieldKey("typeName")}
                                        className={fieldClass(getTicketFieldKey("typeName"))}
                                        placeholder={t("ticket_name_placeholder")}
                                    />
                                    {renderError(getTicketFieldKey("typeName"))}
                                </div>
                                <div className="flex items-end mb-1 gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium mb-1 text-text-secondary">{t("ticket_price_label")}</label>
                                        <input
                                            type="number"
                                            value={ticketDraft.price}
                                            onChange={(event) => setTicketDraft({ ...ticketDraft, price: Number(event.target.value) })}
                                            data-field={getTicketFieldKey("price")}
                                            className={fieldClass(getTicketFieldKey("price"))}
                                        />
                                        {renderError(getTicketFieldKey("price"))}
                                    </div>
                                    <label className="flex items-center gap-2 pb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ticketDraft.isFree}
                                            disabled
                                            onChange={() => undefined}
                                            className="w-4 h-4 rounded border-border-default"
                                        />
                                        <span className="text-sm font-medium text-text-muted">{t("free_ticket_unsupported")}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1 text-text-secondary">{t("ticket_desc")}</label>
                                <textarea
                                    value={ticketDraft.description}
                                    onChange={(event) => setTicketDraft({ ...ticketDraft, description: event.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-border-default rounded-ds-lg bg-field-bg-default text-sm focus:border-field-border-focus outline-none resize-none"
                                    placeholder={t("ticket_desc_placeholder")}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("ticket_qty_label")}</label>
                                    <input
                                        type="number"
                                        value={ticketDraft.quantityTotal}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, quantityTotal: Number(event.target.value) })}
                                        data-field={getTicketFieldKey("quantityTotal")}
                                        className={fieldClass(getTicketFieldKey("quantityTotal"))}
                                    />
                                    {renderError(getTicketFieldKey("quantityTotal"))}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("min_purchase_label")}</label>
                                    <input
                                        type="number"
                                        value={ticketDraft.minPurchase}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, minPurchase: Number(event.target.value) })}
                                        data-field={getTicketFieldKey("minPurchase")}
                                        className={fieldClass(getTicketFieldKey("minPurchase"))}
                                    />
                                    {renderError(getTicketFieldKey("minPurchase"))}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("max_purchase_label")}</label>
                                    <input
                                        type="number"
                                        value={ticketDraft.maxPurchase}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, maxPurchase: Number(event.target.value) })}
                                        data-field={getTicketFieldKey("maxPurchase")}
                                        className={fieldClass(getTicketFieldKey("maxPurchase"))}
                                    />
                                    {renderError(getTicketFieldKey("maxPurchase"))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-4 border-t border-border-default">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("sale_start_label")}</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <CustomDatePicker
                                                selectedDate={parseDatetimeLocal(ticketDraft.saleStartDate || "").date}
                                                onChange={(date) => {
                                                    const time = parseDatetimeLocal(ticketDraft.saleStartDate || "").time || "00:00";
                                                    const combined = combineDateTime(date, time);
                                                    setTicketDraft({ ...ticketDraft, saleStartDate: combined });
                                                }}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <CustomTimePicker
                                                selectedTime={parseDatetimeLocal(ticketDraft.saleStartDate || "").time}
                                                onChange={(time) => {
                                                    const date = parseDatetimeLocal(ticketDraft.saleStartDate || "").date;
                                                    const combined = combineDateTime(date, time);
                                                    setTicketDraft({ ...ticketDraft, saleStartDate: combined });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {renderError(getTicketFieldKey("saleStartDate"))}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">{t("sale_end_label")}</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <CustomDatePicker
                                                selectedDate={parseDatetimeLocal(ticketDraft.saleEndDate || "").date}
                                                onChange={(date) => {
                                                    const time = parseDatetimeLocal(ticketDraft.saleEndDate || "").time || "00:00";
                                                    const combined = combineDateTime(date, time);
                                                    setTicketDraft({ ...ticketDraft, saleEndDate: combined });
                                                }}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <CustomTimePicker
                                                selectedTime={parseDatetimeLocal(ticketDraft.saleEndDate || "").time}
                                                onChange={(time) => {
                                                    const date = parseDatetimeLocal(ticketDraft.saleEndDate || "").date;
                                                    const combined = combineDateTime(date, time);
                                                    setTicketDraft({ ...ticketDraft, saleEndDate: combined });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {renderError(getTicketFieldKey("saleEndDate"))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetTicketEditor}
                                    className="px-4 py-2 border border-border-default rounded-ds-lg text-sm font-medium hover:bg-bg-surface"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTicket}
                                    className="px-4 py-2 bg-action-brand-bg-default text-action-brand-text-default rounded-ds-lg text-sm font-medium hover:bg-action-brand-bg-hover"
                                >
                                    {editingTicketId ? t("save_changes") : t("save_ticket")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3" data-field={activeShowtime ? `showtime-${activeShowtime.id}-tickets` : "ticketType"} tabIndex={-1}>
                            {activeTickets.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-border-default rounded-ds-xl bg-bg-page/50">
                                    <Ticket size={48} className="mx-auto text-text-muted mb-3 opacity-50" />
                                    <p className="text-text-secondary">{t("no_tickets_placeholder")}</p>
                                    <button
                                        type="button"
                                        onClick={startCreateTicket}
                                        className="text-action-brand-text-default font-medium text-sm mt-2 hover:underline"
                                    >
                                        {t("click_to_create_ticket")}
                                    </button>
                                    {activeShowtime ? renderError(`showtime-${activeShowtime.id}-tickets`) : null}
                                </div>
                            ) : (
                                activeTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        data-field={`ticket-${ticket.id}-saleEndDate`}
                                        tabIndex={-1}
                                        className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-ds-xl bg-bg-page hover:border-border-strong transition-colors relative group ${
                                            Object.keys(errors).some((key) => key.startsWith(`ticket-${ticket.id}-`))
                                                ? "border-feedback-error-border"
                                                : "border-border-default"
                                        }`}
                                    >
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => startEditTicket(ticket)}
                                                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary px-2 py-1 bg-bg-surface rounded-full shadow-sm"
                                                aria-label="Sửa loại vé"
                                            >
                                                <Edit3 size={14} />
                                                {t("edit")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTicket(ticket.id)}
                                                className="text-text-muted hover:text-feedback-error-text p-1 bg-bg-surface rounded-full shadow-sm"
                                                aria-label="Xóa loại vé"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="w-12 h-12 bg-action-brand-bg-default/10 text-action-brand-text-default flex items-center justify-center rounded-ds-lg shrink-0 border border-action-brand-bg-default/20">
                                            <Ticket size={24} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                                <h4 className="font-bold text-text-primary text-base truncate pr-16">{ticket.typeName}</h4>
                                                <div className="flex flex-col sm:items-end">
                                                    <span className="font-bold text-action-brand-text-default">
                                                        {ticket.isFree ? (locale === "en" ? "Free" : "Miễn phí") : new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", { style: "currency", currency: "VND" }).format(ticket.price)}
                                                    </span>
                                                    <span className="text-xs text-text-muted">{ticket.quantityTotal} {locale === "en" ? "tickets" : "vé"}</span>
                                                </div>
                                            </div>

                                            {ticket.description && (
                                                <p className="text-xs text-text-secondary line-clamp-1 mb-2">{ticket.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-text-muted bg-bg-surface inline-flex px-2 py-1 rounded-ds-md border border-border-default">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {t("sale_format", { start: formatDate(ticket.saleStartDate), end: formatDate(ticket.saleEndDate) })}
                                                </span>
                                                <span className="border-l border-border-default pl-3">
                                                    {t("purchase_format", { min: ticket.minPurchase, max: ticket.maxPurchase })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
