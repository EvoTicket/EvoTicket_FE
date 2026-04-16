"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import {
    MapPin, Calendar, Clock, User, Star, Image as ImageIcon,
    Check, MapIcon, CircleHelp, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { Footer } from "@/src/components/footer";
import { Header } from "@/src/components/header";
import { EventDetail } from "@/src/types/event";

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import("@/src/components/Map"), {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Đang tải bản đồ...</div>
});



export default function EventDetailPage() {
    const { locale, id } = useParams();
    const router = useRouter();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [suggestedEvents, setSuggestedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Expansion state for the 'introduction' block
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [expandedShowtimeId, setExpandedShowtimeId] = useState<number | null>(null);

    // Xử lý cờ sold out
    const isSoldOut = event?.eventStatus === "SOLD_OUT" || (event && event.showtimes.map(showtime => showtime.ticketTypes).flat().every(t => t.quantityAvailable <= 0));

    // Tính giá vé nhỏ nhất
    const minPrice = event?.showtimes.map(showtime => showtime.ticketTypes).flat().length
        ? Math.min(...event.showtimes.map(showtime => showtime.ticketTypes).flat().map(t => t.price))
        : 0;

    useEffect(() => {
        const token = Cookies.get("token");
        setIsAuthenticated(!!token);
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
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await api.get(`/inventory-service/api/events/${eventId}`, { headers });

            if (response.data && response.data.data) {
                // Mock seat map conditionally based on fake logic if API doesn't provide
                const data = response.data.data;
                data.hasSeatMap = data.seatMapImage !== null;
                setEvent(data);
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

    const fetchSuggestedEvents = async () => {
        try {
            const response = await api.get("/inventory-service/api/events", {
                params: { page: 1, size: 4 },
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
        return new Date(dateString).toLocaleDateString("vi-VN", {
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
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const weekday = days[d.getDay()];
        return `${day} tháng ${month}, ${year} (${weekday})`;
    }

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("vi-VN", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (start: string, end: string) => {
        if (!start || !end) return "Chưa cập nhật";
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (diffHrs > 0) parts.push(`${diffHrs} giờ`);
        if (diffMins > 0) parts.push(`${diffMins} phút`);
        return parts.length > 0 ? parts.join(" ") : "Chưa cập nhật";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-bg-page flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center py-20 px-4">
                    <div className="bg-bg-inverse text-text-inverse rounded-[2rem] rounded-bl-sm p-6 mb-6">
                        <CircleHelp size={64} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Không tìm thấy sự kiện</h2>
                    <p className="text-text-secondary text-center mb-6 max-w-md">
                        Liên kết bạn truy cập không còn tồn tại, đã bị thay đổi hoặc sự kiện không khả dụng trên hệ thống.
                    </p>
                    <Link
                        href={`/${locale}/user/homepage`}
                        className="px-8 py-3 bg-button-primary-bg-default text-button-primary-text-default rounded-button-radius hover:bg-button-primary-bg-hover transition-colors font-medium mb-20"
                    >
                        Quay về trang chủ
                    </Link>

                    {/* Suggested Events */}
                    {suggestedEvents.length > 0 && (
                        <div className="w-full max-w-7xl mx-auto border-t border-border-default pt-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-text-primary text-opacity-50 uppercase tracking-widest">Có thể bạn cũng thích</h3>
                                <Link href={`/${locale}/events`} className="text-sm text-text-secondary hover:text-primary">
                                    Xem thêm {'>'}
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {suggestedEvents.map(evt => (
                                    <Link key={evt.eventId} href={`/${locale}/events/${evt.eventId}`} className="group cursor-pointer">
                                        <div className="aspect-[4/3] rounded-xl bg-secondary mb-3 overflow-hidden relative">
                                            {evt.bannerImage ? (
                                                <Image src={evt.bannerImage} alt={evt.eventName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageIcon /></div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">{evt.eventName}</h4>
                                        <div className="text-sm text-text-secondary mt-2 flex items-center gap-1">
                                            <Calendar size={14} /> {formatTime(evt.startDatetime)} - {formatDate(evt.startDatetime)}
                                        </div>
                                        <div className="text-sm text-text-secondary mt-1 flex items-center gap-1 line-clamp-1">
                                            <MapPin size={14} className="shrink-0" /> {evt.venue || evt.address}
                                        </div>
                                        <div className="font-bold text-primary mt-2">
                                            Từ {(evt.ticketTypes?.[0]?.price || 500000).toLocaleString("vi-VN")} VND
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
            <Header />

            {/* TOP HERO SECTION - Thích ứng theo theme Dark/Light */}
            <div className="bg-gradient-to-br from-bg-surface to-bg-bg-decor border-b border-border-default text-text-primary w-full">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-primary transition-colors">Home</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/events`} className="hover:text-primary transition-colors">Sự kiện</Link>
                        <span>{'>'}</span>
                        <span className="text-primary font-semibold">Chi tiết sự kiện</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Poster Cột Trái */}
                        <div className="lg:col-span-5 w-full flex flex-col">
                            <div className="flex items-center justify-end gap-3 mb-4 w-full">
                                <span className="text-sm text-text-secondary font-medium">Loại sự kiện:</span>
                                <div className="inline-block bg-badge-neutral-bg text-badge-neutral-text rounded-full border-2 border-badge-neutral-border px-4 py-1.5 text-sm font-semibold shadow-sm">
                                    {event.category}
                                </div>
                            </div>
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-bg-surface border border-border-default">
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
                        <div className="lg:col-span-7 flex flex-col justify-start h-full align-top">

                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-text-primary drop-shadow-sm align-top">
                                {event.eventName}
                            </h1>

                            <p className="text-text-secondary text-sm md:text-base mb-6 max-w-2xl leading-relaxed font-medium">
                                {event.description}
                            </p>

                            <div className="bg-card-bg-elevated border border-border-default shadow-sm rounded-xl p-4 mb-6 max-w-xl space-y-3">
                                <div className="flex items-start gap-3">
                                    <Clock size={18} className="text-icon-muted mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">Thời gian: {formatTime(activeShowtime.startDatetime)} - {formatDate(activeShowtime.startDatetime)}</div>
                                        {/* <div className="text-xs text-text-muted">Mở cổng: {formatTime(new Date(new Date(activeShowtime.startDatetime).getTime() - 3600000).toISOString())}</div> */}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-icon-muted mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">Địa điểm: {activeShowtime.venue || event.venue || activeShowtime.address || event.address}</div>
                                        <div className="text-xs text-text-secondary">Tổ chức bởi: {event.orgInternalResponse?.organizationName}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-4 max-w-xl mb-4">
                                <div className="shrink-0">
                                    <span className="text-sm text-text-secondary mr-2 font-medium">Giá từ:</span>
                                    <span className="text-2xl font-bold text-feedback-warning-text">
                                        {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} VND` : 'Miễn phí'}
                                    </span>
                                </div>
                            </div>
                            <div className="max-w-xl">
                                <button 
                                    className={`w-full py-4 rounded-button-radius font-bold text-lg transition-colors shadow-lg ${isSoldOut ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default'}`}
                                    disabled={isSoldOut}
                                    onClick={() => !isSoldOut && router.push(`/${locale}/events/${id}/booking`)}
                                >
                                    {isSoldOut ? "Tạm hết vé" : "Mua vé ngay"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM DETAILS SECTION - Background xám nhạt (hoặc dark tùy theme) */}
            <div className="bg-bg-page w-full flex-1">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Chi tiết */}
                        <div className="lg:col-span-8 flex flex-col gap-6">

                            {/* Khối Giới thiệu */}
                            <div className="bg-card-bg-default border border-border-default rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">Giới thiệu sự kiện</h3>
                                <div
                                    ref={descriptionRef}
                                    className={`prose prose-sm max-w-none text-text-secondary whitespace-pre-line leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}
                                >
                                    {event.introduction || "Chưa có thông tin giới thiệu chi tiết."}
                                </div>
                                {showExpandButton && (
                                    <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors w-full text-center py-2 bg-bg-page hover:bg-bg-subtle rounded-lg border border-border-default"
                                    >
                                        {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                                    </button>
                                )}
                            </div>

                            {/* Khối Thời gian & Địa điểm (Chia 2 cột) */}
                            <div className="bg-card-bg-default border border-border-default rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-1">Lịch diễn & địa điểm</h3>
                                <p className="text-sm text-text-secondary mb-4">Vui lòng chọn một lịch diễn trước khi tiếp tục đặt vé.</p>

                                <div className="space-y-4">
                                    {event.showtimes && event.showtimes.map((showtime) => {
                                        const isSoldOut = showtime.ticketTypes.every((t: any) => t.quantityAvailable <= 0);
                                        const isExpanded = expandedShowtimeId === showtime.showtimeId;
                                        const isSelected = selectedShowtimeId === showtime.showtimeId;

                                        return (
                                            <div
                                                key={showtime.showtimeId}
                                                className={`border rounded-lg overflow-hidden transition-colors ${isSelected ? 'border-primary' : 'border-border-default'}`}
                                            >
                                                {/* Header */}
                                                <div
                                                    className={`p-4 flex gap-4 justify-between items-start cursor-pointer hover:bg-bg-subtle transition-colors ${(isSoldOut && !isSelected) ? 'opacity-60' : ''} ${isSelected ? 'bg-bg-subtle/40' : ''}`}
                                                    onClick={() => setExpandedShowtimeId(isExpanded ? null : showtime.showtimeId)}
                                                >
                                                    <div className="flex-1">
                                                        {isSoldOut && (
                                                            <div className="bg-feedback-error-bg text-feedback-error-text text-xs px-2 py-0.5 rounded w-fit mb-2">Sold out</div>
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
                                                            <div className="text-text-secondary">Thời lượng dự kiến:</div>
                                                            <div className="text-text-primary">{getDuration(showtime.startDatetime, showtime.endDatetime)}</div>

                                                            <div className="text-text-secondary">Địa điểm:</div>
                                                            <div className="text-text-primary">{showtime.venue || event.venue}</div>

                                                            <div className="text-text-secondary">Địa chỉ:</div>
                                                            <div className="text-text-primary line-clamp-2">{showtime.address || showtime.fullAddress || event.address}</div>

                                                            <div className="text-text-secondary">Khu vực check-in:</div>
                                                            <div className="text-text-primary">Sảnh chính tầng 1</div>
                                                        </div>
                                                        <button
                                                            className={`mt-4 px-6 py-2 rounded-button-radius text-sm font-semibold max-w-fit transition-colors shadow-sm ${isSelected ? 'bg-bg-subtle border border-border-default text-text-secondary cursor-not-allowed' : 'bg-button-neutral-bg-default hover:bg-button-neutral-bg-hover text-button-neutral-text-default border border-border-default'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isSoldOut) setSelectedShowtimeId(showtime.showtimeId);
                                                            }}
                                                            disabled={isSoldOut || isSelected}
                                                        >
                                                            {isSelected ? 'Đã chọn lịch diễn này' : 'Chọn lịch diễn này'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Khối Sơ đồ chỗ ngồi (Dựa theo Wireframe Seat Selection) */}
                            {event.hasSeatMap && (
                                <div className="bg-card-bg-default border border-border-default rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">Sơ đồ chỗ ngồi</h3>
                                    <div className="bg-bg-page border border-border-default rounded-xl p-6 flex flex-col items-center">
                                        <div className="w-full max-w-sm h-12 bg-[#A59EDA] text-white flex items-center justify-center font-bold text-sm mb-8 rounded shadow-sm">
                                            SÂN KHẤU
                                        </div>
                                        <div className="flex flex-col gap-3 items-center w-full">
                                            <div className="w-24 h-12 border-2 border-yellow-400 bg-yellow-100/50 flex items-center justify-center font-bold text-sm text-text-primary">VIP</div>
                                            <div className="flex gap-4">
                                                <div className="w-20 h-10 border-2 border-red-200 bg-red-50 flex items-center justify-center font-bold text-sm text-text-primary">A</div>
                                                <div className="w-20 h-10 border-2 border-red-200 bg-red-50 flex items-center justify-center font-bold text-sm text-text-primary">A</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-24 h-10 border-2 border-green-200 bg-green-50 flex items-center justify-center font-bold text-sm text-text-primary">B</div>
                                                <div className="w-24 h-10 border-2 border-green-200 bg-green-50 flex items-center justify-center font-bold text-sm text-text-primary">B</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-20 h-10 border-2 border-blue-200 bg-blue-50 flex items-center justify-center font-bold text-sm text-text-primary">C</div>
                                                <div className="w-20 h-10 border-2 border-blue-200 bg-blue-50 flex items-center justify-center font-bold text-sm text-text-primary">C</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 mt-8">
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#4c3575]"></div><span className="text-xs text-text-secondary">Còn vé</span></div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#8b82a3]"></div><span className="text-xs text-text-secondary">Sắp hết</span></div>
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300"></div><span className="text-xs text-text-secondary">Hết vé</span></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-4">Bạn sẽ chọn vị trí ghế chính xác ở bước tiếp theo.</p>
                                </div>
                            )}

                            {/* Khối Thông tin tham dự */}
                            <div className="bg-card-bg-default border border-border-default rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">Thông tin tham dự</h3>
                                <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                    <li>Khán giả nên đến trước giờ diễn ít nhất 30 phút</li>
                                    <li>Ghế ngồi được xác nhận theo mã vé sau khi thanh toán thành công</li>
                                    <li>Vui lòng kiểm tra đúng khu vực và số ghế trước khi vào chỗ</li>
                                    <li>Mỗi vé chỉ có hiệu lực cho đúng một chỗ ngồi</li>
                                </ul>
                            </div>

                            {/* Khối Đơn vị tổ chức */}
                            <div className="bg-card-bg-default border border-border-default rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 ">Đơn vị tổ chức</h3>
                                <div className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-bg-page border border-border-default shrink-0">
                                        <Image src={event.orgInternalResponse?.logoUrl || "/placeholder-avatar.png"} alt="logo" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">{event.orgInternalResponse?.organizationName}</h4>
                                        <p className="text-sm text-text-secondary mt-1 max-w-lg">
                                            Đơn vị tổ chức các chương trình biểu diễn sân khấu, ballet và nhạc kịch tại Việt Nam.
                                        </p>
                                        <button className="mt-3 text-sm font-semibold text-primary underline underline-offset-2">
                                            Xem thêm sự kiện từ đơn vị này
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Sticky Sidebar Card */}
                        <div className="lg:col-span-4 relative">
                            <div className="bg-payment-summary-bg-default border border-border-default rounded-xl overflow-hidden shadow-xl sticky top-24">
                                {/* Header / Status */}
                                {/* <div className="px-6 py-4 border-b border-border-default flex items-center justify-between">
                                    <div className={`text-xs font-bold px-2 py-1 rounded shadow-sm ${isSoldOut ? 'bg-bg-page border border-border-default text-text-secondary' : 'bg-bg-page border border-border-strong text-text-primary'
                                        }`}>
                                        {isSoldOut ? "Sold out" : "Đang mở bán"}
                                    </div>
                                </div> */}

                                <div className="p-6">
                                    <div className="text-2xl font-extrabold text-feedback-warning-text mb-6">
                                        Từ {minPrice?.toLocaleString('vi-VN')}đ
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">Loại sự kiện:</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.category}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">Hình thức vé:</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.hasSeatMap ? "Chọn ghế theo sơ đồ" : "Vé tự do (No Seat Map)"}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                                            <span className="text-sm text-text-muted shrink-0 w-24">Thời gian:</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{formatTime(activeShowtime.startDatetime)} - {formatDate(activeShowtime.startDatetime)}</span>
                                        </div>
                                        <div className="flex justify-between items-start pb-1">
                                            <span className="text-sm text-text-muted shrink-0 w-24">Địa điểm:</span>
                                            <span className="text-sm font-medium text-text-primary text-right">{event.venue || "Nhà Hát Hòa Bình"}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className={`w-full py-3.5 rounded-button-radius font-semibold mb-6 transition-colors shadow-sm ${isSoldOut ? 'bg-[#5b4f8a] text-white/80 cursor-not-allowed' : 'bg-[#6D48D7] hover:bg-[#5b3bb8] text-white'}`}
                                        disabled={isSoldOut}
                                        onClick={() => !isSoldOut && router.push(`/${locale}/events/${id}/booking`)}
                                    >
                                        {isSoldOut ? "Tạm hết vé" : "Mua vé ngay"}
                                    </button>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Check size={14} className="text-text-muted shrink-0" />
                                            <span className="text-xs text-text-secondary">Check-in bằng mã QR</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check size={14} className="text-text-muted shrink-0" />
                                            <span className="text-xs text-text-secondary">Hỗ trợ chuyển nhượng an toàn trong hệ thống</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
