import React from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Image as ImageIcon, MapPin, AlignLeft, Building2 } from "lucide-react";
import { CreateEventState, getEventCategoryLabel } from "./useCreateEventWizard";
import type { StepErrors } from "./createEventValidation";
import type { EventCategory, ProvinceResponse, WardResponse } from "@/src/features/organizer/types/api";

const MapPicker = dynamic(() => import("@/src/components/MapPicker"), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-bg-subtle animate-pulse rounded-ds-lg flex items-center justify-center border border-border-default">Loading Map...</div>
});

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
    categories: EventCategory[];
    provinces: ProvinceResponse[];
    wards: WardResponse[];
    categoryState: DictionaryState;
    provinceState: DictionaryState;
    wardState: DictionaryState;
    errors?: StepErrors;
    categoryError?: string;
    onCategoryChange?: () => void;
    onProvinceChange: (provinceCode: number, provinceName: string) => void;
    onWardChange: (wardCode: number, wardName: string) => void;
    onRetryCategories: () => void;
    onRetryProvinces: () => void;
    onRetryWards: () => void;
}

type DictionaryState = {
    loading: boolean;
    error: string | null;
};

const EVENT_TYPE_OPTIONS = [
    { value: "OFFLINE", label: "Offline", disabled: false },
    { value: "ONLINE", label: "Online", disabled: true },
    { value: "HYBRID", label: "Hybrid", disabled: true },
];

export function CreateEventStep1BasicInfo({
    formData,
    updateField,
    categories,
    provinces,
    wards,
    categoryState,
    provinceState,
    wardState,
    errors = {},
    categoryError,
    onCategoryChange,
    onProvinceChange,
    onWardChange,
    onRetryCategories,
    onRetryProvinces,
    onRetryWards,
}: Props) {
    const categoryMessage = categoryError ?? errors.category;

    const fieldClass = (field: string) =>
        `w-full p-2.5 border rounded-ds-lg bg-field-bg-default focus:ring-1 focus:ring-focus-ring outline-none ${
            errors[field]
                ? "border-feedback-error-border focus:border-feedback-error-border"
                : "border-border-default focus:border-field-border-focus"
        }`;

    const renderError = (field: string) => (
        errors[field] ? (
            <p className="mt-1.5 text-sm text-feedback-error-text">{errors[field]}</p>
        ) : null
    );

    const renderDictionaryMessage = (message: string, retry?: () => void) => (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-ds-lg border border-border-default bg-bg-subtle px-3 py-2 text-sm text-text-muted">
            <span>{message}</span>
            {retry && (
                <button
                    type="button"
                    onClick={retry}
                    className="shrink-0 text-sm font-medium text-action-brand-text-default hover:underline"
                >
                    Thử lại
                </button>
            )}
        </div>
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            if (type === 'banner') {
                updateField('bannerFile', file);
                updateField('bannerImage', file);
                updateField('bannerPreview', url);
            } else {
                updateField('thumbnailFile', file);
                updateField('thumbnailImage', file);
                updateField('thumbnailPreview', url);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Hình ảnh sự kiện */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Hình ảnh sự kiện</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">Ảnh phải đúng chuẩn hiển thị để được duyệt.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1" data-field="thumbnailImage" tabIndex={-1}>
                        <label className="block text-sm font-medium mb-2">Poster sự kiện <span className="text-feedback-error-text">*</span></label>
                        <div className={`relative aspect-[3/4] border-2 border-dashed rounded-ds-lg hover:bg-bg-subtle transition-colors cursor-pointer text-center overflow-hidden flex flex-col items-center justify-center ${
                            errors.thumbnailImage ? "border-feedback-error-border" : "border-border-default"
                        }`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'thumbnail')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {formData.thumbnailPreview ? (
                                <img src={formData.thumbnailPreview} alt="Poster" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-text-muted p-4">
                                    <div className="w-10 h-10 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-2 border border-border-default">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    </div>
                                    <p className="text-sm font-medium">Kéo thả hoặc nhấn để tải lên</p>
                                    <p className="text-xs mt-1 opacity-70">PNG / JPG - tối đa 8MB</p>
                                </div>
                            )}
                        </div>
                        {renderError("thumbnailImage")}
                    </div>
                    <div className="col-span-1 md:col-span-2" data-field="bannerImage" tabIndex={-1}>
                        <label className="block text-sm font-medium mb-2">Ảnh nền / Cover <span className="text-feedback-error-text">*</span></label>
                        <div className={`relative aspect-video border-2 border-dashed rounded-ds-lg hover:bg-bg-subtle transition-colors cursor-pointer text-center overflow-hidden flex flex-col items-center justify-center bg-bg-subtle ${
                            errors.bannerImage ? "border-feedback-error-border" : "border-border-default"
                        }`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'banner')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {formData.bannerPreview ? (
                                <img src={formData.bannerPreview} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-text-muted p-4">
                                    <div className="w-10 h-10 bg-bg-elevated rounded-full flex items-center justify-center mx-auto mb-2 border border-border-default">
                                        <ImageIcon size={20} />
                                    </div>
                                    <p className="text-sm font-medium">cover-anh-trai-say-hi.jpg</p>
                                    <p className="text-xs mt-1 opacity-70">1920 × 1080 - 842 KB</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-2">Tỷ lệ khuyến nghị 16:9, tối thiểu 1600 × 900 px</p>
                        {renderError("bannerImage")}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-lg flex items-start gap-2 text-sm">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>Ảnh phải đúng chuẩn hiển thị để được duyệt. Tránh để text quan trọng ngoài vùng an toàn.</span>
                </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlignLeft className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Thông tin cơ bản</h3>
                </div>
                
                <div className="space-y-4">
                    <div data-field="eventName">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Tên sự kiện <span className="text-feedback-error-text">*</span></label>
                            <span className="text-xs text-text-muted">Tối đa 120 ký tự</span>
                        </div>
                        <input
                            type="text"
                            value={formData.eventName}
                            onChange={(e) => updateField("eventName", e.target.value)}
                            className={fieldClass("eventName")}
                            placeholder="Tên sự kiện..."
                        />
                        {renderError("eventName")}
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Tagline / Tiêu đề phụ ngắn</label>
                            <span className="text-xs text-text-muted">Hiển thị phụ trên trang sự kiện</span>
                        </div>
                        <input
                            type="text"
                            value={formData.tagline}
                            onChange={(e) => updateField("tagline", e.target.value)}
                            className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus focus:ring-1 focus:ring-focus-ring outline-none"
                            placeholder="Tagline..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div data-field="eventType" tabIndex={-1}>
                            <label className="block text-sm font-medium mb-2">Hình thức sự kiện <span className="text-feedback-error-text">*</span></label>
                            <div className={`flex p-1 bg-bg-subtle rounded-ds-lg border ${errors.eventType ? "border-feedback-error-border" : "border-border-default"}`}>
                                {EVENT_TYPE_OPTIONS.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        disabled={type.disabled}
                                        aria-disabled={type.disabled}
                                        onClick={() => {
                                            if (!type.disabled) {
                                                updateField("eventType", "OFFLINE");
                                            }
                                        }}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-ds-md transition-colors ${
                                            formData.eventType === type.value
                                                ? "bg-bg-surface text-text-primary shadow-sm border border-border-subtle" 
                                                : type.disabled
                                                    ? "cursor-not-allowed text-text-disabled opacity-60"
                                                    : "text-text-secondary hover:text-text-primary"
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {renderError("eventType")}
                        </div>

                        <div data-field="category" tabIndex={-1}>
                            <label className="block text-sm font-medium mb-2">Thể loại sự kiện <span className="text-feedback-error-text">*</span></label>
                            {categoryState.loading ? (
                                renderDictionaryMessage("Đang tải thể loại sự kiện...")
                            ) : categoryState.error ? (
                                renderDictionaryMessage(categoryState.error, onRetryCategories)
                            ) : categories.length === 0 ? (
                                renderDictionaryMessage("Chưa có thể loại sự kiện khả dụng.", onRetryCategories)
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => {
                                                updateField("category", category);
                                                onCategoryChange?.();
                                            }}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                formData.category === category
                                                    ? "bg-action-brand-bg-default text-action-brand-text-default border-transparent"
                                                    : "bg-transparent border-border-default text-text-secondary hover:bg-bg-subtle"
                                            }`}
                                        >
                                            {getEventCategoryLabel(category)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {categoryMessage && (
                                <p className="mt-2 rounded-ds-lg border border-feedback-error-border bg-feedback-error-bg px-3 py-2 text-sm text-feedback-error-text">
                                    {categoryMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Địa điểm */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-text-secondary" size={20} />
                        <h3 className="text-lg font-bold text-text-primary">Địa điểm / nền tảng tổ chức</h3>
                    </div>
                    {formData.eventType !== "OFFLINE" && (
                        <span className="px-2 py-1 bg-bg-elevated text-text-muted text-xs rounded-ds-md border border-border-default">
                            {formData.eventType}
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <div data-field="venue">
                        <label className="block text-sm font-medium mb-1">Tên địa điểm <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="text"
                            value={formData.venue}
                            onChange={(e) => updateField("venue", e.target.value)}
                            className={fieldClass("venue")}
                            placeholder="Nhà thi đấu Phú Thọ..."
                        />
                        {renderError("venue")}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div data-field="provinceCode">
                            <label className="block text-sm font-medium mb-1">Tỉnh / Thành phố <span className="text-feedback-error-text">*</span></label>
                            <select
                                value={formData.provinceCode}
                                onChange={(e) => {
                                    const provinceCode = Number(e.target.value);
                                    const provinceName = provinces.find((province) => province.code === provinceCode)?.name ?? "";
                                    onProvinceChange(provinceCode, provinceName);
                                }}
                                className={fieldClass("provinceCode")}
                                disabled={provinceState.loading || Boolean(provinceState.error) || provinces.length === 0}
                            >
                                <option value={0}>
                                    {provinceState.loading ? "Đang tải tỉnh/thành..." : "Chọn tỉnh/thành"}
                                </option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                            {provinceState.error && renderDictionaryMessage(provinceState.error, onRetryProvinces)}
                            {!provinceState.loading && !provinceState.error && provinces.length === 0 && renderDictionaryMessage("Chưa có tỉnh/thành khả dụng.", onRetryProvinces)}
                            {renderError("provinceCode")}
                        </div>
                        <div data-field="wardCode">
                            <label className="block text-sm font-medium mb-1">Quận / Huyện <span className="text-feedback-error-text">*</span></label>
                            <select
                                value={formData.wardCode}
                                onChange={(e) => {
                                    const wardCode = Number(e.target.value);
                                    const wardName = wards.find((ward) => ward.code === wardCode)?.name ?? "";
                                    onWardChange(wardCode, wardName);
                                }}
                                className={fieldClass("wardCode")}
                                disabled={!formData.provinceCode || wardState.loading || Boolean(wardState.error) || wards.length === 0}
                            >
                                <option value={0}>
                                    {!formData.provinceCode
                                        ? "Chọn tỉnh/thành trước"
                                        : wardState.loading
                                            ? "Đang tải quận/huyện..."
                                            : "Chọn quận/huyện"}
                                </option>
                                {wards.map((w) => (
                                    <option key={w.code} value={w.code}>{w.name}</option>
                                ))}
                            </select>
                            {formData.provinceCode > 0 && wardState.error && renderDictionaryMessage(wardState.error, onRetryWards)}
                            {formData.provinceCode > 0 && !wardState.loading && !wardState.error && wards.length === 0 && renderDictionaryMessage("Chưa có quận/huyện cho tỉnh/thành đã chọn.", onRetryWards)}
                            {renderError("wardCode")}
                        </div>
                    </div>

                    <div data-field="address">
                        <label className="block text-sm font-medium mb-1">Địa chỉ chi tiết <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            className={fieldClass("address")}
                            placeholder="Số nhà, tên đường..."
                        />
                        {renderError("address")}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Ghim vị trí trên bản đồ</label>
                        <div className="h-[250px] w-full rounded-ds-xl overflow-hidden border border-border-default relative">
                            <MapPicker
                                onLocationSelect={(lat, lng) => {
                                    updateField("latitude", lat);
                                    updateField("longitude", lng);
                                }}
                                initialPos={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : undefined}
                            />
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                            <MapPin size={12} />
                            <span>Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mô tả sự kiện */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlignLeft className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Mô tả sự kiện</h3>
                </div>

                <div className="space-y-4">
                    <div data-field="shortDescription">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Tóm tắt ngắn <span className="text-feedback-error-text">*</span></label>
                            <span className="text-xs text-text-muted">Tối đa 160 ký tự</span>
                        </div>
                        <textarea
                            value={formData.shortDescription}
                            onChange={(e) => updateField("shortDescription", e.target.value)}
                            rows={2}
                            className={`${fieldClass("shortDescription")} resize-none`}
                            placeholder="Mô tả ngắn gọn về sự kiện..."
                        />
                        {renderError("shortDescription")}
                    </div>
                    
                    <div data-field="detailedDescription">
                        <label className="block text-sm font-medium mb-1">Mô tả chi tiết <span className="text-feedback-error-text">*</span></label>
                        {/* Placeholder for Rich Text Editor */}
                        <div className={`border rounded-ds-lg overflow-hidden bg-field-bg-default focus-within:ring-1 focus-within:ring-focus-ring transition-shadow ${
                            errors.detailedDescription
                                ? "border-feedback-error-border focus-within:border-feedback-error-border"
                                : "border-border-default focus-within:border-field-border-focus"
                        }`}>
                            <div className="bg-bg-subtle border-b border-border-default px-3 py-2 flex items-center gap-2 text-text-secondary">
                                <button type="button" className="p-1 hover:bg-bg-surface rounded font-bold">B</button>
                                <button type="button" className="p-1 hover:bg-bg-surface rounded italic">I</button>
                                <button type="button" className="p-1 hover:bg-bg-surface rounded underline">U</button>
                                <div className="w-px h-4 bg-border-default mx-1"></div>
                                <button type="button" className="p-1 hover:bg-bg-surface rounded text-sm">H1</button>
                                <button type="button" className="p-1 hover:bg-bg-surface rounded text-sm">H2</button>
                            </div>
                            <textarea
                                value={formData.detailedDescription}
                                onChange={(e) => updateField("detailedDescription", e.target.value)}
                                rows={8}
                                className="w-full p-3 bg-transparent outline-none resize-y"
                                placeholder="Nội dung chi tiết..."
                            />
                        </div>
                        {renderError("detailedDescription")}
                    </div>

                    <div className="rounded-ds-lg border border-feedback-warning-border bg-feedback-warning-bg p-3 text-sm text-feedback-warning-text flex items-start gap-2">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <span>Không đưa thông tin liên hệ trái quy định (SĐT, email, link bên ngoài) trong nội dung hiển thị công khai. Vi phạm có thể khiến sự kiện bị từ chối duyệt.</span>
                    </div>
                </div>
            </div>

            {/* Thông tin ban tổ chức */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Thông tin ban tổ chức</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">Thông tin này được kế thừa từ hồ sơ tổ chức và có thể chỉnh sửa riêng cho event.</p>

                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="shrink-0">
                        <div className="w-24 h-24 bg-action-brand-bg-default text-action-brand-text-default rounded-ds-xl flex items-center justify-center font-bold text-2xl mx-auto">
                            ECS
                        </div>
                        <button type="button" className="text-xs text-text-secondary hover:text-text-primary w-full text-center mt-2">
                            Đổi logo
                        </button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div data-field="organizerName">
                            <label className="block text-sm font-medium mb-1">Tên ban tổ chức <span className="text-feedback-error-text">*</span></label>
                            <input
                                type="text"
                                value={formData.organizerName}
                                onChange={(e) => updateField("organizerName", e.target.value)}
                                className={fieldClass("organizerName")}
                                placeholder="Tên đơn vị tổ chức..."
                            />
                            {renderError("organizerName")}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div data-field="organizerEmail">
                                <label className="block text-sm font-medium mb-1">Email hỗ trợ <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="email"
                                    value={formData.organizerEmail}
                                    onChange={(e) => updateField("organizerEmail", e.target.value)}
                                    className={fieldClass("organizerEmail")}
                                    placeholder="email@example.com"
                                />
                                {renderError("organizerEmail")}
                            </div>
                            <div data-field="organizerPhone">
                                <label className="block text-sm font-medium mb-1">Số điện thoại hỗ trợ <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="text"
                                    value={formData.organizerPhone}
                                    onChange={(e) => updateField("organizerPhone", e.target.value)}
                                    className={fieldClass("organizerPhone")}
                                    placeholder="1900 0000"
                                />
                                {renderError("organizerPhone")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
