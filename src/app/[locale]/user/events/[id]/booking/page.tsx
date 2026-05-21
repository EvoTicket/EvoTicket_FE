"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/src/lib/axios";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle2, X, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { EventDetail } from "@/src/types/event";
import { ChangeShowtimeModal } from "@/src/components/modals/ChangeShowtimeModal";
import { useTranslations } from "next-intl";
import { Step1SelectTicket } from "@/src/components/booking/Step1SelectTicket";
import { useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";

export default function BookingPage() {
    const { locale, id } = useParams();
    const router = useRouter();
    const t = useTranslations("Booking");
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [selectedTickets, setSelectedTickets] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

    // Change showtime modal states
    const [isChangeShowtimeModalOpen, setIsChangeShowtimeModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        if (id) {
            fetchEventDetail(id as string);
        }

    }, [id, isAuthenticated, locale, router]);

    const fetchEventDetail = async (eventId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/inventory-service/api/events/${eventId}`,
                {
                    skipAuth: true
                } as any
            );

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



    const activeShowtime = event?.showtimes?.find(st => st.showtimeId === selectedShowtimeId) || event?.showtimes?.[0];

    const formatShowtimeDate = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const days = [t("day_sun"), t("day_mon"), t("day_tue"), t("day_wed"), t("day_thu"), t("day_fri"), t("day_sat")];
        const weekday = days[d.getDay()];
        return `${day}/${month}/${year} (${weekday})`;
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string | any) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getDuration = (start?: string, end?: string) => {
        if (!start || !end) return t("not_updated");
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (diffHrs > 0) parts.push(`${diffHrs} ${t("hours")}`);
        if (diffMins > 0) parts.push(`${diffMins} ${t("minutes")}`);
        return parts.length > 0 ? parts.join(" ") : t("not_updated");
    };

    const handleUpdateQuantity = (ticketType: any, delta: number) => {
        const minPurchase = ticketType.minPurchase > 0 ? ticketType.minPurchase : 1;
        const maxPurchase = ticketType.maxPurchase > 0 ? Math.min(ticketType.maxPurchase, ticketType.quantityAvailable || Infinity) : (ticketType.quantityAvailable || Infinity);

        setSelectedTickets(prev => {
            const existing = prev.find(t => t.id === ticketType.ticketTypeId);
            if (existing) {
                let newQuantity = existing.quantity + delta;
                if (delta > 0 && newQuantity > maxPurchase) {
                    newQuantity = maxPurchase;
                } else if (delta < 0 && newQuantity < minPurchase) {
                    newQuantity = 0;
                }

                if (newQuantity <= 0) {
                    return prev.filter(t => t.id !== ticketType.ticketTypeId);
                }
                return prev.map(t => t.id === ticketType.ticketTypeId ? { ...t, quantity: newQuantity } : t);
            } else if (delta > 0) {
                if (event && event.allowMultipleTicketTypesPerOrder === false && prev.length > 0) {
                    toast.warning(t('error_single_ticket_type'));
                    return prev;
                }

                const initialQuantity = Math.min(minPurchase, maxPurchase);
                if (initialQuantity > 0 && initialQuantity !== Infinity) {
                    return [...prev, { id: ticketType.ticketTypeId, name: ticketType.ticketTypeName || ticketType.typeName, price: ticketType.price, quantity: initialQuantity }];
                }
            }
            return prev;
        });
    };

    const handleRemoveItem = (id: number) => {
        setSelectedTickets(prev => prev.filter(t => t.id !== id));
    };

    // Calculate totals
    // const serviceFee = selectedTickets.length > 0 ? 2000 : 0;
    const ticketTotal = selectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    // const orderTotal = ticketTotal + serviceFee;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
            </div>
        );
    }

    if (!event) return null;

    const hasSeatMap = !!!event.hasSeatMap; // mock logic
    const ticketOptions = activeShowtime?.ticketTypes || [];


    const createOrder = async () => {


        try {
            const requestBody = {
                items: selectedTickets.map(ticket => ({
                    ticketTypeId: ticket.id,
                    qty: ticket.quantity
                }))
            };

            const response = await api.post(`/inventory-service/api/reservations/reserve`, requestBody);

            if (response.status === 200 || response.status === 201) {
                // sessionStorage.setItem('booking_tickets', JSON.stringify(selectedTickets));
                // sessionStorage.setItem('booking_event', JSON.stringify(event));
                // sessionStorage.setItem('booking_showtime', JSON.stringify(activeShowtime));
                sessionStorage.setItem('booking_session_ID', JSON.stringify(response.data.data.bookingSessionId));

                router.push(`/${locale}/user/events/${event.eventId}/payment`);
            }
        } catch (error) {
            console.error("Failed to reserve tickets", error);
        }
    }

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">

            {/* TOP HEADER TRANG ĐẶT VÊ */}
            <div className="bg-bg-page border-b border-border-default pt-6 pb-4">
                <div className="max-w-[90%] mx-auto px-4">
                    {/* BREADCRUMB */}
                    <div className="text-xs text-text-secondary flex items-center gap-2 mb-6 uppercase tracking-wider">
                        <Link href={`/${locale}/user/homepage`} className="hover:text-button-primary-bg-default transition-colors">{t("home")}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events`} className="hover:text-button-primary-bg-default transition-colors">{t("search")}</Link>
                        <span>{'>'}</span>
                        <Link href={`/${locale}/user/events/${event.eventId}`} className="hover:text-button-primary-bg-default transition-colors">{t("event_detail")}</Link>
                        <span>{'>'}</span>
                        <span className="text-button-primary-bg-default font-semibold">{t("booking_and_payment")}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary mb-2">{t("booking_title")}</h1>
                            <p className="text-sm text-text-secondary mb-1">{t("booking_subtitle")}</p>
                            <p className="text-[11px] text-text-muted">{t("booking_warning")}</p>
                        </div>
                        <Link href={`/${locale}/user/events/${event.eventId}`} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-button-radius hover:bg-bg-subtle transition-colors text-sm font-semibold text-text-primary h-fit">
                            <ArrowLeft size={16} /> {t("back_to_event")}
                        </Link>
                    </div>

                    {/* STEPPER */}
                    <div className="mt-8 bg-stepper-bg-default border border-border-default rounded-full p-4">
                        <div className="flex items-center w-full">
                            {/* Step 1 */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-stepper-border-active text-stepper-text-active flex items-center justify-center font-bold text-sm">1</div>
                                <span className="text-sm font-bold text-stepper-text-active">{t("step_1")}</span>
                            </div>
                            <div className="h-[1px] flex-1 bg-border-strong mx-4"></div>
                            {/* Step 2 */}
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default text-text-secondary flex items-center justify-center font-bold text-sm">2</div>
                                <span className="text-sm font-medium text-text-secondary">{t("step_2")}</span>
                            </div>
                            <div className="h-[1px] flex-1 bg-border-default mx-4"></div>
                            {/* Step 3 */}
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-border-default text-text-secondary flex items-center justify-center font-bold text-sm">3</div>
                                <span className="text-sm font-medium text-text-secondary">{t("step_3")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[90%] mx-auto px-4 py-8 w-full flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Step1SelectTicket
                        event={event}
                        activeShowtime={activeShowtime}
                        selectedShowtimeId={selectedShowtimeId}
                        selectedTickets={selectedTickets}
                        hasSeatMap={hasSeatMap}
                        ticketOptions={ticketOptions}
                        orderTotal={ticketTotal}
                        locale={locale as string}
                        setIsChangeShowtimeModalOpen={setIsChangeShowtimeModalOpen}
                        setSelectedShowtimeId={setSelectedShowtimeId}
                        handleUpdateQuantity={handleUpdateQuantity}
                        handleRemoveItem={handleRemoveItem}
                        setSelectedTickets={setSelectedTickets}
                        formatShowtimeDate={formatShowtimeDate}
                        formatTime={formatTime}
                        formatDate={formatDate}
                        getDuration={getDuration}
                        onNext={() => createOrder()}
                        onBack={() => router.push(`/${locale}/user/events/${event.eventId}`)}
                    />
                </div>
            </div>

            {/* Change Showtime Modal */}
            <ChangeShowtimeModal
                isOpen={isChangeShowtimeModalOpen}
                onClose={() => setIsChangeShowtimeModalOpen(false)}
                event={event}
                selectedShowtimeId={selectedShowtimeId}
                onConfirm={(newShowtimeId) => {
                    setSelectedShowtimeId(newShowtimeId);
                    setSelectedTickets([]);
                }}
            />



        </div>
    );
}


