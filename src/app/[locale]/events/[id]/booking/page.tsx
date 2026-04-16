"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle2, X, ChevronUp, ChevronDown } from "lucide-react";
import { EventDetail } from "@/src/types/event";

export default function BookingPage() {
    const { locale, id } = useParams();
    const router = useRouter();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [selectedTickets, setSelectedTickets] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
    const [timeLeft, setTimeLeft] = useState(9 * 60 + 9); // 09:09
    
    // Change showtime modal states
    const [isChangeShowtimeModalOpen, setIsChangeShowtimeModalOpen] = useState(false);
    const [isChangeShowtimeModalClosing, setIsChangeShowtimeModalClosing] = useState(false);
    const [tempShowtimeId, setTempShowtimeId] = useState<number | null>(null);
    const [expandedShowtimeId, setExpandedShowtimeId] = useState<number | null>(null);

    const closeChangeShowtimeModal = () => {
        setIsChangeShowtimeModalClosing(true);
        setTimeout(() => {
            setIsChangeShowtimeModalOpen(false);
            setIsChangeShowtimeModalClosing(false);
        }, 300);
    };

    useEffect(() => {
        if (id) {
            fetchEventDetail(id as string);
        }

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [id]);

    const fetchEventDetail = async (eventId: string) => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await api.get(`/inventory-service/api/events/${eventId}`, { headers });

            if (response.data && response.data.data) {
                const data = response.data.data;
                data.hasSeatMap = data.seatMapImage !== null; // Mock seat map
                setEvent(data);

                if (data.showtimes && data.showtimes.length > 0) {
                    setSelectedShowtimeId(data.showtimes[0].showtimeId);
                }
            }
        } catch (error) {
            console.error("Failed to fetch event detail", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeMS = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return {
            m1: Math.floor(m / 10), m2: m % 10,
            s1: Math.floor(s / 10), s2: s % 10
        };
    };

    const t = formatTimeMS(timeLeft);

    const activeShowtime = event?.showtimes?.find(st => st.showtimeId === selectedShowtimeId) || event?.showtimes?.[0];

    const formatShowtimeDate = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const weekday = days[d.getDay()];
        return `${day} tháng ${month}, ${year} (${weekday})`;
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("vi-VN", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (start?: string, end?: string) => {
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

    const handleUpdateQuantity = (ticketType: any, delta: number) => {
        setSelectedTickets(prev => {
            const existing = prev.find(t => t.id === ticketType.ticketTypeId);
            if (existing) {
                const newQuantity = existing.quantity + delta;
                if (newQuantity <= 0) {
                    return prev.filter(t => t.id !== ticketType.ticketTypeId);
                }
                return prev.map(t => t.id === ticketType.ticketTypeId ? { ...t, quantity: newQuantity } : t);
            } else if (delta > 0) {
                return [...prev, { id: ticketType.ticketTypeId, name: ticketType.ticketTypeName, price: ticketType.price, quantity: 1 }];
            }
            return prev;
        });
    };

    const handleRemoveItem = (id: number) => {
        setSelectedTickets(prev => prev.filter(t => t.id !== id));
    };

    // Calculate totals
    const serviceFee = selectedTickets.length > 0 ? 2000 : 0;
    const ticketTotal = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const orderTotal = ticketTotal + serviceFee;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) return null;

    const hasSeatMap = event.hasSeatMap; // mock logic
    const ticketOptions = activeShowtime?.ticketTypes || [];

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            <Header />

            {/* TOP HEADER TRANG ĐẶT VÊ */}
            <div className="bg-bg-page border-b border-border-default pt-6 pb-4">
                <div className="max-w-7xl mx-auto px-4">
                    {/* BREADCRUMB */}
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-primary transition-colors">Home</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/events`} className="hover:text-primary transition-colors">Tìm kiếm</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/events/${event.eventId}`} className="hover:text-primary transition-colors">Chi tiết sự kiện</Link>
                        <span>{'>'}</span>
                        <span className="text-primary font-semibold">Đặt vé và thanh toán</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">Đặt vé & Thanh toán</h1>
                            <p className="text-sm text-text-secondary mb-1">Thực hiện trọn vẹn quy trình 03 bước để sở hữu vé</p>
                            <p className="text-[11px] text-text-muted">Vui lòng hoàn tất các bước trong thời gian giữ vé để tránh mất các vé đã chọn.</p>
                        </div>
                        <Link href={`/${locale}/events/${event.eventId}`} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-button-radius hover:bg-bg-subtle transition-colors text-sm font-semibold text-text-primary h-fit">
                            <ArrowLeft size={16} /> Quay lại chi tiết vé
                        </Link>
                    </div>

                    {/* STEPPER & COUNTDOWN */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-card-bg-elevated border border-border-default rounded-xl p-4">
                        <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                            {/* Step 1 */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-primary text-primary flex items-center justify-center font-bold text-sm">1</div>
                                <span className="text-sm font-bold text-text-primary">Chọn vé</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-border-strong mx-4"></div>
                            {/* Step 2 */}
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default text-text-secondary flex items-center justify-center font-bold text-sm">2</div>
                                <span className="text-sm font-medium text-text-secondary">Thanh toán</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-border-default mx-4"></div>
                            {/* Step 3 */}
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default text-text-secondary flex items-center justify-center font-bold text-sm">3</div>
                                <span className="text-sm font-medium text-text-secondary">Hoàn tất</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-text-secondary">Thời gian giữ vé còn lại:</span>
                            <div className="flex items-center gap-1 font-mono text-lg font-bold text-feedback-error-text">
                                <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">{t.m1}</div>
                                <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">{t.m2}</div>
                                <span>:</span>
                                <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">{t.s1}</div>
                                <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">{t.s2}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: CHỌN VÉ */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Block: Lịch diễn đã chọn / Chọn lịch diễn */}
                        {hasSeatMap ? (
                            <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                                <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle">Chọn lịch diễn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {event.showtimes?.map((st) => {
                                        const isSoldOut = st.ticketTypes.every((t: any) => t.quantityAvailable <= 0);
                                        const isSelected = selectedShowtimeId === st.showtimeId;
                                        return (
                                            <div
                                                key={st.showtimeId}
                                                onClick={() => !isSoldOut && setSelectedShowtimeId(st.showtimeId)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-colors relative ${isSelected ? 'border-primary bg-bg-subtle/30' : 'border-border-default hover:border-border-strong'} ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-bold text-text-primary mb-1">{formatShowtimeDate(st.startDatetime)}</div>
                                                <div className="text-sm text-text-secondary">{formatTime(st.startDatetime)}</div>
                                                {isSoldOut && (
                                                    <div className="absolute top-4 right-4 bg-feedback-error-bg text-feedback-error-text text-xs px-2 py-0.5 rounded font-semibold">Sold out</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-text-muted mt-4">Vui lòng chọn một lịch diễn trước khi chọn ghế.</p>
                            </div>
                        ) : (
                            <div className="bg-bg-subtle/50 border border-primary/20 rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-primary/10">
                                    <h3 className="text-lg font-bold text-text-primary">Lịch diễn đã chọn</h3>
                                    <span 
                                        className="text-xs font-semibold px-3 py-1 rounded-full border border-border-strong bg-bg-surface text-text-secondary cursor-pointer hover:bg-bg-subtle transition-colors"
                                        onClick={() => {
                                            setTempShowtimeId(selectedShowtimeId);
                                            setExpandedShowtimeId(selectedShowtimeId);
                                            setIsChangeShowtimeModalOpen(true);
                                        }}
                                    >
                                        Đổi lịch diễn
                                    </span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-bold text-text-primary text-base mb-1">
                                            {formatShowtimeDate(activeShowtime?.startDatetime)}
                                        </div>
                                        <div className="text-sm text-text-secondary mb-4">
                                            {formatTime(activeShowtime?.startDatetime)} - {formatTime(activeShowtime?.endDatetime)}
                                        </div>

                                        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                                            <div className="text-text-secondary">Thời lượng dự kiến:</div>
                                            <div className="text-text-primary">{getDuration(activeShowtime?.startDatetime, activeShowtime?.endDatetime)}</div>

                                            <div className="text-text-secondary">Địa điểm:</div>
                                            <div className="text-text-primary">{activeShowtime?.venue || event.venue}</div>

                                            <div className="text-text-secondary">Địa chỉ:</div>
                                            <div className="text-text-primary">{activeShowtime?.address || event.address}</div>

                                            <div className="text-text-secondary">Khu vực check-in:</div>
                                            <div className="text-text-primary">Sảnh chính tầng 1</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Block: Chọn vé / Sơ đồ ghế */}
                        <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                            <h3 className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-subtle">Chọn vé</h3>

                            {hasSeatMap ? (
                                <div className="flex flex-col items-center">
                                    <div className="flex gap-4 mb-8">
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-border-strong"></div><span className="text-xs text-text-secondary">Đang trống</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary border border-primary"></div><span className="text-xs text-text-secondary">Đang chọn</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-text-muted"></div><span className="text-xs text-text-secondary">Đã bán</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-feedback-error-text"></div><span className="text-xs text-text-secondary">Đã khóa</span></div>
                                    </div>

                                    {/* MOCK SEAT MAP TRAPEZOID SHAPE */}
                                    <div className="w-full max-w-lg aspect-[4/3] bg-bg-surface border border-border-strong rounded-xl flex items-center justify-center p-8 flex-col gap-6 relative overflow-hidden">
                                        {/* Stage */}
                                        <div className="w-full h-12 bg-border-subtle border border-border-strong rounded shadow flex items-center justify-center text-text-muted font-bold tracking-widest text-sm mb-4">SÂN KHẤU</div>
                                        {/* Tiers */}
                                        <div className="flex gap-2">
                                            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                        </div>
                                        <div className="flex gap-2">
                                            {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                        </div>
                                        <div className="flex gap-2">
                                            {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-border-strong hover:bg-primary cursor-pointer"></div>)}
                                        </div>
                                        <div className="flex gap-2 opacity-50">
                                            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-text-muted"></div>)}
                                        </div>

                                        <div className="absolute left-4 top-1/2 flex flex-col gap-2">
                                            <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">+</div>
                                            <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">-</div>
                                            <div className="w-6 h-6 border bg-bg-page flex items-center justify-center text-xs">O</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-muted mt-4 text-center">Click vào ghế để chọn. Bạn có thể chọn tối đa 4 ghế.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ticketOptions.map((ticket: any) => {
                                        const isSoldOut = ticket.quantityAvailable <= 0;
                                        const quantity = selectedTickets.find(t => t.id === ticket.ticketTypeId)?.quantity || 0;

                                        return (
                                            <div key={ticket.ticketTypeId} className="border border-border-default rounded-xl p-4 bg-bg-surface">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-text-primary text-lg">{ticket.ticketTypeName}</h4>
                                                        <p className="text-xs text-text-secondary mt-1">Khu vực gần sân khấu hơn, số lượng giới hạn.</p>
                                                    </div>

                                                    {isSoldOut ? (
                                                        <div className="bg-feedback-error-bg text-feedback-error-text px-3 py-1 rounded text-sm font-semibold">Sold out</div>
                                                    ) : (
                                                        <div className="flex items-center gap-4 bg-bg-page border border-border-strong rounded p-1">
                                                            <button
                                                                className={`w-8 h-8 rounded flex items-center justify-center ${quantity === 0 ? 'text-text-muted cursor-not-allowed' : 'text-text-primary hover:bg-bg-subtle'}`}
                                                                onClick={() => handleUpdateQuantity(ticket, -1)}
                                                                disabled={quantity === 0}
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="font-semibold text-text-primary w-4 text-center">{quantity}</span>
                                                            <button
                                                                className="w-8 h-8 rounded flex items-center justify-center text-text-primary hover:bg-bg-subtle"
                                                                onClick={() => handleUpdateQuantity(ticket, 1)}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="font-bold text-feedback-warning-text text-lg mt-2">
                                                    {ticket.price.toLocaleString("vi-VN")} VND
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
                                                    <span className="text-primary font-semibold hover:underline cursor-pointer">Xem điều kiện</span>
                                                    {/* icon dropdown */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>

                        {/* Block: Lưu ý khi chọn vé */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-3">Lưu ý khi chọn vé</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                <li>Vé của bạn đang được giữ tạm trong thời gian đếm ngược</li>
                                <li>Số lượng vé tối đa phụ thuộc vào từng loại vé và quy định của sự kiện</li>
                                <li>Event này không hỗ trợ chọn ghế cụ thể; vé sẽ được xác định theo loại vé đã chọn</li>
                            </ul>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: ĐƠN HÀNG */}
                    <div className="lg:col-span-4 relative">
                        <div className="bg-payment-summary-bg-default border border-border-default rounded-xl overflow-hidden shadow-xl sticky top-24">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-text-primary mb-6">Đơn hàng của bạn</h2>

                                <div className="mb-6">
                                    <h3 className="font-bold text-text-primary text-base mb-2">{event.eventName}</h3>
                                    <p className="text-sm text-text-secondary mb-1">
                                        {/* {formatTime(activeShowtime?.startDatetime)} - {formatDate(activeShowtime?.startDatetime)} */}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        {activeShowtime?.venue || event.venue}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div className="border-t border-border-strong pt-4 mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-sm text-text-primary">Vé đã chọn</h4>
                                        {selectedTickets.length > 0 && (
                                            <button
                                                className="text-xs text-feedback-error-text hover:underline"
                                                onClick={() => setSelectedTickets([])}
                                            >
                                                Xóa tất cả
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedTickets.length === 0 ? (
                                            <p className="text-sm text-text-muted italic text-center py-4">Chưa có vé nào được chọn</p>
                                        ) : (
                                            selectedTickets.map(t => (
                                                <div key={t.id} className="bg-bg-surface border border-border-default rounded-lg p-3 flex gap-3 relative group">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-text-secondary">Loại vé:</span>
                                                            <span className="font-medium text-text-primary">{t.name}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-text-secondary">{hasSeatMap ? "Số ghế:" : "Số lượng:"}</span>
                                                            <span className="font-medium text-text-primary">{hasSeatMap ? "B02" : String(t.quantity).padStart(2, '0')}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm pt-1">
                                                            <span className="text-text-secondary">Giá:</span>
                                                            <span className="font-medium text-text-primary">{(t.price * t.quantity).toLocaleString("vi-VN")}đ</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="pt-1 text-text-muted hover:text-feedback-error-text transition-colors"
                                                        onClick={() => handleRemoveItem(t.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="border-t border-border-strong pt-4 mb-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Phí dịch vụ</span>
                                        <span className="font-medium text-text-primary text-right">{serviceFee.toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-sm text-text-secondary">Tạm tính</span>
                                        <span className="text-2xl font-bold text-text-primary text-right">
                                            {orderTotal.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={`w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm mb-3 ${selectedTickets.length === 0 ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-[#6D48D7] hover:bg-[#5b3bb8] text-white'}`}
                                    disabled={selectedTickets.length === 0}
                                    onClick={() => router.push(`/${locale}/events/${event.eventId}/payment`)}
                                >
                                    Tiếp tục thanh toán
                                </button>

                                <button
                                    className="w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm bg-bg-surface hover:bg-bg-subtle text-text-primary border border-border-strong"
                                    onClick={() => router.push(`/${locale}/events/${event.eventId}`)}
                                >
                                    Quay lại chi tiết vé
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Change Showtime Modal */}
            {isChangeShowtimeModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-200 ${isChangeShowtimeModalClosing ? 'opacity-0' : 'animate-in fade-in'}`}>
                    <div className={`bg-[#2A2359] border border-border-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl ${isChangeShowtimeModalClosing ? 'animate-thu-chai' : 'animate-quang-chai'}`}>
                        <button 
                            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors hover:bg-white/10 rounded-full p-1"
                            onClick={closeChangeShowtimeModal}
                        >
                            <X size={24} />
                        </button>
                        <div className="p-6 pb-2 text-center mt-2">
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Thay đổi lịch diễn</h3>
                            <p className="text-sm text-text-secondary">Bạn đang thay đổi suất diễn cho đơn đặt vé hiện tại.</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                            {event.showtimes?.map(st => {
                                const isExpanded = expandedShowtimeId === st.showtimeId;
                                const isTempSelected = tempShowtimeId === st.showtimeId;
                                return (
                                    <div key={st.showtimeId} className={`border rounded-xl transition-colors overflow-hidden ${isTempSelected ? 'border-primary' : 'border-border-strong bg-[#201A4A]'}`}>
                                        <div 
                                            className="p-5 flex gap-4 justify-between items-center cursor-pointer hover:bg-white/5"
                                            onClick={() => setExpandedShowtimeId(isExpanded ? null : st.showtimeId)}
                                        >
                                            <div>
                                                <div className="font-bold text-text-primary text-base">
                                                    {formatShowtimeDate(st.startDatetime)}
                                                </div>
                                                <div className="text-sm text-text-secondary mt-1">
                                                    {formatTime(st.startDatetime)} - {formatTime(st.endDatetime)}
                                                </div>
                                            </div>
                                            <div className="text-text-muted">
                                                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                            </div>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="p-5 pt-0 mt-2 flex flex-col border-t border-border-strong/50">
                                                <div className="pt-4 grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                                                    <div className="text-text-secondary">Thời lượng dự kiến:</div>
                                                    <div className="text-text-primary">{getDuration(st.startDatetime, st.endDatetime)}</div>

                                                    <div className="text-text-secondary">Địa điểm:</div>
                                                    <div className="text-text-primary">{st.venue || event.venue}</div>

                                                    <div className="text-text-secondary">Địa chỉ:</div>
                                                    <div className="text-text-primary">{st.address || event.address}</div>

                                                    <div className="text-text-secondary">Khu vực check-in:</div>
                                                    <div className="text-text-primary">Sảnh chính tầng 1</div>
                                                </div>
                                                <button 
                                                    className={`mt-6 px-6 py-2.5 rounded-button-radius text-sm font-semibold max-w-fit transition-colors shadow-sm ${isTempSelected ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-transparent hover:bg-white/10 text-text-primary border border-border-strong'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTempShowtimeId(st.showtimeId);
                                                    }}
                                                    disabled={isTempSelected}
                                                >
                                                    {isTempSelected ? 'Đang chọn' : 'Chọn lịch diễn này'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        
                        <div className="bg-[#1D1743] p-6 border-t border-[#3B3474] flex gap-4 items-center flex-col">
                            <p className="text-[#CBA853] text-sm font-medium">Khi bấm nút xác nhận đổi lịch, bạn sẽ mất các vé đã chọn ở lịch diễn hiện tại. Tiếp tục?</p>
                            <div className="flex gap-4 w-full justify-end mt-2">
                                <button 
                                    className="flex-1 py-3 bg-transparent border border-[#3B3474] text-text-secondary rounded-button-radius font-semibold hover:bg-white/5 transition-colors"
                                    onClick={closeChangeShowtimeModal}
                                >
                                    Giữ lịch hiện tại
                                </button>
                                <button 
                                    className="flex-1 py-3 bg-[#6D48D7] text-white rounded-button-radius font-semibold hover:bg-[#5b3bb8] transition-colors"
                                    onClick={() => {
                                        if (tempShowtimeId !== null && tempShowtimeId !== selectedShowtimeId) {
                                            setSelectedShowtimeId(tempShowtimeId);
                                            setSelectedTickets([]); // reset tickets
                                        }
                                        closeChangeShowtimeModal();
                                    }}
                                >
                                    Xác nhận đổi lịch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

