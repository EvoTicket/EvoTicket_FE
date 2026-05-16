"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/src/lib/axios";
import {
    Search, MapPin, Calendar, LayoutGrid, List as ListIcon, Loader2, ChevronRight, X,
    CheckIcon, CircleHelp,
    ArrowLeft,
    ReceiptRussianRubleIcon,
    SkipBackIcon,
    BackpackIcon
} from "lucide-react";
import { Header } from "@/src/components/header";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { CustomDatePicker } from "@/src/components/ui/CustomDatePicker";
import { EventItem, Province } from "@/src/types/event";
import { useEventFilters } from "@/src/hooks/useEventFilters";
import { toast } from "react-toastify";

export default function EventsPage() {
    const { locale } = useParams();
    const searchParams = useSearchParams();
    const t = useTranslations("Events");



    const {
        categoriesList,
        sortByList,
        ticketAvailabilityList,
        dateFiltersList
    } = useEventFilters();

    // --- State ---
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Filters State
    const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
    const [selectedProvince, setSelectedProvince] = useState<any>(() => {
        const location = searchParams?.get("location");
        if (location && location !== 'all') {
            return { code: location, name: "" }; // Name will be filled by fetchProvinces
        }
        return { code: "all", name: t("location_all") || "Tất cả địa điểm" };
    });
    const [startDate, setStartDate] = useState<Date | null>(
        searchParams?.get("fromDate") ? new Date(searchParams.get("fromDate")!) : null
    );
    const [endDate, setEndDate] = useState<Date | null>(
        searchParams?.get("toDate") ? new Date(searchParams.get("toDate")!) : null
    );
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    // const [openSelectLocation, setOpenSelectLocation] = useState(false);

    // Pagination & Sort
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(9);
    const [sortBy, setSortBy] = useState(sortByList[0]);

    const [suggestedEvents, setSuggestedEvents] = useState<EventItem[]>([]);
    const [loadingSuggested, setLoadingSuggested] = useState(false);

    // Thêm các state UI cho wireframe (Chỉ là UI tĩnh ở level này để đúng thiết kế)
    // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [ticketStatuses, setTicketStatuses] = useState<string[]>([]);
    const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<{ id: string, name: string }[]>(() => {
        const genresParam = searchParams?.get("genres");
        if (genresParam && categoriesList) {
            const genresArray = genresParam.split(",");
            return categoriesList.filter(cat => genresArray.includes(cat.id));
        }
        return [];
    });


    // --- Effects ---

    // Headless UI Listbox handles its own state and click-outside natively.

    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        fetchEvents(page === 1);
    }, [page, sortBy, selectedProvince, startDate, endDate, selectedCategories, keyword]); // Trigger fetch khi bất kỳ bộ lọc nào thay đổi

    useEffect(() => {
        if (suggestedEvents.length === 0) {
            fetchSuggestedEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isFilterApplied = Boolean(
        keyword ||
        selectedProvince ||
        startDate ||
        endDate ||
        selectedCategories.length > 0 ||
        selectedDateFilter ||
        priceFrom ||
        priceTo ||
        ticketStatuses.length > 0
    );

    const fetchSuggestedEvents = async () => {
        setLoadingSuggested(true);
        try {
            const params: any = {
                page: 1,
                size: 4,
                sortBy: "popular",
                sortDirection: "DESC",
                includeExpired: false,
            };
            const response = await api.get("/api/events/recommended?limit=3", { params, skipAuth: true } as any);
            if (response.data && response.data.data) {
                setSuggestedEvents(response.data.data.content);
            }
        } catch (error) {
            console.error("Failed to fetch suggested events", error);
        } finally {
            setLoadingSuggested(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await api.get("/iam-service/api/locations/provinces", { skipAuth: true } as any);
            if (res.data) {
                const locations = [
                    { id: "all", name: t('location') },
                    { id: "all_loc", name: t('location_all') },
                    { id: "online", name: t('category_online') },
                    { id: "hcm", name: "TP. Hồ Chí Minh" },
                    { id: "hn", name: "Hà Nội" },
                    { id: "dn", name: "Đà Nẵng" },
                ];
                const allOption = {
                    code: "all",
                    name: t("location_all") || "Tất cả địa điểm"
                };
                const fullList = [allOption, ...res.data];
                setProvinces(fullList);

                // Cập nhật selectedProvince để có đầy đủ thông tin (như trường name)
                const locCode = searchParams?.get("location") || "all";
                const found = fullList.find((p: any) => String(p.code) === String(locCode));
                if (found) {
                    setSelectedProvince(found);
                } else {
                    setSelectedProvince(allOption);
                }
            }
        } catch (err) {
            console.error("Failed to fetch provinces", err);
        }
    };

    const fetchEvents = async (isReset = false) => {
        // Validation
        if (priceFrom && priceTo && Number(priceFrom) >= Number(priceTo)) {
            toast.warning(t("error_price_range") || "Giá tối thiểu phải nhỏ hơn giá tối đa");
            setLoading(false);
            return;
        }
        if (startDate && endDate && startDate > endDate) {
            toast.warning(t("error_date_range") || "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const params: any = {
                page,
                size,
                sort: sortBy.id,
            };

            if (keyword) params.keyword = keyword;
            if (selectedCategories.length > 0) {
                params.categories = selectedCategories.map(cat => cat.id).join(",");
            }
            const provinceCode = selectedProvince?.code || searchParams?.get("location");
            if (provinceCode && provinceCode !== 'all') params.provinceCodes = provinceCode;
            if (startDate) params.startDate = startDate.toISOString().split('T')[0];
            if (endDate) params.endDate = endDate.toISOString().split('T')[0];
            if (selectedDateFilter) params.dateFilters = selectedDateFilter;
            if (priceFrom) params.minPrice = priceFrom;
            if (priceTo) params.maxPrice = priceTo;
            if (ticketStatuses.length > 0) params.ticketAvailabilityStatuses = ticketStatuses.join(",");

            const response = await api.get("/inventory-service/api/events", { params, skipAuth: true } as any);

            if (response.data && response.data.data) {
                const newEvents = response.data.data.content;
                setEvents(isReset ? newEvents : [...events, ...newEvents]);
                setTotalPages(response.data.data.totalPages || 0);
                setTotalElements(response.data.data.totalElements || 0);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchEvents(true);
    };

    const clearFilters = () => {
        setKeyword("");
        setSelectedProvince("");
        setStartDate(null);
        setEndDate(null);
        setSelectedCategories([]);
        setPriceFrom("");
        setPriceTo("");
        setTicketStatuses([]);
        setSelectedDateFilter(null);
        setPage(1);
        setTimeout(() => fetchEvents(true), 0);
    };

    const loadMore = useCallback(() => {
        if (page < totalPages) {
            setPage(p => p + 1);
        }
    }, [page, totalPages]);

    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, page, totalPages, loadMore]);

    const toggleArrayItem = (array: any[], setArray: any, item: any) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const handleDateFilterClick = (filterId: string) => {
        if (selectedDateFilter === filterId) {
            setSelectedDateFilter(null);
            setStartDate(null);
            setEndDate(null);
            return;
        }

        setSelectedDateFilter(filterId);
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = null;

        switch (filterId) {
            case "TODAY":
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date(now.setHours(23, 59, 59, 999));
                break;
            case "THIS_WEEKEND":
                const day = now.getDay();
                // Diff to Saturday (6)
                const diffToSat = (6 - day + 7) % 7;
                start = new Date(now);
                start.setDate(now.getDate() + (day === 0 ? -1 : diffToSat)); // If Sunday, Sat was yesterday
                start.setHours(0, 0, 0, 0);

                end = new Date(start);
                end.setDate(start.getDate() + (day === 0 ? 0 : 1)); // Sunday
                if (day === 0) {
                    end = new Date(now);
                }
                end.setHours(23, 59, 59, 999);
                break;
            case "NEXT_7_DAYS":
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date(now);
                end.setDate(now.getDate() + 7);
                end.setHours(23, 59, 59, 999);
                break;
            case "CUSTOM":
                // Don't auto-calculate, just let user pick
                break;
            default:
                break;
        }

        if (filterId !== "CUSTOM") {
            setStartDate(start);
            setEndDate(end);
        }
    };

    return (
        <div className="min-h-screen bg-bg-page flex flex-col">
            {/* <Header /> */}

            <div className="container mx-auto px-4 py-6 flex-1 max-w-[90%]">

                {/* --- BREADCRUMB & HEADER --- */}
                <div className="mb-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-text-secondary uppercase tracking-widest">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{t('breadcrumb_home')}</Link>
                        <span>/</span>
                        <span className="text-button-primary-bg-default font-bold">{t('all_events')}</span>
                    </div>

                    {/* Title */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-text-primary mb-2">{t("search_results")}</h1>
                        <Link href={`/${locale}/user/homepage`} className="flex items-center text-text-primary hover:text-button-primary-bg-default transition-colors bg-bg-surface px-3 py-2 border border-border-default rounded-lg">
                            <ArrowLeft size={14} />
                            <span className="ml-2">
                                {t("back_homepage")}
                            </span>
                        </Link>
                    </div>
                    <p className="text-text-secondary">
                        {t("results_count", {
                            count: totalElements,
                            keyword: keyword ? `"${keyword}"` : t("all_events")
                        })}
                    </p>

                    {/* Active Filters Tags (Mockup theo wireframe) */}
                    <div className="flex flex-wrap gap-3 mt-4 mb-6">
                        {keyword && (
                            <div className="flex items-center gap-2 px-3 py-1.5 text-text-primary border border-border-default rounded-full text-sm">
                                <span>{keyword}</span>
                                <button onClick={() => { setKeyword(""); handleApplyFilters(); }} className="hover:text-button-primary-bg-default"><X size={14} /></button>
                            </div>
                        )}
                        {selectedProvince && (
                            <div className="flex items-center gap-2 px-3 py-1.5 text-text-primary border border-border-default rounded-full text-sm">
                                <span>{provinces.find(p => p.code === selectedProvince.code)?.name}</span>
                                <button onClick={() => { setSelectedProvince(""); handleApplyFilters(); }} className="hover:text-button-primary-bg-default"><X size={14} /></button>
                            </div>
                        )}
                        {(startDate || endDate) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 text-text-primary border border-border-default rounded-full text-sm">
                                <span>
                                    {startDate ? new Date(startDate).toLocaleDateString(locale as string === 'vi' ? "vi-VN" : "en-US", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "..."}
                                    {" - "}
                                    {endDate ? new Date(endDate).toLocaleDateString(locale as string === 'vi' ? "vi-VN" : "en-US", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "..."}
                                </span>
                                <button onClick={() => { setStartDate(null); setEndDate(null); handleApplyFilters(); }} className="hover:text-button-primary-bg-default"><X size={14} /></button>
                            </div>
                        )}
                        {selectedCategories.length > 0 && selectedCategories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 text-text-primary border border-border-default rounded-full text-sm">
                                <span>{cat.name}</span>
                                <button onClick={() => {
                                    setSelectedCategories(selectedCategories.filter(c => c.id !== cat.id));
                                    handleApplyFilters();
                                }} className="hover:text-button-primary-bg-default"><X size={14} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="h-px w-full bg-border"></div>
                </div>

                {/* --- MAIN LAYOUT: SIDEBAR + CONTENT --- */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR: BỘ LỌC */}
                    <aside className="w-full lg:w-[300px] shrink-0 space-y-8">
                        {/* Container bộ lọc */}
                        <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6">
                            <h2 className="font-bold text-2xl text-text-primary mb-6">{t("filter_title")}</h2>

                            {/* Danh mục sự kiện */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_by_category")}</h3>
                                <div className="space-y-3">
                                    {categoriesList.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.some(c => c.id === cat.id)}
                                                    onChange={() => {
                                                        if (selectedCategories.some(c => c.id === cat.id)) {
                                                            setSelectedCategories(selectedCategories.filter(c => c.id !== cat.id));
                                                        } else {
                                                            setSelectedCategories([...selectedCategories, cat]);
                                                        }
                                                    }}
                                                    className="peer appearance-none w-5 h-5 border border-border-default rounded bg-bg-surface checked:bg-button-primary-bg-default checked:border-button-primary-bg-default transition-colors cursor-pointer"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none text-button-primary-text-default">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-sm text-text-primary group-hover:text-button-primary-bg-default transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Địa điểm */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("location")}</h3>
                                <div className="h-10 relative">

                                    <Listbox value={selectedProvince} by={(a, b) => String(a?.code) === String(b?.code)} onChange={(val) => { setSelectedProvince(val); }}>
                                        <ListboxButton
                                            className="
                                                w-full h-full p-1.5 pl-3 bg-bg-surface
                                                border border-border-default rounded-ds-lg
                                                text-text-primary outline-none
                                                focus:ring-1 focus:ring-button-primary-bg-default focus:border-button-primary-bg-default 
                                                cursor-pointer transition-colors text-left">
                                            {selectedProvince?.name || "Địa điểm"}
                                        </ListboxButton>

                                        <ListboxOptions
                                            anchor="bottom"
                                            modal={false}
                                            className="
                                                        w-[var(--button-width)] z-50 origin-top
                                                        [--anchor-gap:4px] !max-h-60 overflow-y-auto
                                                        bg-bg-surface border border-border-default
                                                        rounded-ds-lg shadow-lg text-text-primary transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0">
                                            {provinces.map(item => (
                                                <ListboxOption
                                                    key={item.code}
                                                    value={item}
                                                    className="
                                                            group flex items-center justify-between px-3 py-2 cursor-pointer
                                                            hover:bg-secondary rounded-ds-md">
                                                    <span>{item.name}</span>
                                                    <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-button-primary-bg-default ml-2" />
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
                            </div>

                            {/* Ngày diễn */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("event_date")}</h3>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {dateFiltersList.map(filter => {
                                        const isSelected = selectedDateFilter === filter.id;
                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => handleDateFilterClick(filter.id)}
                                                className={`flex items-center gap-1 py-2 px-3 text-xs border transition-colors cursor-pointer ${isSelected
                                                    ? 'justify-between bg-chip-filter-bg-selected text-text-primary border-chip-filter-border-selected rounded-(--button-radius)'
                                                    : 'justify-center border-border-default text-text-secondary hover:bg-secondary hover:text-text-primary rounded-ds-sm'
                                                    }`}
                                            >
                                                <span>{filter.name}</span>
                                                {isSelected && <X size={12} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <label className="text-xs text-text-muted block mb-1">{t("from_date")}</label>
                                        {/* <div className="relative">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-4 py-2 bg-bg-surface text-sm border border-border-default rounded-ds-lg focus:outline-none focus:border-primary text-text-secondary appearance-none"
                                            />
                                        </div> */}
                                        <div className="flex-1 w-full relative">
                                            <CustomDatePicker
                                                selectedDate={startDate}
                                                onChange={(e) => {
                                                    setStartDate(e);
                                                    if (selectedDateFilter !== "CUSTOM") setSelectedDateFilter("CUSTOM");
                                                }}
                                                width="62.5"
                                                height="10"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-xs text-text-muted block mb-1">{t("to_date")}</label>
                                        <div className="flex-1 w-full relative">
                                            <CustomDatePicker
                                                selectedDate={endDate}
                                                onChange={(e) => {
                                                    setEndDate(e);
                                                    if (selectedDateFilter !== "CUSTOM") setSelectedDateFilter("CUSTOM");
                                                }}
                                                width="62.5"
                                                height="10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Khoảng giá */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("price_range")}</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted block mb-1">{t("from")}</label>
                                        <input
                                            type="number"
                                            value={priceFrom}
                                            min={0}
                                            onChange={(e) => setPriceFrom(e.target.value)}
                                            className="w-full px-3 py-2 bg-bg-surface text-sm border border-border-default rounded-lg focus:outline-none focus:border-button-primary-bg-default text-text-secondary"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted block mb-1">{t("to")}</label>
                                        <input
                                            type="number"
                                            value={priceTo}
                                            onChange={(e) => setPriceTo(e.target.value)}
                                            className="w-full px-3 py-2 bg-bg-surface text-sm border border-border-default rounded-lg focus:outline-none focus:border-button-primary-bg-default text-text-secondary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái vé */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("ticket_status")}</h3>
                                <div className="space-y-3">
                                    {ticketAvailabilityList.map(status => (
                                        <label key={status.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={ticketStatuses.includes(status.id)}
                                                    onChange={() => toggleArrayItem(ticketStatuses, setTicketStatuses, status.id)}
                                                    className="peer appearance-none w-5 h-5 border border-border-default rounded bg-bg-surface checked:bg-button-primary-bg-default checked:border-primary transition-colors cursor-pointer"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none text-button-primary-text-default">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-sm text-text-secondary group-hover:text-button-primary-bg-default transition-colors">{status.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Nút hành động */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleApplyFilters}
                                    className="w-full bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default py-3 rounded-ds-lg font-medium transition-colors cursor-pointer"
                                >
                                    {t("apply_filter")}
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-transparent text-button-primary-bg-default hover:text-button-primary-bg-hover py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                >
                                    {t("clear_filter")}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT (LIST GRID) */}
                    <div className="flex-1">

                        {/* Top controls: Hiển thị 9 sự kiện / Sort / ViewMode */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 z-10 relative">
                            <p className="text-text-secondary text-sm">
                                <span className="font-medium text-text-primary mr-1">{totalElements}</span>
                                {t("events_count", { count: totalElements }).replace(totalElements.toString(), "").trim()}
                            </p>

                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-muted whitespace-nowrap w-20">{t("sort_by")}</span>
                                    <div className="relative h-9">

                                        <Listbox value={sortBy} onChange={(val) => { setSortBy(val); setPage(1); }}>
                                            <ListboxButton
                                                className="
                                                w-50 h-full pl-3 bg-bg-surface
                                                border border-border-default rounded-ds-lg
                                                text-text-primary outline-none
                                                focus:ring-1 focus:ring-button-primary-bg-default 
                                                focus:border-button-primary-bg-default cursor-pointer 
                                                transition-colors text-left">
                                                {sortBy?.name || t("location_all")}
                                            </ListboxButton>

                                            <ListboxOptions
                                                anchor="bottom"
                                                modal={false}
                                                className="
                                            w-[var(--button-width)] z-50 origin-top
                                            [--anchor-gap:4px] !max-h-60 overflow-y-auto
                                            bg-bg-surface border border-border-default
                                            rounded-ds-lg shadow-lg text-text-primary transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0">
                                                {sortByList.map(item => (
                                                    <ListboxOption
                                                        key={item.id}
                                                        value={item}
                                                        className="
                                                    group flex justify-between items-center px-3 py-2 cursor-pointer
                                                            hover:bg-secondary rounded-ds-md">
                                                        <span>{item.name}</span>
                                                        <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-button-primary-bg-default mr-2" />
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Listbox>
                                    </div>
                                </div>

                                {/* Icon chuyển đổi Grid / List */}
                                <div className="flex border border-border-default rounded-ds-lg overflow-hidden bg-bg-page">
                                    <button
                                        className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-bg-surface-strong text-button-primary-text-default' : 'text-text-muted hover:bg-secondary'}`}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <div className="w-px bg-border"></div>
                                    <button
                                        className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-bg-surface-strong text-button-primary-text-default' : 'text-text-muted hover:bg-secondary'}`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <ListIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Event Grid body */}
                        {loading && page === 1 ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-button-primary-bg-default" size={40} />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="flex flex-col w-full pb-10">
                                <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-transparent rounded-ds-xl">
                                    {/* Icon */}
                                    <div className="w-16 h-16 mb-6 flex items-center justify-center border border-border-default rounded shadow-sm bg-bg-surface">
                                        <CircleHelp className="text-text-muted w-8 h-8" strokeWidth={1.5} />
                                    </div>
                                    {/* Text */}
                                    <h3 className="text-2xl font-bold text-text-primary mb-3">
                                        {t("no_events_found")}
                                    </h3>
                                    <p className="text-text-secondary text-[15px] mb-8 max-w-md">
                                        {t("no_events_desc")}
                                    </p>
                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default font-medium rounded-ds-md transition-colors"
                                        >
                                            {t("clear_filter")}
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-border-default text-text-primary hover:bg-secondary font-medium rounded-ds-md transition-colors"
                                        >
                                            {t("explore_all")}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <>
                                {/* Lưới 3 cột */}
                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                    {events.map((event) => (
                                        <Link href={`/${locale}/user/events/${event.id}`} key={`${event.id}-${Math.random()}`} className="group bg-bg-page border border-border-default rounded-ds-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
                                            {/* Phần hình ảnh */}
                                            <div className="relative h-44 w-full bg-bg-subtle shrink-0">
                                                {event.bannerImage && (
                                                    <Image
                                                        src={event.bannerImage}
                                                        alt={event.eventName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                                {event.eventStatus === 'COMPLETED' && (
                                                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-button-primary-text-default text-xs font-semibold px-2.5 py-1 rounded">
                                                        {t("status_sold_out")}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phần nội dung */}
                                            <div className="p-4 flex-1 flex flex-col bg-bg-page">
                                                <h3 className="font-bold text-lg text-text-primary mb-3 line-clamp-2 leading-tight group-hover:text-button-primary-bg-default transition-colors">
                                                    {event.eventName}
                                                </h3>

                                                <div className="flex items-start gap-2 text-sm text-text-secondary mb-2">
                                                    <Calendar size={16} className="mt-0.5 shrink-0" />
                                                    <span>{new Date(event.startDatetime).toLocaleString(locale as string === 'vi' ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                </div>

                                                <div className="flex items-start gap-2 text-sm text-text-secondary mb-4">
                                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                                    <span className="line-clamp-1">{event.venue || event.fullAddress || "Online"}</span>
                                                </div>

                                                <div className="mt-auto pt-4 flex items-center">
                                                    <span className="text-button-primary-bg-default font-bold text-base">{event.floorPrice ? t('price_from', { price: event.floorPrice.toLocaleString(locale as string === 'en' ? 'en-US' : 'vi-VN') }) : t('contact')}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Nút hiển thị thêm / Observer */}
                                {page < totalPages && (
                                    <div ref={loadMoreRef} className="flex justify-center mt-12 mb-8 h-10 w-full items-center">
                                        {loading && <Loader2 className="animate-spin text-button-primary-bg-default" size={32} />}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>

                {/* --- SUGGESTED EVENTS (FULL WIDTH) --- */}
                {(!isFilterApplied || events.length === 0) && suggestedEvents.length > 0 && (
                    <div className="mt-16 pt-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">{t("suggested_for_you")}</h2>
                            {isFilterApplied ? (
                                <button onClick={clearFilters} className="text-text-secondary hover:text-button-primary-bg-default transition-colors flex items-center gap-1 text-sm">
                                    {t("view_more")} <ChevronRight size={16} />
                                </button>
                            ) : (
                                <Link href={`/${locale}/user/events`} className="text-text-secondary hover:text-button-primary-bg-default transition-colors flex items-center gap-1 text-sm">
                                    {t("view_more")} <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {suggestedEvents.map((event) => (
                                <Link href={`/${locale}/user/events/${event.id}`} key={`suggested-full-${event.id}`} className="group bg-bg-page border border-border-default rounded-ds-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer">
                                    {/* Phần hình ảnh */}
                                    <div className="relative h-44 w-full bg-bg-subtle shrink-0">
                                        {event.bannerImage && (
                                            <Image
                                                src={event.bannerImage}
                                                alt={event.eventName}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                        {event.eventStatus === 'COMPLETED' && (
                                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-button-primary-text-default text-xs font-semibold px-2.5 py-1 rounded">
                                                {t("status_sold_out")}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phần nội dung */}
                                    <div className="p-4 flex-1 flex flex-col bg-bg-page">
                                        <h3 className="font-bold text-lg text-text-primary mb-3 line-clamp-2 leading-tight group-hover:text-button-primary-bg-default transition-colors">
                                            {event.eventName}
                                        </h3>

                                        <div className="flex items-start gap-2 text-sm text-text-secondary mb-2">
                                            <Calendar size={16} className="mt-0.5 shrink-0" />
                                            <span>{new Date(event.startDatetime).toLocaleString(locale as string === 'vi' ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm text-text-secondary mb-4">
                                            <MapPin size={16} className="mt-0.5 shrink-0" />
                                            <span className="line-clamp-1">{event.venue || event.fullAddress || "Online"}</span>
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center">
                                            <span className="text-button-primary-bg-default font-bold text-base">{event.floorPrice ? t('price_from', { price: event.floorPrice.toLocaleString(locale as string === 'en' ? 'en-US' : 'vi-VN') }) : t('contact')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

