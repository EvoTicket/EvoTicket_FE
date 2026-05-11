"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useTranslations } from "next-intl";

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  width?: string;
  height?: string;
}

export function CustomDatePicker({ selectedDate, onChange, width, height }: CustomDatePickerProps) {

  const t = useTranslations("Homepage");

  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const monthNames = [
    t('month_1'), t('month_2'), t('month_3'), t('month_4'), t('month_5'), t('month_6'),
    t('month_7'), t('month_8'), t('month_9'), t('month_10'), t('month_11'), t('month_12')
  ];
  const dayNames = [t('day_sun'), t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat')];

  return (
    <Popover className="relative w-full">
      {({ close }) => (
        <>
          <PopoverButton
            className={`w-full h-${height} p-3 	bg-bg-surface border border-border-default rounded-lg text-text-primary flex items-center justify-between cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary text-left`}
          >
            <span className={selectedDate ? "text-text-primary" : "text-text-muted"}>
              {selectedDate
                ? selectedDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : t('select_date')}
            </span>
            <CalendarIcon size={16} className={selectedDate ? "text-primary" : "text-text-muted"} />
          </PopoverButton>

          <PopoverPanel
            transition
            className={`absolute z-50 mt-2 inset-x-0 bg-bg-surface/95 backdrop-blur-xl border border-border-default rounded-xl shadow-2xl p-5 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 lg:bottom-auto bottom-full lg:mb-0 mb-2 origin-top`}
          >
            <div className="flex justify-between items-center mb-5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 hover:bg-secondary rounded-lg text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-semibold text-text-primary">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-secondary rounded-lg text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-semibold text-text-muted">
              {dayNames.map((day) => (
                <div key={day} className="w-8 h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="w-8 h-8" />
              ))}
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                    close();
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50
                    ${isSelected(day)
                      ? "bg-button-primary-bg-defaultext-button-primary-text-default font-bold shadow-md shadow-primary/30 scale-105"
                      : isToday(day)
                        ? "text-primary font-bold border border-primary/30 bg-button-primary-bg-defaul/10"
                        : "text-text-primary hover:bg-secondary hover:text-primary"
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border-default flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  close();
                }}
                className="text-xs text-text-muted hover:text-primary transition-colors font-medium px-2 py-1"
              >
                {t('clear_selection')}
              </button>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
