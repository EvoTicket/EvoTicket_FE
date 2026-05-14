"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/src/lib/axios";
import { ArrowLeft, Check, X, Clock, Pause, Loader2 } from "lucide-react";
import { EventDetail } from "@/src/types/event";
import { useTranslations } from "next-intl";

function PaymentResultContent() {
    const { locale, id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderCode = searchParams.get("orderCode");

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const tb = useTranslations("Booking");
    const tp = useTranslations("Payment");
    const tr = useTranslations("Result");

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
        if (id) {
            fetchData();
        }
    }, [id, orderCode]);

    const fetchData = async () => {
        if (!id || !orderCode) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {

            // Fetch event detail
            const eventRes = await api.get(`/inventory-service/api/events/${id}`);
            if (eventRes.data && eventRes.data.data) {
                setEvent(eventRes.data.data);
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) return null;

    const renderIcon = () => {
        switch (status) {
            case "SUCCESS":
                return <div className="w-16 h-16 rounded-full bg-[#82e1a3] flex items-center justify-center mb-6"><Check size={40} className="text-[#104825] stroke-[3]" /></div>;
            case "PENDING":
                return <div className="w-16 h-16 flex items-center justify-center mb-6"><Loader2 size={64} className="text-[#72aef8] animate-spin stroke-1" /></div>;
            case "FAILED":
                return <div className="w-16 h-16 rounded-full bg-[#f88585] flex items-center justify-center mb-6"><X size={40} className="text-[#6b1e1e] stroke-[3]" /></div>;
            case "EXPIRED":
                return <div className="w-16 h-16 rounded-full bg-[#f6c445] flex items-center justify-center mb-6"><Clock size={40} className="text-[#64490f] stroke-[3]" /></div>;
            case "CANCELLED":
                return <div className="w-16 h-16 rounded-full bg-[#f6c445] flex items-center justify-center mb-6"><Pause size={32} className="text-[#64490f] fill-current" /></div>;
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

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            {tr('nft_issuing_note')}
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/tickets`)}
                            >
                                {tr('view_ticket_list')}
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

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            {tr('auto_update_note')}
                        </div>

                        <div className="w-full space-y-3">
                            <button className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors">{tr('refresh_status')}</button>
                            <button className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors">{tr('view_order_history')}</button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">{tr('contact_support')}</button>
                        </div>
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
                                    <li>404</li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            {tr('auto_update_note')}
                        </div>

                        <div className="w-full space-y-3">
                            <button className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors">{tr('retry_payment')}</button>
                            <button
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}/booking`)}
                            >
                                {tr('reselect_tickets')}
                            </button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">{tr('choose_other_method')}</button>
                        </div>

                        <div className="w-full bg-[#3d2a13] border border-[#5c401d] rounded-lg p-4 text-sm text-[#d49942] mt-6 text-left">
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

                        <div className="w-full space-y-3">
                            <button
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}/booking`)}
                            >
                                {tr('reselect_tickets_btn')}
                            </button>
                            <button
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events`)}
                            >
                                {tr('view_other_events')}
                            </button>
                            <button
                                className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}`)}
                            >
                                {tr('back_to_event_page')}
                            </button>
                        </div>

                        <div className="w-full bg-[#3d2a13] border border-[#5c401d] rounded-lg p-4 text-sm text-[#d49942] mt-6 text-left">
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

                        <div className="w-full space-y-3">
                            <button
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}/payment`)}
                            >
                                {tr('continue_payment_btn')}
                            </button>
                            <button
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}/booking`)}
                            >
                                {tr('reselect_tickets')}
                            </button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">
                                {tr('choose_other_method')}
                            </button>
                        </div>
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
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/events/${event.eventId}/booking`)}
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
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-text-secondary">{tr('loading_result')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">

            {/* TOP HEADER */}
            <div className="bg-bg-page border-b border-border-default pt-6 pb-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-primary transition-colors">{tb('home')}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events`} className="hover:text-primary transition-colors">{tb('search')}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events/${event.eventId}`} className="hover:text-primary transition-colors">{tb('event_detail')}</Link>
                        <span>{'>'}</span>
                        <span className="text-primary font-semibold">{tb('booking_and_payment')}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">{tb('booking_title')}</h1>
                            <p className="text-sm text-text-secondary mb-1">{tb('booking_subtitle')}</p>
                            <p className="text-[11px] text-text-muted">{tb('booking_warning')}</p>
                        </div>
                        <Link href={`/${locale}/user/events/${event.eventId}`} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-button-radius hover:bg-bg-subtle transition-colors text-sm font-semibold text-text-primary h-fit">
                            <ArrowLeft size={16} /> {tb('back_to_event')}
                        </Link>
                    </div>

                    {/* STEPPER */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-card-bg-elevated border border-border-default rounded-xl p-4 px-6">
                        <div className="flex items-center w-full mb-4 md:mb-0">
                            {/* Step 1 - Done */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f] flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-text-primary whitespace-nowrap">{tb('step_1')}</span>
                            </div>
                            <div className="h-[1px] flex-1 bg-[#2bad7f] mx-4 opacity-50"></div>
                            {/* Step 2 - Done */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f] flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-text-primary whitespace-nowrap">{tb('step_2')}</span>
                            </div>
                            <div className={`h-[1px] flex-1 mx-4 opacity-50 ${(status === 'SUCCESS' || status === 'CANCELLED') ? 'bg-[#2bad7f]' : 'bg-[#ad2b2b]'}`}></div>
                            {/* Step 3 - Status based */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    (status === 'SUCCESS' || status === 'CANCELLED')
                                        ? 'bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f]'
                                        : 'bg-[#461e1e] border border-[#ad2b2b] text-[#ad2b2b]'
                                }`}>
                                    {(status === 'SUCCESS' || status === 'CANCELLED') ? <Check size={16} /> : <X size={16} />}
                                </div>
                                <span className="text-sm font-bold text-text-primary whitespace-nowrap">{tb('step_3')}</span>
                            </div>
                        </div>

                        {/* Only show timer if not success or expired, adjust based on real logic, here just mocking disabled state */}
                        {status !== 'SUCCESS' && status !== 'EXPIRED' && status !== 'FAILED' && status !== 'CANCELLED' && status !== 'RESOURCE_NOT_FOUND' && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-text-secondary">{tb('time_remaining')}</span>
                                <div className="flex items-center gap-1 font-mono text-lg font-bold text-feedback-error-text">
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">0</div>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">9</div>
                                    <span>:</span>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">0</div>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">9</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex justify-center">
                <div className="w-full max-w-2xl bg-card-bg-elevated border border-border-default rounded-xl shadow-xl flex flex-col items-center text-center p-10">
                    {renderIcon()}
                    {renderContent()}
                </div>
            </div>

        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}

