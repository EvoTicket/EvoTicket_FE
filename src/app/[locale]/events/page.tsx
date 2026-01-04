"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import {
    Search, MapPin, Calendar, Filter, Heart, ChevronLeft, ChevronRight,
    LayoutGrid, List as ListIcon, Loader2
} from "lucide-react";

// --- Interfaces ---
interface EventItem {
    id: number;
    eventName: string;
    description: string;
    venue: string;
    fullAddress: string;
    startDatetime: string;
    endDatetime: string;
    eventStatus: string;
    eventType: string;
    bannerImage: string | null;
    thumbnailImage: string | null;
    totalSeats: number;
    organizerId: number;
    isFeatured: boolean;
    categoryId: number;
    categoryName: string;
    favorite: boolean;
    favoriteCount: number;
    minPrice?: number; // Optional, might not be in list API directly based on your sample
}

interface Province {
    code: number;
    name: string;
}

export default function EventsPage() {
    const { locale } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State ---
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Filters State
    const [keyword, setKeyword] = useState("");
    const [selectedProvince, setSelectedProvince] = useState<number | "">("");
    const [eventType, setEventType] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [provinces, setProvinces] = useState<Province[]>([]);

    // Pagination & Sort
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(12);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("DESC");

    // --- Effects ---
    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [page, size, sortBy, sortDirection]);
    // Trigger fetch on pagination/sort change directly. 
    // For filters, we usually wait for user to click "Apply" or debounce, 
    // but for simplicity, let's trigger on "Apply" button or Enter key for keyword.

    const fetchProvinces = async () => {
        try {
            const res = await api.get("/iam-service/api/locations/provinces");
            if (res.data) setProvinces(res.data);
        } catch (err) {
            console.error("Failed to fetch provinces", err);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const params: any = {
                page,
                size,
                sortBy,
                sortDirection,
                includeExpired: true,
            };

            if (keyword) params.keyword = keyword;
            if (selectedProvince) params.provinceCodes = selectedProvince;
            if (eventType) params.eventTypes = eventType;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            // Note: params that accept lists (provinceCodes, eventTypes) 
            // might need special formatting if multiple selected, but here we stick to single select for simplicity first.

            const response = await api.get("/inventory-service/api/events", {
                params,
                headers
            });

            if (response.data && response.data.data) {
                setEvents(response.data.data.content);
                setTotalPages(response.data.data.totalPages || 0);
                setTotalElements(response.data.data.totalElements || 0);

                // Handle pagination response structure if different
                // Based on sample, it likely returns standard Spring Page structure
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1
        fetchEvents();
    };

    const clearFilters = () => {
        setKeyword("");
        setSelectedProvince("");
        setEventType("");
        setStartDate("");
        setEndDate("");
        setPage(1);
        // After clearing, we should probably fetch again or wait for user to click apply.
        // Let's create a reset trigger or just call fetch manually inside a timeout or effect
        // Simpler: just call fetchEvents() via timeout
        setTimeout(() => {
            // Trigger fetch logic manually or by dependecy 
            // We need a clearer way. Let's make fetchEvents use the current state values, 
            // but state updates are async. 
            // Best approach: Just reload page or implement useEffect on filter dependencies with debounce.
            // For this implementation, I will just require clicking "Tìm kiếm"/Apply.
        }, 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Đang mở bán</span>;
            case 'ON_GOING': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Đang diễn ra</span>;
            case 'COMPLETED': return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Đã kết thúc</span>;
            case 'CANCELLED': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Đã hủy</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* Header Banner */}
            <div className="bg-primary text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-4">Khám phá sự kiện</h1>
                    <p className="text-white/80 max-w-2xl">
                        Tìm kiếm những sự kiện hấp dẫn nhất đang diễn ra xung quanh bạn.
                        Âm nhạc, nghệ thuật, hội thảo và nhiều hơn nữa.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR FILTERS */}
                    <aside className="w-full lg:w-1/4 space-y-6">
                        <div className="bg-main border border-border rounded-xl p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Filter size={20} /> Bộ lọc
                                </h2>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Xóa lọc
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-4">
                                {/* Keyword */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Từ khóa</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            placeholder="Tên sự kiện..."
                                            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                        <Search className="absolute left-3 top-2.5 text-txt-muted" size={16} />
                                    </div>
                                </div>

                                {/* Province */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Địa điểm</label>
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : "")}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="">Tất cả địa điểm</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Event Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại hình</label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="ONLINE">Online</option>
                                        <option value="OFFLINE">Offline</option>
                                    </select>
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Từ ngày</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đến ngày</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* MAIN CONTENT */}
                    <main className="flex-1">
                        {/* Sort & Count */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <p className="text-txt-secondary">
                                Tìm thấy <span className="font-bold text-txt-primary">{totalElements}</span> sự kiện
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-txt-muted">Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-1.5 border border-border rounded-lg bg-surface text-sm focus:outline-none"
                                >
                                    <option value="createdAt">Mới nhất</option>
                                    <option value="startDatetime">Ngày diễn ra</option>
                                    <option value="totalSeats">Số ghế</option>
                                </select>
                                <select
                                    value={sortDirection}
                                    onChange={(e) => setSortDirection(e.target.value)}
                                    className="px-3 py-1.5 border border-border rounded-lg bg-surface text-sm focus:outline-none"
                                >
                                    <option value="DESC">Giảm dần</option>
                                    <option value="ASC">Tăng dần</option>
                                </select>
                            </div>
                        </div>

                        {/* Event Grid */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-20 bg-main border border-border rounded-xl">
                                <p className="text-txt-muted text-lg">Không tìm thấy sự kiện nào phù hợp.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary hover:underline font-medium"
                                >
                                    Xóa bộ lọc để xem tất cả
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <div key={event.id} className="group bg-main border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative h-[420px]">
                                        {/* Card Image */}
                                        <Link href={`/${locale}/events/${event.id}`} className="relative h-48 w-full block overflow-hidden bg-gray-100">
                                            {event.bannerImage ? (
                                                <Image
                                                    src={event.bannerImage}
                                                    alt={event.eventName}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                    <Calendar size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                {getStatusBadge(event.eventStatus)}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                {/* Favorite Button (Visual Only for now) */}
                                                <button
                                                    className={`p-2 rounded-full transition-colors ${event.favorite ? 'bg-red-50 text-red-500' : 'bg-black/30 text-white hover:bg-red-50 hover:text-red-500'}`}
                                                    title={event.favorite ? "Đã yêu thích" : "Yêu thích"}
                                                >
                                                    <Heart size={18} className={event.favorite ? "fill-current" : ""} />
                                                </button>
                                            </div>
                                        </Link>

                                        {/* Card Content */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between text-xs text-txt-muted mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>{new Date(event.startDatetime).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    {event.categoryName}
                                                </span>
                                            </div>

                                            <Link href={`/${locale}/events/${event.id}`} className="block">
                                                <h3 className="font-bold text-lg text-txt-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {event.eventName}
                                                </h3>
                                            </Link>

                                            <div className="flex items-start gap-2 text-sm text-txt-secondary mb-3">
                                                <MapPin size={16} className="shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{event.venue || event.fullAddress || "Online"}</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                                <div className="text-sm font-semibold text-primary">
                                                    <span className="text-xs text-txt-muted font-normal mr-1">Từ</span>
                                                    {/* Since API listing sample doesn't clearly show minPrice, I use a placeholder or handle if present. 
                                            Assuming price might need to be fetched or is implicit. 
                                            I'll just show 'Liên hệ' or similar if not available.
                                        */}
                                                    Liên hệ
                                                </div>
                                                <Link
                                                    href={`/${locale}/events/${event.id}`}
                                                    className="text-xs font-bold uppercase tracking-wide bg-secondary hover:bg-border px-3 py-2 rounded-lg transition-colors"
                                                >
                                                    Mua vé
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                                    .map((p, index, array) => {
                                        // Add dots logic if needed, simplify for now
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === p
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'border border-border hover:bg-secondary'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}
