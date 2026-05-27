import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface StepItem {
    id: number;
}

const steps: StepItem[] = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 }
];

interface Props {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export function CreateEventWizardStepper({ currentStep, onStepClick }: Props) {
    const t = useTranslations("CreateEvent.Wizard");

    return (
        <div className="flex items-center w-full overflow-x-auto pb-4">
            {steps.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                    <div key={step.id} className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
                        <button
                            type="button"
                            onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-ds-lg border transition-colors flex-shrink-0 ${
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
                                <span className="text-[10px] uppercase font-semibold text-text-muted">
                                    {t("step_label", { number: step.id })}
                                </span>
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {t(`step${step.id}_name`)}
                                </span>
                            </div>
                        </button>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 flex justify-center text-text-muted/50 min-w-[32px] font-medium">&gt;</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

