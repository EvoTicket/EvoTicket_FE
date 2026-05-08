"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { Plus, LayoutDashboard, FolderOpen, FileText, Settings, LogOut, Calendar, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/axios";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectIsOrganization } from "@/src/store/slices/authSlice";
import { OrganizerSidebar } from "@/src/components/organizer/OrganizerSidebar";
import { OrganizerHeader } from "@/src/components/organizer/OrganizerHeader";

// Interfaces based on API response
interface AddressInfo {
    wardCode: number;
    wardName: string;
    provinceCode: number;
    provinceName: string;
    fullAddress: string;
}

interface OrgClientResponse {
    id: number;
    organizationName: string;
    logoUrl: string;
    addressInfo: AddressInfo;
    businessPhone: string;
    businessEmail: string;
}

interface TicketType {
    ticketTypeId: number;
    typeName: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    ticketTypeStatus: string;
}

interface Event {
    eventId: number;
    eventName: string;
    orgClientResponse: OrgClientResponse;
    description: string;
    venue: string;
    address: string;
    startDatetime: string;
    endDatetime: string;
    eventStatus: "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";
    eventType: string;
    bannerImage: string | null;
    thumbnailImage: string | null;
    totalSeats: number;
    organizerId: number;
    isFeatured: boolean;
    categoryName: string;
    ticketTypes: TicketType[];
}

export default function OrganizerCenterPage() {
    const router = useRouter();
    const { locale } = useParams();
    const [organizationName, setOrganizationName] = useState<string>("");
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isOrganization = useSelector(selectIsOrganization);

    useEffect(() => {
        if (!isOrganization) {
            router.push(`/${locale}/organizer/register`);
            return;
        }

        setOrganizationName("Organizer Center");
        fetchMyEvents();
    }, [router, locale, isOrganization]);

    const fetchMyEvents = async () => {
        const token = Cookies.get("token");
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await api.get("/inventory-service/api/events/my", {
                params: {
                    page: 1,
                    size: 10,
                    sortBy: "createdAt",
                    sortDirection: "DESC",
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.content) {
                setEvents(response.data.content);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PUBLISHED": return "bg-green-100 text-green-700 border-green-200";
            case "DRAFT": return "bg-gray-100 text-gray-700 border-gray-200";
            case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
            case "COMPLETED": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-bg-surface flex">
            <OrganizerSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-[280px]">
                <OrganizerHeader />

                {/* Page Title & Description */}
                <div className="px-8 pt-8 pb-2">
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Sự kiện của tôi</h2>
                    <p className="text-sm text-text-muted">Quản lý toàn bộ sự kiện của tổ chức, từ nháp đến đã kết thúc</p>
                </div>

                {/* Content Area */}
                <main className="flex-1 px-8 pb-8 bg-bg-surface">
                    <div className="max-w-7xl mx-auto">

                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                        ) : events.length === 0 ? (
                            /* Empty State */
                            <div className="bg-bg-page border-2 border-dashed border-border-default rounded-xl p-16 text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FolderOpen size={64} className="text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-text-primary mb-3">
                                    Chưa có sự kiện nào
                                </h3>
                                <p className="text-text-muted mb-8 max-w-md mx-auto">
                                    Bắt đầu tạo sự kiện đầu tiên của bạn và tiếp cận hàng ngàn khách hàng tiềm năng!
                                </p>
                                <Link href={`/${locale}/organizer/events/create`} className="inline-flex items-center gap-2 bg-button-primary-bg-defaul hover:bg-button-primary-bg-defaul-hovertext-button-primary-text-default px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105">
                                    <Plus size={22} />
                                    Tạo sự kiện đầu tiên
                                </Link>
                            </div>
                        ) : (
                            /* Events Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <Link
                                        href={`/${locale}/user/events/${event.eventId}`}
                                        key={event.eventId}
                                        className="group bg-bg-page border border-border-default rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col"
                                    >
                                        {/* Image Cover */}
                                        <div className="relative h-48 w-full bg-gray-200">
                                            {event.bannerImage || event.thumbnailImage ? (
                                                <Image
                                                    src={event.bannerImage || event.thumbnailImage || ""}
                                                    alt={event.eventName}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 bg-secondary">
                                                    <FileText size={48} />
                                                </div>
                                            )}
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.eventStatus)} shadow-sm`}>
                                                {event.eventStatus}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {event.eventName}
                                            </h3>

                                            <div className="space-y-2 mt-auto">
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <Calendar size={16} className="text-primary" />
                                                    <span>{formatDate(event.startDatetime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    <MapPin size={16} className="text-primary" />
                                                    <span className="truncate">{event.venue || event.address || "Online"}</span>
                                                </div>
                                                {event.ticketTypes && event.ticketTypes.length > 0 && (
                                                    <div className="pt-3 mt-3 border-t border-border-default flex items-center justify-between">
                                                        <span className="text-xs text-text-muted text-nowrap">Giá từ:</span>
                                                        <span className="font-bold text-primary">
                                                            {Math.min(...event.ticketTypes.map(t => t.price)).toLocaleString('vi-VN')} đ
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Stats Cards (Hidden when empty, shown when has data for better UX) */}
                        {events.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-8">
                                <div className="bg-bg-page border border-border-default rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-text-muted text-sm">Tổng sự kiện</span>
                                        <LayoutDashboard size={20} className="text-primary" />
                                    </div>
                                    <p className="text-3xl font-bold text-text-primary">{events.length}</p>
                                </div>
                                <div className="bg-bg-page border border-border-default rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-text-muted text-sm">Tổng vé bán ra</span>
                                        <FileText size={20} className="text-accent" />
                                    </div>
                                    {/* Demo calculation */}
                                    <p className="text-3xl font-bold text-text-primary">
                                        {events.reduce((acc, curr) => acc + (curr.ticketTypes ? curr.ticketTypes.reduce((tAcc, tCurr) => tAcc + tCurr.quantitySold, 0) : 0), 0)}
                                    </p>
                                </div>
                                <div className="bg-bg-page border border-border-default rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-text-muted text-sm">Doanh thu tạm tính</span>
                                        <FolderOpen size={20} className="text-success" />
                                    </div>
                                    <p className="text-3xl font-bold text-text-primary">
                                        {events.reduce((acc, curr) => acc + (curr.ticketTypes ? curr.ticketTypes.reduce((tAcc, tCurr) => tAcc + (tCurr.quantitySold * tCurr.price), 0) : 0), 0).toLocaleString('vi-VN')} đ
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

