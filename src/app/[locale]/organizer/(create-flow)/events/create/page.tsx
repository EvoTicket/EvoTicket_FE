"use client";

import { useEffect, useState } from "react";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { useCreateEventWizard } from "./useCreateEventWizard";
import { CreateEventWizardShell } from "./components/CreateEventWizardShell";
import { CreateEventStep1BasicInfo } from "./components/CreateEventStep1BasicInfo";
import { CreateEventStep2Showtimes } from "./components/CreateEventStep2Showtimes";
import { CreateEventStep3Settings } from "./components/CreateEventStep3Settings";
import { CreateEventStep4Settlement } from "./components/CreateEventStep4Settlement";
import { CreateEventStep5Review } from "./components/CreateEventStep5Review";
import { CreateEventSuccessScreen } from "./components/CreateEventSuccessScreen";
import { CheckCircle2 } from "lucide-react";
import {
    getStepProgress,
    validateStep,
    type CreateEventStep,
    type StepErrors,
} from "./createEventValidation";

type ChecklistItem = {
    label: string;
    checked: boolean;
};

function RightPanelChecklist({
    draftProgress,
    items,
}: {
    draftProgress: number;
    items: ChecklistItem[];
}) {
    return (
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm sticky top-24">
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
    const wizard = useCreateEventWizard();
    const [stepErrors, setStepErrors] = useState<Partial<Record<CreateEventStep, StepErrors>>>({});
    
    // We keep fetching the dictionaries required for the form here 
    // to pass them to Step 1.
    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [wards, setWards] = useState<{ code: number; name: string }[]>([]);

    useEffect(() => {
        const loadDictionaries = async () => {
            try {
                const provRes = await api.get("/iam-service/api/locations/provinces");
                if (provRes.data) setProvinces(provRes.data);
            } catch (error) {
                console.error("Failed to load dictionaries", error);
            }
        };
        void loadDictionaries();
    }, []);

    useEffect(() => {
        if (wizard.formData.provinceCode) {
            const loadWards = async () => {
                try {
                    const res = await api.get("/iam-service/api/locations/wards", {
                        params: { provinceCode: wizard.formData.provinceCode }
                    });
                    if (res.data) setWards(Array.isArray(res.data) ? res.data : res.data.data || []);
                } catch (error) {
                    console.error("Failed to load wards", error);
                }
            };
            void loadWards();
        }
    }, [wizard.formData.provinceCode]);

    if (wizard.isSuccess) {
        return <CreateEventSuccessScreen formData={wizard.formData} />;
    }

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

    const handleSubmit = () => {
        const validation = validateStep(5, wizard.formData);
        if (Object.keys(validation.errors).length > 0) {
            setStepErrors(prev => ({ ...prev, 5: validation.errors }));
            toast.error("Vui lòng hoàn tất tất cả các bước trước khi gửi duyệt.");
            scrollToField(validation.firstInvalidField);
            return;
        }
        void wizard.submitForm();
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
                { label: "Thông tin BTC", checked: !!wizard.formData.organizerName && !!wizard.formData.organizerEmail && !!wizard.formData.organizerPhone },
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
                { label: "Slug hợp lệ", checked: Object.keys(validateStep(3, wizard.formData).errors).filter(key => key === "urlSlug").length === 0 },
                { label: "Quy tắc bán vé", checked: true },
                { label: "Chính sách resale", checked: true },
                { label: "Cấu hình cổng", checked: wizard.formData.gates.length > 0 && wizard.formData.gates.every(gate => gate.name) },
            ];
        }
        if (wizard.step === 4) {
            return [
                { label: "Hồ sơ đối soát", checked: !!wizard.formData.selectedProfileId },
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
                    provinces={provinces}
                    wards={wards}
                    errors={stepErrors[1]}
                    onCategoryChange={() => setStepErrors(prev => {
                        const rest = { ...(prev[1] ?? {}) };
                        delete rest.category;
                        return { ...prev, 1: rest };
                    })}
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
