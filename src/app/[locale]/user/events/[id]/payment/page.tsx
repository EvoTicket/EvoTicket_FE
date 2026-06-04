"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import api from "@/src/lib/axios";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { ArrowLeft, Check, Loader2, XCircle } from "lucide-react";
import { EventDetail } from "@/src/types/event";
import { OdometerDigit } from "@/src/components/ui/odoMeterDigit";
import { isValidEmail, isValidPhone, isValidFullName } from "@/src/lib/validations";
import { getLegalHref } from "@/src/lib/docs/registry";
import { toast } from "react-toastify";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";

export default function PaymentPage() {
    const { locale, id } = useParams();
    const router = useRouter();
    const tb = useTranslations("Booking");
    const tp = useTranslations("Payment");
    const tr = useTranslations("Result");

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
    const [activeShowtime, setActiveShowtime] = useState<any>(null);
    const [bookingSessionId, setBookingSessionId] = useState<any>(null);
    const [isSticky, setIsSticky] = useState(false);

    const [timeLeft, setTimeLeft] = useState(9 * 60 + 9); // 09:09

    // Mock user context if needed
    const user = useAppSelector(selectUser);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (user) {
            setFullName(prev => prev || `${user.firstName || ""} ${user.lastName || ""}`.trim());
            setPhone(prev => prev || user.phoneNumber || "");
            setEmail(prev => prev || user.email || "");
        }
    }, [user]);

    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("payos");

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [checkedInfo, setCheckedInfo] = useState(false);
    const [understoodTime, setUnderstoodTime] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [allowDiscountCode, setAllowDiscountCode] = useState(true);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Fullname validation
        if (!fullName.trim()) {
            newErrors.fullName = tp('error_fullname_required');
        } else if (!isValidFullName(fullName)) {
            newErrors.fullName = tp('error_fullname_invalid');
        }

        // Phone validation
        if (!phone.trim()) {
            newErrors.phone = tp('error_phone_required');
        } else if (!isValidPhone(phone)) {
            newErrors.phone = tp('error_phone_invalid');
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = tp('error_email_required');
        } else if (!isValidEmail(email)) {
            newErrors.email = tp('error_email_invalid');
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const firstErrorElement = document.querySelector('.border-feedback-error-text');
                if (firstErrorElement) {
                    const y = firstErrorElement.getBoundingClientRect().top + window.scrollY - 150;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
            return false;
        }

        return true;
    };

    useEffect(() => {
        // Chỉ lấy bookingSessionId từ sessionStorage
        const bookingSessionIdData = sessionStorage.getItem('booking_session_ID');

        if (bookingSessionIdData) {
            const currentSessionId = JSON.parse(bookingSessionIdData);
            setBookingSessionId(currentSessionId);

            // Luôn gọi lấy thông tin sự kiện và sau đó lấy thông tin reservation
            if (id) {
                fetchData(id as string, currentSessionId);
            }
        } else {
            // Nếu không có sessionId, có thể quay lại trang booking
            // router.push(`/${locale}/user/events/${id}/booking`);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        const handleScroll = () => {
            if (window.scrollY > 250) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [id]);

    useEffect(() => {
        if (timeLeft === 0 && !loading) {
            toast.warning(tb('timeout_message'));
            sessionStorage.removeItem('booking_session_ID');
            router.push(`/${locale}/user/events/${id}`);
        }
    }, [timeLeft, loading, id, locale, router, tb]);

    const fetchData = async (eventId: string, sessionId: string) => {
        setLoading(true);
        try {
            // Chỉ gọi API reservation để lấy toàn bộ thông tin cần thiết
            const resResponse = await api.get(`/inventory-service/api/reservations/${sessionId}`);

            if (resResponse.data && resResponse.data.status === 200) {
                const { remainingSeconds, sessionData } = resResponse.data.data;

                // Cập nhật thông tin "sự kiện" từ sessionData
                if (sessionData) {
                    setEvent({
                        id: eventId,
                        eventId: eventId,
                        eventName: sessionData.eventName || tb('event_default'),
                        venue: sessionData.venue || tb('not_updated'),
                        // Map thêm các trường cần thiết cho UI
                        startDatetime: sessionData.time,
                    } as any);

                    // Map tickets
                    if (sessionData.items) {
                        const mappedTickets = sessionData.items.map((item: any) => {
                            return {
                                id: item.ticketTypeId,
                                name: item.ticketTypeName || tb('ticket_default'), // Giả định backend trả thêm name/price hoặc UI sẽ dùng dữ liệu cũ
                                price: item.price || 0,
                                quantity: item.qty
                            };
                        });
                        setSelectedTickets(mappedTickets);
                    }

                    setAllowDiscountCode(sessionData.allowDiscountCode ?? true);
                }

                // Cập nhật timer
                if (remainingSeconds > 0) {
                    setTimeLeft(remainingSeconds);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch reservation data", error);
            const errorData = error.response?.data;
            if (error.response?.status === 404 || errorData?.code === "BOOKING_SESSION_NOT_FOUND") {
                toast.error(tp('error_booking_session_not_found') || "Phiên đặt vé đã hết hạn hoặc không tồn tại");
                router.push(`/${locale}/user/events/${eventId}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTimeMS = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return {
            m1: Math.floor(m / 10), m2: m % 10,
            s1: Math.floor(s / 10), s2: s % 10
        };
    };

    const t = formatTimeMS(timeLeft);

    const formatShowtimeDate = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const weekdayKey = ['day_sun', 'day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat'][d.getDay()];
        const weekday = tb(weekdayKey);

        if (locale === 'vi') {
            return `${day} tháng ${month}, ${year} (${weekday})`;
        }
        return `${weekday}, ${month}/${day}/${year}`;
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString(locale === 'vi' ? "vi-VN" : "en-US", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApplyVoucher = async () => {
        if (!discountCode.trim()) {
            toast.error(tp('error_voucher_required') || "Vui lòng nhập mã giảm giá");
            return;
        }

        setIsApplyingVoucher(true);
        try {
            const response = await api.post(`/order-service/api/v1/vouchers/apply-voucher`, {
                voucherCode: discountCode.toUpperCase(),
                sessionId: bookingSessionId
            });

            if (response.data && response.data.data) {
                const { discountAmount, voucherCode } = response.data.data;
                setAppliedDiscount(discountAmount);
                setAppliedVoucherCode(voucherCode);
                toast.success(tp('voucher_applied_success') || "Áp dụng mã giảm giá thành công");
            } else {
                toast.error(response.data?.message || "Mã giảm giá không hợp lệ");
            }
        } catch (error: any) {
            console.error("Failed to apply voucher", error);
            toast.error(error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá");
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const createOrder = async () => {
        if (!validateForm()) return;
        setIsCreatingOrder(true);
        try {
            const response = await api.post(`/order-service/api/v1/orders`, {
                bookingSessionId,
                paymentMethod: paymentMethod.toUpperCase(),
                fullName,
                phoneNumber: phone,
                email,
                voucherCode: appliedVoucherCode,
                locale: locale
            });

            if (response.data && response.data.data) {
                const data = response.data.data;
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            }
        } catch (error) {
            console.error("Failed to create order", error);
            setIsCreatingOrder(false);
        }

        // console.log({
        //     bookingSessionId,
        //     paymentMethod: paymentMethod.toUpperCase(),
        //     fullName,
        //     phoneNumber: phone,
        //     email,
        //     voucherCode: appliedVoucherCode
        // });
        // router.push(`/${locale}/user/events/${id}/payment/result?status=PAID&orderCode=120526626521`);
    }


    // const serviceFee = 2000;
    const ticketTotal = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const subTotal = ticketTotal;
    const finalTotal = subTotal - appliedDiscount;

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
                <p className="ml-4 text-text-secondary">{tr('loading_result')}</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-bg-surface p-4 text-center">
                <div className="w-16 h-16 bg-feedback-error-bg/10 text-feedback-error-text rounded-full flex items-center justify-center mb-4">
                    <XCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    {tr('not_found_title', { defaultMessage: 'Không tìm thấy thông tin' })}
                </h2>
                <p className="text-text-secondary max-w-md mb-6">
                    {tr('not_found_desc', { defaultMessage: 'Rất tiếc, chúng tôi không thể tìm thấy thông tin cho đơn hàng này hoặc phiên đặt vé đã bị hủy.' })}
                </p>
                <button
                    onClick={() => router.push(`/${locale}/user/events/${id}`)}
                    className="px-6 py-2.5 bg-button-primary-bg-default text-button-primary-text-default font-medium rounded-lg hover:bg-button-primary-bg-hover transition-colors"
                >
                    {tb('back_to_event', { defaultMessage: 'Quay lại sự kiện' })}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-bg-page flex flex-col font-sans">
            {/* <Header /> */}

            {/* STICKY COUNTDOWN FLOATING BAR */}
            <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[90] transition-all duration-500 transform ${isSticky ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-bg-surface/80 backdrop-blur-xl border border-button-primary-bg-default/30 px-6 py-2.5 rounded-full shadow-[0_8px_32px_var(--button-primary-bg-default-alpha-25)] flex items-center gap-4">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{tb('time_remaining')}</span>
                    <div className="flex items-center gap-1 font-mono text-xl font-black text-button-primary-bg-default">
                        <OdometerDigit value={t.m1} />
                        <OdometerDigit value={t.m2} />
                        <span className="mb-1">:</span>
                        <OdometerDigit value={t.s1} />
                        <OdometerDigit value={t.s2} />
                    </div>
                </div>
            </div>

            {/* TOP HEADER */}
            <div className="bg-bg-page border-b border-border-default pt-6 pb-4">
                <div className="max-w-[90%] mx-auto px-4">
                    {/* BREADCRUMB */}
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{tb('home')}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events`} className="hover:text-button-primary-bg-default transition-colors">{tb('search')}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events/${event.eventId}`} className="hover:text-button-primary-bg-default transition-colors">{tb('event_detail')}</Link>
                        <span>{'>'}</span>
                        <span className="text-button-primary-bg-default font-semibold">{tb('booking_and_payment')}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">{tb('booking_title')}</h1>
                            <p className="text-sm text-text-secondary mb-1">{tb('booking_subtitle')}</p>
                            <p className="text-[11px] text-text-muted">{tb('booking_warning')}</p>
                        </div>
                        <Link href={`/${locale}/user/events/${event.eventId}/booking`} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-button-radius hover:bg-bg-subtle transition-colors text-sm font-semibold text-text-primary h-fit">
                            <ArrowLeft size={16} /> {tb('back_to_event')}
                        </Link>
                    </div>

                    {/* STEPPER & COUNTDOWN */}
                    <div className="mt-8 flex flex-col lg:flex-row items-center justify-between bg-stepper-bg-default border border-border-default rounded-full p-4 gap-6">
                        <div className="flex items-center flex-1 w-full">
                            {/* Step 1 - Done */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-feedback-success-bg border border-feedback-success-border text-feedback-success-text flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-stepper-text-completed">{tb('step_1')}</span>
                            </div>
                            <div className="h-[1px] flex-1 bg-stepper-border-completed mx-4"></div>
                            {/* Step 2 - Active */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-stepper-border-active text-stepper-text-active flex items-center justify-center font-bold text-sm">2</div>
                                <span className="text-sm font-bold text-stepper-text-active">{tb('step_2')}</span>
                            </div>
                            <div className="h-[1px] flex-1 bg-border-strong mx-4"></div>
                            {/* Step 3 - Pending */}
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default text-text-secondary flex items-center justify-center font-bold text-sm">3</div>
                                <span className="text-sm font-medium text-text-secondary">{tb('step_3')}</span>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] bg-border-default hidden lg:block"></div>

                        <div className="flex items-center gap-4 shrink-0">
                            <span className="text-sm text-text-secondary">{tb('time_remaining')}</span>
                            <div className="flex items-center gap-1 font-mono text-lg font-bold text-feedback-error-text">
                                <OdometerDigit value={t.m1} />
                                <OdometerDigit value={t.m2} />
                                <span className="mb-1">:</span>
                                <OdometerDigit value={t.s1} />
                                <OdometerDigit value={t.s2} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[90%] mx-auto px-4 py-8 w-full flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: FORM NHẬP THÔNG TIN */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Block: Thông tin liên hệ */}
                        <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">{tp('contact_info_title')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">{tp('fullname_label')}</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        placeholder={tp('fullname_placeholder')}
                                        onChange={(e) => {
                                            setFullName(e.target.value);
                                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                        }}
                                        className={`w-full bg-bg-surface border ${errors.fullName ? 'border-feedback-error-text' : 'border-border-default'} rounded-ds-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors`}
                                    />
                                    {errors.fullName && <p className="text-xs text-feedback-error-text mt-1">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">{tp('phone_label')}</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        maxLength={10}
                                        placeholder={tp('phone_placeholder')}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (errors.phone) setErrors({ ...errors, phone: "" });
                                        }}
                                        className={`w-full bg-bg-surface border ${errors.phone ? 'border-feedback-error-text' : 'border-border-default'} rounded-ds-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors`}
                                    />
                                    {errors.phone && <p className="text-xs text-feedback-error-text mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">{tp('email_label')}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        placeholder={tp('email_placeholder')}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({ ...errors, email: "" });
                                        }}
                                        className={`w-full bg-bg-surface border ${errors.email ? 'border-feedback-error-text' : 'border-border-default'} rounded-ds-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors`}
                                    />
                                    {errors.email && <p className="text-xs text-feedback-error-text mt-1">{errors.email}</p>}
                                    <p className="text-xs text-text-muted mt-2">{tp('email_note')}</p>
                                </div>

                                <div className="bg-[#19274e] border border-[#253f7f] rounded-ds-lg p-3 text-sm text-[#87a5f8]">
                                    {tp('wallet_note')}
                                </div>
                            </div>
                        </div>

                        {/* Block: Mã giảm giá */}
                        <div className={`bg-card-bg-default border border-border-default rounded-ds-xl p-6 ${!allowDiscountCode ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                            <h3 className="font-bold text-text-primary mb-4">{tp('discount_title')}</h3>
                            <div className="flex gap-3 mb-2">
                                <input
                                    type="text"
                                    placeholder={tp('discount_placeholder')}
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    disabled={!allowDiscountCode}
                                    className="flex-1 bg-bg-surface border border-border-default rounded-ds-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors placeholder:text-text-muted"
                                />
                                <button
                                    onClick={handleApplyVoucher}
                                    disabled={!allowDiscountCode || isApplyingVoucher}
                                    className={`bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-ds-lg font-medium transition-colors flex items-center justify-center min-w-[100px] ${isApplyingVoucher ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isApplyingVoucher ? <span className="w-5 h-5 border-2 border-white/30 border-t-button-primary-text-default rounded-full animate-spin"></span> : tp('apply_button')}
                                </button>
                            </div>
                            {appliedDiscount > 0 && appliedVoucherCode && (
                                <p className="text-sm text-feedback-success-text mt-2 flex items-center gap-2">
                                    <Check size={16} />
                                    {tp('applied_discount', {
                                        code: appliedVoucherCode,
                                        amount: appliedDiscount.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")
                                    })}
                                </p>
                            )}
                            <div className="bg-[#19274e] border border-[#253f7f] rounded-ds-lg p-3 text-sm text-[#87a5f8]">
                                {allowDiscountCode ? tp('discount_note') : tp('discount_not_allowed', { defaultMessage: 'Sự kiện này không áp dụng mã giảm giá' })}
                            </div>
                        </div>

                        {/* Block: Phương thức thanh toán */}
                        <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">{tb('payment_method')}</h3>
                            <p className="text-sm text-text-secondary mb-4">{tb('payment_method_note')}</p>

                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 p-3 border border-primary bg-primary/5 rounded-ds-lg cursor-pointer transition-colors shadow-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="payos"
                                        checked={paymentMethod === "payos"}
                                        onChange={() => setPaymentMethod("payos")}
                                        className="w-4 h-4 accent-button-primary-bg-default"
                                    />
                                    <div className="w-12 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                        <img src="/images/payos-logo.png" alt="PayOS" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-text-primary">{tp('payos_label')}</span>
                                        <p className="text-[10px] text-text-secondary">{tp('payos_sub')}</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default hover:border-primary rounded-ds-lg cursor-pointer bg-bg-surface transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="sepay"
                                        checked={paymentMethod === "sepay"}
                                        onChange={() => setPaymentMethod("sepay")}
                                        className="w-4 h-4 accent-button-primary-bg-default"
                                    />
                                    <div className="w-12 h-8 rounded bg-bg-surface flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                        <img src="/images/sepay-logo.png" alt="Sepay" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-text-primary">{tp('balance_label')}</span>
                                        <p className="text-[10px] text-text-secondary">{tp('balance_sub')}</p>
                                    </div>
                                </label>

                                <div className="pt-2 pb-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">{tp('other_methods')}</div>

                                <label className="flex items-center gap-3 p-3 border border-border-default rounded-ds-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        disabled
                                        className="w-4 h-4 accent-button-primary-bg-default"
                                    />
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0">
                                        <div className="flex gap-0.5 font-bold text-[10px]"><span className="text-blue-600">VN</span><span className="text-red-500">PAY</span></div>
                                    </div>
                                    <span className="text-sm font-medium text-text-muted">{tp('vnpay_label')}</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default rounded-ds-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="momo"
                                        disabled
                                        className="w-4 h-4 accent-button-primary-bg-default"
                                    />
                                    <div className="w-8 h-8 rounded bg-brand-secondary flex items-center justify-center p-1 shrink-0">
                                        <span className="text-white font-bold text-[8px]">MoMo</span>
                                    </div>
                                    <span className="text-sm font-medium text-text-muted">{tp('momo_label')}</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default rounded-ds-lg bg-bg-subtle/50 opacity-40 cursor-not-allowed grayscale pointer-events-none">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="zalopay"
                                        disabled
                                        className="w-4 h-4 accent-button-primary-bg-default"
                                    />
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0">
                                        <span className="text-blue-500 font-extrabold text-[8px]">Zalo</span><span className="text-green-500 font-extrabold text-[8px]">Pay</span>
                                    </div>
                                    <span className="text-sm font-medium text-text-muted">{tp('zalopay_label')}</span>
                                </label>
                            </div>

                            <div className="bg-[#19274e] border border-[#253f7f] rounded-ds-lg p-3 text-sm text-[#87a5f8]">
                                {tp('payment_note')}
                            </div>
                        </div>

                        {/* Block: Lưu ý trước khi thanh toán */}
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6">
                            <h3 className="font-bold text-text-primary mb-3">{tp('before_payment_title')}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                <li>{tp('before_note_1')}</li>
                                <li>{tp('before_note_2')}</li>
                                <li>{tp('before_note_3')}</li>
                                <li>{tp('before_note_4')}</li>
                            </ul>
                        </div>

                        {/* Block: Lưu ý sau khi thanh toán */}
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6">
                            <h3 className="font-bold text-text-primary mb-3">{tp('after_payment_title')}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                <li>{tp('after_note_1')}</li>
                                <li>{tp('after_note_2')}</li>
                                <li>{tp('after_note_3')}</li>
                                <li>{tp('after_note_4')}</li>
                            </ul>
                        </div>

                        {/* Block: Xác nhận giao dịch */}
                        <div id="confirmation-section" className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 scroll-mt-24">
                            <h3 className="font-bold text-text-primary mb-4">{tp('confirmation_title')}</h3>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={checkedInfo}
                                        onChange={(e) => setCheckedInfo(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-button-primary-bg-default shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{tp('confirm_check')}</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={understoodTime}
                                        onChange={(e) => setUnderstoodTime(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-button-primary-bg-default shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{tp('confirm_time')}</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-button-primary-bg-default shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                        Tôi xác nhận đã đọc và đồng ý với{" "}
                                        <Link href={getLegalHref(locale as string, "terms-of-use")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Điều khoản sử dụng</Link>,{" "}
                                        <Link href={getLegalHref(locale as string, "general-transaction-conditions")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Điều kiện giao dịch chung</Link>,{" "}
                                        <Link href={getLegalHref(locale as string, "ticket-policy")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Chính sách vé</Link>,{" "}
                                        <Link href={getLegalHref(locale as string, "payment-policy")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Chính sách thanh toán</Link>,{" "}
                                        <Link href={getLegalHref(locale as string, "refund-policy")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Chính sách hoàn tiền</Link>,{" "}
                                        <Link href={getLegalHref(locale as string, "privacy-policy")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Chính sách bảo mật</Link> và{" "}
                                        <Link href={getLegalHref(locale as string, "blockchain-nft-policy")} onClick={(e) => e.stopPropagation()} target="_blank" className="text-button-primary-bg-default hover:underline">Chính sách NFT/blockchain</Link>{" "}
                                        của EvoTicket.
                                    </span>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: ĐƠN HÀNG */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit z-10">
                        <div className="bg-payment-summary-bg-default border border-border-default rounded-ds-xl overflow-hidden shadow-xl">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-text-primary mb-6">{tb('your_order')}</h2>

                                <div className="mb-6">
                                    <h3 className="font-bold text-text-primary text-base mb-2">{event.eventName}</h3>
                                    <p className="text-sm text-text-secondary mb-1">
                                        {event.startDatetime}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        {event.venue}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div className="border-t border-border-strong pt-4 mb-4">
                                    <h4 className="font-bold text-sm text-text-primary mb-4">{tb('selected_tickets')}</h4>

                                    <div className="space-y-3">
                                        {selectedTickets.map((t, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 text-sm border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">{tb('ticket_type_label')}</span>
                                                    <span className="font-medium text-text-primary">{t.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">{tb('quantity_label')}</span>
                                                    <span className="font-medium text-text-primary">{String(t.quantity).padStart(2, '0')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">{tb('price_label')}</span>
                                                    <span className="font-medium text-text-primary">{(t.price).toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")}đ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="border-t border-border-strong pt-4 mb-6 space-y-3">
                                    {/* <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{tb('service_fee')}</span>
                                        <span className="font-medium text-text-primary text-right">{serviceFee.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")} đ</span>
                                    </div> */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{tb('subtotal')}</span>
                                        <span className="font-medium text-text-primary text-right">{subTotal.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")} đ</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">{tp('discount_title')}</span>
                                            <span className="font-medium text-text-primary text-right">- {appliedDiscount.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")} đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-border-strong">
                                        <span className="text-sm font-medium text-text-secondary">{tp('total_payment')}</span>
                                        <span className="text-2xl font-bold text-text-primary text-right">
                                            {finalTotal.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")}đ
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={`w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm mb-3 ${isCreatingOrder ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default'}`}
                                    disabled={isCreatingOrder}
                                    onClick={() => {
                                        if (!(agreedToTerms && checkedInfo && understoodTime)) {
                                            toast.error(tp('error_confirm_terms') || "Vui lòng xác nhận các điều khoản trước khi thanh toán");
                                            document.getElementById('confirmation-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            return;
                                        }
                                        createOrder();
                                    }}
                                >
                                    {isCreatingOrder ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            {tp('processing')}
                                        </div>
                                    ) : (
                                        tp('pay_now')
                                    )}
                                </button>

                                <button
                                    className="w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm bg-transparent hover:bg-bg-subtle text-text-secondary border border-border-strong"
                                    onClick={() => router.push(`/${locale}/user/events/${event.eventId}/booking`)}
                                >
                                    {tp('reselect_ticket')}
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* <Footer /> */}

        </div>
    );
}

