"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, CheckCircle2, HelpCircle, Network, ExternalLink, ChevronDown, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import api from "@/src/lib/axios";

export default function ResaleDetailPage() {
    const t = useTranslations("ResaleDetail");
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || "vi";
    const listingId = params?.id;

    const [listingData, setListingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isBlockchainExpanded, setIsBlockchainExpanded] = useState(false);

    useEffect(() => {
        const fetchListingDetail = async () => {
            if (!listingId) return;
            setIsLoading(true);
            try {
                const response = await api.get(`/order-service/api/v1/resale/listings/${listingId}`);
                if (response.data && response.data.data) {
                    setListingData(response.data.data);
                    setIsAvailable(true);
                } else {
                    setIsAvailable(false);
                }
            } catch (error) {
                console.error("Failed to fetch listing detail:", error);
                setIsAvailable(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListingDetail();
    }, [listingId]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
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

    const handleOpenProvenance = (ticketAssetId: string) => {
        window.open(`/${locale}/user/tickets/${ticketAssetId}/provenance`, "_blank");
    };

    const handleOpenExplorer = (contractAddress: string, tokenIdNum: string) => {
        window.open(`https://amoy.polygonscan.com/nft/${contractAddress}/${tokenIdNum}`, "_blank");
    };

    const handleBuyResaleTicket = (listingId: string) => {
        router.push(`/${locale}/user/resale/${listingId}/checkout`);
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24 max-w-6xl flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-button-primary-bg-default animate-spin mb-4" />
                <p className="text-sm text-text-secondary font-medium">{t('loading_listing')}</p>
            </div>
        );
    }

    if (!isAvailable) {
        return (
            <div className="container mx-auto px-4 pb-12 max-w-[90%] pt-6">
                <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                    <Link href={`/${locale}/user/resale`} className="hover:text-button-primary-bg-default transition-colors">{t('marketplace')}</Link>
                    <ChevronRight size={14} />
                    <span className="text-text-primary">{t('resale_detail_breadcrumb')}</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-border-default">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('page_title')}</h1>
                        <p className="text-sm text-text-secondary max-w-2xl">
                            {t('page_subtitle')}
                            <br />
                            <span className="text-[13px] opacity-80 mt-1 inline-block">{t('official_verified_note')}</span>
                        </p>
                    </div>
                    <Link href={`/${locale}/user/resale`}>
                        <button className="bg-[#f0f3f6] dark:bg-gray-800 hover:bg-[#e2e8f0] dark:hover:bg-gray-700 text-text-primary px-5 py-2.5 rounded-ds-lg text-sm font-semibold transition-colors active:scale-[0.98]">
                            {t('back_to_marketplace')}
                        </button>
                    </Link>
                </div>

                <div className="py-24 flex justify-center">
                    <div className="bg-bg-surface border border-border-default rounded-ds-xl p-10 max-w-md w-full flex flex-col items-center text-center shadow-sm">
                        <div className="w-14 h-14 rounded-full border border-border-default flex items-center justify-center mb-6">
                            <HelpCircle size={28} className="text-text-secondary" />
                        </div>
                        <h2 className="text-[18px] font-bold text-text-primary mb-3">{t('unavailable_title')}</h2>
                        <p className="text-[13px] text-text-secondary mb-8 leading-relaxed">
                            {t('unavailable_subtitle')}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-6 py-3 rounded-full text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 w-full shadow-sm"
                        >
                            <ArrowLeft size={16} /> {t('back_to_marketplace')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%] pt-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                <Link href={`/${locale}/user/resale`} className="hover:text-button-primary-bg-default transition-colors">{t('marketplace')}</Link>
                <ChevronRight size={14} />
                <span className="text-text-primary">{t('resale_detail_breadcrumb')}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-border-default">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">{t('page_title')}</h1>
                    <p className="text-sm text-text-secondary max-w-2xl">
                        {t('page_subtitle')}
                        <br />
                        <span className="text-[13px] opacity-80 mt-1 inline-block">{t('official_verified_note')}</span>
                    </p>
                </div>
                <Link href={`/${locale}/user/resale`}>
                    <button className="bg-[#f0f3f6] dark:bg-gray-800 hover:bg-[#e2e8f0] dark:hover:bg-gray-700 text-text-primary px-5 py-2.5 rounded-ds-lg text-sm font-semibold transition-colors active:scale-[0.98]">
                        {t('back_to_marketplace')}
                    </button>
                </Link>
            </div>

            {/* Hero Event Info */}
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">{listingData.eventName}</h2>
                        <div className="text-[13px] text-text-secondary space-y-1.5">
                            <p>{formatDate(listingData.eventStartTime)}</p>
                            <p>{listingData.venueName}, {listingData.venueAddress}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="flex items-center gap-2 mb-3 md:justify-end">
                            <span className="bg-[#1a1a1a] dark:bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-ds-sm flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> {t('official_resale')}
                            </span>
                            <span className="bg-[#1a1a1a] dark:bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-ds-sm">
                                {t('selling')}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-text-primary mb-1">{formatCurrency(listingData.listingPrice)}</div>
                        <p className="text-[11px] text-text-muted">{t('official_resale_note')}</p>
                    </div>
                </div>
                <div className="border-t border-border-default pt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]">
                    <div className="text-text-secondary">{t('ticket_type')} <span className="font-semibold text-text-primary ml-1">{listingData.ticketTypeName}</span></div>
                    <div className="text-text-secondary">{t('seat_area')} <span className="font-semibold text-text-primary ml-1">-</span></div>
                    <div className="text-text-secondary flex items-center gap-2">{t('listing_code')} <span className="font-semibold text-text-primary ml-1 px-2 py-0.5 bg-bg-subtle rounded border border-border-default font-mono text-[11px]">{listingData.listingCode}</span></div>
                </div>
            </div>

            {/* Layout 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6 w-full">
                    {/* Thông tin vé */}
                    <div className="border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">{t('ticket_info')}</h3>
                        <div className="space-y-4 text-[13px]">
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('event')}</span>
                                <span className="font-bold text-text-primary text-right">{listingData.eventName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('time')}</span>
                                <span className="font-bold text-text-primary text-right">{formatDate(listingData.eventStartTime)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('venue')}</span>
                                <span className="font-bold text-text-primary text-right">{listingData.venueName}, {listingData.venueAddress}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('ticket_type')}</span>
                                <span className="font-bold text-text-primary">{listingData.ticketTypeName}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('seat_area')}</span>
                                <span className="font-bold text-text-primary">-</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('listing_code')}</span>
                                <span className="font-bold text-text-primary font-mono text-[12px]">{listingData.listingCode}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('listing_status')}</span>
                                <span className="font-bold text-text-primary">{t('selling')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle hover:bg-bg-subtle transition-colors">
                                <span className="text-text-secondary">{t('transaction_type')}</span>
                                <span className="font-bold text-text-primary text-right">{t('transaction_type_value')}</span>
                            </div>
                        </div>
                        <p className="text-[12px] text-text-muted mt-5 leading-relaxed bg-[#fafafa] dark:bg-[#111827] p-3.5 rounded-ds-lg border border-border-default">
                            {t('verified_marketplace_note')}
                        </p>
                    </div>

                    {/* Xác thực vé */}
                    <div className="border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">{t('verification_title')}</h3>
                        <div className="space-y-4 text-[13px] mb-5">
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                                <span className="text-text-secondary">{t('verification_status')}</span>
                                <span className="font-bold text-text-primary">{t('verified')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                                <span className="text-text-secondary">{t('token_id')}</span>
                                <span className="font-bold text-text-primary">{listingData.tokenId}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                                <span className="text-text-secondary">{t('ticket_source')}</span>
                                <span className="font-bold text-text-primary text-right">{t('ticket_source_value')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                                <span className="text-text-secondary">{t('ownership_status')}</span>
                                <span className="font-bold text-text-primary text-right">{t('ownership_status_value')}</span>
                            </div>
                        </div>

                        <div className="bg-[#fafafa] dark:bg-[#111827] rounded-ds-lg p-3.5 border border-border-default mb-5 text-[12px] text-text-secondary leading-relaxed">
                            {t('verification_desc')}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div onClick={() => handleOpenProvenance(listingData.ticketAssetId)}>
                                <button className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-5 py-2.5 rounded-full text-[12px] font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <Network size={14} /> {t('view_provenance')}
                                </button>
                            </div>
                            <button onClick={() => handleOpenExplorer(listingData.contractAddress, listingData.tokenId)} className="border border-border-default hover:bg-bg-subtle text-button-primary-bg-default px-5 py-2.5 rounded-full text-[12px] font-semibold transition-colors flex items-center justify-center gap-2 bg-bg-surface">
                                <ExternalLink size={14} /> {t('open_explorer')}
                            </button>
                        </div>
                    </div>

                    {/* Giá vé */}
                    <div className="border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">{t('price_title')}</h3>
                        <div className="space-y-4 text-[13px] mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">{t('current_resale_price')}</span>
                                <span className="font-bold text-text-primary">{formatCurrency(listingData.listingPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">{t('original_price')}</span>
                                <span className="font-bold text-text-primary">{formatCurrency(listingData.originalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">{t('difference')}</span>
                                <span className="font-bold text-text-primary">+{formatCurrency(listingData.listingPrice - listingData.originalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-5 border-b border-border-default items-end">
                                <span className="text-text-secondary">{t('system_check')}</span>
                                <span className="font-bold text-text-primary">{t('valid_price_note')}</span>
                            </div>
                        </div>

                        <div className="bg-[#fafafa] dark:bg-[#111827] rounded-ds-lg p-3.5 border border-border-default text-[12px] text-text-secondary mb-3">
                            {t('anti_speculation_note')}
                        </div>
                        <p className="text-[11px] text-text-muted mt-2">{t('final_price_note')}</p>
                    </div>

                    {/* Sau khi bạn mua */}
                    <div className="border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-4">{t('after_purchase_title')}</h3>
                        <ul className="space-y-3 text-[13px] text-text-secondary list-disc pl-5 marker:text-text-muted">
                            <li>{t('after_purchase_1')}</li>
                            <li>{t('after_purchase_2')}</li>
                            <li>{t('after_purchase_3')}</li>
                            <li>{t('after_purchase_4')}</li>
                        </ul>
                    </div>

                    {/* Lưu ý khi mua vé bán lại */}
                    <div className="border border-border-default rounded-ds-xl p-6 shadow-sm bg-[#fafafa] dark:bg-[#111827]">
                        <h3 className="text-[16px] font-bold text-text-primary mb-4">{t('resale_notes_title')}</h3>
                        <ul className="space-y-3 text-[13px] text-text-secondary list-disc pl-5 mb-6 marker:text-text-muted">
                            <li>{t('resale_note_1')}</li>
                            <li>{t('resale_note_2')}</li>
                            <li>{t('resale_note_3')}</li>
                            <li>{t('resale_note_4')}</li>
                        </ul>
                        <div className="flex gap-6 text-[12px] text-button-primary-bg-default font-medium border-t border-border-default pt-5">
                            <span className="cursor-pointer hover:underline">{t('faq')}</span>
                            <span className="cursor-pointer hover:underline">{t('ticket_policy')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column / Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 border border-border-default rounded-ds-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="font-bold text-[16px] text-text-primary mb-5 border-b border-border-default pb-4">{t('listing_summary')}</h3>

                        <div className="mb-5">
                            <div className="inline-flex items-center gap-2 mb-3 bg-[#1a1a1a] dark:bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-ds-sm">
                                <CheckCircle2 size={12} /> {t('official_resale')}
                            </div>
                            <h4 className="font-bold text-[14px] text-text-primary mb-2">{listingData.eventName}</h4>
                            <p className="text-[12px] text-text-secondary mb-1">{formatDate(listingData.eventStartTime)}</p>
                            <p className="text-[12px] text-text-secondary">{listingData.venueName}</p>
                        </div>

                        <div className="border-t border-border-default my-4"></div>

                        <div className="space-y-3.5 text-[12px] mb-6 border-b border-border-default pb-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('ticket_type')}</span>
                                <span className="font-bold text-text-primary">{listingData.ticketTypeName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('seat_area')}</span>
                                <span className="font-bold text-text-primary">-</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[13px] text-text-secondary">{t('subtotal')}</span>
                            <span className="text-2xl font-bold text-text-primary">{formatCurrency(listingData.listingPrice)}</span>
                        </div>

                        <div className="bg-[#fafafa] dark:bg-[#111827] rounded-ds-lg p-4 border border-border-default mb-6">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-text-primary mb-3">
                                <ShieldCheck size={16} className="text-feedback-success-text" /> {t('safety_commitment')}
                            </div>
                            <ul className="space-y-2.5 text-[11px] text-text-secondary">
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
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Link href={`/${locale}/user/resale/${listingId}/checkout`} className="block">
                                <button className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-ds-lg text-[13px] font-bold transition-all duration-200 shadow-md active:scale-[0.98]">
                                    {t('buy_resale_ticket')}
                                </button>
                            </Link>
                            <Link href={`/${locale}/user/tickets/${listingData.ticketAssetId}/provenance`} className="block">
                                <button className="w-full py-3 bg-[#e5e7eb]/40 dark:bg-[#1f2937] hover:bg-[#e5e7eb] dark:hover:bg-gray-700 text-text-primary rounded-ds-lg text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                    {t('view_provenance')}
                                </button>
                            </div>
                            <Link href={`/${locale}/user/resale`} className="block">
                                <button className="w-full py-3 bg-Bg-Surface dark:bg-transparent border border-border-default hover:bg-[#f0f3f6] dark:hover:bg-gray-800 text-text-primary rounded-ds-lg text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                    {t('back_to_marketplace')}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

