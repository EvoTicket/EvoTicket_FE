"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { categoryApi } from "@/src/features/organizer/api/categoryApi";
import { locationApi } from "@/src/features/organizer/api/locationApi";
import { organizerEventApi } from "@/src/features/organizer/api/organizerEventApi";
import type {
    BaseResponse,
    CreateEventMultipartPayload,
    CreateEventRequest,
    CreateTicketTypeRequest,
    EventCategory,
    ProvinceResponse,
    WardResponse,
} from "@/src/features/organizer/types/api";
import { useCreateEventWizard } from "./useCreateEventWizard";
import { CreateEventWizardShell } from "./CreateEventWizardShell";
import { CreateEventStep1BasicInfo } from "./CreateEventStep1BasicInfo";
import { CreateEventStep2Showtimes } from "./CreateEventStep2Showtimes";
import { CreateEventStep3Settings } from "./CreateEventStep3Settings";
import { CreateEventStep4Settlement } from "./CreateEventStep4Settlement";
import { CreateEventStep5Review } from "./CreateEventStep5Review";
import { CheckCircle2 } from "lucide-react";
import {
    getStepProgress,
    validateCreateEvent,
    validateStep,
    type CreateEventStep,
    type StepErrors,
} from "./createEventValidation";

type ChecklistItem = {
    label: string;
    checked: boolean;
};

type DictionaryState = {
    loading: boolean;
    error: string | null;
};

type ApiErrorBody = Partial<BaseResponse<unknown>> & {
    error?: string;
    code?: string;
};

/**
 * HTML datetime-local inputs emit values like "2026-05-20T19:00" (no seconds).
 * Spring's LocalDateTime parser requires at least "yyyy-MM-ddTHH:mm:ss", so
 * we append ":00" when the seconds component is absent.
 */
function toLocalDateTime(value: string) {
    const trimmed = value.trim();
    // "2026-05-20T19:00" → 16 chars  |  "2026-05-20T19:00:00" → 19 chars
    if (trimmed.length === 16) return `${trimmed}:00`;
    return trimmed;
}

function buildCreateEventPayload(state: ReturnType<typeof useCreateEventWizard>["formData"]): CreateEventMultipartPayload {
    // Backend enforces @Min(1) on totalSeats.
    const totalSeats = Math.max(1, state.ticketTypes.reduce((sum, ticket) => sum + ticket.quantityTotal, 0));

    const showtimes = state.showtimes.map((showtime) => {
        const ticketTypes: CreateTicketTypeRequest[] = state.ticketTypes
            .filter((ticket) => ticket.showtimeId === showtime.id)
            .map((ticket) => ({
                typeName: ticket.typeName.trim(),
                description: ticket.description.trim() || undefined,
                price: ticket.price,
                quantityTotal: ticket.quantityTotal,
                minPurchase: ticket.minPurchase,
                maxPurchase: ticket.maxPurchase,
                saleStartDate: toLocalDateTime(ticket.saleStartDate),
                saleEndDate: toLocalDateTime(ticket.saleEndDate),
            }));

        return {
            startDatetime: toLocalDateTime(showtime.startDatetime),
            endDatetime: toLocalDateTime(showtime.endDatetime),
            venue: state.venue.trim(),
            address: state.address.trim(),
            wardCode: state.wardCode,
            provinceCode: state.provinceCode,
            ticketTypes,
        };
    });

    const event: CreateEventRequest = {
        eventName: state.eventName.trim(),
        introduction: state.shortDescription.trim(),
        description: state.detailedDescription.trim(),
        venue: state.venue.trim(),
        wardCode: state.wardCode,
        provinceCode: state.provinceCode,
        address: state.address.trim(),
        eventType: state.eventType,
        totalSeats,
        checkers: state.expectedCheckers,
        isFeatured: false,
        latitude: state.latitude,
        longitude: state.longitude,
        category: state.category,
        showtimes,
    };

    return {
        event,
        bannerImage: state.bannerImage ?? state.bannerFile,
        thumbnailImage: state.thumbnailImage ?? state.thumbnailFile,
    };
}

function getCreateEventErrorMessage(error: unknown) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
        if (error.response?.status === 413) {
            return "Ảnh tải lên quá lớn. Vui lòng giảm dung lượng ảnh và thử lại.";
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
            return "Phiên đăng nhập hoặc quyền tổ chức không hợp lệ. Vui lòng đăng nhập lại hoặc kiểm tra trạng thái tổ chức.";
        }

        const body = error.response?.data;
        return body?.message || body?.error || "Không thể tạo sự kiện. Vui lòng thử lại.";
    }

    return "Không thể tạo sự kiện. Vui lòng thử lại.";
}

function RightPanelChecklist({
    draftProgress,
    items,
}: {
    draftProgress: number;
    items: ChecklistItem[];
}) {
    return (
        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-5 shadow-sm sticky top-45">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Tiến độ bước hiện tại</h3>
                <span className="font-bold text-action-brand-text-default">{draftProgress}%</span>
            </div>

            <div className="w-full bg-bg-subtle h-2 rounded-full mb-6 overflow-hidden">
                <div
                    className="bg-action-brand-bg-default h-full transition-all duration-500 ease-out"
                    style={{ width: `${draftProgress}%` }}
                />
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-bold text-text-primary mb-2">Thông tin tối thiểu</h4>
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                            size={16}
                            className={item.checked ? "text-feedback-success-text shrink-0" : "text-border-strong shrink-0"}
                        />
                        <span className={item.checked ? "text-text-primary" : "text-text-muted"}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CreateEventPage() {
    const router = useRouter();
    const params = useParams();
    const wizard = useCreateEventWizard();
    const [stepErrors, setStepErrors] = useState<Partial<Record<CreateEventStep, StepErrors>>>({});

    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [wards, setWards] = useState<WardResponse[]>([]);
    const [categoryState, setCategoryState] = useState<DictionaryState>({ loading: true, error: null });
    const [provinceState, setProvinceState] = useState<DictionaryState>({ loading: true, error: null });
    const [wardState, setWardState] = useState<DictionaryState>({ loading: false, error: null });

    const loadCategories = useCallback(async () => {
        setCategoryState({ loading: true, error: null });

        try {
            const nextCategories = await categoryApi.getCategories();
            setCategories(Array.isArray(nextCategories) ? nextCategories : []);
        } catch (error) {
            console.error("Failed to load event categories", error);
            setCategories([]);
            setCategoryState({
                loading: false,
                error: "Không thể tải thể loại sự kiện.",
            });
            return;
        }

        setCategoryState({ loading: false, error: null });
    }, []);

    const loadProvinces = useCallback(async () => {
        setProvinceState({ loading: true, error: null });

        try {
            const nextProvinces = await locationApi.getProvinces();
            setProvinces(Array.isArray(nextProvinces) ? nextProvinces : []);
        } catch (error) {
            console.error("Failed to load provinces", error);
            setProvinces([]);
            setProvinceState({
                loading: false,
                error: "Không thể tải danh sách tỉnh/thành.",
            });
            return;
        }

        setProvinceState({ loading: false, error: null });
    }, []);

    const loadWards = useCallback(async (provinceCode: number) => {
        if (!provinceCode) {
            setWards([]);
            setWardState({ loading: false, error: null });
            return;
        }

        setWardState({ loading: true, error: null });

        try {
            const nextWards = await locationApi.getWards(provinceCode);
            setWards(Array.isArray(nextWards) ? nextWards : []);
        } catch (error) {
            console.error("Failed to load wards", error);
            setWards([]);
            setWardState({
                loading: false,
                error: "Không thể tải danh sách quận/huyện.",
            });
            return;
        }

        setWardState({ loading: false, error: null });
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadCategories();
            void loadProvinces();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadCategories, loadProvinces]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadWards(wizard.formData.provinceCode);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadWards, wizard.formData.provinceCode]);

    const handleProvinceChange = useCallback(
        (provinceCode: number, provinceName: string) => {
            wizard.updateField("provinceCode", provinceCode);
            wizard.updateField("provinceName", provinceName);
            wizard.updateField("wardCode", 0);
            wizard.updateField("wardName", "");
            setWards([]);
            setWardState({ loading: Boolean(provinceCode), error: null });
        },
        [wizard]
    );

    const handleWardChange = useCallback(
        (wardCode: number, wardName: string) => {
            wizard.updateField("wardCode", wardCode);
            wizard.updateField("wardName", wardName);
        },
        [wizard]
    );

    const scrollToField = (field?: string) => {
        if (!field) return;
        window.setTimeout(() => {
            const element = document.querySelector(`[data-field="${field}"]`) as HTMLElement | null;
            if (!element) return;
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof element.focus === "function") {
                element.focus({ preventScroll: true });
                return;
            }
            const focusable = element.querySelector("input, select, textarea, button") as HTMLElement | null;
            focusable?.focus({ preventScroll: true });
        }, 0);
    };

    const handleNext = () => {
        const currentStep = wizard.step as CreateEventStep;
        const validation = validateStep(currentStep, wizard.formData);

        if (Object.keys(validation.errors).length > 0) {
            setStepErrors(prev => ({ ...prev, [currentStep]: validation.errors }));
            toast.error("Vui lòng kiểm tra các trường bắt buộc hoặc chưa hợp lệ.");
            scrollToField(validation.firstInvalidField);
            return;
        }

        setStepErrors(prev => ({ ...prev, [currentStep]: {} }));
        wizard.nextStep();
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        const validation = validateCreateEvent(wizard.formData);
        if (validation.firstInvalidStep) {
            setStepErrors(prev => ({ ...prev, ...validation.stepErrors }));
            wizard.setStep(validation.firstInvalidStep);
            toast.error("Vui lòng hoàn tất tất cả các bước trước khi gửi duyệt.");
            window.setTimeout(() => scrollToField(validation.firstInvalidField), 0);
            return;
        }

        try {
            const created = await wizard.submitForm(async (state) => {
                const payload = buildCreateEventPayload(state);
                return organizerEventApi.createEvent(payload);
            });

            if (!created) {
                toast.error("Backend chưa xác nhận tạo sự kiện thành công. Vui lòng thử lại.");
                return;
            }

            toast.success("Tạo sự kiện thành công. Danh sách sự kiện đang được làm mới.");
            const locale = typeof params.locale === "string" ? params.locale : "vi";
            router.replace(`/${locale}/organizer/center?refresh=${Date.now()}`);
            router.refresh();
        } catch (error) {
            console.error("Failed to create organizer event", error);
            toast.error(getCreateEventErrorMessage(error));
        }
    };

    const handleSaveDraft = () => {
        toast.success("Đã lưu bản nháp thành công!");
    };

    const getChecklistItems = (): ChecklistItem[] => {
        if (wizard.step === 1) {
            return [
                { label: "Poster & cover", checked: !!wizard.formData.thumbnailPreview && !!wizard.formData.bannerPreview },
                { label: "Tên sự kiện", checked: !!wizard.formData.eventName },
                { label: "Hình thức Offline", checked: wizard.formData.eventType === "OFFLINE" },
                { label: "Thể loại", checked: !!wizard.formData.category },
                { label: "Địa điểm", checked: !!wizard.formData.venue && wizard.formData.provinceCode !== 0 && wizard.formData.wardCode !== 0 && !!wizard.formData.address },
                { label: "Mô tả", checked: !!wizard.formData.shortDescription && !!wizard.formData.detailedDescription },
                { label: "Liên hệ BTC hợp lệ", checked: Object.keys(validateStep(1, wizard.formData).errors).filter(key => key === "organizerEmail" || key === "organizerPhone").length === 0 },
            ];
        }
        if (wizard.step === 2) {
            return [
                { label: "Có suất diễn", checked: wizard.formData.showtimes.length > 0 },
                { label: "Lịch suất diễn hợp lệ", checked: wizard.formData.showtimes.every(item => item.startDatetime && item.endDatetime && new Date(item.endDatetime) > new Date(item.startDatetime)) },
                { label: "Mỗi suất diễn có vé", checked: wizard.formData.showtimes.every(item => wizard.formData.ticketTypes.some(ticket => ticket.showtimeId === item.id)) },
                { label: "Loại vé hợp lệ", checked: Object.keys(validateStep(2, wizard.formData).errors).length === 0 },
            ];
        }
        if (wizard.step === 3) {
            return [
                { label: "Slug hợp lệ nếu nhập", checked: Object.keys(validateStep(3, wizard.formData).errors).filter(key => key === "urlSlug").length === 0 },
                { label: "Quy tắc bán vé", checked: true },
                { label: "Chính sách resale", checked: true },
                { label: "Cổng sẽ cấu hình sau", checked: true },
            ];
        }
        if (wizard.step === 4) {
            return [
                { label: "Hồ sơ đối soát sau duyệt", checked: true },
                { label: "Ghi chú đối soát", checked: true },
            ];
        }
        return [
            { label: "Thông tin sự kiện", checked: Object.keys(validateStep(1, wizard.formData).errors).length === 0 },
            { label: "Suất diễn & vé", checked: Object.keys(validateStep(2, wizard.formData).errors).length === 0 },
            { label: "Cài đặt", checked: Object.keys(validateStep(3, wizard.formData).errors).length === 0 },
            { label: "Thanh toán", checked: Object.keys(validateStep(4, wizard.formData).errors).length === 0 },
        ];
    };

    const currentStep = wizard.step as CreateEventStep;
    const checklistItems = getChecklistItems();
    const currentStepProgress = getStepProgress(currentStep, wizard.formData);

    const getStepContent = () => {
        switch (wizard.step) {
            case 1: return (
                <CreateEventStep1BasicInfo
                    formData={wizard.formData}
                    updateField={wizard.updateField}
                    categories={categories}
                    provinces={provinces}
                    wards={wards}
                    categoryState={categoryState}
                    provinceState={provinceState}
                    wardState={wardState}
                    errors={stepErrors[1]}
                    onCategoryChange={() => setStepErrors(prev => {
                        const rest = { ...(prev[1] ?? {}) };
                        delete rest.category;
                        return { ...prev, 1: rest };
                    })}
                    onProvinceChange={handleProvinceChange}
                    onWardChange={handleWardChange}
                    onRetryCategories={loadCategories}
                    onRetryProvinces={loadProvinces}
                    onRetryWards={() => loadWards(wizard.formData.provinceCode)}
                />
            );
            case 2: return <CreateEventStep2Showtimes formData={wizard.formData} updateField={wizard.updateField} errors={stepErrors[2]} />;
            case 3: return <CreateEventStep3Settings formData={wizard.formData} updateField={wizard.updateField} errors={stepErrors[3]} />;
            case 4: return <CreateEventStep4Settlement formData={wizard.formData} updateField={wizard.updateField} />;
            case 5: return <CreateEventStep5Review formData={wizard.formData} setStep={wizard.setStep} errors={stepErrors[5]} />;
            default: return null;
        }
    };

    const getStepInfo = () => {
        switch (wizard.step) {
            case 1: return { title: "Thông tin sự kiện", desc: "Nhập các thông tin cơ bản giúp khán giả hiểu về sự kiện của bạn." };
            case 2: return { title: "Suất diễn & Loại vé", desc: "Cấu hình lịch diễn và các loại vé mở bán." };
            case 3: return { title: "Cài đặt & Phân phối", desc: "Thiết lập quyền riêng tư, quy tắc mua vé và tính năng resale." };
            case 4: return { title: "Hồ sơ đối soát", desc: "Chọn hồ sơ pháp lý và tài khoản nhận tiền thanh toán." };
            case 5: return { title: "Kiểm tra trước khi gửi", desc: "Xác nhận lại toàn bộ thông tin trước khi gửi duyệt." };
            default: return { title: "", desc: "" };
        }
    };

    const stepInfo = getStepInfo();

    return (
        <CreateEventWizardShell
            step={wizard.step}
            title={stepInfo.title}
            description={stepInfo.desc}
            onBack={wizard.prevStep}
            onNext={handleNext}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            isSubmitting={wizard.isSubmitting}
            rightPanel={<RightPanelChecklist draftProgress={currentStepProgress} items={checklistItems} />}
        >
            {getStepContent()}
        </CreateEventWizardShell>
    );
}
