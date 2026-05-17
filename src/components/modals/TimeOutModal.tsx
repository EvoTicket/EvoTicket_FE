"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface TimeOutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TimeOutModal({ isOpen, onClose }: TimeOutModalProps) {
    const t = useTranslations("Booking");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-bg-page border border-border-strong rounded-ds-2xl w-full max-w-md p-6 text-center shadow-2xl relative">
                {/* <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-feedback-error-bg mb-4">
                    <X className="h-6 w-6 text-feedback-error-text" />
                </div> */}
                <h3 className="text-xl font-bold text-text-primary mb-2">{t("timeout_title")}</h3>
                <p className="text-sm text-text-secondary mb-6">
                    {t("timeout_message")}
                </p>
                <button
                    className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-button-primary-text-default rounded-button-radius font-semibold transition-colors"
                    onClick={onClose}
                >
                    {t("back_to_event_page")}
                </button>
            </div>
        </div>
    );
}
