import { ReactNode } from "react";
import { CreateEventWizardStepper } from "./CreateEventWizardStepper";
import { CreateEventFooterActions } from "./CreateEventFooterActions";
import { Save, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    
    return (
        <div className="dark flex min-h-screen flex-col bg-bg-page pb-20"> 
            {/* Header */}
            <div className="bg-bg-surface border-b border-border-default sticky top-0 z-30 pt-4 px-4 sm:px-6">
                <div className="max-w-[1860px] mx-auto flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-action-brand-bg-default text-action-brand-text-default rounded-lg flex items-center justify-center font-bold text-lg">
                            E
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-text-primary">Tạo sự kiện</h1>
                            <p className="text-xs text-text-muted">Evo Culture Studio</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block text-xs text-text-muted px-2 py-1 bg-bg-elevated rounded-full border border-border-default">Nháp</span>
                        <span className="hidden md:inline-block text-xs text-text-muted">Tự động lưu • cập nhật 1 phút trước</span>
                        <button 
                            type="button"
                            onClick={onSaveDraft}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border-default rounded-md text-sm hover:bg-bg-subtle text-text-secondary"
                        >
                            <Save size={14} />
                            <span className="hidden sm:inline">Lưu nháp</span>
                        </button>
                        <Link 
                            href={`/${locale}/organizer/center`}
                            className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-bg-subtle transition-colors"
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
                    <h2 className="text-2xl font-bold text-text-primary">Tạo sự kiện <span className="text-text-muted text-sm font-normal bg-bg-elevated px-2 py-1 rounded-full ml-2 border border-border-default">Bước {step} / 5</span></h2>
                    <p className="text-text-secondary mt-1">{title} — {description}</p>
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
