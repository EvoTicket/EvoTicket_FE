"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
    MapPin, Calendar, Clock, User, Star, Image as ImageIcon,
    Check, MapIcon, CircleHelp, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, Heart, Trash2
} from "lucide-react";
import { Footer } from "@/src/components/footer";
import { Header } from "@/src/components/header";
import { EventDetail, Review } from "@/src/types/event";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";
import { CATEGORIES } from "@/src/constants/eventFilters";

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import("@/src/components/Map"), {
    ssr: false,
    loading: () => {
        const t = useTranslations("EventDetail");
        return <div className="h-40 w-full bg-gray-100 animate-pulse rounded-ds-xl flex items-center justify-center text-gray-400">{t('loading_map')}</div>
    }
});



export default function EventDetailPage() {
    const { locale, id } = useParams();
    const router = useRouter();
    const tb = useTranslations("Booking");
    const te = useTranslations("EventDetail");
    const tEvents = useTranslations("Events");

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [suggestedEvents, setSuggestedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const { user } = useAppSelector((state) => state.auth);

    // Favorites & Reviews States
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [newImages, setNewImages] = useState<File[]>([]);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Check favorite status on mount/auth change
    useEffect(() => {
        if (id && isAuthenticated) {
            const checkFav = async () => {
                try {
                    const res = await api.get(`/inventory-service/api/favorites/check`, {
                        params: { eventId: id }
                    });
                    if (res.data && res.data.status === 200) {
                        setIsFavorite(res.data.data);
                    }
                } catch (e) {
                    console.error("Failed to check favorite status", e);
                }
            };
            void checkFav();
        } else {
            setIsFavorite(false);
        }
    }, [id, isAuthenticated]);

    // Favorite Toggle
    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        try {
            if (isFavorite) {
                await api.delete('/inventory-service/api/favorites', { params: { eventId: id } });
                setIsFavorite(false);
                toast.success(te('remove_favorite_success'));
            } else {
                await api.post('/inventory-service/api/favorites', null, { params: { eventId: id } });
                setIsFavorite(true);
                toast.success(te('add_favorite_success'));
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            toast.error("Đã xảy ra lỗi khi cập nhật yêu thích.");
        }
    };

    // Review Submit
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        if (newRating === 0) {
            toast.error(te('rating_required'));
            return;
        }
        if (!newComment.trim() && newImages.length === 0) {
            toast.error(te('comment_required'));
            return;
        }

        setSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append("eventId", id as string);
            if (newComment.trim()) {
                formData.append("comment", newComment.trim());
            }
            formData.append("rating", newRating.toString());
            newImages.forEach((img) => {
                formData.append("files", img);
            });

            const response = await api.post("/inventory-service/api/reviews", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data) {
                toast.success(te('review_success'));
                if (id) {
                    void fetchReviews(id as string);
                }
                setNewRating(0);
                setNewComment("");
                setNewImages([]);
            }
        } catch (error: any) {
            console.error("Failed to submit review", error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Review Delete
    const handleDeleteReview = async (reviewId: number) => {
        if (!window.confirm(te('delete_confirm'))) {
            return;
        }
        try {
            await api.delete(`/inventory-service/api/reviews/${reviewId}`);
            toast.success(te('review_deleted'));
            if (id) {
                void fetchReviews(id as string);
            }
        } catch (error) {
            console.error("Failed to delete review", error);
            toast.error("Không thể xóa đánh giá.");
        }
    };

    // Expansion state for the 'introduction' block
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [expandedShowtimeId, setExpandedShowtimeId] = useState<number | null>(null);

    // Xử lý cờ sold out
    const isSoldOut = !!(event?.eventStatus === "SOLD_OUT" || (event && event.showtimes.map(showtime => showtime.ticketTypes).flat().every(t => t.quantityAvailable <= 0)));

    const now = new Date().getTime();

    let isUpcoming = false;
    let isEnded = false;
    let isActiveSale = false;

    if (event) {
        const allTickets = event.showtimes.flatMap(st => st.ticketTypes || []);
        if (allTickets.length > 0) {
            for (const t of allTickets) {
                const start = new Date(t.saleStartDate).getTime();
                const end = new Date(t.saleEndDate).getTime();
                if (now >= start && now <= end) {
                    isActiveSale = true;
                    break;
                }
            }
            if (!isActiveSale) {
                const allStartsInFuture = allTickets.every(t => new Date(t.saleStartDate).getTime() > now);
                const allEndsInPast = allTickets.every(t => new Date(t.saleEndDate).getTime() < now);

                if (allStartsInFuture) {
                    isUpcoming = true;
                } else if (allEndsInPast) {
                    isEnded = true;
                } else {
                    const hasFuture = allTickets.some(t => new Date(t.saleStartDate).getTime() > now);
                    if (hasFuture) {
                        isUpcoming = true;
                    } else {
                        isEnded = true;
                    }
                }
            }
        } else {
            // Nếu event không có ticket types nào (có thể là lỗi data hoặc chưa setup)
            isActiveSale = false;
            isEnded = true;
        }
    }

    const isBuyDisabled = isSoldOut || isUpcoming || isEnded || !isActiveSale;

    const getBuyButtonText = () => {
        if (isSoldOut) return te('sold_out_temp');
        if (isUpcoming) return te('sale_upcoming');
        if (isEnded || !isActiveSale) return te('sale_ended');
        return te('buy_now');
    };

    // Tính giá vé nhỏ nhất
    const minPrice = event?.showtimes.map(showtime => showtime.ticketTypes).flat().length
        ? Math.min(...event.showtimes.map(showtime => showtime.ticketTypes).flat().map(t => t.price))
        : 0;

    useEffect(() => {
        if (id) {
            fetchEventDetail(id as string);
        }
    }, [id]);

    useEffect(() => {
        if (event && event.showtimes) {
            if (event.showtimes.length > 0 && selectedShowtimeId === null) {
                setSelectedShowtimeId(event.showtimes[0].showtimeId);
                setExpandedShowtimeId(event.showtimes[0].showtimeId);
            }
        }
    }, [event, selectedShowtimeId]);

    const activeShowtime = event?.showtimes?.find(st => st.showtimeId === selectedShowtimeId) || event?.showtimes?.[0] || (event as any);

    const fetchEventDetail = async (eventId: string) => {
        setLoading(true);
        try {

            const response = await api.get(`/inventory-service/api/events/${eventId}`, { skipAuth: true});

            if (response.data && response.data.data) {
                // Mock seat map conditionally based on fake logic if API doesn't provide
                const data = response.data.data;
                data.hasSeatMap = data.seatMapImage !== null;
                setEvent(data);
                void fetchReviews(eventId);
                fetchSuggestedEvents();
            }
        } catch (error) {
            console.error("Failed to fetch event detail", error);
            // Fetch suggested events if not found
            fetchSuggestedEvents();
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (eventId: string) => {
        try {
            const res = await api.get(`/inventory-service/api/reviews/event/${eventId}`, { skipAuth: true});
            if (res.data && res.data.status === 200) {
                setReviews(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const fetchSuggestedEvents = async () => {
        try {
            const response = await api.get("/inventory-service/api/events/recommend", {
                params: { limit: "10" },
                skipAuth: true
            } as any);
            if (response.data?.data?.content) {
                setSuggestedEvents(response.data.data.content);
            }
        } catch (e) {
            console.error("Failed to load suggested events");
        }
    }

    useEffect(() => {
        if (descriptionRef.current && !isDescriptionExpanded) {
            // Check if the scrollHeight is greater than clientHeight to determine overflow
            setShowExpandButton(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
        }
    }, [event, isDescriptionExpanded]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(locale === 'vi' ? "vi-VN" : "en-US", {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatShowtimeDate = (dateString: string) => {
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

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString(locale === 'vi' ? "vi-VN" : "en-US", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (start: string, end: string) => {
        if (!start || !end) return tb('not_updated');
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (diffHrs > 0) parts.push(`${diffHrs} ${tb('hours')}`);
        if (diffMins > 0) parts.push(`${diffMins} ${tb('minutes')}`);
        return parts.length > 0 ? parts.join(" ") : tb('not_updated');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-bg-page flex flex-col">
                {/* <Header /> */}
                <div className="flex-1 flex flex-col items-center py-20 px-4">
                    <div className="bg-bg-inverse text-text-inverse rounded-[2rem] rounded-bl-sm p-6 mb-6">
                        <CircleHelp size={64} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">{te('event_not_found')}</h2>
                    <p className="text-text-secondary text-center mb-6 max-w-md">
                        {te('event_not_found_desc')}
                    </p>
                    <Link
                        href={`/${locale}/user/homepage`}
                        className="px-8 py-3 bg-button-primary-bg-default text-button-primary-text-default rounded-button-radius hover:bg-button-primary-bg-hover transition-colors font-medium mb-20"
                    >
                        {te('back_to_home')}
                    </Link>

                    {/* Suggested Events */}
                    {suggestedEvents.length > 0 && (
                        <div className="w-full max-w-[90%] mx-auto border-t border-border-default pt-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-text-primary text-opacity-50 uppercase tracking-widest">{te('you_might_also_like')}</h3>
                                <Link href={`/${locale}/user/events`} className="text-sm text-text-secondary hover:text-button-primary-bg-default">
                                    {te('see_more')} {'>'}
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {suggestedEvents.map(evt => (
                                    <Link key={evt.eventId} href={`/${locale}/user/events/${evt.id}`} className="group cursor-pointer">
                                        <div className="aspect-[4/3] rounded-ds-xl bg-secondary mb-3 overflow-hidden relative">
                                            {evt.bannerImage ? (
                                                <Image src={evt.bannerImage} alt={evt.eventName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageIcon /></div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-text-primary line-clamp-2 group-hover:text-button-primary-bg-default transition-colors">{evt.eventName}</h4>
                                        <div className="text-sm text-text-secondary mt-2 flex items-center gap-1">
                                            <Calendar size={14} /> {formatTime(evt.startDatetime)} - {formatDate(evt.startDatetime)}
                                        </div>
                                        <div className="text-sm text-text-secondary mt-1 flex items-center gap-1 line-clamp-1">
                                            <MapPin size={14} className="shrink-0" /> {evt.venue || evt.address}
                                        </div>
                                        <div className="font-bold text-button-primary-bg-default mt-2">
                                            {te('from_price', { price: (evt.ticketTypes?.[0]?.price || 500000).toLocaleString(locale === 'vi' ? "vi-VN" : "en-US") })}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            {/* <Header /> */}

            {/* TOP HERO SECTION - Thích ứng theo theme Dark/Light */}
            <div className="bg-gradient-to-br from-bg-surface to-bg-bg-decor border-b border-border-default text-text-primary w-full">
                <div className="max-w-[90%] mx-auto px-4 py-6 md:py-10">
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{tb('home')}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events`} className="hover:text-button-primary-bg-default transition-colors">{te('all_events')}</Link>
                        <span>{'>'}</span>
                        <span className="text-button-primary-bg-default font-semibold">{te('event_breadcrumb')}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Poster Cột Trái */}
                        <div className="lg:col-span-6 w-full flex flex-col">
                            <div className="flex items-center justify-end mb-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-text-secondary font-medium">{te('event_category_label')}</span>
                                    <div className="inline-block bg-badge-neutral-bg text-badge-neutral-text rounded-full border-2 border-badge-neutral-border px-4 py-1.5 text-sm font-semibold shadow-sm">
                                        {CATEGORIES.find(c => c.id === event.category) ? tEvents(CATEGORIES.find(c => c.id === event.category)!.translationKey as any) : event.category}
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-[4/3] rounded-ds-2xl overflow-hidden shadow-xl bg-bg-surface border border-border-default">
                                {event.bannerImage ? (
                                    <Image
                                        src={event.bannerImage}
                                        alt={event.eventName}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-text-muted flex-col gap-2">
                                        <ImageIcon size={48} />
                                        <span>Event Poster</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Cột Phải */}
                        <div className="lg:col-span-6 flex flex-col justify-start h-full align-top">

                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-text-primary drop-shadow-sm align-top">
                                {event.eventName}
                            </h1>

                            <p className="text-text-secondary text-sm md:text-base mb-6 max-w-2xl leading-relaxed font-medium">
                                {event.description}
                            </p>

                            <div className="bg-card-bg-elevated border border-border-default shadow-sm rounded-ds-xl p-6 mb-8 max-w-full grid grid-cols-1 gap-6">
                                <div className="flex  items-center gap-4">
                                    <div className="bg-bg-page p-2 rounded-ds-lg border border-border-subtle shrink-0">
                                        <Clock size={22} className="text-primary" />
                                    </div>
                                    <div className="flex flex-row gap-4 items-center">
                                        <div className="text-xs text-text-secondary uppercase tracking-wider font-bold">{te('time_label')}</div>
                                        <div className="text-sm font-semibold text-text-primary">{formatTime(activeShowtime.startDatetime)} - {formatDate(activeShowtime.startDatetime)}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-bg-page p-2 rounded-ds-lg border border-border-subtle shrink-0">
                                        <MapPin size={22} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex flex-row gap-4 items-center">
                                            <div className="text-xs text-text-secondary uppercase tracking-wider font-bold">{te('location_label')}</div>
                                            <div className="text-sm font-semibold text-text-primary">{activeShowtime.venue || event.venue || activeShowtime.address || event.address}</div>
                                        </div>
                                        <div className="text-[11px] text-text-muted mt-1">{te('organized_by', { name: event.orgInternalResponse?.organizationName })}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-full flex flex-col items-start gap-6">
                                <div className="flex flex-row w-full items-center justify-start gap-2">
                                    <span className="text-sm text-text-secondary font-medium">{te('price_only_from')}</span>
                                    <span className="text-3xl font-black text-feedback-warning-text">
                                        {minPrice > 0 ? `${minPrice.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} VND` : te('free')}
                                    </span>
                                </div>
                                <button
                                    className={`w-full py-4 px-10 rounded-button-radius font-bold text-lg transition-all shadow-lg ${isBuyDisabled ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default hover:shadow-xl hover:-translate-y-0.5'}`}
                                    disabled={isBuyDisabled}
                                    onClick={() => {
                                        if (isBuyDisabled) return;
                                        if (!isAuthenticated) {
                                            router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                                            return;
                                        }
                                        router.push(`/${locale}/user/events/${id}/booking`);
                                    }}
                                >
                                    {getBuyButtonText()}
                                </button>
                                <button
                                    onClick={toggleFavorite}
                                    className="w-full mt-3 py-3 px-10 rounded-button-radius font-bold text-base border border-border-default flex items-center justify-center gap-2 hover:bg-bg-subtle transition-all cursor-pointer shadow-sm text-text-primary bg-card-bg-default"
                                >
                                    <Heart
                                        size={18}
                                        className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-text-secondary'}
                                    />
                                    {isFavorite ? te('remove_from_favorites') : te('add_to_favorites')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM DETAILS SECTION - Background xám nhạt (hoặc dark tùy theme) */}
            <div className="bg-bg-page w-full flex-1">
                <div className="max-w-[90%] mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Chi tiết */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Khối Giới thiệu */}
                            <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">{te('event_intro')}</h3>
                                <div
                                    ref={descriptionRef}
                                    className={`prose prose-sm max-w-none text-text-secondary whitespace-pre-line leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}
                                >
                                    {event.introduction || te('no_intro')}
                                </div>
                                {showExpandButton && (
                                    <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors w-full text-center py-2 bg-bg-page hover:bg-bg-subtle rounded-ds-lg border border-border-default"
                                    >
                                        {isDescriptionExpanded ? te('collapse') : te('see_more')}
                                    </button>
                                )}
                            </div>

                            {/* Khối Thời gian & Địa điểm (Chia 2 cột) */}
                            <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-1">{te('schedule_venue')}</h3>
                                <p className="text-sm text-text-secondary mb-4">{te('schedule_note')}</p>

                                <div className="space-y-4">
                                    {event.showtimes && event.showtimes.map((showtime) => {
                                        const isSoldOut = showtime.ticketTypes.every((t: any) => t.quantityAvailable <= 0);
                                        const isExpanded = expandedShowtimeId === showtime.showtimeId;
                                        const isSelected = selectedShowtimeId === showtime.showtimeId;

                                        return (
                                            <div
                                                key={showtime.showtimeId}
                                                className={`border rounded-ds-lg overflow-hidden transition-colors ${isSelected ? 'border-primary' : 'border-border-default'}`}
                                            >
                                                {/* Header */}
                                                <div
                                                    className={`p-4 flex gap-4 justify-between items-start cursor-pointer hover:bg-bg-subtle transition-colors ${(isSoldOut && !isSelected) ? 'opacity-60' : ''} ${isSelected ? 'bg-bg-subtle/40' : ''}`}
                                                    onClick={() => setExpandedShowtimeId(isExpanded ? null : showtime.showtimeId)}
                                                >
                                                    <div className="flex-1">
                                                        {isSoldOut && (
                                                            <div className="bg-feedback-error-bg text-feedback-error-text text-xs px-2 py-0.5 rounded w-fit mb-2">{tb('sold_out')}</div>
                                                        )}
                                                        <div className="font-bold text-text-primary text-base">
                                                            {formatShowtimeDate(showtime.startDatetime)}
                                                        </div>
                                                        <div className="text-sm text-text-secondary mt-1">
                                                            {formatTime(showtime.startDatetime)} - {formatTime(showtime.endDatetime)}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-text-muted pt-1">
                                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                {isExpanded && (
                                                    <div className="p-4 pt-0 mt-2 flex flex-col">
                                                        <div className="pt-2 border-t border-border-subtle mt-1 grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                                                            <div className="text-text-secondary">{tb('estimated_duration')}</div>
                                                            <div className="text-text-primary">{getDuration(showtime.startDatetime, showtime.endDatetime)}</div>

                                                            <div className="text-text-secondary">{tb('venue')}</div>
                                                            <div className="text-text-primary">{showtime.venue || event.venue}</div>

                                                            <div className="text-text-secondary">{tb('address')}</div>
                                                            <div className="text-text-primary line-clamp-2">{showtime.address || showtime.fullAddress || event.address}</div>

                                                            <div className="text-text-secondary">{tb('checkin_area')}</div>
                                                            <div className="text-text-primary">{tb('main_hall')}</div>
                                                        </div>
                                                        <button
                                                            className={`mt-4 px-6 py-2 rounded-button-radius text-sm font-semibold max-w-fit transition-colors shadow-sm ${isSelected ? 'bg-bg-subtle border border-border-default text-text-secondary cursor-not-allowed' : 'bg-button-neutral-bg-default hover:bg-button-neutral-bg-hover text-button-neutral-text-default border border-border-default'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isSoldOut) setSelectedShowtimeId(showtime.showtimeId);
                                                            }}
                                                            disabled={isSoldOut || isSelected}
                                                        >
                                                            {isSelected ? te('selected_this_schedule') : te('select_this_schedule')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Event Location Map */}
                                {event.latitude !== 0 && event.longitude !== 0 && (
                                    <div className="mt-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MapIcon size={20} className="text-primary" />
                                            <span className="font-bold text-text-primary">{te('location_map')}</span>
                                        </div>
                                        <div className="h-[350px] w-full rounded-ds-xl overflow-hidden border border-border-default shadow-sm relative z-0">
                                            <Map
                                                pos={[event.latitude, event.longitude]}
                                                popupText={event.venue || event.address}
                                            />
                                        </div>
                                        <div className="mt-3 flex justify-between items-center">
                                            <p className="text-xs text-text-secondary italic">
                                                * {te('map_instruction')}
                                            </p>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                {te('open_in_google_maps')} <ArrowLeft size={12} className="rotate-180" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Khối Sơ đồ chỗ ngồi (Dựa theo Wireframe Seat Selection) */}
                            {event.hasSeatMap && (
                                <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">{te('seat_map')}</h3>
                                    <div className="bg-bg-page border border-border-default rounded-ds-xl p-6 flex flex-col items-center">
                                        <div className="w-full max-w-sm h-12 bg-[#A59EDA] text-white flex items-center justify-center font-bold text-sm mb-8 rounded shadow-sm">
                                            {te('stage')}
                                        </div>
                                        <div className="flex flex-col gap-3 items-center w-full">
                                            <div className="w-24 h-12 border-2 border-feedback-warning-border bg-feedback-warning-bg/50 flex items-center justify-center font-bold text-sm text-text-primary">VIP</div>
                                            <div className="flex gap-4">
                                                <div className="w-20 h-10 border-2 border-feedback-error-border bg-feedback-error-bg/50 flex items-center justify-center font-bold text-sm text-text-primary">A</div>
                                                <div className="w-20 h-10 border-2 border-feedback-error-border bg-feedback-error-bg/50 flex items-center justify-center font-bold text-sm text-text-primary">A</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-24 h-10 border-2 border-feedback-success-border bg-feedback-success-bg/50 flex items-center justify-center font-bold text-sm text-text-primary">B</div>
                                                <div className="w-24 h-10 border-2 border-feedback-success-border bg-feedback-success-bg/50 flex items-center justify-center font-bold text-sm text-text-primary">B</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-20 h-10 border-2 border-border-strong bg-bg-surface flex items-center justify-center font-bold text-sm text-text-primary">C</div>
                                                <div className="w-20 h-10 border-2 border-border-strong bg-bg-surface flex items-center justify-center font-bold text-sm text-text-primary">C</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 mt-8">
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-button-primary-bg-default"></div><span className="text-xs text-text-secondary">{te('available')}</span></div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-button-primary-bg-default/60"></div><span className="text-xs text-text-secondary">{te('fast_selling')}</span></div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-text-muted"></div><span className="text-xs text-text-secondary">{te('sold_out_status')}</span></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-4">{te('seat_selection_next_step')}</p>
                                </div>
                            )}

                            {/* Khối Thông tin tham dự */}
                            <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">{te('attendance_info')}</h3>
                                <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                    <li>{te('attendance_note_1')}</li>
                                    <li>{te('attendance_note_2')}</li>
                                    <li>{te('attendance_note_3')}</li>
                                    <li>{te('attendance_note_4')}</li>
                                </ul>
                            </div>

                            {/* Khối Đơn vị tổ chức */}
                            <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">{te('organizer')}</h3>
                                <div className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 rounded-ds-md overflow-hidden bg-bg-page border border-border-default shrink-0">
                                        <Image src={event.orgInternalResponse?.logoUrl || "/placeholder-avatar.png"} alt="logo" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">{event.orgInternalResponse?.organizationName}</h4>
                                        <p className="text-sm text-text-secondary mt-1 max-w-lg">
                                            {event.orgInternalResponse?.description}
                                        </p>
                                        {/* <button className="mt-3 text-sm font-semibold text-primary underline underline-offset-2">
                                            {te('see_more_from_org')}
                                        </button> */}
                                    </div>
                                </div>
                            </div>

                            {/* Khối Đánh giá */}
                            <div className="bg-card-bg-default border border-border-default rounded-ds-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle">{te('reviews_title')}</h3>
                                
                                {/* Form viết đánh giá */}
                                {isAuthenticated ? (
                                    <form onSubmit={handleReviewSubmit} className="mb-8 bg-bg-page border border-border-subtle rounded-ds-lg p-4">
                                        <h4 className="font-semibold text-sm text-text-primary mb-3">{te('write_review')}</h4>
                                        
                                        {/* Chọn rating */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs text-text-secondary">{te('rating_label')}</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        className="cursor-pointer text-feedback-warning-text hover:scale-110 transition-transform"
                                                    >
                                                        <Star
                                                            size={20}
                                                            className={star <= newRating ? "fill-current" : "text-text-muted"}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Nhập bình luận */}
                                        <div className="mb-3">
                                            <textarea
                                                className="w-full text-sm p-3 bg-bg-surface text-text-primary border border-border-default rounded-ds-md focus:outline-none focus:ring-1 focus:ring-button-primary-bg-default"
                                                rows={3}
                                                placeholder={te('comment_label')}
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                        </div>

                                        {/* Upload file ảnh */}
                                        <div className="mb-4">
                                            <label className="block text-xs text-text-secondary mb-1.5">{te('images_label')}</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const filesArray = Array.from(e.target.files);
                                                        if (filesArray.length + newImages.length > 3) {
                                                            toast.error("Tối đa 3 hình ảnh.");
                                                            return;
                                                        }
                                                        setNewImages([...newImages, ...filesArray]);
                                                    }
                                                }}
                                                className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-ds-md file:border-0 file:text-xs file:font-semibold file:bg-button-neutral-bg-default file:text-button-neutral-text-default hover:file:bg-button-neutral-bg-hover cursor-pointer"
                                            />
                                            {/* Preview ảnh đã chọn */}
                                            {newImages.length > 0 && (
                                                <div className="flex gap-2 mt-3">
                                                    {newImages.map((img, idx) => (
                                                        <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-border-default">
                                                            <img
                                                                src={URL.createObjectURL(img)}
                                                                alt="upload-preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-[10px] w-4 h-4 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="px-4 py-2 bg-button-primary-bg-default text-button-primary-text-default text-xs font-semibold rounded-ds-md hover:bg-button-primary-bg-hover disabled:bg-bg-subtle disabled:text-text-muted transition-colors cursor-pointer"
                                        >
                                            {submittingReview ? "..." : te('submit_review_btn')}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="mb-6 p-4 bg-bg-page border border-border-subtle rounded-ds-lg text-center text-sm text-text-secondary">
                                        Vui lòng <Link href={`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-primary hover:underline font-semibold">Đăng nhập</Link> để viết đánh giá cho sự kiện này.
                                    </div>
                                )}

                                {/* Danh sách reviews */}
                                <div className="space-y-6">
                                    {reviews && reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="flex gap-3 pb-6 border-b border-border-subtle last:border-0 last:pb-0">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-bg-page border border-border-default shrink-0">
                                                    <Image
                                                        src={review.userAvatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                                        alt={review.userFullName || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-semibold text-sm text-text-primary">{review.userFullName || "Người dùng ẩn danh"}</h5>
                                                            <div className="flex gap-0.5 mt-0.5">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star
                                                                        key={s}
                                                                        size={12}
                                                                        className={s <= review.rating ? "fill-current text-feedback-warning-text" : "text-text-muted"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-text-muted">
                                                                {new Date(review.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                                                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {user && user.id === review.userId && (
                                                                <button
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    className="text-feedback-error-text hover:bg-feedback-error-bg/10 p-1 rounded transition-colors cursor-pointer"
                                                                    title={te('delete_review_confirm', { defaultMessage: 'Xóa nhận xét' })}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{review.comment}</p>
                                                    
                                                    {/* Ảnh đính kèm trong review */}
                                                    {review.images && review.images.length > 0 && (
                                                        <div className="flex gap-2 mt-3 flex-wrap">
                                                            {review.images.map((imgUrl, i) => (
                                                                <a href={imgUrl} target="_blank" rel="noopener noreferrer" key={i} className="relative w-20 h-20 rounded overflow-hidden border border-border-default hover:opacity-90 transition-opacity">
                                                                    <img src={imgUrl} alt="review-attachment" className="w-full h-full object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-sm text-text-secondary italic">
                                            {te('no_reviews')}
                                        </div>
                                    )}
                                </div>
                            </div>


                        </div>

                        {/* RIGHT COLUMN: Sticky Sidebar Card */}
                        <div className="lg:col-span-4 relative">
                            <div className="bg-payment-summary-bg-default border border-border-default rounded-ds-xl overflow-hidden shadow-xl sticky top-24">
                                <div className="p-6">
                                    <div className="text-2xl font-extrabold text-feedback-warning-text mb-6">
                                        {te('from_price', { price: minPrice?.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">{te('event_category_label')}</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.category}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">{te('ticket_type_label')}</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.hasSeatMap ? te('has_seat_map_label') : te('no_seat_map_label')}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">{te('time_label')}</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{formatTime(activeShowtime.startDatetime)} - {formatDate(activeShowtime.startDatetime)}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">{te('venue_label')}</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.venue || "Nhà Hát Hòa Bình"}</span>
                                        </div>
                                        {(() => {
                                            const allTickets = event.showtimes?.flatMap(st => st.ticketTypes || []) || [];
                                            if (allTickets.length > 0) {
                                                const earliestSaleStart = Math.min(...allTickets.map(t => new Date(t.saleStartDate).getTime()));
                                                const latestSaleEnd = Math.max(...allTickets.map(t => new Date(t.saleEndDate).getTime()));
                                                const startStr = new Date(earliestSaleStart).toISOString();
                                                const endStr = new Date(latestSaleEnd).toISOString();
                                                
                                                const formatCompactDate = (dateString: string) => {
                                                    const d = new Date(dateString);
                                                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                                };

                                                return (
                                                    <div className="flex justify-between items-start pb-1">
                                                        <span className="text-sm text-text-muted shrink-0 w-24">{te('sale_time_label', { defaultMessage: 'Mở bán' })}</span>
                                                        <div className="text-sm font-medium text-text-primary text-right flex flex-col items-end gap-0.5">
                                                            <span>{formatTime(startStr)} - {formatCompactDate(startStr)}</span>
                                                            <span className="text-[11px] text-text-secondary italic">đến {formatTime(endStr)} - {formatCompactDate(endStr)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    <button
                                        className={`w-full py-3.5 rounded-button-radius font-semibold mb-3 transition-colors shadow-sm ${isBuyDisabled ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default'}`}
                                        disabled={isBuyDisabled}
                                        onClick={() => {
                                            if (isBuyDisabled) return;
                                            if (!isAuthenticated) {
                                                router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                                                return;
                                            }
                                            router.push(`/${locale}/user/events/${id}/booking`);
                                        }}
                                    >
                                        {getBuyButtonText()}
                                    </button>
                                    <button
                                        onClick={toggleFavorite}
                                        className="w-full mb-6 py-2.5 rounded-button-radius font-semibold border border-border-default flex items-center justify-center gap-2 hover:bg-bg-subtle transition-colors cursor-pointer shadow-sm text-text-primary bg-card-bg-default"
                                    >
                                        <Heart
                                            size={16}
                                            className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-text-secondary'}
                                        />
                                        {isFavorite ? te('remove_from_favorites') : te('add_to_favorites')}
                                    </button>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Check size={14} className="text-text-muted shrink-0" />
                                            <span className="text-xs text-text-secondary">{te('qr_checkin')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check size={14} className="text-text-muted shrink-0" />
                                            <span className="text-xs text-text-secondary">{te('secure_transfer_support')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {suggestedEvents.length > 0 && (
                <div className="w-full max-w-[90%] mx-auto border-t border-border-default pt-10 pb-20">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-semibold text-lg text-text-primary text-opacity-50 uppercase tracking-widest">{te('you_might_also_like')}</h3>
                        <Link href={`/${locale}/user/events`} className="text-sm text-text-secondary hover:text-button-primary-bg-default transition-colors flex items-center gap-1">
                            {te('see_more')} <span className="text-xs">▶</span>
                        </Link>
                    </div>

                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                            1536: { slidesPerView: 5 },
                        }}
                        className="suggested-events-swiper !pb-12"
                    >
                        {suggestedEvents.map(evt => (
                            <SwiperSlide key={evt.eventId || evt.id}>
                                <Link href={`/${locale}/user/events/${evt.id}`} className="group cursor-pointer block h-full">
                                    <div className="aspect-[4/3] rounded-ds-xl bg-secondary mb-3 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300">
                                        {evt.bannerImage ? (
                                            <Image
                                                src={evt.bannerImage}
                                                alt={evt.eventName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-text-primary line-clamp-2 group-hover:text-button-primary-bg-default transition-colors leading-snug h-12">
                                            {evt.eventName}
                                        </h4>
                                        <div className="text-[13px] text-text-secondary flex items-center gap-1.5">
                                            <Calendar size={14} className="shrink-0" />
                                            <span>{formatTime(evt.startDatetime)} - {formatDate(evt.startDatetime)}</span>
                                        </div>
                                        <div className="text-[13px] text-text-secondary flex items-center gap-1.5 line-clamp-1">
                                            <MapPin size={14} className="shrink-0" />
                                            <span>{evt.venue || evt.address}</span>
                                        </div>
                                        <div className="font-bold text-button-primary-bg-default mt-2 text-base">
                                            {te('from_price', {
                                                price: (evt.floorPrice || evt.ticketTypes?.[0]?.price || 500000).toLocaleString(locale === 'vi' ? "vi-VN" : "en-US")
                                            })}
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
            <Footer />
        </div>
    );
}

