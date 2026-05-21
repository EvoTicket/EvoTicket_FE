"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import {
    Search,
    ChevronDown,
    CheckIcon,
    Ticket,
    Wallet,
    ArrowRight,
    ChevronUp,
    QrCode,
    ExternalLink,
    Network,
    Search as SearchIcon,
    Loader2,
    CheckCircle2,
    X,
    RefreshCcw,
    Clock
} from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";

export default function MyTicketsPage() {
    const t = useTranslations("MyTickets");
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || "vi";

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [expandedEvents, setExpandedEvents] = useState<any[]>([]);
    const [expandedTickets, setExpandedTickets] = useState<any[]>([]);

    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // QR Code Modal State
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrData, setQrData] = useState<any>(null);
    const [qrTimer, setQrTimer] = useState(0);
    const [qrLoading, setQrLoading] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    // Sort setup
    const sortByList = [
        { id: "popular", name: t("sort_popular") },
        { id: "newest", name: t("sort_newest") },
        { id: "oldest", name: t("sort_oldest") }
    ];
    const [sortBy, setSortBy] = useState(sortByList[1]);

    const fetchQRToken = async (ticketAssetId: number) => {
        setSelectedTicketId(ticketAssetId);
        setQrLoading(true);
        setQrModalOpen(true);
        try {
            const response = await api.get(`/checkin-service/api/v1/tickets/${ticketAssetId}/qr-token`, { skipAuth: false } as any);
            if (response.data && response.data.data) {
                setQrData(response.data.data);
                setQrTimer(response.data.data.refreshAfterSeconds);
            }
        } catch (error) {
            console.error("Failed to fetch QR token", error);
            // toast.error(t('qr_fetch_failed') || "Không thể tải mã QR");
        } finally {
            setQrLoading(false);
        }
    };

    const refreshQRCode = () => {
        if (selectedTicketId) {
            fetchQRToken(selectedTicketId);
        }
    };

    useEffect(() => {
        let interval: any;
        if (qrModalOpen && qrTimer > 0) {
            interval = setInterval(() => {
                setQrTimer(prev => prev - 1);
            }, 1000);
        } else if (qrTimer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [qrModalOpen, qrTimer]);

    const tabs = [
        { id: "all", label: t("tab_all") },
        { id: "upcoming", label: t("tab_upcoming") },
        { id: "used", label: t("tab_used") },
        { id: "minting", label: t("tab_minting") },
        { id: "reselling", label: t("tab_reselling") },
    ];

    const cancelResell = async (listingCode: string) => {
        try {
            const response = await api.post(`/order-service/api/v1/resale/listings/${listingCode}/cancel`);
            if (response.data && response.data.status === 200) {
                toast.success(t('cancel_resell_success'));
                fetchTickets();
            }
        } catch (error) {
            console.error("Failed to cancel resell", error);
            toast.error(t('cancel_resell_failed'));
        }
    };

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/order-service/api/v1/tickets/me");

            if (response.data && response.data.data) {
                const data = response.data.data;
                setEvents(data);
                if (data.length > 0) {
                    setExpandedEvents([data[0].id]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const toggleEvent = (id: any) => {
        if (expandedEvents.includes(id)) {
            setExpandedEvents(expandedEvents.filter(e => e !== id));
        } else {
            setExpandedEvents([...expandedEvents, id]);
        }
    };

    const toggleTicket = (id: any) => {
        if (expandedTickets.includes(id)) {
            setExpandedTickets(expandedTickets.filter(t => t !== id));
        } else {
            setExpandedTickets([...expandedTickets, id]);
        }
    };

    const filteredEvents = events.map(event => {
        const matchedTickets = event.tickets.filter((ticket: any) => {
            let matchTab = false;
            switch (activeTab) {
                case "all": matchTab = true; break;
                case "upcoming": matchTab = ticket.status === 'active'; break;
                case "used": matchTab = ticket.status === 'used'; break;
                case "minting": matchTab = ticket.status === 'minting'; break;
                case "reselling": matchTab = ticket.status === 'on_sale'; break;
                default: matchTab = true;
            }

            let matchSearch = false;
            if (!searchQuery.trim()) {
                matchSearch = true;
            } else {
                const q = searchQuery.toLowerCase();
                matchSearch = (ticket.ticketId || "").toLowerCase().includes(q) ||
                    (ticket.tokenId || "").toLowerCase().includes(q) ||
                    (ticket.ticketName || "").toLowerCase().includes(q);
            }

            return matchTab && matchSearch;
        });

        const q = searchQuery.toLowerCase();
        const eventMatchesSearch = !searchQuery.trim() ||
            (event.eventName || "").toLowerCase().includes(q) ||
            (event.venue || "").toLowerCase().includes(q) ||
            (event.orderId || "").toLowerCase().includes(q);

        let finalTickets = matchedTickets;

        if (eventMatchesSearch && searchQuery.trim()) {
            finalTickets = event.tickets.filter((ticket: any) => {
                switch (activeTab) {
                    case "all": return true;
                    case "upcoming": return ticket.status === 'active';
                    case "used": return ticket.status === 'used';
                    case "minting": return ticket.status === 'minting';
                    case "reselling": return ticket.status === 'on_sale';
                    default: return true;
                }
            });
        }

        if (finalTickets.length === 0 && !eventMatchesSearch) return null;
        if (finalTickets.length === 0 && activeTab !== "all") return null;

        return { ...event, tickets: finalTickets };
    }).filter(Boolean) as any[];

    filteredEvents.sort((a, b) => {
        if (!a || !b) return 0;
        if (sortBy.id === "nearest") {
            // Since backend date is pre-formatted, sorting might need a better approach or trust backend order
            return a.id - b.id;
        } else {
            return b.id - a.id;
        }
    });

    const openProvenance = (tokenId: string) => {
        window.open(`/${locale}/user/tickets/${tokenId}/provenance`, "_blank");
        // router.push(`/${locale}/user/tickets/${tokenId}/provenance`);
    }
    const openExplorer = (contractAddress: string, tokenId: string) => {
        window.open(`https://amoy.polygonscan.com/nft/${contractAddress}/${tokenId}`, "_blank");
    }

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mt-6 mb-4">
                <span>{t('breadcrumb_account')}</span>
                <span className="text-[10px]">›</span>
                <span className="text-button-primary-bg-default font-semibold">{t('breadcrumb_my_tickets')}</span>
            </div>

            {/* Header section with title and global action button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1">{t('page_title')}</h1>
                    <p className="text-sm text-text-secondary">{t('page_subtitle')}</p>
                </div>
                <button className="bg-button-secondary-bg-default hover:bg-button-secondary-bg-hover text-button-secondary-text-default border border-button-secondary-border-default px-4 py-2 rounded-lg outline-none font-medium transition-colors text-sm flex items-center gap-2">
                    <Ticket size={16} className="text-button-secondary-text-default" /> {t('explore_events')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-bg-surface border border-border-default rounded-lg p-5">
                    <div className="flex items-center gap-2 text-text-secondary mb-3">
                        <Ticket size={16} />
                        <span className="font-semibold text-xs">{t('total_tickets')}</span>
                    </div>
                    <div className="text-3xl font-bold text-text-primary mb-1">
                        {events.reduce((sum, e) => sum + e.totalTickets, 0).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-text-secondary mt-2">
                        {t('total_tickets_sub')}
                    </div>
                </div>

                <div className="bg-bg-surface border border-border-default rounded-lg p-5">
                    <div className="flex items-center gap-2 text-text-secondary mb-3">
                        <Wallet size={16} />
                        <span className="font-semibold text-xs">{t('blockchain_wallet')}</span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary mb-1 mt-1">
                        {t('wallet_initialized')}
                    </div>
                    <div className="text-xs text-text-secondary mt-2">
                        {t('wallet_sub')}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6 w-full">
                <div className="flex justify-end relative z-20">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                            <SearchIcon size={14} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-1.5 bg-bg-surface text-xs text-text-primary rounded-full border border-border-default focus:outline-none focus:ring-1 focus:ring-button-primary-bg-default focus:border-button-primary-bg-default transition-colors"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-4 border-b border-border-default pb-2">
                    <div className="flex items-center overflow-x-auto w-full sm:w-auto hidescrollbar gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-2 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? "text-button-primary-bg-default font-semibold"
                                    : "text-text-secondary hover:text-text-primary"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 z-10 w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="text-[13px] text-text-secondary whitespace-nowrap">{t('sort_by')}</span>
                        <div className="relative h-8 w-40">
                            <Listbox value={sortBy} onChange={setSortBy}>
                                <ListboxButton className="w-full h-full pl-3 pr-8 bg-bg-surface border border-border-default rounded-md text-text-primary outline-none focus:ring-1 focus:ring-button-primary-bg-default focus:border-button-primary-bg-default cursor-pointer transition-colors text-left text-[13px] relative shadow-sm">
                                    <span className="block truncate">{sortBy.name}</span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions
                                    anchor="bottom"
                                    modal={false}
                                    className="absolute right-0 mt-1 w-[var(--button-width)] bg-bg-surface border border-border-default rounded-ds-md shadow-lg text-text-primary text-[13px] py-1 z-50">
                                    {sortByList.map(item => (
                                        <ListboxOption key={item.id} value={item} className="group flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-secondary">
                                            <span>{item.name}</span>
                                            <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-button-primary-bg-default" />
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-bg-surface border border-border-default rounded-lg">
                        <Loader2 className="w-10 h-10 text-button-primary-bg-default animate-spin mb-4" />
                        <p className="text-sm text-text-secondary font-medium">{t('loading_message')}</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-12 bg-bg-surface border border-border-default rounded-ds-lg text-center flex flex-col items-center">
                        <Ticket size={48} className="text-text-muted mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-text-primary mb-1">{t('empty_title')}</h3>
                        <p className="text-sm text-text-secondary w-3/4 max-w-md">{t('empty_subtitle')}</p>
                    </div>
                ) : (
                    filteredEvents.map((event, index) => {
                        const isExpanded = expandedEvents.includes(event.id);
                        return (
                            <div key={event.id || event.orderId || `event-${index}`} className="bg-bg-surface border border-border-default rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                                    <div className="flex-1 max-w-sm">
                                        <h3 className="font-semibold text-[15px] text-text-primary mb-1">{event.eventName}</h3>
                                        <p className="text-[11px] text-text-secondary leading-tight mt-1.5">
                                            {event.date}<br />
                                            {event.venue}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 divide-y divide-transparent md:divide-none gap-y-1 text-[11px] text-text-secondary flex-1">
                                        <div>{t('order_id')} <span className="font-medium text-text-primary">{event.orderId}</span></div>
                                        <div>{t('quantity')} <span className="font-medium text-text-primary">{t('quantity_tickets', { count: event.totalTickets })}</span></div>
                                        <div>{t('summary')} <span className="font-medium text-text-primary">{event.summary}</span></div>
                                        <div>{t('status')} <span className="font-medium text-text-primary">{event.statusSummary}</span></div>
                                    </div>
                                    <div className="mt-2 md:mt-0 md:pl-4 shrink-0 self-start md:self-center">
                                        <button
                                            onClick={() => toggleEvent(event.id)}
                                            className={`px-3 py-1.5 border rounded-full text-[11px] font-medium transition-colors flex items-center gap-1 min-w-[90px] justify-center ${isExpanded
                                                ? 'bg-button-secondary-bg-default border-button-secondary-border-default text-button-secondary-text-default hover:bg-button-secondary-bg-hover'
                                                : 'border-button-primary-bg-default/20 text-button-primary-bg-default hover:bg-button-primary-bg-default/10'
                                                }`}
                                        >
                                            {isExpanded ? t('collapse') : t('view_details')}
                                            {isExpanded ? <ChevronUp size={12} className="ml-0.5" /> : <ChevronDown size={12} className="ml-0.5" />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && event.tickets.length > 0 && (
                                    <div className="bg-bg-subtle border-t border-border-default p-4 sm:p-6">
                                        <div className="mb-4">
                                            <h4 className="font-bold text-text-primary text-[13px] leading-tight">{t('ticket_list_title')}</h4>
                                            <p className="text-[11px] text-text-muted mt-1">{t('ticket_list_desc')}</p>
                                        </div>

                                        <div className="space-y-3 relative z-10 w-full overflow-visible">
                                            {event.tickets.map((ticket: any, ticketIndex: number) => {
                                                const isTicketExpanded = expandedTickets.includes(ticket.id);

                                                return (
                                                    <div key={ticket.id || ticket.ticketAssetId || `ticket-${ticketIndex}`} className="bg-bg-surface border border-border-default rounded-ds-md overflow-hidden relative">
                                                        <div className="p-4 sm:px-6 sm:py-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                                                            <div className="w-full md:w-1/4 shrink-0">
                                                                <h5 className="font-bold text-text-primary text-[13px] mb-1">{ticket.ticketName}</h5>
                                                                <p className="text-[11px] text-text-secondary mt-1">{ticket.ticketType} • {ticket.seat}</p>
                                                            </div>

                                                            <div className="w-full md:w-1/3 flex flex-col gap-1 text-[11px]">
                                                                {ticket.status === 'on_sale' ? (
                                                                    <div>
                                                                        <span className="text-text-muted">{t('listing_id')} </span>
                                                                        <span className="text-text-primary font-medium">{ticket.listingCode}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <span className="text-text-muted">{t('ticket_id')} </span>
                                                                        <span className="text-text-primary font-medium">{ticket.id}</span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-text-muted">{t('token_id')} </span>
                                                                    <span className="text-text-primary font-medium">{ticket.tokenId}</span>
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    {ticket.status === 'minting' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-default bg-bg-surface text-text-muted text-[10px] font-medium whitespace-nowrap">
                                                                            <Loader2 size={10} className="animate-spin" /> {t('minting')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'active' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-feedback-success-border bg-feedback-success-bg text-feedback-success-text text-[10px] font-medium whitespace-nowrap">
                                                                            <CheckCircle2 size={10} /> {t('valid')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'on_sale' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-feedback-warning-border bg-feedback-warning-bg text-feedback-warning-text text-[10px] font-medium whitespace-nowrap">
                                                                            {t('tab_reselling')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'used' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-default bg-secondary text-text-muted text-[10px] font-medium whitespace-nowrap">
                                                                            {t('tab_used')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-end gap-2 shrink-0 md:flex-1 w-full md:w-auto relative z-20">
                                                                <button
                                                                    onClick={() => fetchQRToken(ticket.id)}
                                                                    className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors shadow-sm whitespace-nowrap"
                                                                >
                                                                    {t('view_qr')}
                                                                </button>
                                                                {ticket.status !== 'on_sale' && (
                                                                    <Link href={`/${locale}/user/tickets/${ticket.id}/resell`}>
                                                                        <button className="bg-button-ghost-bg-default hover:bg-button-ghost-bg-hover text-button-ghost-text-default border border-button-ghost-border-default px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap block">
                                                                            {t('resell_button')}
                                                                        </button>
                                                                    </Link>
                                                                )}
                                                                {ticket.status === 'on_sale' && (
                                                                    <button
                                                                        onClick={() => cancelResell(ticket.listingCode)}
                                                                        className="bg-feedback-error-bg/10 hover:bg-feedback-error-bg/20 text-feedback-error-text border border-feedback-error-border px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap block"
                                                                    >
                                                                        {t('cancel_resell')}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleTicket(ticket.id)}
                                                                    className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                                                >
                                                                    {isTicketExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isTicketExpanded && (
                                                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10 w-full">
                                                                <div className="flex flex-col md:flex-row gap-6 mt-2 pt-6 items-start bg-bg-surface border-t border-border-default">
                                                                    <div className="flex-1 py-1">
                                                                        <h5 className="font-bold text-text-primary text-[13px] mb-4">{t('ticket_details_title')}</h5>
                                                                        <div className="grid grid-cols-[100px_1fr] gap-y-2.5 text-[11px] mb-6 max-w-full">
                                                                            <div className="text-text-muted">{t('ticket_type_label')}</div>
                                                                            <div className="font-medium text-text-primary pl-2 text-right">{ticket.ticketType}</div>

                                                                            <div className="text-text-muted">{t('ticket_id')}</div>
                                                                            <div className="font-medium text-text-primary pl-2 text-right">{ticket.id}</div>

                                                                            <div className="text-text-muted">{t('token_id')}</div>
                                                                            <div className="font-medium text-text-primary pl-2 text-right">{ticket.tokenId}</div>

                                                                            <div className="text-text-muted">{t('ticket_status')}</div>
                                                                            <div className="font-medium text-text-primary pl-2 text-right">{ticket.status.toUpperCase().replace(/_/g, ' ')}</div>
                                                                            {ticket.status === 'on_sale' &&
                                                                                <div className="text-text-muted">{t('listing_price')}</div>
                                                                            }
                                                                            {ticket.status === 'on_sale' &&
                                                                                <div className="font-medium text-text-primary pl-2 text-right">{ticket.listingPrice}</div>
                                                                            }
                                                                            <div className="text-text-muted">{t('qr_status')}</div>
                                                                            <div className="font-medium text-text-primary pl-2 text-right">{t('qr_ready')}</div>
                                                                        </div>

                                                                        <div className="flex justify-end flex-wrap gap-3 pointer-events-auto">
                                                                            <button onClick={() => openProvenance(ticket.id)}>
                                                                                <div className="bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default px-5 py-2 rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                                                                    <Network size={12} /> {t('view_provenance')}
                                                                                </div>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openExplorer(ticket.contractAddress, ticket.tokenId)}
                                                                                disabled={!ticket.contractAddress || !ticket.tokenId}
                                                                                className={`border px-5 py-2 rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 ${ticket.contractAddress && ticket.tokenId
                                                                                    ? 'border-border-default hover:bg-secondary text-button-primary-bg-default cursor-pointer'
                                                                                    : 'border-border-default text-text-muted cursor-not-allowed opacity-50'
                                                                                    }`}
                                                                            >
                                                                                <ExternalLink size={12} /> {t('open_explorer')}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-border-default mt-16 mb-8"></div>

            <Transition show={qrModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setQrModalOpen(false)}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-modal-overlay-bg-default backdrop-blur-sm transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <TransitionChild
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative transform overflow-hidden rounded-ds-2xl bg-bg-surface text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                                    <div className="bg-bg-surface px-4 pb-4 pt-5 sm:p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <DialogTitle as="h3" className="text-lg font-bold leading-6 text-text-primary">
                                                {t('qr_code_title')}
                                            </DialogTitle>
                                            <button
                                                onClick={() => setQrModalOpen(false)}
                                                className="rounded-full p-1 hover:bg-bg-subtle text-text-muted transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="bg-white p-6 rounded-ds-2xl border-2 border-dashed border-border-default shadow-inner mb-6 relative">
                                                {qrLoading ? (
                                                    <div className="w-56 h-56 flex items-center justify-center">
                                                        <Loader2 className="w-12 h-12 text-button-primary-bg-default animate-spin" />
                                                    </div>
                                                ) : qrData ? (
                                                    <div className="relative">
                                                        <QRCodeSVG
                                                            value={qrData.qrToken}
                                                            size={224}
                                                            level="M"
                                                            includeMargin={false}
                                                        />
                                                        {qrTimer === 0 && (
                                                            <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                                                                <p className="text-sm font-bold text-feedback-error-text mb-4">{t('qr_expired')}</p>
                                                                <button
                                                                    onClick={refreshQRCode}
                                                                    className="flex items-center gap-2 bg-button-primary-bg-default text-button-primary-text-default px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-button-primary-bg-hover transition-all active:scale-95"
                                                                >
                                                                    <RefreshCcw size={14} /> {t('refresh_qr')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-56 h-56 flex items-center justify-center text-text-muted italic text-xs">
                                                        {t('qr_not_found')}
                                                    </div>
                                                )}
                                            </div>

                                            {qrTimer > 0 && (
                                                <div className="w-full bg-bg-subtle rounded-ds-xl p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-button-primary-bg-default/10 flex items-center justify-center text-button-primary-bg-default">
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{t('qr_expires_in')}</p>
                                                            <p className="text-sm font-mono font-bold text-text-primary">{qrTimer}s</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={refreshQRCode}
                                                        className="p-2 rounded-full hover:bg-bg-surface text-text-secondary transition-colors"
                                                        title={t('refresh_qr')}
                                                    >
                                                        <RefreshCcw size={18} className={qrLoading ? "animate-spin" : ""} />
                                                    </button>
                                                </div>
                                            )}

                                            <div className="mt-8 text-center">
                                                <p className="text-[11px] text-text-muted leading-relaxed">
                                                    {t('qr_security_note')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
