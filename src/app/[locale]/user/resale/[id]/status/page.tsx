"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/src/lib/axios";
import { ArrowLeft, Check, X, Clock, Pause, Loader2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

function ResaleStatusContent() {
    const params = useParams();
    const { locale, id: listingId } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");

    const [listing, setListing] = useState<any>(null);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const tb = useTranslations("Booking");
    const tp = useTranslations("Payment");
    const tr = useTranslations("Result");
    const tc = useTranslations("ResaleCheckout");

    const rawStatus = searchParams.get("status");
    const [status, setStatus] = useState<string>(
        (rawStatus === "PAID" || rawStatus === "SUCCESS" || rawStatus === "success") ? "SUCCESS"
            : (rawStatus === "PENDING" || rawStatus === "pending") ? "PENDING"
                : (rawStatus === "CANCELLED" || rawStatus === "cancelled") ? "CANCELLED"
                    : (rawStatus === "FAILED" || rawStatus === "failed") ? "FAILED"
                        : (rawStatus === "EXPIRED" || rawStatus === "expired") ? "EXPIRED"
                            : (rawStatus === "RESOURCE_NOT_FOUND" || rawStatus === "NOT_FOUND") ? "RESOURCE_NOT_FOUND"
                                : "SUCCESS"
    );

    useEffect(() => {
        if (listingId) {
            fetchData();
        }
    }, [listingId, orderCode]);

    const fetchData = async () => {
        if (!listingId || !orderCode) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch listing detail (analogous to event detail)
            // Assuming the resale listing info is needed for the header/breadcrumb
            const listingRes = await api.get(`/order-service/api/v1/resale/listings/${listingId}`);
            if (listingRes.data && listingRes.data.data) {
                setListing(listingRes.data.data);
            }

            // Fetch order detail from payment-service
            try {
                const orderRes = await api.get(`/payment-service/api/v1/payments/${orderCode}`);
                if (orderRes.data && orderRes.data.data) {
                    const data = orderRes.data.data;
                    setOrderDetail(data);

                    // Map API status to UI status
                    const apiStatus = data.code;
                    const mappedStatus = (apiStatus === "PAID" || apiStatus === "SUCCESS" || apiStatus === "success") ? "SUCCESS"
                        : (apiStatus === "PENDING" || apiStatus === "pending") ? "PENDING"
                            : (apiStatus === "CANCELLED" || apiStatus === "cancelled") ? "CANCELLED"
                                : (apiStatus === "FAILED" || apiStatus === "failed") ? "FAILED"
                                    : (apiStatus === "EXPIRED" || apiStatus === "expired") ? "EXPIRED"
                                        : (apiStatus === "RESOURCE_NOT_FOUND" || apiStatus === "RESOURCE_NOT_FOUND") ? "RESOURCE_NOT_FOUND"
                                            : "SUCCESS";
                    setStatus(mappedStatus);
                }
            } catch (err: any) {
                console.error("Failed to fetch order detail", err);
                const errorData = err.response?.data;
                if (err.response?.status === 404 || errorData?.code === "RESOURCE_NOT_FOUND") {
                    setOrderDetail(null);
                    setStatus("RESOURCE_NOT_FOUND");
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
            </div>
        );
    }

    // Default title if listing not found yet
    const eventName = listing?.eventName || "Swan Lake Ballet Night 2026";

    const renderIcon = () => {
        switch (status) {
            case "SUCCESS":
                return <div className="w-16 h-16 rounded-full bg-feedback-success-bg flex items-center justify-center mb-6"><Check size={40} className="text-feedback-success-text stroke-[3]" /></div>;
            case "PENDING":
                return <div className="w-16 h-16 flex items-center justify-center mb-6"><Loader2 size={64} className="text-feedback-info-text animate-spin stroke-1" /></div>;
            case "FAILED":
                return <div className="w-16 h-16 rounded-full bg-feedback-error-bg flex items-center justify-center mb-6"><X size={40} className="text-feedback-error-text stroke-[3]" /></div>;
            case "EXPIRED":
                return <div className="w-16 h-16 rounded-full bg-feedback-warning-bg flex items-center justify-center mb-6"><Clock size={40} className="text-feedback-warning-text stroke-[3]" /></div>;
            case "CANCELLED":
                return <div className="w-16 h-16 rounded-full bg-feedback-warning-bg flex items-center justify-center mb-6"><Pause size={32} className="text-feedback-warning-text fill-current" /></div>;
            case "RESOURCE_NOT_FOUND":
            case "NOT_FOUND":
            case "BOOKING_SESSION_NOT_FOUND":
                return <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center mb-6"><X size={40} className="text-text-muted stroke-[2]" /></div>;
            default:
                return null;
        }
    };

    const renderContent = () => {
        switch (status) {
            case "SUCCESS":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('success_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8">{tr('success_desc')}</p>

                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('order_code_label')}</span>
                                <span className="font-bold text-text-primary">#{orderDetail?.orderCode || orderCode || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('payment_method_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.paymentMethod || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('transaction_id_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.transactionId || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('payment_time_label')}</span>
                                <span className="font-bold text-text-primary">
                                    {orderDetail?.transactionDateTime
                                        ? new Date(orderDetail.transactionDateTime).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')
                                        : orderDetail?.updatedAt
                                            ? new Date(orderDetail.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')
                                            : tr('not_available')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('receipt_email_label')}</span>
                                <span className="font-bold text-text-primary text-right max-w-[200px] break-all">{orderDetail?.buyerEmail || orderDetail?.email || tr('not_available')}</span>
                            </div>
                        </div>

                        <div className="w-full bg-bg-inverse text-text-inverse border border-border-strong rounded-lg p-3 text-sm mb-8 text-left">
                            {tr('nft_issuing_note')}
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button 
                                className="flex-1 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/tickets`)}
                            >
                                {tr('view_ticket_detail') || "Xem chi tiết vé"}
                            </button>
                            <button 
                                className="flex-1 bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/tickets`)}
                            >
                                {tr('view_ticket_list') || "Xem danh sách vé"}
                            </button>
                        </div>
                        <button 
                            className="w-full bg-button-ghost-bg-default hover:bg-button-ghost-bg-hover text-button-ghost-text-default border border-button-ghost-border-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            onClick={() => router.push(`/${locale}/user/resale`)}
                        >
                            {"Về chợ vé bán lại"}
                        </button>
                    </>
                );

            case "PENDING":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('pending_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8">{tr('pending_desc')}</p>

                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('order_code_label')}</span>
                                <span className="font-bold text-text-primary">#{orderDetail?.orderCode || orderCode || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('payment_method_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.paymentMethod || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('transaction_id_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.transactionId || orderDetail?.paymentId || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('recorded_time_label')}</span>
                                <span className="font-bold text-text-primary">
                                    {orderDetail?.updatedAt ? new Date(orderDetail.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : tr('not_available')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full bg-bg-inverse text-text-inverse border border-border-strong rounded-lg p-3 text-sm mb-8 text-left">
                            {tr('auto_update_note')}
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button 
                                className="flex-1 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]"
                                onClick={() => fetchData()}
                            >
                                {tr('refresh_status') || "Làm mới trạng thái"}
                            </button>
                            <button 
                                className="flex-1 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/tickets`)}
                            >
                                {tr('view_order_history') || "Xem lịch sử đơn hàng"}
                            </button>
                        </div>
                        <button 
                            className="w-full bg-transparent border border-border-default hover:bg-bg-subtle text-button-primary-bg-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                        >
                            {tr('contact_support') || "Liên hệ hỗ trợ"}
                        </button>
                    </>
                );

            case "FAILED":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('failed_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">{tr('failed_desc')}</p>

                        <div className="w-full text-sm mb-8 border-t border-b border-border-strong py-6 text-left flex gap-12">
                            <div className="flex-1">
                                <span className="font-bold text-text-primary block mb-2">{tr('possible_causes')}</span>
                                <ul className="list-disc pl-5 text-text-secondary space-y-1">
                                    <li>{tr('cause_rejected')}</li>
                                    <li>{tr('cause_timeout')}</li>
                                    <li>{tr('cause_bank_error')}</li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-text-primary block mb-2">{tr('error_ref_code')}</span>
                                <ul className="list-disc pl-5 text-text-secondary space-y-1">
                                    <li>{orderDetail?.errorCode || "404"}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-full bg-bg-inverse text-text-inverse border border-border-strong rounded-lg p-3 text-sm mb-8 text-left">
                            {tr('auto_update_note')}
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button 
                                className="flex-1 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}/checkout`)}
                            >
                                {tr('retry_payment') || "Thử lại thanh toán"}
                            </button>
                            <button 
                                className="flex-1 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}/checkout`)}
                            >
                                {tr('choose_other_method') || "Chọn phương thức khác"}
                            </button>
                        </div>
                        <button 
                            className="w-full bg-transparent border border-border-default hover:bg-bg-subtle text-button-primary-bg-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            onClick={() => router.push(`/${locale}/user/resale/${listingId}`)}
                        >
                            {"Quay lại chi tiết vé bán lại"}
                        </button>

                        <div className="w-full bg-feedback-warning-bg border border-feedback-warning-border rounded-lg p-4 text-sm text-feedback-warning-text mt-6 text-left shadow-sm">
                            <span className="font-bold flex items-center gap-2 mb-1"><Clock size={16} /> {tb('booking_notes_title')}</span>
                            {tr('failed_note')}
                        </div>
                    </>
                );

            case "EXPIRED":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('expired_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">{tr('expired_desc')}</p>

                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('order_code_label')}</span>
                                <span className="font-bold text-text-primary">#{orderDetail?.orderCode || orderCode || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('payment_method_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.paymentMethod || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('creation_time_label')}</span>
                                <span className="font-bold text-text-primary">
                                    {orderDetail?.createdAt ? new Date(orderDetail.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : tr('not_available')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('expiration_time_label')}</span>
                                <span className="font-bold text-text-primary">
                                    {orderDetail?.expiredAt ? new Date(orderDetail.expiredAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : tr('not_available')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button 
                                className="flex-1 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}`)}
                            >
                                {tr('reselect_tickets_btn') || "Xem lại niêm yết"}
                            </button>
                            <button 
                                className="flex-1 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale`)}
                            >
                                {tr('view_other_events') || "Về chợ vé bán lại"}
                            </button>
                        </div>
                        <button 
                            <button 
                                className="w-full bg-transparent border border-button-ghost-border-default hover:bg-button-ghost-bg-hover text-button-ghost-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            >
                                {"Xem niêm yết tương tự"}
                            </button>

                        <div className="w-full bg-feedback-warning-bg border border-feedback-warning-border rounded-lg p-4 text-sm text-feedback-warning-text mt-6 text-left shadow-sm">
                            <span className="font-bold flex items-center gap-2 mb-1"><Clock size={16} /> {tb('booking_notes_title')}</span>
                            {tr('expired_note')}
                        </div>
                    </>
                );

            case "CANCELLED":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('cancelled_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">{tr('cancelled_desc')}</p>

                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('order_code_label')}</span>
                                <span className="font-bold text-text-primary">#{orderDetail?.orderCode || orderCode || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('payment_method_label')}</span>
                                <span className="font-bold text-text-primary">{orderDetail?.paymentMethod || tr('not_available')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{tr('cancellation_time_label')}</span>
                                <span className="font-bold text-text-primary">
                                    {orderDetail?.updatedAt ? new Date(orderDetail.updatedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') : tr('not_available')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button 
                                className="flex-1 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}/checkout`)}
                            >
                                {tr('continue_payment_btn') || "Tiếp tục thanh toán"}
                            </button>
                            <button 
                                className="flex-1 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}/checkout`)}
                            >
                                {tr('choose_other_method') || "Chọn phương thức khác"}
                            </button>
                        </div>
                        <button 
                            className="w-full bg-transparent border border-button-ghost-border-default hover:bg-button-ghost-bg-hover text-button-ghost-text-default py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            onClick={() => router.push(`/${locale}/user/resale/${listingId}`)}
                        >
                            {"Quay lại chi tiết vé bán lại"}
                        </button>
                    </>
                );

            case "NOT_FOUND":
            case "BOOKING_SESSION_NOT_FOUND":
            case "not_found":
            case "RESOURCE_NOT_FOUND":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{tr('not_found_title')}</h2>
                        <p className="text-sm text-text-secondary mb-8">{tr('not_found_desc')}</p>

                        <div className="w-full bg-bg-surface border border-border-default rounded-lg p-6 mb-8 text-left">
                            <h4 className="font-bold text-text-primary mb-2">{tr('suggestions_title')}</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                                <li>{tr('suggestion_1')}</li>
                                <li>{tr('suggestion_2')}</li>
                                <li>{tr('suggestion_3')}</li>
                            </ul>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                className="w-full py-3 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}`)}
                            >
                                {tr('back_to_booking')}
                            </button>
                            <button
                                className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/homepage`)}
                            >
                                {tr('back_to_homepage')}
                            </button>
                        </div>
                    </>
                );

            default:
                return (
                    <div className="py-12 flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-button-primary-bg-default animate-spin mb-4" />
                        <p className="text-text-secondary">{tr('loading_result')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            <div className="container mx-auto px-4 pb-12 pt-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-12 max-w-6xl mx-auto">
                    <Link href={`/${locale}/user/resale`} className="hover:text-button-primary-bg-default transition-colors">{tc('breadcrumb_marketplace')}</Link>
                    <ChevronRight size={14} />
                    <Link href={`/${locale}/user/resale/${listingId}`} className="hover:text-button-primary-bg-default transition-colors">{tc('breadcrumb_detail')}</Link>
                    <ChevronRight size={14} />
                    <Link href={`/${locale}/user/resale/${listingId}/checkout`} className="hover:text-button-primary-bg-default transition-colors">{tc('breadcrumb_checkout')}</Link>
                    <ChevronRight size={14} />
                    <span className="text-text-primary">{tc('breadcrumb_status')}</span>
                </div>

                <div className="max-w-7xl mx-auto px-4 w-full flex justify-center">
                    <div className="w-full max-w-2xl bg-card-bg-elevated border border-border-default rounded-xl shadow-xl flex flex-col items-center text-center p-10">
                        {renderIcon()}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResaleStatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
            </div>
        }>
            <ResaleStatusContent />
        </Suspense>
    );
}
