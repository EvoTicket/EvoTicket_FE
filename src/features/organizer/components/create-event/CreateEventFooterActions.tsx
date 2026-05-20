import { Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onSaveDraft?: () => void;
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

export function CreateEventFooterActions({ currentStep, totalSteps, onBack, onNext, onSaveDraft, onSubmit, isSubmitting }: Props) {
    const t = useTranslations("CreateEvent.Shell");
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="sticky bottom-0 z-40 bg-bg-surface border-t border-border-default p-4 flex items-center justify-between shadow-lg">
            <div>
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-ds-lg font-medium border border-border-default text-text-secondary hover:bg-bg-subtle transition-colors"
                    >
                        {t("back")}
                    </button>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-ds-lg font-medium border border-border-default text-text-primary hover:bg-bg-subtle transition-colors flex items-center gap-2"
                >
                    <Save size={18} />
                    {t("save_draft")}
                </button>
                
                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-ds-lg font-medium bg-action-brand-bg-default text-action-brand-text-default hover:bg-action-brand-bg-hover transition-colors min-w-[140px] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : null}
                        {t("submit")}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        className="px-6 py-2 rounded-ds-lg font-medium bg-action-brand-bg-default text-action-brand-text-default hover:bg-action-brand-bg-hover transition-colors"
                    >
                        {t("continue")}
                    </button>
                )}
            </div>
        </div>
    );
}
