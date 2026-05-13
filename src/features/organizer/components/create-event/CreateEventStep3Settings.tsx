import { useState } from "react";
import { Edit3, Globe, Map, Plus, Settings2, ShieldCheck, Ticket, Trash2 } from "lucide-react";
import { CreateEventState, GateInput, Visibility } from "./useCreateEventWizard";
import { validateStep3, type StepErrors } from "./createEventValidation";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
    errors?: StepErrors;
}

const initialGateDraft: GateInput = {
    id: "draft",
    name: "",
    code: "",
    description: "",
};

export function CreateEventStep3Settings({ formData, updateField, errors = {} }: Props) {
    const [editingGateId, setEditingGateId] = useState<string | null>(null);
    const [gateDraft, setGateDraft] = useState<GateInput>(initialGateDraft);
    const [localGateErrors, setLocalGateErrors] = useState<StepErrors>({});
    const mergedErrors = { ...errors, ...localGateErrors };

    const fieldClass = (field: string) =>
        `w-full p-2.5 border rounded-lg bg-field-bg-default focus:ring-1 focus:ring-focus-ring outline-none ${
            mergedErrors[field]
                ? "border-feedback-error-border focus:border-feedback-error-border"
                : "border-border-default focus:border-field-border-focus"
        }`;

    const renderError = (field: string) => (
        mergedErrors[field] ? (
            <p className="mt-1.5 text-sm text-feedback-error-text">{mergedErrors[field]}</p>
        ) : null
    );

    const startAddGate = () => {
        setEditingGateId("draft");
        setGateDraft(initialGateDraft);
        setLocalGateErrors({});
    };

    const startEditGate = (gate: GateInput) => {
        setEditingGateId(gate.id);
        setGateDraft(gate);
        setLocalGateErrors({});
    };

    const resetGateEditor = () => {
        setEditingGateId(null);
        setGateDraft(initialGateDraft);
        setLocalGateErrors({});
    };

    const saveGate = () => {
        const validationGateId = editingGateId ?? "draft";
        const normalizedGate = {
            ...gateDraft,
            id: validationGateId,
            code: gateDraft.code.trim().toUpperCase(),
        };
        const nextGates = editingGateId === "draft"
            ? [...formData.gates, normalizedGate]
            : formData.gates.map((gate) => gate.id === editingGateId ? normalizedGate : gate);
        const validation = validateStep3({ ...formData, gates: nextGates });
        const relevantErrors = Object.fromEntries(
            Object.entries(validation.errors).filter(([key]) => key.startsWith(`gate-${validationGateId}-`) || key === "gate"),
        );

        if (Object.keys(relevantErrors).length > 0) {
            setLocalGateErrors(relevantErrors);
            return;
        }

        const savedGates = editingGateId === "draft"
            ? nextGates.map((gate) => gate.id === "draft" ? { ...gate, id: `gate-${Date.now()}` } : gate)
            : nextGates;
        updateField("gates", savedGates);
        updateField("totalGates", savedGates.length);
        resetGateEditor();
    };

    const deleteGate = (id: string) => {
        const nextGates = formData.gates.filter((gate) => gate.id !== id);
        updateField("gates", nextGates);
        updateField("totalGates", Math.max(1, nextGates.length));
        if (editingGateId === id) resetGateEditor();
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Công bố sự kiện</h3>
                </div>

                <div className="space-y-4">
                    <div data-field="urlSlug">
                        <label className="block text-sm font-medium mb-1">Đường dẫn sự kiện (URL slug) <span className="text-feedback-error-text">*</span></label>
                        <div className={`flex bg-field-bg-default border rounded-lg focus-within:ring-1 focus-within:ring-focus-ring overflow-hidden ${
                            mergedErrors.urlSlug ? "border-feedback-error-border" : "border-border-default focus-within:border-field-border-focus"
                        }`}>
                            <span className="px-3 py-2.5 bg-bg-subtle text-text-muted border-r border-border-default text-sm">evoticket.vn/e/</span>
                            <input
                                type="text"
                                value={formData.urlSlug}
                                onChange={(event) => updateField("urlSlug", event.target.value)}
                                placeholder="ten-su-kien-viet-lien-khong-dau"
                                className="w-full px-3 py-2.5 bg-transparent outline-none text-sm"
                            />
                        </div>
                        {renderError("urlSlug")}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Quyền riêng tư</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { val: "PUBLIC", label: "Công khai", desc: "Mọi người đều có thể tìm thấy" },
                                { val: "PRIVATE", label: "Riêng tư", desc: "Chỉ người có link mới xem được" },
                                { val: "UNLISTED", label: "Không liệt kê", desc: "Không hiện trên trang chủ" },
                            ].map((option) => (
                                <button
                                    key={option.val}
                                    type="button"
                                    onClick={() => updateField("visibility", option.val as Visibility)}
                                    className={`p-3 text-left rounded-xl border transition-colors ${
                                        formData.visibility === option.val
                                            ? "border-action-brand-bg-default bg-action-brand-bg-default/5 shadow-sm"
                                            : "border-border-default hover:bg-bg-subtle"
                                    }`}
                                >
                                    <div className="font-bold text-sm text-text-primary">{option.label}</div>
                                    <div className="text-xs text-text-secondary mt-1">{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Ticket className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Quy tắc bán vé</h3>
                </div>

                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer p-3 border border-border-default rounded-lg hover:bg-bg-subtle transition-colors">
                        <span className="mt-0.5">
                            <input
                                type="checkbox"
                                checked={formData.allowMultipleTicketTypes}
                                onChange={(event) => updateField("allowMultipleTicketTypes", event.target.checked)}
                                className="w-4 h-4 rounded border-border-default text-action-brand-bg-default focus:ring-focus-ring"
                            />
                        </span>
                        <span>
                            <span className="font-medium text-sm text-text-primary block">Cho phép mua nhiều loại vé trong cùng 1 đơn hàng</span>
                            <span className="text-xs text-text-secondary mt-0.5 block">Nếu tắt, khách hàng chỉ có thể mua số lượng vé thuộc 1 loại duy nhất mỗi đơn.</span>
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-3 border border-border-default rounded-lg hover:bg-bg-subtle transition-colors">
                        <span className="mt-0.5">
                            <input
                                type="checkbox"
                                checked={formData.allowVouchers}
                                onChange={(event) => updateField("allowVouchers", event.target.checked)}
                                className="w-4 h-4 rounded border-border-default text-action-brand-bg-default focus:ring-focus-ring"
                            />
                        </span>
                        <span>
                            <span className="font-medium text-sm text-text-primary block">Cho phép sử dụng mã giảm giá (Voucher/Promo code)</span>
                            <span className="text-xs text-text-secondary mt-0.5 block">Bạn có thể tạo mã giảm giá ở màn hình quản lý sau khi sự kiện được duyệt.</span>
                        </span>
                    </label>
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Chính sách Resale & Blockchain</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-bg-page border border-border-default rounded-xl">
                        <div>
                            <div className="font-bold text-text-primary">Bật tính năng Resale (Bán lại vé)</div>
                            <div className="text-xs text-text-secondary mt-1">Cho phép khách hàng bán lại vé một cách an toàn trên nền tảng EvoTicket.</div>
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <span className={`w-12 h-6 rounded-full relative transition-colors ${formData.allowResale ? "bg-action-brand-bg-default" : "bg-border-default"}`}>
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-bg-surface transition-transform ${formData.allowResale ? "translate-x-6" : ""}`} />
                            </span>
                            <input type="checkbox" className="sr-only" checked={formData.allowResale} onChange={(event) => updateField("allowResale", event.target.checked)} />
                        </label>
                    </div>

                    {formData.allowResale && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-action-brand-bg-default/30 bg-action-brand-bg-default/5 rounded-xl">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-secondary">Giá bán lại tối đa (%)</label>
                                <div className="flex items-center bg-bg-surface border border-border-default rounded-lg px-3 py-2">
                                    <input
                                        type="number"
                                        value={formData.resaleMaxPriceCap}
                                        onChange={(event) => updateField("resaleMaxPriceCap", Number(event.target.value))}
                                        className="w-full bg-transparent outline-none text-sm"
                                    />
                                    <span className="text-text-muted">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-text-secondary">Phí bản quyền tổ chức (%)</label>
                                <div className="flex items-center bg-bg-surface border border-border-default rounded-lg px-3 py-2">
                                    <input
                                        type="number"
                                        value={formData.royaltyFee}
                                        onChange={(event) => updateField("royaltyFee", Number(event.target.value))}
                                        className="w-full bg-transparent outline-none text-sm"
                                    />
                                    <span className="text-text-muted">%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4" data-field="gate" tabIndex={-1}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Map className="text-text-secondary" size={20} />
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Cấu hình vận hành tại cổng (Check-in)</h3>
                            <p className="text-sm text-text-muted">Cổng và checker vẫn là cấu hình frontend-only cho đến khi có API.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={startAddGate}
                        className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-subtle"
                    >
                        <Plus size={16} />
                        Thêm cổng
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-field="totalGates">
                        <label className="block text-sm font-medium mb-1">Tổng số cổng <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={formData.totalGates}
                            onChange={(event) => updateField("totalGates", Number(event.target.value))}
                            className={fieldClass("totalGates")}
                        />
                        {renderError("totalGates")}
                    </div>
                    <div data-field="expectedCheckers">
                        <label className="block text-sm font-medium mb-1">Số checker dự kiến <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={formData.expectedCheckers}
                            onChange={(event) => updateField("expectedCheckers", Number(event.target.value))}
                            className={fieldClass("expectedCheckers")}
                        />
                        {renderError("expectedCheckers")}
                    </div>
                </div>

                {editingGateId && (
                    <div className="rounded-xl border border-border-default bg-bg-page p-4 space-y-4" data-field={`gate-${editingGateId}-name`}>
                        <h4 className="font-bold text-text-primary">{editingGateId === "draft" ? "Thêm cổng" : "Chỉnh sửa cổng"}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên cổng <span className="text-feedback-error-text">*</span></label>
                                <input
                                    value={gateDraft.name}
                                    onChange={(event) => setGateDraft({ ...gateDraft, name: event.target.value })}
                                    className={fieldClass(`gate-${editingGateId}-name`)}
                                    placeholder="Gate A - Main Entry"
                                />
                                {renderError(`gate-${editingGateId}-name`)}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mã cổng</label>
                                <input
                                    value={gateDraft.code}
                                    onChange={(event) => setGateDraft({ ...gateDraft, code: event.target.value.toUpperCase() })}
                                    className={fieldClass(`gate-${editingGateId}-code`)}
                                    placeholder="GATE-A"
                                />
                                {renderError(`gate-${editingGateId}-code`)}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ghi chú</label>
                            <textarea
                                value={gateDraft.description}
                                onChange={(event) => setGateDraft({ ...gateDraft, description: event.target.value })}
                                rows={2}
                                className="w-full p-2.5 border border-border-default rounded-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                                placeholder="Ghi chú vận hành cho checker..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={resetGateEditor} className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium hover:bg-bg-subtle">
                                Hủy
                            </button>
                            <button type="button" onClick={saveGate} className="rounded-lg bg-action-brand-bg-default px-4 py-2 text-sm font-medium text-action-brand-text-default hover:bg-action-brand-bg-hover">
                                Lưu cổng
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {formData.gates.map((gate) => (
                        <div key={gate.id} className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-bg-page p-4">
                            <div className="min-w-0">
                                <div className="font-bold text-text-primary">{gate.name || "Chưa đặt tên cổng"}</div>
                                <div className="text-xs text-text-muted">{gate.code || "Chưa có mã"} · {gate.description || "Chưa có ghi chú"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => startEditGate(gate)} className="rounded-lg border border-border-default p-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle" aria-label="Sửa cổng">
                                    <Edit3 size={16} />
                                </button>
                                <button type="button" onClick={() => deleteGate(gate.id)} className="rounded-lg border border-feedback-error-border p-2 text-feedback-error-text hover:bg-feedback-error-bg" aria-label="Xóa cổng">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {renderError("gate")}
                </div>

                <div className="rounded-lg border border-feedback-info-border bg-feedback-info-bg p-3 text-sm text-feedback-info-text">
                    Checker sẽ được phân công theo event và gate sau khi sự kiện được tạo. Check-in hỗ trợ online hoặc offline có đồng bộ lại.
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Hướng dẫn cho người mua (Tùy chọn)</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ghi chú sau khi mua vé thành công</label>
                        <textarea
                            value={formData.postPurchaseNotes}
                            onChange={(event) => updateField("postPurchaseNotes", event.target.value)}
                            rows={3}
                            className="w-full p-2.5 border border-border-default rounded-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                            placeholder="Cảm ơn bạn đã mua vé. Vui lòng kiểm tra email..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Lưu ý khi đến cổng check-in</label>
                        <textarea
                            value={formData.checkinReminder}
                            onChange={(event) => updateField("checkinReminder", event.target.value)}
                            rows={3}
                            className="w-full p-2.5 border border-border-default rounded-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                            placeholder="Vui lòng chuẩn bị sẵn mã QR, mang theo CCCD..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ghi chú vào cổng</label>
                        <textarea
                            value={formData.gateNotes}
                            onChange={(event) => updateField("gateNotes", event.target.value)}
                            rows={3}
                            className="w-full p-2.5 border border-border-default rounded-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                            placeholder="Khán giả nên có mặt trước giờ diễn ít nhất 30 phút..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
