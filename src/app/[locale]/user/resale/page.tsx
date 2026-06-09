"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { Search, ShieldCheck, CheckCircle, Lock, X, ChevronDown, List as ListIcon, LayoutGrid as GridIcon, Calendar as CalendarIcon, CheckIcon, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CustomDatePicker } from "@/src/components/ui/CustomDatePicker";
import api from "@/src/lib/axios";
import { useEventFilters } from "@/src/hooks/useEventFilters";
import { toast } from "react-toastify";


export default function ResaleMarketplacePage() {
    const { locale } = useParams();
    const router = useRouter();
    const t = useTranslations("Resale");

    // Listings State from API
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Lọc theo từ khóa
    const [searchQuery, setSearchQuery] = useState("");

    // Filters State
    const [selectedCategories, setSelectedCategories] = useState<{ id: string, name: string }[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<any>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [ticketStatuses, setTicketStatuses] = useState<string[]>([]);
    const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>([]);
    const [selectedQuantities, setSelectedQuantities] = useState<string[]>([]);
    // const [listingCode, setListingCode] = useState("");

    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [provinces, setProvinces] = useState<any[]>([]);
    const { categoriesList, sortByList, dateFiltersList } = useEventFilters();

    const [sortBy, setSortBy] = useState(sortByList[0]);

    useEffect(() => {
        fetchProvinces();
        fetchListings(0);
    }, []);

    // Tự động tải lại khi đổi tiêu chí sắp xếp
    useEffect(() => {
        fetchListings(0);
    }, [sortBy]);

    const fetchProvinces = async () => {
        try {
            const res = await api.get("/iam-service/api/locations/provinces", { skipAuth: true } as any);
            if (res.data) setProvinces(res.data);
        } catch (err) {
            console.error("Failed to fetch provinces", err);
        }
    };

    const fetchListings = async (page: number) => {
        setLoading(true);
        try {
            const params: any = {
                page: page,
                size: pagination.pageSize,
            };

            // Thêm các bộ lọc nếu có
            if (searchQuery) params.keyword = searchQuery;
            if (selectedProvince) params.provinceCode = selectedProvince.code;
            if (selectedCategories.length > 0) {
                params.category = selectedCategories.map(c => c.id).join(',');
            }
            if (startDate) {
                params.startTime = startDate.toISOString().split('T')[0];
            }
            if (endDate) {
                params.endTime = endDate.toISOString().split('T')[0];
            }
            if (priceFrom) params.minPrice = priceFrom;
            if (priceTo) params.maxPrice = priceTo;
            // if (listingCode) params.listingCode = listingCode;

            // Xử lý Sort
            params.sortBy = sortBy.id;

            const res = await api.get("/order-service/api/v1/resale/listings", { params });

            if (res.data?.data) {
                setListings(res.data.data.content);
                setPagination({
                    pageNumber: res.data.data.pageNumber,
                    pageSize: res.data.data.pageSize,
                    totalElements: res.data.data.totalElements,
                    totalPages: res.data.data.totalPages
                });
            }
        } catch (err) {
            console.error("Failed to fetch listings", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleArrayItem = (array: any[], setArray: any, item: any, isObject = false) => {
        if (isObject) {
            if (array.find((i: any) => i.id === item.id)) {
                setArray(array.filter((i: any) => i.id !== item.id));
            } else {
                setArray([...array, item]);
            }
        } else {
            if (array.includes(item)) {
                setArray(array.filter(i => i !== item));
            } else {
                setArray([...array, item]);
            }
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedProvince(null);
        setStartDate(null);
        setEndDate(null);
        setSelectedCategories([]);
        setPriceFrom("");
        setPriceTo("");
        // setListingCode("");
        setSelectedDateFilters([]);
        setSelectedQuantities([]);
        fetchListings(0);
    };

    const handleApplyFilters = () => {
        if (priceFrom && priceTo && Number(priceFrom) >= Number(priceTo)) {
            toast.warning(t("error_price_range") || "Giá tối thiểu phải nhỏ hơn giá tối đa");
            return;
        }
        if (startDate && endDate && startDate > endDate) {
            toast.warning(t("error_date_range") || "Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            return;
        }
        fetchListings(0);
    };

    const hasResults = listings.length > 0;

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            {/* <Header /> */}

            <div className="container mx-auto px-4 pb-8 max-w-[90%] flex flex-col gap-8 flex-1">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col gap-6 pt-6 pb-2">
                    <div className="flex flex-col md:flex-row gap-8 justify-between">
                        {/* Title & Description */}
                        <div className="flex-1 space-y-2">
                            <h1 className="text-4xl font-bold text-text-primary">{t("page_title")}</h1>
                            <p className="text-body-base text-text-primary font-medium mt-2">{t("page_subtitle")}</p>
                            <p className="text-body-small text-text-secondary pr-4 xl:pr-32 mt-1">{t("page_description")}</p>
                        </div>
                        {/* Badges */}
                        <div className="flex flex-col md:flex-row items-end gap-3 shrink-0">
                            <div className="flex items-center gap-2 bg-[#2d2d2d] text-white px-3 py-1.5 rounded-ds-md text-xs font-semibold">
                                <ShieldCheck size={14} /> {t("badge_official")}
                            </div>
                            <div className="flex items-center gap-2 bg-[#1a1a1a] text-white px-3 py-1.5 rounded-ds-md text-xs font-semibold">
                                <CheckCircle size={14} /> {t("badge_auto_transfer")}
                            </div>
                            <div className="flex items-center gap-2 bg-[#111111] text-white px-3 py-1.5 rounded-ds-md text-xs font-semibold">
                                <Lock size={14} /> {t("badge_price_control")}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col gap-4 max-w-full mt-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-bg-surface text-text-primary rounded-ds-lg border border-border-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                    placeholder={t("search_placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") fetchListings(0);
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => fetchListings(0)}
                                className="w-full md:w-auto px-8 py-3 font-semibold text-button-primary-text-default bg-button-primary-bg-default border border-transparent rounded-ds-lg hover:bg-button-primary-bg-hover transition-colors cursor-pointer"
                            >
                                {t("search_button")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- MAIN LAYOUT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                    {/* SIDEBAR: BỘ LỌC (1 column) */}
                    <aside className="lg:col-span-1 hidden lg:block sticky top-24 pr-2">
                        <div className="bg-bg-page border border-border-default rounded-ds-xl p-5 w-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-xl text-text-primary">{t("filter_title")}</h2>
                            </div>

                            {/* Listing Code
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_listing_code") || "Mã tin đăng"}</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={listingCode}
                                        onChange={(e) => setListingCode(e.target.value)}
                                        className="w-full px-3 py-2 bg-bg-surface text-sm border border-border-default rounded-lg focus:outline-none focus:border-button-primary-bg-default text-text-secondary placeholder-text-muted"
                                        placeholder="RES-XXXXXXXX"
                                    />
                                </div>
                            </div>
                            <div className="border-t border-border-subtle my-5"></div> */}

                            {/* Danh mục */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_category")}</h3>
                                <div className="space-y-3">
                                    {categoriesList.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.some(c => c.id === cat.id)}
                                                    onChange={() => toggleArrayItem(selectedCategories, setSelectedCategories, cat, true)}
                                                    className="peer appearance-none w-5 h-5 border border-border-default rounded bg-bg-surface checked:bg-button-primary-bg-default checked:border-button-primary-bg-default transition-colors cursor-pointer"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none text-button-primary-text-default">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-sm text-text-secondary group-hover:text-button-primary-bg-default transition-colors">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-border-subtle my-5"></div>

                            {/* Địa điểm */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_location")}</h3>
                                <div className="relative">
                                    <Listbox value={selectedProvince} onChange={setSelectedProvince}>
                                        <ListboxButton className="w-full relative px-3 py-2 text-left bg-bg-surface border border-border-default rounded-ds-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm cursor-pointer">
                                            {selectedProvince?.name || t("filter_location")}
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                            </span>
                                        </ListboxButton>
                                        <ListboxOptions
                                            anchor="bottom"
                                            modal={false}
                                            className="absolute mt-1 w-[var(--button-width)] z-50 bg-bg-surface 
                                                border border-border-default rounded-ds-lg shadow-lg 
                                                text-text-primary text-sm max-h-48 overflow-y-auto">
                                            {provinces.map(item => (
                                                <ListboxOption key={item.code} value={item} className="group flex justify-between px-3 py-2 cursor-pointer hover:bg-secondary rounded-ds-md">
                                                    <span>{item.name}</span>
                                                    <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-button-primary-bg-default" />
                                                </ListboxOption>
                                            ))}
                                            <ListboxOption value={null} className="group flex justify-between px-3 py-2 cursor-pointer hover:bg-secondary rounded-ds-md">
                                                <span>Tất cả</span>
                                            </ListboxOption>
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
                            </div>
                            <div className="border-t border-border-subtle my-5"></div>

                            {/* Ngày diễn */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_date")}</h3>
                                {/* <div className="grid grid-cols-2 gap-2 mb-4">
                                    {dateFiltersList.map(filter => {
                                        const isSelected = selectedDateFilters.includes(filter.id);
                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => toggleArrayItem(selectedDateFilters, setSelectedDateFilters, filter.id)}
                                                className={`flex items-center gap-1 py-2 px-3 text-xs border transition-colors cursor-pointer ${isSelected
                                                    ? 'justify-between bg-chip-filter-bg-selected text-text-primary border-chip-filter-border-selected rounded-ds-md'
                                                    : 'justify-center border-border-default text-text-secondary hover:bg-secondary hover:text-text-primary rounded-ds-md'
                                                    }`}
                                            >
                                                <span>{filter.name}</span>
                                                {isSelected && <X size={12} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div> */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <label className="text-xs text-text-muted block mb-1">{t('from_date')}</label>
                                        <div className="w-full relative">
                                            <CustomDatePicker
                                                selectedDate={startDate}
                                                onChange={setStartDate}
                                                width="62.5"
                                                height="10"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="text-xs text-text-muted block mb-1">{t('to_date')}</label>
                                        <div className="w-full relative">
                                            <CustomDatePicker
                                                selectedDate={endDate}
                                                onChange={setEndDate}
                                                width="62.5"
                                                height="10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-border-subtle my-5"></div>

                            {/* Khoảng giá */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-sm text-text-primary mb-3">{t("filter_price_range")}</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted block mb-1">{t('from_price')}</label>
                                        <input
                                            type="number"
                                            value={priceFrom}
                                            min={0}
                                            onChange={(e) => setPriceFrom(e.target.value)}
                                            className="w-full px-3 py-2 bg-bg-surface text-sm border border-border-default rounded-ds-lg focus:outline-none focus:border-primary text-text-secondary placeholder-text-muted"
                                            placeholder="VNĐ"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-text-muted block mb-1">{t('to_price')}</label>
                                        <input
                                            type="number"
                                            value={priceTo}
                                            min={0}
                                            onChange={(e) => setPriceTo(e.target.value)}
                                            className="w-full px-3 py-2 bg-bg-surface text-sm border border-border-default rounded-ds-lg focus:outline-none focus:border-primary text-text-secondary placeholder-text-muted"
                                            placeholder="VNĐ"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-border-subtle my-5"></div>

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
                                    className="w-full bg-transparent text-primary hover:text-primary-hover py-2 rounded-ds-lg text-sm font-medium transition-colors cursor-pointer"
                                >
                                    {t("clear_filter")}
                                </button>
                            </div>
                        </div>
                    </aside>


                    {/* MAIN CONTENT AREA (3 columns) */}
                    <div className="lg:col-span-3">

                        {/* Banner Message */}
                        <div className="p-4 mb-6 bg-primary/10 border border-primary/20 rounded-ds-lg text-sm text-primary font-medium text-center">
                            {t("banner_text")}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
                                <p className="mt-4 text-text-secondary">{t("loading_listings") || "Đang tải danh sách..."}</p>
                            </div>
                        ) : hasResults ? (
                            <>
                                {/* Listing Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 z-10 relative">
                                    <p className="text-text-secondary text-sm">
                                        <span className="font-medium text-text-primary mr-1">{pagination.totalElements}</span>
                                        {t('results_found')}
                                    </p>

                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-text-muted whitespace-nowrap hidden sm:inline-block">{t("sort_by")}</span>
                                            <div className="relative h-9">
                                                <Listbox value={sortBy} onChange={(val) => setSortBy(val)}>
                                                    <ListboxButton className="w-48 h-full pl-3 pr-8 bg-bg-surface border border-border-default rounded-ds-lg text-text-primary outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-colors text-left text-sm relative">
                                                        <span className="block truncate">{sortBy?.name}</span>
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                            <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
                                                        </span>
                                                    </ListboxButton>
                                                    <ListboxOptions
                                                        anchor="bottom"
                                                        modal={false}
                                                        className="absolute right-0 mt-1 w-48 z-50 bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary text-sm py-1">
                                                        {sortByList.map(item => (
                                                            <ListboxOption key={item.id} value={item} className="group flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-secondary">
                                                                <span>{item.name}</span>
                                                                <CheckIcon className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-button-primary-bg-default mr-2" />
                                                            </ListboxOption>
                                                        ))}
                                                    </ListboxOptions>
                                                </Listbox>
                                            </div>
                                        </div>

                                        {/* Icon chuyển đổi Grid / List */}
                                        <div className="flex border border-border-default rounded-ds-lg overflow-hidden bg-bg-page shrink-0">
                                            <button
                                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-bg-inverse text-text-inverse' : 'text-text-muted hover:bg-secondary'}`}
                                                onClick={() => setViewMode("list")}
                                            >
                                                <ListIcon size={16} />
                                            </button>
                                            <div className="w-px bg-border-strong"></div>
                                            <button
                                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-bg-inverse text-text-inverse' : 'text-text-muted hover:bg-secondary'}`}
                                                onClick={() => setViewMode("grid")}
                                            >
                                                <GridIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* LIST OF TICKETS */}
                                <div className={`grid gap-5 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                    {listings.map(ticket => (
                                        <div
                                            key={ticket.listingId}
                                            onClick={() => router.push(`/${locale}/user/resale/${ticket.listingCode}`)}
                                            className={`group bg-bg-page border border-border-default rounded-ds-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'} cursor-pointer`}
                                        >

                                            {/* Image placeholder */}
                                            <div className={`relative bg-bg-subtle shrink-0 ${viewMode === 'list' ? 'h-48 sm:h-auto sm:w-48 lg:w-56' : 'h-44 w-full'}`}>
                                                <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm border-b sm:border-b-0 sm:border-r border-border-default bg-secondary">
                                                    <Image
                                                        src={ticket.bannerImage && ticket.bannerImage !== "" ? ticket.bannerImage : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop"}
                                                        alt={ticket.eventName || "Event"}
                                                        fill
                                                        className="object-cover opacity-60"
                                                    />
                                                </div>
                                                <div className="absolute top-3 left-3 bg-button-primary-bg-default text-button-primary-text-default text-xs font-semibold px-2 py-1 rounded">
                                                    {ticket.category || t('default_category')}
                                                </div>
                                            </div>

                                            {/* Ticket Layout Core content */}
                                            <div className="p-4 relative flex-1 flex flex-col justify-between">

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-2 pr-4">
                                                        <h3 className="font-bold text-lg text-text-primary line-clamp-2 leading-tight group-hover:text-button-primary-bg-default transition-colors">{ticket.eventName}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-text-secondary mt-2">
                                                            <CalendarIcon size={14} className="shrink-0" />
                                                            <span>{new Date(ticket.eventStartTime).toLocaleString(locale === 'vi' ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm text-text-secondary">
                                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                                            <span className="line-clamp-1">{ticket.venueName}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-border-subtle pt-3 mt-auto">
                                                    {/* Ticket Detail */}
                                                    <div className="flex items-center gap-6 mb-4 text-sm bg-bg-surface p-2.5 rounded-ds-lg border border-border-default">
                                                        <div className="flex items-center gap-1.5 text-text-secondary">
                                                            <Ticket size={14} />
                                                            <span>{t("ticket_type_label")} <span className="font-semibold text-text-primary ml-1">{ticket.ticketTypeName}</span></span>
                                                        </div>
                                                        {ticket.seat && (
                                                            <div className="flex items-center gap-1.5 text-text-secondary border-l border-border-strong pl-6">
                                                                <span>{t("seat_label")} <span className="font-semibold text-text-primary ml-1">{ticket.seat}</span></span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <div className="text-xl font-bold text-button-primary-bg-default">{ticket.listingPrice.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")}đ</div>
                                                            <div className="text-xs text-text-muted line-through mt-0.5">{t("original_price")} {ticket.originalPrice.toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")}đ</div>
                                                        </div>

                                                        {viewMode === 'list' && (
                                                            <button className="bg-button-primary-bg-default text-button-primary-text-default hover:bg-button-primary-bg-hover transition px-5 py-2.5 rounded-ds-lg font-medium text-sm">
                                                                {t("buy_now")}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PAGINATION */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-12 pb-10">
                                        <button
                                            onClick={() => fetchListings(pagination.pageNumber - 1)}
                                            disabled={pagination.pageNumber === 0}
                                            className="px-4 py-2 border border-border-default rounded-ds-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm text-text-primary cursor-pointer"
                                        >
                                            {t('prev_page')}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {[...Array(pagination.totalPages)].map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => fetchListings(index)}
                                                    className={`w-10 h-10 rounded-ds-lg text-sm font-semibold transition-all ${pagination.pageNumber === index
                                                        ? 'bg-primary text-white shadow-md scale-105'
                                                        : 'border border-border-default text-text-secondary hover:bg-secondary'
                                                        } cursor-pointer`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => fetchListings(pagination.pageNumber + 1)}
                                            disabled={pagination.pageNumber === pagination.totalPages - 1}
                                            className="px-4 py-2 border border-border-default rounded-ds-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm text-text-primary cursor-pointer"
                                        >
                                            {t('next_page')}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* EMPTY STATE */
                            <div className="flex flex-col items-center justify-center py-20 mt-4 border border-border-default bg-bg-page rounded-ds-xl">
                                <div className="w-16 h-16 mb-6 flex items-center justify-center border border-border-default rounded shadow-sm bg-bg-surface">
                                    <div className="text-text-muted font-bold text-3xl">!</div>
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary mb-3 text-center">{t("empty_title")}</h3>
                                <p className="text-[15px] text-text-secondary text-center max-w-md mb-8 leading-relaxed">
                                    {t("empty_subtitle")}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button onClick={clearFilters} className="w-full sm:w-auto px-6 py-2.5 bg-button-primary-bg-default text-button-primary-text-default hover:bg-button-primary-bg-hover transition rounded-ds-md font-medium">
                                        {t("clear_filter")}
                                    </button>
                                    <button onClick={clearFilters} className="w-full sm:w-auto px-6 py-2.5 text-text-primary bg-transparent border border-border-default hover:bg-secondary rounded-ds-md font-medium transition cursor-pointer">
                                        {t("explore_all")}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* <Footer /> */}
        </div>
    );
}
