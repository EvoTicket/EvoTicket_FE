import { useState } from "react";
import { AlertCircle, Calendar, Edit3, Plus, Ticket, Trash2 } from "lucide-react";
import { CreateEventState, ShowtimeInput, TicketTypeInput } from "./useCreateEventWizard";
import { getStep2Warnings, validateStep2, type StepErrors } from "./createEventValidation";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
    errors?: StepErrors;
}

const initialTicketForm: Partial<TicketTypeInput> = {
    typeName: "",
    description: "",
    price: 0,
    isFree: false,
    quantityTotal: 100,
    minPurchase: 1,
    maxPurchase: 10,
    saleStartDate: "",
    saleEndDate: "",
    status: "AVAILABLE",
};

function formatDate(value: string) {
    if (!value) return "Chưa đặt";
    return new Date(value).toLocaleDateString("vi-VN");
}

export function CreateEventStep2Showtimes({ formData, updateField, errors = {} }: Props) {
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>(formData.showtimes[0]?.id || "");
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
            <p className="mt-1 text-xs text-feedback-error-text">{mergedErrors[fieldKey]}</p>
        ) : null
    );

    const handleAddShowtime = () => {
        const newId = `st-${Date.now()}`;
        const newShowtime: ShowtimeInput = {
            id: newId,
            name: `Suất diễn ${formData.showtimes.length + 1}`,
            startDatetime: "",
            endDatetime: "",
        };
        updateField("showtimes", [...formData.showtimes, newShowtime]);
        setSelectedShowtimeId(newId);
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
        setTicketDraft(ticket);
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">Tổng số vé</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">
                        {formData.ticketTypes.reduce((acc, ticket) => acc + ticket.quantityTotal, 0)}
                    </span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">Tổng loại vé</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">{formData.ticketTypes.length}</span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">Số suất diễn</span>
                    <span className="text-2xl font-bold text-text-primary mt-1">{formData.showtimes.length}</span>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-4 flex flex-col justify-center shadow-sm">
                    <span className="text-xs text-text-muted font-semibold uppercase">Sử dụng sơ đồ ghế</span>
                    <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className={`w-10 h-5 rounded-full relative transition-colors ${formData.useSeatMap ? "bg-action-brand-bg-default" : "bg-border-default"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg-surface transition-transform ${formData.useSeatMap ? "translate-x-5" : ""}`} />
                            </span>
                            <span className="text-sm font-medium">{formData.useSeatMap ? "Có" : "Không"}</span>
                            <input type="checkbox" className="sr-only" checked={formData.useSeatMap} onChange={(event) => updateField("useSeatMap", event.target.checked)} />
                        </label>
                    </div>
                </div>
            </div>

            {formData.ticketTypes.length === 0 && (
                <div className="p-3 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-lg flex items-start gap-2 text-sm" data-field="showtime">
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                    <span>Sự kiện chưa có vé. Vui lòng tạo ít nhất 1 loại vé để tiếp tục.</span>
                </div>
            )}

            {warningMessages.length > 0 && (
                <div className="p-4 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-xl flex items-start justify-between gap-4 text-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <div className="font-bold mb-1">Một loại vé đang có cửa sổ bán không hợp lệ</div>
                            <p>{warningMessages[0]}</p>
                        </div>
                    </div>
                    <button type="button" className="shrink-0 rounded-ds-lg border border-feedback-warning-border px-3 py-1.5 text-sm font-medium">
                        Xem chi tiết
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-text-primary">Danh sách suất diễn</h3>
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
                        {formData.showtimes.map((showtime) => (
                            <div
                                key={showtime.id}
                                onClick={() => setSelectedShowtimeId(showtime.id)}
                                className={`p-4 rounded-ds-xl border transition-all cursor-pointer relative ${
                                    selectedShowtimeId === showtime.id
                                        ? "border-action-brand-bg-default bg-action-brand-bg-default/5 shadow-sm"
                                        : "border-border-default bg-bg-surface hover:border-border-strong"
                                }`}
                            >
                                {formData.showtimes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleRemoveShowtime(showtime.id);
                                        }}
                                        className="absolute top-2 right-2 text-text-muted hover:text-feedback-error-text p-1"
                                        aria-label="Xóa suất diễn"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}

                                <input
                                    type="text"
                                    value={showtime.name}
                                    onChange={(event) => handleUpdateShowtime(showtime.id, "name", event.target.value)}
                                    className="w-[85%] bg-transparent border-b border-transparent focus:border-border-strong outline-none font-bold text-text-primary mb-2 px-1 py-0.5 -ml-1 text-sm"
                                    placeholder="Tên suất diễn"
                                    onClick={(event) => event.stopPropagation()}
                                />

                                <div className="space-y-2 mt-2">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                            <Calendar size={14} className="shrink-0" />
                                            <input
                                                type="datetime-local"
                                                value={showtime.startDatetime}
                                                onChange={(event) => handleUpdateShowtime(showtime.id, "startDatetime", event.target.value)}
                                                onClick={(event) => event.stopPropagation()}
                                                data-field={`showtime-${showtime.id}-startDatetime`}
                                                className={`bg-bg-surface border rounded px-1.5 py-1 w-full ${
                                                    errors[`showtime-${showtime.id}-startDatetime`] ? "border-feedback-error-border" : "border-border-default"
                                                }`}
                                            />
                                        </div>
                                        {renderError(`showtime-${showtime.id}-startDatetime`)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                            <span className="w-[14px] flex justify-center shrink-0">-</span>
                                            <input
                                                type="datetime-local"
                                                value={showtime.endDatetime}
                                                onChange={(event) => handleUpdateShowtime(showtime.id, "endDatetime", event.target.value)}
                                                onClick={(event) => event.stopPropagation()}
                                                data-field={`showtime-${showtime.id}-endDatetime`}
                                                className={`bg-bg-surface border rounded px-1.5 py-1 w-full ${
                                                    errors[`showtime-${showtime.id}-endDatetime`] ? "border-feedback-error-border" : "border-border-default"
                                                }`}
                                            />
                                        </div>
                                        {renderError(`showtime-${showtime.id}-endDatetime`)}
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-border-default border-dashed flex items-center justify-between">
                                        <span className="text-xs text-text-muted">Số loại vé:</span>
                                        <span className="text-xs font-bold text-text-primary">
                                            {formData.ticketTypes.filter((ticket) => ticket.showtimeId === showtime.id).length}
                                        </span>
                                    </div>
                                    {renderError(`showtime-${showtime.id}-tickets`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-2/3 bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                <Ticket size={20} />
                                Loại vé của suất diễn
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">{activeShowtime?.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={startCreateTicket}
                            className="flex items-center gap-2 px-4 py-2 bg-button-primary-bg-default text-button-primary-text-default rounded-ds-lg text-sm font-medium hover:bg-button-primary-bg-hover"
                        >
                            <Plus size={16} />
                            Tạo loại vé
                        </button>
                    </div>

                    {isEditingTicket ? (
                        <div className="bg-bg-page border border-action-brand-bg-default/30 rounded-ds-xl p-5 shadow-sm" data-field={`ticket-${editingTicketId ?? "draft"}-typeName`}>
                            <h4 className="font-bold text-text-primary mb-4 border-b border-border-default pb-2">
                                {editingTicketId ? "Chỉnh sửa loại vé" : "Thêm loại vé mới"}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Tên loại vé *</label>
                                    <input
                                        type="text"
                                        value={ticketDraft.typeName}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, typeName: event.target.value })}
                                        data-field={getTicketFieldKey("typeName")}
                                        className={fieldClass(getTicketFieldKey("typeName"))}
                                        placeholder="Ví dụ: General Admission"
                                    />
                                    {renderError(getTicketFieldKey("typeName"))}
                                </div>
                                <div className="flex items-end mb-1 gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium mb-1 text-text-secondary">Giá vé (VND) *</label>
                                        <input
                                            type="number"
                                            disabled={ticketDraft.isFree}
                                            value={ticketDraft.price}
                                            onChange={(event) => setTicketDraft({ ...ticketDraft, price: Number(event.target.value) })}
                                            data-field={getTicketFieldKey("price")}
                                            className={`${fieldClass(getTicketFieldKey("price"))} disabled:opacity-50`}
                                        />
                                        {renderError(getTicketFieldKey("price"))}
                                    </div>
                                    <label className="flex items-center gap-2 pb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ticketDraft.isFree}
                                            onChange={(event) => setTicketDraft({ ...ticketDraft, isFree: event.target.checked, price: 0 })}
                                            className="w-4 h-4 rounded border-border-default"
                                        />
                                        <span className="text-sm font-medium">Vé miễn phí</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium mb-1 text-text-secondary">Mô tả (Tùy chọn)</label>
                                <textarea
                                    value={ticketDraft.description}
                                    onChange={(event) => setTicketDraft({ ...ticketDraft, description: event.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-border-default rounded-ds-lg bg-field-bg-default text-sm focus:border-field-border-focus outline-none resize-none"
                                    placeholder="Mô tả quyền lợi của vé..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Số lượng bán *</label>
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
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Mua tối thiểu</label>
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
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Mua tối đa</label>
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
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Thời gian bắt đầu bán *</label>
                                    <input
                                        type="datetime-local"
                                        value={ticketDraft.saleStartDate}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, saleStartDate: event.target.value })}
                                        data-field={getTicketFieldKey("saleStartDate")}
                                        className={fieldClass(getTicketFieldKey("saleStartDate"))}
                                    />
                                    {renderError(getTicketFieldKey("saleStartDate"))}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-text-secondary">Thời gian kết thúc bán *</label>
                                    <input
                                        type="datetime-local"
                                        value={ticketDraft.saleEndDate}
                                        onChange={(event) => setTicketDraft({ ...ticketDraft, saleEndDate: event.target.value })}
                                        data-field={getTicketFieldKey("saleEndDate")}
                                        className={fieldClass(getTicketFieldKey("saleEndDate"))}
                                    />
                                    {renderError(getTicketFieldKey("saleEndDate"))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetTicketEditor}
                                    className="px-4 py-2 border border-border-default rounded-ds-lg text-sm font-medium hover:bg-bg-surface"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTicket}
                                    className="px-4 py-2 bg-action-brand-bg-default text-action-brand-text-default rounded-ds-lg text-sm font-medium hover:bg-action-brand-bg-hover"
                                >
                                    {editingTicketId ? "Lưu thay đổi" : "Lưu loại vé"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3" data-field={activeShowtime ? `showtime-${activeShowtime.id}-tickets` : "ticketType"} tabIndex={-1}>
                            {activeTickets.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-border-default rounded-ds-xl bg-bg-page/50">
                                    <Ticket size={48} className="mx-auto text-text-muted mb-3 opacity-50" />
                                    <p className="text-text-secondary">Chưa có loại vé nào cho suất diễn này</p>
                                    <button
                                        type="button"
                                        onClick={startCreateTicket}
                                        className="text-action-brand-text-default font-medium text-sm mt-2 hover:underline"
                                    >
                                        + Nhấn để tạo vé
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
                                                Sửa
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
                                                        {ticket.isFree ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ticket.price)}
                                                    </span>
                                                    <span className="text-xs text-text-muted">{ticket.quantityTotal} vé</span>
                                                </div>
                                            </div>

                                            {ticket.description && (
                                                <p className="text-xs text-text-secondary line-clamp-1 mb-2">{ticket.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-text-muted bg-bg-surface inline-flex px-2 py-1 rounded-ds-md border border-border-default">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> Bán: {formatDate(ticket.saleStartDate)} - {formatDate(ticket.saleEndDate)}
                                                </span>
                                                <span className="border-l border-border-default pl-3">
                                                    Mua: {ticket.minPurchase} - {ticket.maxPurchase} vé/đơn
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
