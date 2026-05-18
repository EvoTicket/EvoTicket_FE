"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Loader2, AlertCircle, CreditCard, User, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import api from "@/src/lib/axios";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

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

    // Bank Account Setup States
    const [bankList, setBankList] = useState<any[]>([]);
    const [isBankSetupOpen, setIsBankSetupOpen] = useState(false);
    const [bankCode, setBankCode] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [isSavingBank, setIsSavingBank] = useState(false);
    const [isFetchingBankOwner, setIsFetchingBankOwner] = useState(false);

    useEffect(() => {
        if (!bankCode || !bankAccountNumber || bankAccountNumber.length < 6) {
            setBankAccountName("");
            return;
        }

        const fetchBankOwner = async () => {
            setIsFetchingBankOwner(true);
            try {
                const response = await api.get(
                    `/inventory-service/api/banks/owner-name?bankCode=${bankCode}&bankAccountNumber=${bankAccountNumber}`
                );
                let ownerName = "";
                if (response.data) {
                    if (typeof response.data === "string") {
                        ownerName = response.data;
                    } else if (response.data.ownerName) {
                        ownerName = response.data.ownerName;
                    } else if (response.data.data) {
                        if (typeof response.data.data === "string") {
                            ownerName = response.data.data;
                        } else if (response.data.data.ownerName) {
                            ownerName = response.data.data.ownerName;
                        }
                    }
                }

                if (ownerName) {
                    setBankAccountName(ownerName.toUpperCase());
                } else {
                    setBankAccountName("");
                }
            } catch (error: any) {
                console.error("Failed to fetch bank owner name:", error);
                if (error.response && error.response.status === 404) {
                    toast.error(locale === "vi" 
                        ? "Không tìm thấy thông tin tài khoản ngân hàng này" 
                        : "Bank account details not found");
                }
                setBankAccountName("");
            } finally {
                setIsFetchingBankOwner(false);
            }
        };

        const timer = setTimeout(() => {
            fetchBankOwner();
        }, 3000); // 3 seconds debounce

        return () => clearTimeout(timer);
    }, [bankCode, bankAccountNumber, locale]);

    useEffect(() => {
        const fetchTicketAndBanks = async () => {
            try {
                setLoading(true);
                const [ticketRes, bankRes] = await Promise.allSettled([
                    api.get(`/order-service/api/v1/tickets/${id}`),
                    api.get("/inventory-service/api/banks")
                ]);

                if (ticketRes.status === "fulfilled" && ticketRes.value.data) {
                    const result = ticketRes.value.data;
                    if (result.status === 200 && result.data) {
                        setTicket(result.data);
                        if (!result.data.canResell) {
                            setError(result.data.resaleBlockedReason || t("not_allowed"));
                        }
                    } else {
                        setError(result.message || t("loading_error_default"));
                    }
                } else {
                    setError(t("loading_error_default"));
                }

                if (bankRes.status === "fulfilled" && bankRes.value.data && bankRes.value.data.data) {
                    setBankList(bankRes.value.data.data);
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
            fetchTicketAndBanks();
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
            } else if (response.data.status === 400 || response.data.status === 403) {
                toast.warning(response.data.message || (locale === "vi" ? "Vui lòng liên kết tài khoản ngân hàng để tiếp tục" : "Please link a bank account to continue"));
                setIsBankSetupOpen(true);
            } else {
                toast.error(response.data.message || t("resell_failed"));
            }
        } catch (err: any) {
            const status = err.response?.status || err.response?.data?.status;
            const message = err.response?.data?.message || t("submit_error");
            
            if (status === 400 || status === 403 || message.includes("ngân hàng") || message.includes("bank")) {
                toast.warning(message || (locale === "vi" ? "Vui lòng liên kết tài khoản ngân hàng để tiếp tục" : "Please link a bank account to continue"));
                setIsBankSetupOpen(true);
            } else {
                toast.error(message);
            }
            console.error("Resale submit error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBankSubmit = async () => {
        if (!bankCode) {
            toast.error(locale === "vi" ? "Vui lòng chọn ngân hàng" : "Please select a bank");
            return;
        }
        if (!bankAccountNumber) {
            toast.error(locale === "vi" ? "Vui lòng nhập số tài khoản" : "Please enter account number");
            return;
        }
        if (!bankAccountName) {
            toast.error(locale === "vi" ? "Vui lòng nhập tên tài khoản" : "Please enter account owner name");
            return;
        }

        try {
            setIsSavingBank(true);
            const response = await api.put("/iam-service/api/users/me/bank", {
                bankCode,
                bankAccountNumber,
                bankAccountName
            });

            if (response.status === 200 || response.status === 204 || response.data?.status === 200) {
                toast.success(locale === "vi" ? "Liên kết tài khoản ngân hàng thành công!" : "Linked bank account successfully!");
                setIsBankSetupOpen(false);
                // Immediately call resale submission for a frictionless UX!
                void handleResellSubmit();
            } else {
                toast.error(response.data?.message || (locale === "vi" ? "Không thể liên kết ngân hàng" : "Failed to link bank"));
            }
        } catch (err: any) {
            const message = err.response?.data?.message || (locale === "vi" ? "Có lỗi xảy ra" : "An error occurred");
            toast.error(message);
        } finally {
            setIsSavingBank(false);
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
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm">
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
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm">
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
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm">
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
                        <div className="sticky top-6 border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
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

            {/* Bank Setup Modal Overlay */}
            {isBankSetupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-bg-surface border border-border-default rounded-[2rem] max-w-lg w-full p-8 relative shadow-2xl mx-4 text-left">
                        <button
                            onClick={() => setIsBankSetupOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-bg-subtle text-text-secondary transition-all cursor-pointer"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-button-primary-bg-default/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-button-primary-bg-default/20">
                                <CreditCard size={28} className="text-button-primary-bg-default" />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary tracking-tight">
                                {locale === "vi" ? "Cài Đặt Tài Khoản Nhận Tiền" : "Payout Account Setup"}
                            </h3>
                            <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto leading-relaxed">
                                {locale === "vi"
                                    ? "Bạn cần liên kết tài khoản ngân hàng để nhận tiền thanh toán khi vé được mua lại."
                                    : "You must link a bank account to receive payout funds when your ticket is resold."}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Bank list using Listbox */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                                    {locale === "vi" ? "NGÂN HÀNG" : "BANK NAME"}
                                </label>
                                <Listbox value={bankCode} onChange={setBankCode}>
                                    <div className="relative w-full">
                                        <ListboxButton className="w-full flex items-center justify-between p-4 rounded-xl border bg-bg-surface border-border-strong text-left text-sm font-bold text-text-primary outline-none cursor-pointer focus:border-button-primary-bg-default transition-all shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <CreditCard size={18} className="text-button-primary-bg-default" />
                                                <span className="truncate">
                                                    {(() => {
                                                        const bank = bankList.find((b) => b.code === bankCode);
                                                        return bank ? `${bank.shortName || bank.name} (${bank.code})` : (locale === "vi" ? "-- Chọn ngân hàng --" : "-- Select Bank --");
                                                    })()}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-text-muted transform rotate-90" />
                                        </ListboxButton>
                                        <ListboxOptions
                                            anchor="bottom"
                                            modal={false}
                                            className="z-[60] w-[var(--button-width)] [--anchor-gap:4px] !max-h-56 overflow-y-auto bg-bg-surface border border-border-default rounded-xl shadow-2xl text-text-primary mt-1"
                                        >
                                            <ListboxOption
                                                value=""
                                                className="group flex items-center px-4 py-3 cursor-pointer hover:bg-bg-subtle transition-colors text-sm font-medium"
                                            >
                                                <span>{locale === "vi" ? "-- Chọn ngân hàng --" : "-- Select Bank --"}</span>
                                            </ListboxOption>
                                            {bankList.map((bank: any) => (
                                                <ListboxOption
                                                    key={bank.id}
                                                    value={bank.code}
                                                    className="group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-bg-subtle transition-colors text-sm font-medium border-b border-border-default/20 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3 truncate">
                                                        {bank.logo && (
                                                            <img
                                                                src={bank.logo}
                                                                alt={bank.shortName}
                                                                className="w-6 h-6 object-contain rounded bg-white border p-0.5 border-border/20 shrink-0"
                                                            />
                                                        )}
                                                        <span className="truncate">{bank.shortName || bank.name} ({bank.code})</span>
                                                    </div>
                                                    {bankCode === bank.code && (
                                                        <Check size={16} className="text-button-primary-bg-default shrink-0" />
                                                    )}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>
                            </div>

                            {/* Account number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                                    {locale === "vi" ? "SỐ TÀI KHOẢN" : "ACCOUNT NUMBER"}
                                </label>
                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-bg-surface border-border-strong focus-within:border-button-primary-bg-default transition-all shadow-sm">
                                    <CreditCard size={18} className="text-button-primary-bg-default" />
                                    <input
                                        type="text"
                                        className="bg-transparent border-none outline-none text-sm font-bold text-text-primary w-full"
                                        placeholder={locale === "vi" ? "Nhập số tài khoản" : "Enter account number"}
                                        value={bankAccountNumber}
                                        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                                    />
                                </div>
                            </div>

                            {/* Account Name */}
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                                     {locale === "vi" ? "TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU)" : "ACCOUNT HOLDER NAME (NO ACCENTS)"}
                                 </label>
                                 <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isFetchingBankOwner ? 'bg-bg-subtle/40 border-border-default/50' : 'bg-bg-subtle/10 border-border-default/30'}`}>
                                     {isFetchingBankOwner ? (
                                         <svg className="animate-spin h-[18px] w-[18px] text-button-primary-bg-default" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                         </svg>
                                     ) : (
                                         <User size={18} className="text-button-primary-bg-default" />
                                     )}
                                     <input
                                         type="text"
                                         readOnly
                                         className="bg-transparent border-none outline-none text-sm font-bold text-text-primary w-full uppercase cursor-not-allowed select-none placeholder-text-muted"
                                         placeholder={isFetchingBankOwner ? (locale === "vi" ? "ĐANG TRUY VẤN TÊN CHỦ TÀI KHOẢN..." : "QUERYING OWNER NAME...") : (locale === "vi" ? "TỰ ĐỘNG XÁC THỰC TÊN CHỦ TÀI KHOẢN" : "AUTOMATICALLY RETRIEVED")}
                                         value={bankAccountName}
                                     />
                                 </div>
                                 <p className="text-[10px] text-text-muted ml-1">
                                     {locale === "vi" 
                                         ? "* Tên chủ tài khoản được tự động xác thực dựa trên số tài khoản và ngân hàng đã chọn." 
                                         : "* Account owner name is automatically validated based on the selected bank and account number."}
                                 </p>
                             </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => setIsBankSetupOpen(false)}
                                className="flex-1 py-3 bg-bg-subtle text-text-secondary border border-border-default rounded-xl text-sm font-bold transition-all cursor-pointer"
                            >
                                {locale === "vi" ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                onClick={handleBankSubmit}
                                disabled={isSavingBank}
                                className="flex-1 py-3 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default rounded-xl text-sm font-bold transition-all shadow-lg shadow-button-primary-bg-default/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSavingBank ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {locale === "vi" ? "Đang lưu..." : "Saving..."}
                                    </>
                                ) : (
                                    locale === "vi" ? "Liên kết ngay" : "Link Account"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
