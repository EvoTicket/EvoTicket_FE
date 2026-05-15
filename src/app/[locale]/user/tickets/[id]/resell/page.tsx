"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import api from "@/src/lib/axios";

interface TicketDetail {
    ticketAssetId: number;
    assetCode: string;
    ticketCode: string;
    originalOrderId: number;
    originalOrderCode: string;
    eventId: number;
    eventName: string;
    showtimeId: number;
    eventStartTime: string;
    eventEndTime: string;
    venueName: string;
    venueAddress: string;
    ticketTypeId: number;
    ticketTypeName: string;
    originalPrice: number;
    accessStatus: string;
    chainStatus: string;
    tokenId: string | null;
    txHash: string | null;
    contractAddress: string | null;
    currentResaleListingId: number | null;
    usedAt: string | null;
    createdAt: string;
    updatedAt: string;
    qrAvailable: boolean;
    canResell: boolean;
    resaleBlockedReason: string | null;
}

export default function ResellTicketPage() {
    const { id, locale } = useParams();
    const t = useTranslations("ResellTicket");

    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [desiredPrice, setDesiredPrice] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/order-service/api/v1/tickets/${id}`);
                const result = response.data;

                if (result.status === 200 && result.data) {
                    setTicket(result.data);

                    if (!result.data.canResell) {
                        setError(result.data.resaleBlockedReason || t("not_allowed"));
                    }
                } else {
                    setError(result.message || t("loading_error_default"));
                }
            } catch (err: any) {
                const message = err.response?.data?.message || t("submit_error");
                setError(message);
                console.error("Fetch ticket error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTicket();
        }
    }, [id, t]);

    const handleResellSubmit = async () => {
        if (!ticket || currentPriceNum <= 0) return;

        try {
            setIsSubmitting(true);
            const response = await api.post("/order-service/api/v1/resale/listings", {
                ticketAssetId: ticket.ticketAssetId,
                listingPrice: currentPriceNum
            });

            if (response.data.status === 201 || response.data.status === 0) {
                toast.success(t("resell_success"));
                router.push(`/${locale}/user/tickets`);
            } else {
                toast.error(response.data.message || t("resell_failed"));
            }
        } catch (err: any) {
            const message = err.response?.data?.message || t("submit_error");
            toast.error(message);
            console.error("Resale submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value === "") {
            setDesiredPrice("");
            return;
        }
        const numberValue = parseInt(value);
        setDesiredPrice(new Intl.NumberFormat('vi-VN').format(numberValue));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-button-primary-bg-default animate-spin mb-4" />
                <p className="text-text-secondary animate-pulse">{t("loading_message")}</p>
            </div>
        );
    }

    if (error && !ticket) {
        return (
            <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6">
                <div className="bg-bg-surface border border-border-default rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-feedback-error-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-feedback-error-text" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">{t("error_title")}</h2>
                    <p className="text-text-secondary mb-8">{error}</p>
                    <Link href={`/${locale}/user/tickets`} className="block w-full">
                        <button className="w-full py-3 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default rounded-xl font-bold transition-all shadow-lg shadow-button-primary-bg-default/20">
                            {t("btn_back")}
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!ticket) return null;

    const currentPriceNum = parseInt(desiredPrice.replace(/\D/g, "")) || 0;
    const priceCap = Math.floor(ticket.originalPrice * 1.1);
    const feeRate = 0.02;
    const calculatedFee = Math.floor(currentPriceNum * feeRate);
    const netReceived = Math.max(0, currentPriceNum - calculatedFee);

    const suggestedPrices = [
        Math.floor(ticket.originalPrice * 0.9),
        ticket.originalPrice,
        priceCap
    ];

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%]">
            {/* Breadcrumbs */}
            <div className="border-b border-border-default">
                <div className=" mx-auto px-4 h-14 flex items-center gap-2 text-[13px]">
                    <Link href={`/${locale}/user/homepage`} className="text-text-secondary hover:text-button-primary-bg-default transition-colors">
                        {t("breadcrumb_account")}
                    </Link>
                    <ChevronRight size={14} className="text-text-muted" />
                    <Link href={`/${locale}/user/tickets`} className="text-text-secondary hover:text-button-primary-bg-default transition-colors">
                        {t("breadcrumb_my_tickets")}
                    </Link>
                    <ChevronRight size={14} className="text-text-muted" />
                    <span className="text-text-primary font-medium truncate">{t("breadcrumb_resell")}</span>
                </div>
            </div>

            <div className=" mx-auto px-4 pt-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-3">
                            {t("header_title")}
                        </h1>
                        <p className="text-text-secondary text-[15px] leading-relaxed mb-2">
                            {t("header_subtitle")}
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-button-primary-bg-default font-medium bg-button-primary-bg-default/5 dark:bg-button-primary-bg-default/10 px-3 py-1.5 rounded-full w-fit border border-button-primary-bg-default/20">
                            <AlertCircle size={14} />
                            <span>{t("header_note")}</span>
                        </div>
                    </div>
                    <Link href={`/${locale}/user/tickets`}>
                        <button className="px-5 py-2.5 bg-bg-surface border border-border-default rounded-xl text-[14px] font-semibold text-text-primary hover:bg-bg-subtle transition-all shadow-sm active:scale-[0.98]">
                            {t("btn_back")}
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 w-full space-y-6">
                        {/* Block 1: Thông tin vé */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                            <h2 className="text-[17px] font-bold text-text-primary mb-6">{t("ticket_info_title")}</h2>

                            <div className="space-y-4 text-[13px]">
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("event_label")}</span>
                                    <span className="font-semibold text-text-primary">{ticket.eventName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("time_label")}</span>
                                    <span className="font-semibold text-text-primary">{formatDate(ticket.eventStartTime)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("venue_label")}</span>
                                    <span className="font-semibold text-text-primary">{ticket.venueName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("type_label")}</span>
                                    <span className="font-semibold text-text-primary">{ticket.ticketTypeName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("code_label")}</span>
                                    <span className="font-semibold text-text-primary">{ticket.ticketCode}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-border-default/50">
                                    <span className="text-text-secondary">{t("original_price_label")}</span>
                                    <span className="font-semibold text-text-primary">{formatVND(ticket.originalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">{t("status_label")}</span>
                                    <span className={`font-semibold ${ticket.accessStatus === 'VALID' ? 'text-feedback-success-text' : 'text-text-primary'}`}>
                                        {ticket.accessStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Block 2: Thiết lập giá bán */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                            <h2 className="text-[17px] font-bold text-text-primary mb-2">{t("price_setting_title")}</h2>
                            <p className="text-[13px] text-text-secondary mb-6">{t("price_setting_subtitle")}</p>

                            <div className="mb-6">
                                <label className="block text-[13px] font-semibold text-text-primary mb-2">{t("desired_price_label")}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={desiredPrice}
                                        onChange={handlePriceChange}
                                        placeholder="0.00"
                                        className="w-full pl-4 pr-16 py-2.5 bg-bg-surface border border-border-strong rounded-lg text-text-primary text-[15px] outline-none focus:ring-1 focus:ring-button-primary-bg-default focus:border-button-primary-bg-default transition-colors"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <span className="text-[13px] text-text-secondary font-semibold">VND</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg-subtle rounded-lg p-5 mb-6 text-[13px] border border-border-default">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-text-secondary">{t("original_price")}</span>
                                    <span className="font-bold text-text-primary">{formatVND(ticket.originalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-text-secondary">{t("max_price")}</span>
                                    <span className="font-bold text-text-primary">{formatVND(priceCap)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] text-text-muted mt-4 pt-4 border-t border-border-default">
                                    <span>{t("price_cap_rule")}</span>
                                    <span>{t("price_cap_value")}</span>
                                </div>
                            </div>

                            <div>
                                <span className="block text-[13px] text-text-secondary mb-3">{t("price_suggestion")}</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {suggestedPrices.map((price) => (
                                        <button
                                            key={price}
                                            onClick={() => setDesiredPrice(new Intl.NumberFormat('vi-VN').format(price))}
                                            className="px-4 py-1.5 border border-button-primary-bg-default/20 rounded-full text-[13px] font-medium text-button-primary-bg-default hover:bg-button-primary-bg-default/10 transition-colors bg-bg-surface"
                                        >
                                            {formatVND(price)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Block 3: Chi tiết doanh thu */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                            <h2 className="text-[17px] font-bold text-text-primary mb-6">{t("revenue_detail_title")}</h2>

                            <div className="space-y-4 text-[13px] mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">{t("listing_price")}</span>
                                    <span className="font-medium text-text-primary">{formatVND(currentPriceNum)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">{t("platform_fee")}</span>
                                    <span className="font-medium text-feedback-error-text">-{formatVND(calculatedFee)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-[13px]">
                                <span className="text-text-secondary">{t("total_received_est")}</span>
                                <span className="font-bold text-text-primary">{formatVND(netReceived)}</span>
                            </div>

                            <div className="bg-button-secondary-bg-default/40 rounded-lg p-4 flex justify-between items-center mb-4 border border-border-default/50">
                                <span className="font-bold text-text-primary">{t("you_will_receive")}</span>
                                <span className="text-xl font-bold text-text-primary">{formatVND(netReceived)}</span>
                            </div>

                            <p className="text-[11px] text-text-muted leading-relaxed">
                                {t("revenue_note")}
                            </p>
                        </div>

                        {/* Block 4: Lưu ý khi bán lại */}
                        <div className="bg-bg-subtle border border-border-default rounded-xl p-6 text-[13px]">
                            <h3 className="font-bold text-text-primary mb-4">{t("notes_title")}</h3>
                            <ul className="space-y-3 text-text-secondary list-disc pl-5 marker:text-text-muted">
                                <li>{t("note_1")}</li>
                                <li>{t("note_2")}</li>
                                <li>{t("note_3")}</li>
                                <li>{t("note_4")}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column / Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                            <h3 className="font-bold text-[15px] text-text-primary mb-6">{t("sidebar_title")}</h3>

                            <div className="mb-5">
                                <h4 className="font-bold text-[14px] text-text-primary mb-2">{ticket.eventName}</h4>
                                <p className="text-[12px] text-text-secondary mb-1">{formatDate(ticket.eventStartTime)}</p>
                                <p className="text-[12px] text-text-secondary">{ticket.venueName}</p>
                            </div>

                            <div className="border-t border-border-default my-5"></div>

                            <div className="space-y-3.5 text-[12px] mb-8">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">{t("type_label")}:</span>
                                    <span className="font-medium text-text-primary">{ticket.ticketTypeName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">{t("code_label")}:</span>
                                    <span className="font-medium text-text-primary">{ticket.ticketCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">{t("original_price_label")}:</span>
                                    <span className="font-medium text-text-primary">{formatVND(ticket.originalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">{t("status_label")}:</span>
                                    <span className={`font-medium ${ticket.accessStatus === 'VALID' ? 'text-feedback-success-text' : 'text-text-primary'}`}>
                                        {ticket.accessStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleResellSubmit}
                                    className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${currentPriceNum > 0 && !isSubmitting
                                        ? 'bg-button-primary-bg-default text-button-primary-text-default hover:bg-button-primary-bg-hover shadow-md active:scale-[0.98]'
                                        : 'bg-button-secondary-bg-default border border-button-secondary-border-default text-button-secondary-text-default cursor-not-allowed'
                                        }`}
                                    disabled={currentPriceNum === 0 || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {t("btn_processing")}
                                        </>
                                    ) : (
                                        t("btn_continue")
                                    )}
                                </button>
                                <Link href={`/${locale}/user/tickets`} className="block">
                                    <button className="w-full py-2.5 bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                        {t("btn_back")}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
