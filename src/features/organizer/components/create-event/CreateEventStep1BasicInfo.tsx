import React from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Image as ImageIcon, MapPin, AlignLeft, Building2, ChevronDown, Check } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
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
    const t = useTranslations("CreateEvent.Step1");
    const tValidation = useTranslations("CreateEvent.Validation");
    
    const categoryMessage = categoryError ?? (errors.category ? tValidation(errors.category.replace("Validation.", "")) : null);

    const fieldClass = (field: string) =>
        `w-full p-2.5 border rounded-ds-lg bg-field-bg-default focus:ring-1 focus:ring-focus-ring outline-none ${
            errors[field]
                ? "border-feedback-error-border focus:border-feedback-error-border"
                : "border-border-default focus:border-field-border-focus"
        }`;

    const renderError = (field: string) => (
        errors[field] ? (
            <p className="mt-1.5 text-sm text-feedback-error-text">{tValidation(errors[field].replace("Validation.", ""))}</p>
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
                    {t("retry")}
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
                    <h3 className="text-lg font-bold text-text-primary">{t("images.title")}</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">{t("images.desc")}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1" data-field="thumbnailImage" tabIndex={-1}>
                        <label className="block text-sm font-medium mb-2">{t("images.poster")} <span className="text-feedback-error-text">*</span></label>
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
                                    <p className="text-sm font-medium">{t("images.drag_drop")}</p>
                                    <p className="text-xs mt-1 opacity-70">{t("images.limits")}</p>
                                </div>
                            )}
                        </div>
                        {renderError("thumbnailImage")}
                    </div>
                    <div className="col-span-1 md:col-span-2" data-field="bannerImage" tabIndex={-1}>
                        <label className="block text-sm font-medium mb-2">{t("images.cover")} <span className="text-feedback-error-text">*</span></label>
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
                                    <p className="text-sm font-medium">{t("images.drag_drop")}</p>
                                    <p className="text-xs mt-1 opacity-70">{t("images.limits")}</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-2">{t("images.cover_hint")}</p>
                        {renderError("bannerImage")}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-feedback-warning-bg border border-feedback-warning-border text-feedback-warning-text rounded-ds-lg flex items-start gap-2 text-sm">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{t("images.warning")}</span>
                </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <AlignLeft className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">{t("basic_info.title")}</h3>
                </div>
                
                <div className="space-y-4">
                    <div data-field="eventName">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">{t("basic_info.event_name")} <span className="text-feedback-error-text">*</span></label>
                            <span className="text-xs text-text-muted">{t("basic_info.event_name_hint")}</span>
                        </div>
                        <input
                            type="text"
                            value={formData.eventName}
                            onChange={(e) => updateField("eventName", e.target.value)}
                            className={fieldClass("eventName")}
                            placeholder={t("basic_info.event_name_placeholder")}
                        />
                        {renderError("eventName")}
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">{t("basic_info.tagline")}</label>
                            <span className="text-xs text-text-muted">{t("basic_info.tagline_hint")}</span>
                        </div>
                        <input
                            type="text"
                            value={formData.tagline}
                            onChange={(e) => updateField("tagline", e.target.value)}
                            className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus focus:ring-1 focus:ring-focus-ring outline-none"
                            placeholder={t("basic_info.tagline_placeholder")}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div data-field="eventType" tabIndex={-1}>
                            <label className="block text-sm font-medium mb-2">{t("basic_info.event_format")} <span className="text-feedback-error-text">*</span></label>
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
                            <label className="block text-sm font-medium mb-2">{t("basic_info.category")} <span className="text-feedback-error-text">*</span></label>
                            {categoryState.loading ? (
                                renderDictionaryMessage(t("basic_info.loading_category"))
                            ) : categoryState.error ? (
                                renderDictionaryMessage(categoryState.error, onRetryCategories)
                            ) : categories.length === 0 ? (
                                renderDictionaryMessage(t("basic_info.no_category"), onRetryCategories)
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
                        <h3 className="text-lg font-bold text-text-primary">{t("location.title")}</h3>
                    </div>
                    {formData.eventType !== "OFFLINE" && (
                        <span className="px-2 py-1 bg-bg-elevated text-text-muted text-xs rounded-ds-md border border-border-default">
                            {formData.eventType}
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <div data-field="venue">
                        <label className="block text-sm font-medium mb-1">{t("location.venue")} <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="text"
                            value={formData.venue}
                            onChange={(e) => updateField("venue", e.target.value)}
                            className={fieldClass("venue")}
                            placeholder={t("location.venue_placeholder")}
                        />
                        {renderError("venue")}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div data-field="provinceCode">
                            <label className="block text-sm font-medium mb-1">{t("location.province")} <span className="text-feedback-error-text">*</span></label>
                            <Listbox
                                value={formData.provinceCode}
                                onChange={(code: number) => {
                                    const provinceName = provinces.find((province) => province.code === code)?.name ?? "";
                                    onProvinceChange(code, provinceName);
                                }}
                                disabled={provinceState.loading || Boolean(provinceState.error) || provinces.length === 0}
                            >
                                <div className="relative">
                                    <ListboxButton
                                        className={`${fieldClass("provinceCode")} flex items-center justify-between text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <span>
                                            {formData.provinceCode > 0
                                                ? formData.provinceName
                                                : provinceState.loading
                                                ? t("location.loading_province")
                                                : t("location.select_province")}
                                        </span>
                                        <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2" />
                                    </ListboxButton>
                                    <ListboxOptions
                                        anchor="bottom start"
                                        modal={false}
                                        className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                    >
                                        <ListboxOption
                                            value={0}
                                            className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm text-text-muted"
                                        >
                                            <span className="group-data-[selected]:font-semibold">{t("location.select_province")}</span>
                                            <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                        </ListboxOption>
                                        {provinces.map((p) => (
                                            <ListboxOption
                                                key={p.code}
                                                value={p.code}
                                                className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                            >
                                                <span className="group-data-[selected]:font-semibold">{p.name}</span>
                                                <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </div>
                            </Listbox>
                            {provinceState.error && renderDictionaryMessage(provinceState.error, onRetryProvinces)}
                            {!provinceState.loading && !provinceState.error && provinces.length === 0 && renderDictionaryMessage(t("location.no_province"), onRetryProvinces)}
                            {renderError("provinceCode")}
                        </div>
                        <div data-field="wardCode">
                            <label className="block text-sm font-medium mb-1">{t("location.ward")} <span className="text-feedback-error-text">*</span></label>
                            <Listbox
                                value={formData.wardCode}
                                onChange={(code: number) => {
                                    const wardName = wards.find((ward) => ward.code === code)?.name ?? "";
                                    onWardChange(code, wardName);
                                }}
                                disabled={!formData.provinceCode || wardState.loading || Boolean(wardState.error) || wards.length === 0}
                            >
                                <div className="relative">
                                    <ListboxButton
                                        className={`${fieldClass("wardCode")} flex items-center justify-between text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <span>
                                            {formData.wardCode > 0
                                                ? formData.wardName
                                                : !formData.provinceCode
                                                ? t("location.select_province_first")
                                                : wardState.loading
                                                ? t("location.loading_ward")
                                                : t("location.select_ward")}
                                        </span>
                                        <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2" />
                                    </ListboxButton>
                                    <ListboxOptions
                                        anchor="bottom start"
                                        modal={false}
                                        className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                    >
                                        <ListboxOption
                                            value={0}
                                            className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm text-text-muted"
                                        >
                                            <span className="group-data-[selected]:font-semibold">{t("location.select_ward")}</span>
                                            <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                        </ListboxOption>
                                        {wards.map((w) => (
                                            <ListboxOption
                                                key={w.code}
                                                value={w.code}
                                                className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                            >
                                                <span className="group-data-[selected]:font-semibold">{w.name}</span>
                                                <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </div>
                            </Listbox>
                            {formData.provinceCode > 0 && wardState.error && renderDictionaryMessage(wardState.error, onRetryWards)}
                            {formData.provinceCode > 0 && !wardState.loading && !wardState.error && wards.length === 0 && renderDictionaryMessage(t("location.no_ward"), onRetryWards)}
                            {renderError("wardCode")}
                        </div>
                    </div>

                    <div data-field="address">
                        <label className="block text-sm font-medium mb-1">{t("location.address")} <span className="text-feedback-error-text">*</span></label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            className={fieldClass("address")}
                            placeholder={t("location.address_placeholder")}
                        />
                        {renderError("address")}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">{t("location.map_pin")}</label>
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
                    <h3 className="text-lg font-bold text-text-primary">{t("description.title")}</h3>
                </div>

                <div className="space-y-4">
                    <div data-field="shortDescription">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">{t("description.short_desc")} <span className="text-feedback-error-text">*</span></label>
                            <span className="text-xs text-text-muted">{t("description.short_desc_hint")}</span>
                        </div>
                        <textarea
                            value={formData.shortDescription}
                            onChange={(e) => updateField("shortDescription", e.target.value)}
                            rows={2}
                            className={`${fieldClass("shortDescription")} resize-none`}
                            placeholder={t("description.short_desc_placeholder")}
                        />
                        {renderError("shortDescription")}
                    </div>
                    
                    <div data-field="detailedDescription">
                        <label className="block text-sm font-medium mb-1">{t("description.detailed_desc")} <span className="text-feedback-error-text">*</span></label>
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
                                placeholder={t("description.detailed_desc_placeholder")}
                            />
                        </div>
                        {renderError("detailedDescription")}
                    </div>

                    <div className="rounded-ds-lg border border-feedback-warning-border bg-feedback-warning-bg p-3 text-sm text-feedback-warning-text flex items-start gap-2">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <span>{t("description.warning")}</span>
                    </div>
                </div>
            </div>

            {/* Thông tin ban tổ chức */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">{t("organizer.title")}</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">{t("organizer.desc")}</p>

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
                            <label className="block text-sm font-medium mb-1">{t("organizer.name")} <span className="text-feedback-error-text">*</span></label>
                            <input
                                type="text"
                                value={formData.organizerName}
                                disabled
                                className={`${fieldClass("organizerName")} bg-bg-muted cursor-not-allowed text-text-secondary`}
                                placeholder={t("organizer.name_placeholder")}
                            />
                            {renderError("organizerName")}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div data-field="organizerEmail">
                                <label className="block text-sm font-medium mb-1">{t("organizer.email")} <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="email"
                                    value={formData.organizerEmail}
                                    disabled
                                    className={`${fieldClass("organizerEmail")} bg-bg-muted cursor-not-allowed text-text-secondary`}
                                    placeholder="email@example.com"
                                />
                                {renderError("organizerEmail")}
                            </div>
                            <div data-field="organizerPhone">
                                <label className="block text-sm font-medium mb-1">{t("organizer.phone")} <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="text"
                                    value={formData.organizerPhone}
                                    disabled
                                    className={`${fieldClass("organizerPhone")} bg-bg-muted cursor-not-allowed text-text-secondary`}
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
