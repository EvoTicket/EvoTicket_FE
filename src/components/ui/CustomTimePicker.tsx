"use client";

import { useState, useRef, useEffect } from "react";
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
                const active = hourRef.current.querySelector('[data-active="true"]');
                if (active) active.scrollIntoView({ block: "center", behavior: "smooth" });
            }
            if (minuteRef.current) {
                const active = minuteRef.current.querySelector('[data-active="true"]');
                if (active) active.scrollIntoView({ block: "center", behavior: "smooth" });
            }
        }, 50);
    };

    return (
        <Popover className="relative" style={{ width }}>
            <PopoverButton 
                onClick={onOpen}
                className="w-full flex items-center justify-between bg-secondary/30 border-2 border-border/30 rounded-2xl px-5 py-4 outline-none focus:border-primary/50 focus:bg-surface transition-all text-sm font-bold shadow-sm group"
            >
                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-txt-muted group-hover:text-primary transition-colors" />
                    <span className={selectedTime ? "text-txt-primary" : "text-txt-muted"}>
                        {selectedTime || placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className="text-txt-muted" />
            </PopoverButton>

            <PopoverPanel className="absolute z-[100] mt-3 inset-x-0 bg-surface/90 border border-border/50 rounded-3xl shadow-2xl p-5 backdrop-blur-3xl animate-in fade-in zoom-in duration-200 origin-top">
                <div className="grid grid-cols-2 gap-4 h-[320px]">
                    {/* Hour Column */}
                    <div className="space-y-3 flex flex-col h-full overflow-hidden">
                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] text-center">Giờ</label>
                        <div ref={hourRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-1 scroll-smooth">
                            {hours.map((h) => (
                                <button
                                    key={h}
                                    data-active={currentHour === h}
                                    onClick={() => handleSelectHour(h)}
                                    className={`w-full py-2.5 rounded-xl text-sm font-black transition-all ${
                                        currentHour === h 
                                        ? "bg-primary text-white shadow-lg scale-105" 
                                        : "text-txt-muted hover:bg-secondary/50 hover:text-txt-primary"
                                    }`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minute Column */}
                    <div className="space-y-3 flex flex-col h-full overflow-hidden">
                        <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] text-center">Phút</label>
                        <div ref={minuteRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-1 scroll-smooth">
                            {minutes.map((m) => (
                                <button
                                    key={m}
                                    data-active={currentMinute === m}
                                    onClick={() => handleSelectMinute(m)}
                                    className={`w-full py-2.5 rounded-xl text-sm font-black transition-all ${
                                        currentMinute === m 
                                        ? "bg-primary text-white shadow-lg scale-105" 
                                        : "text-txt-muted hover:bg-secondary/50 hover:text-txt-primary"
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/10 flex justify-center">
                    <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.3em]">Select Time</p>
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
