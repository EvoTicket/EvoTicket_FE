"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
    CheckCircle2
} from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/lib/axios";

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

    // Sort setup
    const sortByList = [
        { id: "popular", name: t("sort_popular") || "Phổ biến" },
        { id: "nearest", name: t("sort_nearest_date") || "Gần ngày diễn nhất" },
    ];
    const [sortBy, setSortBy] = useState(sortByList[0]);

    const tabs = [
        { id: "all", label: t("tab_all") || "Tất cả" },
        { id: "upcoming", label: t("tab_upcoming") || "Sắp diễn ra" },
        { id: "used", label: t("tab_used") || "Đã sử dụng" },
        { id: "minting", label: t("tab_minting") || "Đang mint" },
        { id: "reselling", label: t("tab_reselling") || "Đang bán lại" },
    ];

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

    return (
        <div className="container mx-auto px-4 pb-12 max-w-[90%]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mt-6 mb-4">
                <span>{t('breadcrumb_account')}</span>
                <span className="text-[10px]">›</span>
                <span className="text-text-primary">{t('breadcrumb_my_tickets')}</span>
            </div>

            {/* Header section with title and global action button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-1">{t('page_title')}</h1>
                    <p className="text-sm text-text-secondary">{t('page_subtitle')}</p>
                </div>
                <button className="bg-bg-surface border border-border-default hover:bg-secondary text-text-primary px-4 py-2 rounded-lg outline-none font-medium transition-colors text-sm flex items-center gap-2">
                    <Ticket size={16} className="text-text-secondary" /> {t('explore_events')}
                </button>
            </div>

            {/* Stats Cards - Updated to 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Total Tickets */}
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

                {/* Blockchain Wallet */}
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

            {/* Filters and Search */}
            <div className="flex flex-col gap-4 mb-6 w-full">
                <div className="flex justify-end relative z-20">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                            <SearchIcon size={14} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-1.5 bg-bg-surface text-xs text-text-primary rounded-full border border-border-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
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
                                    ? "text-primary font-semibold"
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
                                <ListboxButton className="w-full h-full pl-3 pr-8 bg-bg-surface border border-border-default rounded-md text-text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-colors text-left text-[13px] relative shadow-sm">
                                    <span className="block truncate">{sortBy.name}</span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                    </span>
                                </ListboxButton>
                                <ListboxOptions
                                    anchor="bottom"
                                    modal={false}
                                    className="absolute right-0 mt-1 w-[var(--button-width)] bg-bg-surface border border-border-default rounded-md shadow-lg text-text-primary text-[13px] py-1 z-50">
                                    {sortByList.map(item => (
                                        <ListboxOption key={item.id} value={item} className="group flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-secondary">
                                            <span>{item.name}</span>
                                            <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-primary" />
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                    </div>
                </div>
            </div>

            {/* TICKETS CONTENT */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-bg-surface border border-border-default rounded-lg">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-sm text-text-secondary font-medium">{t('loading_message')}</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-12 bg-bg-surface border border-border-default rounded-lg text-center flex flex-col items-center">
                        <Ticket size={48} className="text-text-muted mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-text-primary mb-1">{t('empty_title')}</h3>
                        <p className="text-sm text-text-secondary w-3/4 max-w-md">{t('empty_subtitle')}</p>
                    </div>
                ) : (
                    filteredEvents.map((event) => {
                        const isExpanded = expandedEvents.includes(event.id);
                        return (
                            <div key={event.id} className="bg-bg-surface border border-border-default rounded-lg overflow-hidden shadow-sm">
                                {/* Event Header Row */}
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
                                                ? 'border-border-default bg-secondary text-text-primary hover:bg-[#e2e8f0] dark:hover:bg-gray-700'
                                                : 'border-[#c7d2fe] dark:border-[#4f46e5] text-primary hover:bg-[#e0e7ff] dark:hover:bg-[#3730a3]'
                                                }`}
                                        >
                                            {isExpanded ? t('collapse') : t('view_details')}
                                            {isExpanded ? <ChevronUp size={12} className="ml-0.5" /> : <ChevronDown size={12} className="ml-0.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Ticket List */}
                                {isExpanded && event.tickets.length > 0 && (
                                    <div className="bg-[#f8f9fa] dark:bg-[#111827]/40 border-t border-border-default p-4 sm:p-6">
                                        <div className="mb-4">
                                            <h4 className="font-bold text-text-primary text-[13px] leading-tight">{t('ticket_list_title')}</h4>
                                            <p className="text-[11px] text-text-muted mt-1">{t('ticket_list_desc')}</p>
                                        </div>

                                        <div className="space-y-3 relative z-10 w-full overflow-visible">
                                            {event.tickets.map((ticket: any) => {
                                                const isTicketExpanded = expandedTickets.includes(ticket.id);

                                                return (
                                                    <div key={ticket.id} className="bg-bg-surface border border-border-default rounded-md overflow-hidden relative">
                                                        <div className="p-4 sm:px-6 sm:py-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                                                            {/* Ticket Info Left */}
                                                            <div className="w-full md:w-1/4 shrink-0">
                                                                <h5 className="font-bold text-text-primary text-[13px] mb-1">{ticket.ticketName}</h5>
                                                                <p className="text-[11px] text-text-secondary mt-1">{ticket.ticketType} • {ticket.seat}</p>
                                                            </div>

                                                            {/* Ticket Info Middle */}
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
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#e2e8f0] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] text-[10px] font-medium whitespace-nowrap">
                                                                            <Loader2 size={10} className="animate-spin" /> {t('minting')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'active' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#22c55e] bg-[#f0fdf4] dark:bg-[#052e16] text-[#16a34a] dark:text-[#22c55e] text-[10px] font-medium whitespace-nowrap">
                                                                            <CheckCircle2 size={10} /> {t('valid')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'on_sale' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-600 text-[10px] font-medium whitespace-nowrap">
                                                                            {t('tab_reselling')}
                                                                        </span>
                                                                    )}
                                                                    {ticket.status === 'used' && (
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-medium whitespace-nowrap">
                                                                            {t('tab_used')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center justify-end gap-2 shrink-0 md:flex-1 w-full md:w-auto relative z-20">
                                                                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors shadow-sm whitespace-nowrap">
                                                                    {t('view_qr')}
                                                                </button>
                                                                {ticket.status !== 'on_sale' && (
                                                                    <Link href={`/${locale}/user/tickets/${ticket.id}/resell`}>
                                                                        <button className="border border-[#c7d2fe] dark:border-[#4f46e5] hover:bg-[#e0e7ff] dark:hover:bg-[#3730a3] text-primary px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap block">
                                                                            {t('resell_button')}
                                                                        </button>
                                                                    </Link>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleTicket(ticket.id)}
                                                                    className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                                                >
                                                                    {isTicketExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Ticket Detail */}
                                                        {isTicketExpanded && (
                                                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative z-10 w-full">
                                                                <div className="flex flex-col md:flex-row gap-6 mt-2 pt-6 items-start bg-bg-surface border-t border-border-default">
                                                                    {/* QR Code Placeholder */}
                                                                    {/* <div className="w-full md:w-56 bg-[#FAFAFA] dark:bg-[#1a1a1a] border border-border-default p-4 flex flex-col items-center justify-center self-stretch min-h-[220px]">
                                                                        <div className="bg-white p-2 border border-dotted border-border-default shadow-sm mb-4">
                                                                            <QrCode size={100} className="text-[#1a1a1a]" strokeWidth={1.5} />
                                                                        </div>
                                                                        <p className="text-[10px] text-text-muted text-center leading-relaxed max-w-[150px]">Mã QR dùng để check-in vào cổng tại sự kiện</p>
                                                                    </div> */}

                                                                    {/* Ticket Detail Block */}
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
                                                                            <div className="font-medium text-text-primary pl-2 text-right">Ready</div>
                                                                        </div>

                                                                        <div className="flex justify-end flex-wrap gap-3 pointer-events-auto">
                                                                            <Link href={`/${locale}/user/tickets/${ticket.id}/provenance`}>
                                                                                <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                                                                    <Network size={12} /> {t('view_provenance')}
                                                                                </button>
                                                                            </Link>
                                                                            <button className="border border-border-default hover:bg-secondary text-primary px-5 py-2 rounded-full text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5">
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
        </div>
    );
}
