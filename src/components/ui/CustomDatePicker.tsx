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
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [yearPage, setYearPage] = useState(currentMonth.getFullYear() - 5);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (view === "days") {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else if (view === "months") {
      setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
    } else if (view === "years") {
      setYearPage(yearPage - 12);
    }
  };

  const nextAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (view === "days") {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else if (view === "months") {
      setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
    } else if (view === "years") {
      setYearPage(yearPage + 12);
    }
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
    <Popover className="relative" style={{ width: width || "100%" }}>
      {({ close }) => (
        <>
          <PopoverButton
            className={`w-full h-${height} p-3 	bg-bg-surface border border-border-default rounded-ds-lg text-text-primary flex items-center justify-between cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary text-left`}
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
            anchor="bottom start"
            transition
            className="z-50 w-80 [--anchor-gap:6px] bg-bg-surface/95 backdrop-blur-xl border border-border-default rounded-ds-xl shadow-2xl p-5 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none"
          >
            <div className="flex justify-between items-center mb-5">
              <button
                type="button"
                onClick={prevAction}
                className="p-1.5 hover:bg-secondary rounded-ds-lg text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1 items-center font-semibold text-text-primary">
                {view === "days" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setView("months")}
                      className="hover:bg-secondary rounded px-2 py-1 transition-colors focus:outline-none"
                    >
                      {monthNames[currentMonth.getMonth()]}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setView("years"); setYearPage(currentMonth.getFullYear() - 5); }}
                      className="hover:bg-secondary rounded px-2 py-1 transition-colors focus:outline-none"
                    >
                      {currentMonth.getFullYear()}
                    </button>
                  </>
                )}
                {view === "months" && (
                  <button
                    type="button"
                    onClick={() => { setView("years"); setYearPage(currentMonth.getFullYear() - 5); }}
                    className="hover:bg-secondary rounded px-2 py-1 transition-colors focus:outline-none"
                  >
                    {currentMonth.getFullYear()}
                  </button>
                )}
                {view === "years" && (
                  <span className="px-2 py-1">
                    {yearPage} - {yearPage + 11}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={nextAction}
                className="p-1.5 hover:bg-secondary rounded-ds-lg text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {view === "days" && (
              <>
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
                          ? "bg-button-primary-bg-default text-button-primary-text-default font-bold shadow-md shadow-primary/30 scale-105"
                          : isToday(day)
                            ? "text-primary font-bold border border-primary/30 bg-button-primary-bg-default/10"
                            : "text-text-primary hover:bg-secondary hover:text-primary"
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === "months" && (
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1));
                      setView("days");
                    }}
                    className={`p-3 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50
                      ${currentMonth.getMonth() === i
                        ? "bg-button-primary-bg-default text-button-primary-text-default font-bold shadow-md shadow-primary/30 scale-105"
                        : "text-text-primary hover:bg-secondary hover:text-primary"
                      }
                    `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {view === "years" && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => yearPage + i).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
                      setView("months");
                    }}
                    className={`p-3 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50
                      ${currentMonth.getFullYear() === y
                        ? "bg-button-primary-bg-default text-button-primary-text-default font-bold shadow-md shadow-primary/30 scale-105"
                        : "text-text-primary hover:bg-secondary hover:text-primary"
                      }
                    `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

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
