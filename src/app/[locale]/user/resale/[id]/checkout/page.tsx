"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, CheckCircle2, User, Phone, Mail, Tag, CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { isValidEmail, isValidPhone, isValidFullName } from "@/src/lib/validations";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import { TimeOutModal } from "@/src/components/modals/TimeOutModal";
import { OdometerDigit } from "@/src/components/ui/odoMeterDigit";

export default function ResaleCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const sentinelRef = React.useRef<HTMLDivElement>(null);
    const locale = params?.locale || "vi";
    const listingId = params?.id || "";
    const t = useTranslations("ResaleCheckout");

    // Timer logic 
    const [timeLeft, setTimeLeft] = useState(556); // ~9m16s
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        const observer = new IntersectionObserver(
            ([entry]) => {
                // isSticky is true when the sentinel is NOT intersecting (scrolled past)
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            clearInterval(timer);
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            setIsTimeoutModalOpen(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return {
            m1: Math.floor(m / 10),
            m2: m % 10,
            s1: Math.floor(s / 10),
            s2: s % 10
        };
    };
    const timeObj = formatTime(timeLeft);

    // Form logic
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("payos");

    // Checkboxes
    const [confirmedInfo, setConfirmedInfo] = useState(false);
    const [understoodOwnership, setUnderstoodOwnership] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [bookingSessionId, setBookingSessionId] = useState<any>(null);
    const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
    const appliedDiscount = 0;

    useEffect(() => {
        const bookingSessionIdData = sessionStorage.getItem('listing_to_buy');
        if (bookingSessionIdData) {
            try {
                setBookingSessionId(JSON.parse(bookingSessionIdData));
            } catch (e) {
                console.error("Failed to parse booking session ID", e);
            }
        }
    }, []);

    const [listingData, setListingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchListingDetail = async () => {
            if (!bookingSessionId) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/order-service/api/v1/resale/session/${bookingSessionId}`);
                if (response.data && response.data.data) {
                    setListingData(response.data.data);
                    if (typeof response.data.data.remainingSeconds === 'number') {
                        setTimeLeft(response.data.data.remainingSeconds);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch listing detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListingDetail();
    }, [listingId, bookingSessionId]);

    // Format date
    const formatDateStr = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            weekday: 'long'
        }).format(date);
    };

    // Validation errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!fullName.trim()) {
            newErrors.fullName = t('error_fullname_required');
        } else if (!isValidFullName(fullName)) {
            newErrors.fullName = t('error_fullname_invalid');
        }

        if (!phone.trim()) {
            newErrors.phone = t('error_phone_required');
        } else if (!isValidPhone(phone)) {
            newErrors.phone = t('error_phone_invalid');
        }

        if (!email.trim()) {
            newErrors.email = t('error_email_required');
        } else if (!isValidEmail(email)) {
            newErrors.email = t('error_email_invalid');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Price normalization helper (2200.00 means 2200 VNĐ)
    const normalizePrice = (amount: number | undefined | null) => {
        if (!amount) return 0;
        return amount;
    };

    // Pricing (Fees are borne by the seller, so they are not added to the buyer's ticket price)
    const resalePrice = normalizePrice(listingData?.listingPrice || 1950000);
    const subtotal = resalePrice;
    const totalPayment = Math.max(0, subtotal - appliedDiscount);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const handlePurchaseResaleTicket = async () => {
        if (!validateForm()) {
            toast.error(t('error_check_contact') || "Vui lòng kiểm tra lại thông tin liên hệ");
            return;
        }

        setIsCreatingOrder(true);
        try {
            const response = await api.post(`/order-service/api/v1/resale/listings/checkout`, {
                paymentMethod: paymentMethod.toUpperCase(),
                fullName,
                email,
                phoneNumber: phone,
                resaleSessionId: bookingSessionId
            });

            if (response.data && response.data.data) {
                const data = response.data.data;
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else if (data.orderCode) {
                    router.push(`/${locale}/user/resale/${listingId}/status?status=SUCCESS&orderCode=${data.orderCode}`);
                } else {
                    router.push(`/${locale}/user/resale/${listingId}/status?state=success`);
                }
            }
        } catch (error: any) {
            console.error("Failed to purchase resale ticket:", error);
            toast.error(error.response?.data?.message || t('payment_error') || "Lỗi khi xử lý thanh toán vé bán lại");
        } finally {
            setIsCreatingOrder(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-6xl flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-button-primary-bg-default animate-spin mb-4" />
                <p className="text-sm text-text-secondary font-medium">{t('processing') || "Đang tải..."}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%] pt-6">


            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                <Link href={`/${locale}/user/resale`} className="hover:text-button-primary-bg-default transition-colors">{t('breadcrumb_marketplace')}</Link>
                <ChevronRight size={14} />
                <Link href={`/${locale}/user/resale/${listingId}`} className="hover:text-button-primary-bg-default transition-colors">{t('breadcrumb_detail')}</Link>
                <ChevronRight size={14} />
                <span className="text-text-primary">{t('breadcrumb_checkout')}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-border-default">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">{t('page_title')}</h1>
                    <p className="text-sm text-text-secondary max-w-2xl">
                        {t('page_subtitle')}
                        <br />
                        <span className="text-[13px] opacity-80 mt-1 inline-block">{t('page_description')}</span>
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
                >
                    {t('back_to_detail')}
                </button>
            </div>

            {/* Layout 2 columns */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column */}
                <div className="flex-1 space-y-6 w-full">
                    {/* Thông tin liên hệ */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">{t('contact_info_title')}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">{t('fullname_label')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => {
                                            setFullName(e.target.value);
                                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                        }}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-bg-surface border ${errors.fullName ? 'border-feedback-error-border' : 'border-border-default'} rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-button-primary-bg-default focus:ring-1 focus:ring-button-primary-bg-default placeholder-text-muted transition-colors`}
                                        placeholder={t('fullname_placeholder')}
                                    />
                                </div>
                                {errors.fullName && <p className="text-xs text-feedback-error-text mt-1">{errors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">{t('phone_label')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={phone}
                                        maxLength={10}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (errors.phone) setErrors({ ...errors, phone: "" });
                                        }}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-bg-surface border ${errors.phone ? 'border-feedback-error-border' : 'border-border-default'} rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-button-primary-bg-default focus:ring-1 focus:ring-button-primary-bg-default placeholder-text-muted transition-colors`}
                                        placeholder={t('phone_placeholder')}
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-feedback-error-text mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">{t('email_label')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({ ...errors, email: "" });
                                        }}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-bg-surface border ${errors.email ? 'border-feedback-error-border' : 'border-border-default'} rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-button-primary-bg-default focus:ring-1 focus:ring-button-primary-bg-default placeholder-text-muted transition-colors`}
                                        placeholder={t('email_placeholder')}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-feedback-error-text mt-1">{errors.email}</p>}
                                <p className="text-[11px] text-text-muted mt-2">{t('email_note')}</p>
                            </div>
                        </div>

                        <div className="mt-5 bg-bg-subtle p-3 rounded-lg border border-border-default text-[12px] text-text-secondary leading-relaxed">
                            {t('wallet_note')}
                        </div>
                    </div>



                    {/* Phương thức thanh toán */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-2">{t('payment_method_title')}</h3>
                        <p className="text-[13px] text-text-secondary mb-5">{t('payment_method_desc')}</p>

                        <div className="space-y-3 mb-6">
                            {/* PayOS */}
                            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all shadow-sm ${paymentMethod === 'payos' ? 'border-button-primary-bg-default bg-button-primary-bg-default/10' : 'border-border-default hover:bg-bg-subtle'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="payos"
                                    checked={paymentMethod === "payos"}
                                    onChange={() => setPaymentMethod("payos")}
                                    className="w-4 h-4 accent-button-primary-bg-default"
                                />
                                <div className="w-8 h-8 rounded bg-bg-surface flex items-center justify-center p-1 shrink-0">
                                    <div className="text-feedback-info-text font-black text-xs">PayOS</div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-text-primary">{t('payos_label')}</span>
                                    <p className="text-[10px] text-text-secondary">{t('payos_sub')}</p>
                                </div>
                            </label>

                            {/* Sedan Balance */}
                            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'sepay' ? 'border-button-primary-bg-default bg-button-primary-bg-default/10' : 'border-border-default hover:bg-bg-subtle'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="sepay"
                                    checked={paymentMethod === "sepay"}
                                    onChange={() => setPaymentMethod("sepay")}
                                    className="w-4 h-4 accent-button-primary-bg-default"
                                />
                                <div className="w-8 h-8 rounded bg-bg-surface border border-border-strong flex items-center justify-center shrink-0">
                                    <div className="text-button-primary-bg-default font-bold text-[8px]">sepay</div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-text-primary">{t('balance_label')}</span>
                                    <p className="text-[10px] text-text-secondary">{t('balance_sub')}</p>
                                </div>
                            </label>

                            <div className="pt-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('other_methods')}</div>

                            {/* VNPay */}
                            <label className="flex items-center gap-3 p-3 border border-border-default rounded-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="vnpay"
                                    disabled
                                    className="w-4 h-4 accent-button-primary-bg-default"
                                />
                                <div className="w-8 h-8 rounded bg-bg-surface flex items-center justify-center p-1 shrink-0">
                                    <div className="flex gap-0.5 font-bold text-[10px]"><span className="text-feedback-info-text">VN</span><span className="text-feedback-error-text">PAY</span></div>
                                </div>
                                <span className="text-sm font-medium text-text-muted">{t('vnpay_label')}</span>
                            </label>

                            {/* MoMo */}
                            <label className="flex items-center gap-3 p-3 border border-border-default rounded-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="momo"
                                    disabled
                                    className="w-4 h-4 accent-button-primary-bg-default"
                                />
                                <div className="w-8 h-8 rounded bg-feedback-error-bg flex items-center justify-center p-1 shrink-0">
                                    <span className="text-feedback-error-text font-bold text-[8px]">MoMo</span>
                                </div>
                                <span className="text-sm font-medium text-text-muted">{t('momo_label')}</span>
                            </label>

                            {/* ZaloPay */}
                            <label className="flex items-center gap-3 p-3 border border-border-default rounded-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="zalopay"
                                    disabled
                                    className="w-4 h-4 accent-button-primary-bg-default"
                                />
                                <div className="w-8 h-8 rounded bg-bg-surface flex items-center justify-center p-1 shrink-0">
                                    <span className="text-feedback-info-text font-extrabold text-[8px]">Zalo</span><span className="text-feedback-success-text font-extrabold text-[8px]">Pay</span>
                                </div>
                                <span className="text-sm font-medium text-text-muted">{t('zalopay_label')}</span>
                            </label>
                        </div>

                        <div className="bg-bg-inverse text-text-inverse border border-border-strong rounded-lg p-3.5 text-sm leading-relaxed">
                            {t('payment_note')}
                        </div>
                    </div>

                    {/* Lưu ý trước khi thanh toán */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                        <h3 className="text-[15px] font-bold text-text-primary mb-4">{t('before_payment_title')}</h3>
                        <ul className="space-y-2.5 text-[13px] text-text-secondary list-disc pl-5 marker:text-text-muted">
                            <li>{t('before_note_1')}</li>
                            <li>{t('before_note_2')}</li>
                            <li>{t('before_note_3')}</li>
                            <li>{t('before_note_4')}</li>
                        </ul>
                    </div>

                    {/* Sau khi bạn thanh toán thành công */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-subtle">
                        <h3 className="text-[15px] font-bold text-text-primary mb-4">{t('after_payment_title')}</h3>
                        <ul className="space-y-2.5 text-[13px] text-text-secondary list-disc pl-5 marker:text-text-muted">
                            <li>{t('after_note_1')}</li>
                            <li>{t('after_note_2')}</li>
                            <li>{t('after_note_3')}</li>
                            <li>{t('after_note_4')}</li>
                        </ul>
                    </div>

                    {/* Xác nhận giao dịch Checkboxes */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">{t('confirmation_title')}</h3>
                        <div className="space-y-3.5">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={confirmedInfo}
                                        onChange={(e) => setConfirmedInfo(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-button-primary-bg-default focus:ring-button-primary-bg-default"
                                    />
                                </div>
                                <span className={`text-[13px] ${confirmedInfo ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    {t('confirm_info')}
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={understoodOwnership}
                                        onChange={(e) => setUnderstoodOwnership(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-button-primary-bg-default focus:ring-button-primary-bg-default"
                                    />
                                </div>
                                <span className={`text-[13px] ${understoodOwnership ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    {t('confirm_ownership')}
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-button-primary-bg-default focus:ring-button-primary-bg-default"
                                    />
                                </div>
                                <span className={`text-[13px] ${agreedToTerms ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    {t('confirm_terms')}
                                </span>
                            </label>
                        </div>
                    </div>

                </div>

                {/* Right Column / Sidebar */}
                <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-24 self-start">
                    <div ref={sentinelRef} className="absolute -top-24 h-1 w-full pointer-events-none" />
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">

                        {/* Countdown block inside sticky box as shown in mockup */}
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-[12px] text-text-secondary mb-2">{t('time_remaining')}</span>
                            <div className="flex items-center gap-1.5 font-mono text-feedback-error-text">
                                <OdometerDigit value={timeObj.m1} />
                                <OdometerDigit value={timeObj.m2} />
                                <span className="font-bold text-text-secondary pb-1">:</span>
                                <OdometerDigit value={timeObj.s1} />
                                <OdometerDigit value={timeObj.s2} />
                            </div>
                        </div>

                        <div className="border-t border-border-default my-5"></div>

                        <h3 className="font-bold text-[16px] text-text-primary mb-5">{t('order_summary')}</h3>

                        <div className="mb-5">
                            {/* <div className="inline-flex items-center gap-2 mb-3 bg-[#1a1a1a] dark:bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                                <CheckCircle2 size={12} /> {t('badge_official_resale')}
                            </div> */}
                            <h4 className="font-bold text-[14px] text-text-primary mb-2">{listingData?.eventName}</h4>
                            <p className="text-[12px] text-text-secondary mb-1">{formatDateStr(listingData?.time)}</p>
                            <p className="text-[12px] text-text-secondary">{listingData?.venue}</p>
                        </div>

                        <div className="border-t border-border-default border-dashed my-4"></div>

                        <div className="flex justify-between">
                            <span className="text-text-secondary">{t('ticket_type_label')}</span>
                            <span className="font-bold text-text-primary">{listingData?.ticketTypeName || "Standard"}</span>
                        </div>
                        {listingData?.seat && (
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('seat_label')}</span>
                                <span className="font-bold text-text-primary">{listingData?.seat}</span>
                            </div>
                        )}

                        <div className="border-t border-border-default border-dashed my-4"></div>

                        <div className="space-y-3.5 text-[13px] mb-5">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('resale_price_label')}</span>
                                <span className="font-bold text-text-primary">{formatVND(resalePrice)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6 pt-5 border-t border-border-default">
                            <span className="text-[14px] font-bold text-text-secondary">{t('total_payment')}</span>
                            <span className="text-[20px] font-bold text-text-primary">{formatVND(totalPayment)}</span>
                        </div>

                        <div className="bg-bg-subtle rounded-lg p-4 border border-border-default mb-6">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-text-primary">
                                <ShieldCheck size={16} className="text-feedback-success-text" /> {t('safety_title')}
                            </div>
                            {/* <ul className="space-y-2.5 text-[11px] text-text-secondary">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>{t('safety_1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>{t('safety_2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>{t('safety_3')}</span>
                                </li>
                            </ul> */}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handlePurchaseResaleTicket}
                                className={`w-full py-3 rounded-lg text-[13px] font-bold transition-all duration-200 shadow-sm
                                ${confirmedInfo && understoodOwnership && agreedToTerms && !isCreatingOrder
                                        ? 'bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default active:scale-[0.98]'
                                        : 'bg-button-secondary-bg-default text-text-muted cursor-not-allowed border border-border-default'
                                    }`}
                                disabled={!(confirmedInfo && understoodOwnership && agreedToTerms) || isCreatingOrder}
                            >
                                {isCreatingOrder ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        {t('processing') || "Đang xử lý..."}
                                    </div>
                                ) : (
                                    t('continue_payment')
                                )}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="w-full py-3 bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            >
                                {t('back_to_detail')}
                            </button>
                            <button className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                {t('contact_support')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <TimeOutModal
                isOpen={isTimeoutModalOpen}
                onClose={() => {
                    sessionStorage.removeItem('booking_session_ID');
                    router.push(`/${locale}/user/resale/${listingId}`);
                }}
            />
        </div>
    );
}

