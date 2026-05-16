import { Check } from "lucide-react";

interface StepItem {
    id: number;
    title: string;
    description?: string;
}

const steps: StepItem[] = [
    { id: 1, title: "Thông tin sự kiện" },
    { id: 2, title: "Suất diễn & Loại vé" },
    { id: 3, title: "Cài đặt" },
    { id: 4, title: "Hồ sơ thanh toán áp dụng" },
    { id: 5, title: "Review & Submit" }
];

interface Props {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export function CreateEventWizardStepper({ currentStep, onStepClick }: Props) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {steps.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                    <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-ds-lg border transition-colors ${
                                isActive 
                                    ? "bg-bg-elevated border-border-default text-text-primary" 
                                    : isCompleted
                                        ? "bg-transparent border-transparent text-text-secondary hover:bg-bg-subtle"
                                        : "bg-transparent border-transparent text-text-muted opacity-50 cursor-not-allowed"
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isActive 
                                    ? "bg-action-brand-bg-default text-action-brand-text-default" 
                                    : isCompleted
                                        ? "bg-feedback-success-bg text-feedback-success-text"
                                        : "bg-bg-subtle text-text-muted"
                            }`}>
                                {isCompleted ? <Check size={14} /> : step.id}
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] uppercase font-semibold text-text-muted">Bước {step.id}</span>
                                <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                            </div>
                        </button>
                        {idx < steps.length - 1 && (
                            <div className="text-text-muted/50 px-2">&gt;</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
