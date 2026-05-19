"use client";

import { useState, useRef } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

interface CustomTimePickerProps {
    selectedTime: string; // Format "HH:mm"
    onChange: (time: string) => void;
    width?: string;
    placeholder?: string;
}

export function CustomTimePicker({ selectedTime, onChange, width = "100%", placeholder = "00:00" }: CustomTimePickerProps) {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    const [currentHour, setCurrentHour] = useState(selectedTime?.split(":")[0] || "00");
    const [currentMinute, setCurrentMinute] = useState(selectedTime?.split(":")[1] || "00");

    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    const handleSelectHour = (h: string) => {
        setCurrentHour(h);
        onChange(`${h}:${currentMinute}`);
    };

    const handleSelectMinute = (m: string) => {
        setCurrentMinute(m);
        onChange(`${currentHour}:${m}`);
    };

    const onOpen = () => {
        setTimeout(() => {
            if (hourRef.current) {
                const container = hourRef.current;
                const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement;
                if (activeBtn) {
                    const targetScrollTop = activeBtn.offsetTop - (container.clientHeight / 2) + (activeBtn.clientHeight / 2);
                    container.scrollTo({ top: targetScrollTop, behavior: "auto" });
                }
            }
            if (minuteRef.current) {
                const container = minuteRef.current;
                const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement;
                if (activeBtn) {
                    const targetScrollTop = activeBtn.offsetTop - (container.clientHeight / 2) + (activeBtn.clientHeight / 2);
                    container.scrollTo({ top: targetScrollTop, behavior: "auto" });
                }
            }
        }, 50);
    };

    return (
        <Popover className="relative" style={{ width }}>
            <PopoverButton 
                onClick={onOpen}
                className="w-full flex items-center justify-between bg-bg-surface border border-border-default rounded-ds-lg p-2.5 outline-none hover:border-primary/50 focus:border-primary/50 focus:bg-bg-surface transition-all text-sm font-medium shadow-sm group cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                    <span className={selectedTime ? "text-text-primary font-medium" : "text-text-muted"}>
                        {selectedTime || placeholder}
                    </span>
                </div>
                <ChevronDown size={14} className="text-text-muted" />
            </PopoverButton>

            <PopoverPanel 
                anchor="bottom start"
                transition
                className="z-[100] w-60 [--anchor-gap:6px] bg-bg-surface border border-border-default rounded-ds-lg shadow-xl p-4 backdrop-blur-xl focus:outline-none transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            >
                <div className="grid grid-cols-2 gap-3 h-[240px]">
                    {/* Hour Column */}
                    <div className="space-y-2 flex flex-col h-full overflow-hidden">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider text-center border-b border-border-default pb-1">Giờ</label>
                        <div ref={hourRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 scroll-smooth pr-1">
                            {hours.map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    data-active={currentHour === h}
                                    onClick={() => handleSelectHour(h)}
                                    className={`w-full py-1.5 rounded-ds-md text-xs font-semibold transition-all ${
                                        currentHour === h 
                                        ? "bg-action-brand-bg-default text-action-brand-text-default shadow-sm font-bold" 
                                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                                    }`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minute Column */}
                    <div className="space-y-2 flex flex-col h-full overflow-hidden">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider text-center border-b border-border-default pb-1">Phút</label>
                        <div ref={minuteRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 scroll-smooth pr-1">
                            {minutes.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    data-active={currentMinute === m}
                                    onClick={() => handleSelectMinute(m)}
                                    className={`w-full py-1.5 rounded-ds-md text-xs font-semibold transition-all ${
                                        currentMinute === m 
                                        ? "bg-action-brand-bg-default text-action-brand-text-default shadow-sm font-bold" 
                                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border-default flex justify-center">
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Chọn thời gian</p>
                </div>
            </PopoverPanel>

            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </Popover>
    );
}
