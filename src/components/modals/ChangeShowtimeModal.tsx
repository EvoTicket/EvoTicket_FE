"use client";

import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { EventDetail } from "@/src/types/event";
import { useTranslations } from "next-intl";

interface ChangeShowtimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventDetail;
    selectedShowtimeId: number | null;
    onConfirm: (newShowtimeId: number) => void;
}

export function ChangeShowtimeModal({ isOpen, onClose, event, selectedShowtimeId, onConfirm }: ChangeShowtimeModalProps) {
    const t = useTranslations("Booking");
    const { locale } = useParams();

    const [isClosing, setIsClosing] = useState(false);
    const [tempShowtimeId, setTempShowtimeId] = useState<number | null>(null);
    const [expandedShowtimeId, setExpandedShowtimeId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTempShowtimeId(selectedShowtimeId);
            setExpandedShowtimeId(selectedShowtimeId);
            setIsClosing(false);
        }
    }, [isOpen, selectedShowtimeId]);

    if (!isOpen && !isClosing) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleConfirm = () => {
        if (tempShowtimeId !== null && tempShowtimeId !== selectedShowtimeId) {
            onConfirm(tempShowtimeId);
        }
        handleClose();
    };

    const formatShowtimeDate = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const days = [t("day_sun"), t("day_mon"), t("day_tue"), t("day_wed"), t("day_thu"), t("day_fri"), t("day_sat")];
        const weekday = days[d.getDay()];
        return `${day}/${month}/${year} (${weekday})`;
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (start?: string, end?: string) => {
        if (!start || !end) return t("not_updated");
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (diffHrs > 0) parts.push(`${diffHrs} ${t("hours")}`);
        if (diffMins > 0) parts.push(`${diffMins} ${t("minutes")}`);
        return parts.length > 0 ? parts.join(" ") : t("not_updated");
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-200 ${isClosing ? 'opacity-0' : 'animate-in fade-in'}`}>
            <div className={`bg-[#2A2359] border border-border-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl ${isClosing ? 'animate-thu-chai' : 'animate-quang-chai'}`}>
                <button
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors hover:bg-white/10 rounded-full p-1"
                    onClick={handleClose}
                >
                    <X size={24} />
                </button>
                <div className="p-6 pb-2 text-center mt-2">
                    <h3 className="text-2xl font-bold text-text-primary mb-2">{t("change_showtime_title")}</h3>
                    <p className="text-sm text-text-secondary">{t("change_showtime_subtitle")}</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                    {event.showtimes?.map(st => {
                        const isExpanded = expandedShowtimeId === st.showtimeId;
                        const isTempSelected = tempShowtimeId === st.showtimeId;
                        return (
                            <div key={st.showtimeId} className={`border rounded-xl transition-colors overflow-hidden ${isTempSelected ? 'border-primary' : 'border-border-strong bg-[#201A4A]'}`}>
                                <div
                                    className="p-5 flex gap-4 justify-between items-center cursor-pointer hover:bg-white/5"
                                    onClick={() => setExpandedShowtimeId(isExpanded ? null : st.showtimeId)}
                                >
                                    <div>
                                        <div className="font-bold text-text-primary text-base">
                                            {formatShowtimeDate(st.startDatetime)}
                                        </div>
                                        <div className="text-sm text-text-secondary mt-1">
                                            {formatTime(st.startDatetime)} - {formatTime(st.endDatetime)}
                                        </div>
                                    </div>
                                    <div className="text-text-muted">
                                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-5 pt-0 mt-2 flex flex-col border-t border-border-strong/50">
                                        <div className="pt-4 grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                                            <div className="text-text-secondary">{t("estimated_duration")}</div>
                                            <div className="text-text-primary">{getDuration(st.startDatetime, st.endDatetime)}</div>

                                            <div className="text-text-secondary">{t("venue")}</div>
                                            <div className="text-text-primary">{st.venue || event.venue}</div>

                                            <div className="text-text-secondary">{t("address")}</div>
                                            <div className="text-text-primary">{st.address || event.address}</div>

                                            <div className="text-text-secondary">{t("checkin_area")}</div>
                                            <div className="text-text-primary">{t("main_hall")}</div>
                                        </div>
                                        <button
                                            className={`mt-6 px-6 py-2.5 rounded-button-radius text-sm font-semibold max-w-fit transition-colors shadow-sm ${isTempSelected ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-transparent hover:bg-white/10 text-text-primary border border-border-strong'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTempShowtimeId(st.showtimeId);
                                            }}
                                            disabled={isTempSelected}
                                        >
                                            {isTempSelected ? t("selecting_showtime") : t("select_this_showtime")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="bg-[#1D1743] p-6 border-t border-[#3B3474] flex gap-4 items-center flex-col">
                    <p className="text-[#CBA853] text-sm font-medium">{t("change_showtime_warning")}</p>
                    <div className="flex gap-4 w-full justify-end mt-2">
                        <button
                            className="flex-1 py-3 bg-transparent border border-[#3B3474] text-text-secondary rounded-button-radius font-semibold hover:bg-white/5 transition-colors"
                            onClick={handleClose}
                        >
                            {t("keep_current_showtime")}
                        </button>
                        <button
                            className="flex-1 py-3 bg-[#6D48D7] text-white rounded-button-radius font-semibold hover:bg-[#5b3bb8] transition-colors"
                            onClick={handleConfirm}
                        >
                            {t("confirm_change_showtime")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
