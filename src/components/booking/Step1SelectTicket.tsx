"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";

interface Step1SelectTicketProps {
    event: any;
    activeShowtime: any;
    selectedShowtimeId: number | null;
    selectedTickets: any[];
    hasSeatMap: boolean | null;
    ticketOptions: any[];
    serviceFee?: number;
    orderTotal: number;
    locale: string;
    setIsChangeShowtimeModalOpen: (isOpen: boolean) => void;
    setSelectedShowtimeId: (id: number | null) => void;
    handleUpdateQuantity: (ticketType: any, delta: number) => void;
    handleRemoveItem: (id: number) => void;
    setSelectedTickets: (tickets: any[]) => void;
    formatShowtimeDate: (date?: string) => string;
    formatTime: (date?: string) => string;
    formatDate: (date?: string) => string;
    getDuration: (start?: string, end?: string) => string;
    onNext: () => void;
    onBack: () => void;
}

export const Step1SelectTicket: React.FC<Step1SelectTicketProps> = ({
    event,
    activeShowtime,
    selectedShowtimeId,
    selectedTickets,
    hasSeatMap,
    ticketOptions,
    serviceFee = 0,
    orderTotal,
    locale,
    setIsChangeShowtimeModalOpen,
    setSelectedShowtimeId,
    handleUpdateQuantity,
    handleRemoveItem,
    setSelectedTickets,
    formatShowtimeDate,
    formatTime,
    formatDate,
    getDuration,
    onNext,
    onBack
}) => {
    const t = useTranslations("Booking");

    return (
        <>
            {/* LEFT COLUMN: CHỌN VÉ */}
            <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Block: Lịch diễn đã chọn / Chọn lịch diễn */}
                {hasSeatMap ? (
                    <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6">
                        <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle">{t("select_showtime")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.showtimes?.map((st: any) => {
                                const isSoldOut = st.ticketTypes.every((tic: any) => tic.quantityAvailable <= 0);
                                const isSelected = selectedShowtimeId === st.showtimeId;
                                return (
                                    <div
                                        key={st.showtimeId}
                                        onClick={() => !isSoldOut && setSelectedShowtimeId(st.showtimeId)}
                                        className={`p-4 rounded-ds-xl border cursor-pointer transition-colors relative ${isSelected ? 'border-primary bg-bg-subtle/30' : 'border-border-default hover:border-border-strong'} ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="font-bold text-text-primary mb-1">{formatShowtimeDate(st.startDatetime)}</div>
                                        <div className="text-sm text-text-secondary">{formatTime(st.startDatetime)}</div>
                                        {isSoldOut && (
                                            <div className="absolute top-4 right-4 bg-feedback-error-bg text-feedback-error-text text-xs px-2 py-0.5 rounded font-semibold">{t("sold_out")}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-text-muted mt-4">{t("select_showtime_warning")}</p>
                    </div>
                ) : (
                    <div className="bg-card-bg-default border border-primary/20 rounded-ds-xl p-6">
                        <div className="flex justify-between items-center mb-4 pb-2 ">
                            <h3 className="text-lg font-bold text-text-primary">{t("selected_showtime")}</h3>
                            <span
                                className="text-body-small font-semibold px-3 py-1 rounded-full border border-border-strong bg-bg-surface text-text-secondary cursor-pointer hover:bg-bg-subtle transition-colors"
                                onClick={() => setIsChangeShowtimeModalOpen(true)}
                            >
                                {t("change_showtime")}
                            </span>
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="flex-1 p-card-padding-root border-card-border-default border rounded-card-radius bg-card-bg-elevated">
                                <div className="font-bold text-text-primary text-base mb-1">
                                    {formatShowtimeDate(activeShowtime?.startDatetime)}
                                </div>
                                <div className="text-sm text-text-secondary mb-4">
                                    {formatTime(activeShowtime?.startDatetime)} - {formatTime(activeShowtime?.endDatetime)}
                                </div>

                                <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                                    <div className="text-text-secondary">{t("estimated_duration")}</div>
                                    <div className="text-text-primary">{getDuration(activeShowtime?.startDatetime, activeShowtime?.endDatetime)}</div>

                                    <div className="text-text-secondary">{t("venue")}</div>
                                    <div className="text-text-primary">{activeShowtime?.venue || event.venue}</div>

                                    <div className="text-text-secondary">{t("address")}</div>
                                    <div className="text-text-primary">{activeShowtime?.address || event.address}</div>

                                    <div className="text-text-secondary">{t("checkin_area")}</div>
                                    <div className="text-text-primary">{t("main_hall")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block: Chọn vé / Sơ đồ ghế */}
                <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle">{t("step_1")}</h3>

                    {hasSeatMap ? (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-4 mb-8">
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-border-strong"></div><span className="text-xs text-text-secondary">{t('available_seat')}</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary border border-primary"></div><span className="text-xs text-text-secondary">{t('selecting_seat')}</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-text-muted"></div><span className="text-xs text-text-secondary">{t('sold_out_seat')}</span></div>
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-feedback-error-text"></div><span className="text-xs text-text-secondary">{t('locked_seat')}</span></div>
                            </div>

                            {/* MOCK SEAT MAP TRAPEZOID SHAPE */}
                            <div className="w-full max-w-lg aspect-[4/3] bg-bg-surface border border-border-strong rounded-ds-xl flex items-center justify-center p-8 flex-col gap-6 relative overflow-hidden">
                                {/* Stage */}
                                <div className="w-full h-12 bg-border-subtle border border-border-strong rounded shadow flex items-center justify-center text-text-muted font-bold tracking-widest text-sm mb-4">{t("stage")}</div>
                                {/* Tiers */}
                                <div className="flex gap-2">
                                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                </div>
                                <div className="flex gap-2 opacity-50">
                                    {Array.from({ length: 24 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-text-muted"></div>)}
                                </div>

                                <div className="absolute left-4 top-1/2 flex flex-col gap-2">
                                    <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">+</div>
                                    <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">-</div>
                                    <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">O</div>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted mt-4 text-center">{t("seat_selection_hint")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {ticketOptions.map((ticket: any) => {
                                const isSoldOut = (ticket.quantityAvailable <= 0);
                                const quantity = selectedTickets.find(t => t.id === ticket.ticketTypeId)?.quantity || 0;
                                const maxPurchase = ticket.maxPurchase > 0 ? Math.min(ticket.maxPurchase, ticket.quantityAvailable || Infinity) : (ticket.quantityAvailable || Infinity);

                                return (
                                    <div key={ticket.ticketTypeId} className="border border-border-default rounded-ds-xl p-4 bg-bg-surface">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className={`font-semibold text-body-large ${isSoldOut ? 'text-text-muted' : 'text-ticket-card-text-title'}`}>{ticket.typeName}</h4>
                                                <p className={`text-xs mt-1 ${isSoldOut ? 'text-text-muted' : 'text-ticket-card-text-meta '}`}>{ticket.description}</p>
                                                {(!isSoldOut && (ticket.minPurchase > 1 || ticket.maxPurchase > 0)) && (
                                                    <p className="text-[11px] mt-1 font-medium text-primary">
                                                        {ticket.minPurchase > 1 && t("min_purchase", { min: ticket.minPurchase })}
                                                        {ticket.maxPurchase > 0 && t("max_purchase", { max: ticket.maxPurchase })}
                                                    </p>
                                                )}
                                            </div>

                                            {isSoldOut ? (
                                                <div className="bg-button-destructive-bg-default text-text-on-error px-3 py-1 rounded text-sm font-semibold">{t("sold_out")}</div>
                                            ) : (
                                                <div className="flex items-center gap-4 border border-border-strong rounded-checkbox-radius p-1">
                                                    <button
                                                        className={`w-8 h-8 rounded flex items-center justify-center ${quantity === 0 ? 'text-text-muted cursor-not-allowed' : 'text-text-primary hover:bg-bg-subtle'}`}
                                                        onClick={() => handleUpdateQuantity(ticket, -1)}
                                                        disabled={quantity === 0}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-semibold text-text-primary w-4 text-center">{quantity}</span>
                                                    <button
                                                        className={`w-8 h-8 rounded flex items-center justify-center ${quantity >= maxPurchase ? 'text-text-muted cursor-not-allowed' : 'text-text-primary hover:bg-bg-subtle'}`}
                                                        onClick={() => handleUpdateQuantity(ticket, 1)}
                                                        disabled={quantity >= maxPurchase}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`font-semibold text-body-base ${isSoldOut ? 'text-text-muted' : 'text-alert-warning-text'}`}>
                                            {ticket.price.toLocaleString("vi-VN")} VND
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
                                            <span className="text-primary font-semibold hover:underline cursor-pointer">{t("view_conditions")}</span>
                                            {/* icon dropdown */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                {/* Block: Lưu ý khi chọn vé */}
                <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6">
                    <h3 className="font-bold text-text-primary mb-3">{t("booking_notes_title")}</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                        <li>{t("booking_note_1")}</li>
                        <li>{t("booking_note_2")}</li>
                        <li>{t("booking_note_3")}</li>
                    </ul>
                </div>

            </div>

            {/* RIGHT COLUMN: ĐƠN HÀNG */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit z-10">
                <div className="bg-payment-summary-bg-default border border-border-default rounded-ds-xl overflow-hidden shadow-xl">
                    <div className="p-6 flex flex-col gap-button-gap-lg">
                        <div className="text-body-large font-bold text-payment-summary-text-title">{t("your_order")}</div>

                        <div className="flex flex-col gap-button-gap-lg">
                            <div className="font-semibold text-body-base text-payment-summary-text-body">{event.eventName}</div>
                            <p className="text-body-small text-payment-summary-text-body">
                                {formatTime(activeShowtime?.startDatetime)} - {formatDate(activeShowtime?.startDatetime)}
                            </p>
                            <p className="text-body-small text-payment-summary-text-body">
                                {activeShowtime?.venue || event.venue}
                            </p>
                        </div>

                        {/* Order Items */}
                        <div className="border-t border-border-strong pt-4 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-payment-summary-text-body">{t("selected_tickets")}</h4>
                                {selectedTickets.length > 0 && (
                                    <button
                                        className="text-xs text-field-text-error hover:underline"
                                        onClick={() => setSelectedTickets([])}
                                    >
                                        {t("clear_all")}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {selectedTickets.length === 0 ? (
                                    <p className="text-sm text-text-muted italic text-center py-4">{t("no_ticket_selected")}</p>
                                ) : (
                                    selectedTickets.map(ticket => (
                                        <div key={ticket.id} className="  flex gap-3 relative group">
                                            <div className="flex-1 space-y-1 border-r pr-tab-padding-x">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-payment-summary-text-body">{t("ticket_type_label")}</span>
                                                    <span className="font-medium text-payment-summary-text-title">{ticket.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-payment-summary-text-body">{hasSeatMap ? t("seat_number_label") : t("quantity_label")}</span>
                                                    <span className="font-medium text-payment-summary-text-title">{hasSeatMap ? "B02" : String(ticket.quantity).padStart(2, '0')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm pt-1">
                                                    <span className="text-payment-summary-text-body">{t("price_label")}</span>
                                                    <span className="font-medium text-payment-summary-text-title">{(ticket.price * ticket.quantity).toLocaleString("vi-VN")}đ</span>
                                                </div>
                                            </div>
                                            <button
                                                className="pt-1 text-field-border-error hover:text-feedback-error-text transition-colors"
                                                onClick={() => handleRemoveItem(ticket.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t border-border-strong pt-4 mb-6 flex flex-col gap-button-gap-md">
                            {/* <div className="flex justify-between text-sm">
                                <span className="text-body-small text-payment-summary-text-title">{t("service_fee")}</span>
                                <span className="font-medium text-text-primary">{serviceFee.toLocaleString("vi-VN")} đ</span>
                            </div> */}
                            <div className="flex justify-between items-end">
                                <span className="text-body-small text-payment-summary-text-title">{t("subtotal")}</span>
                                <span className="text-2xl font-bold text-text-primary">
                                    {orderTotal.toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                        </div>

                        <button
                            className={`w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm mb-3 text-body-base ${selectedTickets.length === 0 ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-[#6D48D7] hover:bg-[#5b3bb8] text-button-primary-text-default'}`}
                            disabled={selectedTickets.length === 0}
                            onClick={onNext}
                        >
                            {selectedTickets.length === 0 ? t("please_select_ticket") : t("continue_payment")}
                        </button>

                        <button
                            className="w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm hover:bg-bg-subtle text-text-primary border border-button-outline-border-default"
                            onClick={onBack}
                        >
                            {t("back_to_event")}
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
};