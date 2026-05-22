import { ReactNode } from "react";
import { CreateEventWizardStepper } from "./CreateEventWizardStepper";
import { CreateEventFooterActions } from "./CreateEventFooterActions";
import { Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
    step: number;
    title: string;
    description: string;
    children: ReactNode;
    rightPanel?: ReactNode;
    onBack: () => void;
    onNext: () => void;
    onSubmit?: () => void;
    onSaveDraft?: () => void;
    isSubmitting?: boolean;
}

export function CreateEventWizardShell({
    step, title, description, children, rightPanel,
    onBack, onNext, onSubmit, onSaveDraft, isSubmitting
}: Props) {
    const { locale } = useParams();
    const t = useTranslations("CreateEvent.Shell");
    const tWizard = useTranslations("CreateEvent.Wizard");

    return (
        <div className="dark flex min-h-screen flex-col bg-bg-page">
            {/* Header */}
            <div className="bg-bg-surface border-b border-border-default sticky top-0 z-30 pt-4 px-4 sm:px-6">
                <div className="max-w-[1860px] mx-auto flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg" 
                            alt="EvoTicket Workspace" 
                            width={140} 
                            height={32} 
                            className="object-contain" 
                            priority 
                        />
                        <div className="h-6 w-px bg-border-default mx-1 hidden sm:block"></div>
                        <p className="text-xs text-text-muted hidden sm:block mt-1">Evo Culture Studio</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}/organizer/center`}
                            className="p-1 text-text-muted hover:text-text-primary rounded-ds-md hover:bg-bg-subtle transition-colors"
                        >
                            <X size={20} />
                        </Link>
                    </div>
                </div>

                <div className="max-w-[1860px] mx-auto">
                    <CreateEventWizardStepper currentStep={step} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1860px] mx-auto w-full px-4 sm:px-6 py-8 flex-1">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">{title} <span className="text-text-muted text-sm font-normal bg-bg-elevated px-2 py-1 rounded-full ml-2 border border-border-default">{tWizard("step_progress_indicator", { current: step, total: 5 })}</span></h2>
                    <p className="text-text-secondary mt-1">{description}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left/Main column */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {children}
                    </div>

                    {/* Right column */}
                    {rightPanel && (
                        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                            {rightPanel}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <CreateEventFooterActions
                    currentStep={step}
                    totalSteps={5}
                    onBack={onBack}
                    onNext={onNext}
                    onSubmit={onSubmit}
                    onSaveDraft={onSaveDraft}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}
