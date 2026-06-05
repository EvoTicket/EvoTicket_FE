"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Calendar, MapPin, Trash2, FolderOpen, ArrowRight, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import api from "@/src/lib/axios";
import { useAppSelector } from "@/src/store/hooks";
import { selectIsAuthenticated } from "@/src/store/slices/authSlice";
import { UserFavorite } from "@/src/types/event";

export default function FavoritesPage() {
    const { locale } = useParams();
    const router = useRouter();
    const te = useTranslations("EventDetail");
    const tb = useTranslations("Booking");

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const { user } = useAppSelector((state) => state.auth);

    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get("/inventory-service/api/favorites", {
                params: {
                    userId: user.id,
                    page: 1,
                    size: 100
                }
            });
            if (response.data && response.data.content) {
                setFavorites(response.data.content);
            }
        } catch (error) {
            console.error("Failed to fetch favorites", error);
            toast.error("Không thể tải danh sách sự kiện yêu thích.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/${locale}/auth/login?callbackUrl=/${locale}/user/favorites`);
            return;
        }
        void fetchFavorites();
    }, [isAuthenticated, user]);

    const handleRemoveFavorite = async (e: React.MouseEvent, eventId: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.delete("/inventory-service/api/favorites", {
                params: { eventId }
            });
            toast.success(te("remove_favorite_success"));
            setFavorites(favorites.filter(fav => fav.eventId !== eventId));
        } catch (error) {
            console.error("Failed to remove favorite", error);
            toast.error("Không thể bỏ yêu thích sự kiện.");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(locale === 'vi' ? "vi-VN" : "en-US", {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString(locale === 'vi' ? "vi-VN" : "en-US", {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-page">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-button-primary-bg-default"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page py-10">
            <div className="max-w-[90%] mx-auto px-4">
                
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-default pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
                            {te("my_favorite_events")}
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            {locale === 'vi' 
                                ? `Bạn đang có ${favorites.length} sự kiện được lưu trong danh sách yêu thích.` 
                                : `You have ${favorites.length} events saved in your favorite list.`
                            }
                        </p>
                    </div>
                    <Link
                        href={`/${locale}/user/events`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-button-secondary-bg-default text-text-primary hover:bg-border-default transition-colors rounded-ds-lg text-sm font-semibold border border-border-default"
                    >
                        <span>{te("browse_events_btn")}</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Content Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {favorites.map((fav) => (
                            <div 
                                key={fav.id} 
                                className="group relative bg-card-bg-default border border-border-default rounded-ds-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Banner Image */}
                                <div className="aspect-[4/3] bg-bg-page relative overflow-hidden shrink-0">
                                    {fav.eventBannerImage ? (
                                        <Image
                                            src={fav.eventBannerImage}
                                            alt={fav.eventName}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    
                                    {/* Quick Remove Heart Button overlay */}
                                    <button
                                        onClick={(e) => handleRemoveFavorite(e, fav.eventId)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-rose-500 hover:scale-110 transition-all shadow-sm cursor-pointer z-10"
                                        title={locale === 'vi' ? "Xóa khỏi yêu thích" : "Remove from favorites"}
                                    >
                                        <Trash2 size={16} className="text-white hover:text-red-400" />
                                    </button>
                                </div>

                                {/* Event Details */}
                                <div className="p-4 flex flex-col flex-1 justify-between">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-button-primary-bg-default transition-colors text-base">
                                            <Link href={`/${locale}/user/events/${fav.eventId}`} className="outline-none">
                                                {fav.eventName}
                                            </Link>
                                        </h3>
                                        
                                        <div className="text-[13px] text-text-secondary flex items-center gap-1.5">
                                            <Calendar size={14} className="shrink-0 text-text-muted" />
                                            <span className="line-clamp-1">
                                                {formatTime(fav.eventStartDate)} - {formatDate(fav.eventStartDate)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-[13px] text-text-secondary flex items-center gap-1.5">
                                            <MapPin size={14} className="shrink-0 text-text-muted" />
                                            <span className="line-clamp-1">{fav.eventVenue || fav.eventAddress}</span>
                                        </div>
                                    </div>

                                    {/* Card Footer / Price & Details Link */}
                                    <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center shrink-0">
                                        <span className="text-sm font-black text-feedback-warning-text">
                                            {fav.minPrice && fav.minPrice > 0 
                                                ? `${fav.minPrice.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} VND`
                                                : te("free")
                                            }
                                        </span>
                                        <Link 
                                            href={`/${locale}/user/events/${fav.eventId}`} 
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            {locale === 'vi' ? "Xem chi tiết" : "View details"}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 bg-card-bg-default border border-border-default rounded-ds-2xl p-6 text-center max-w-lg mx-auto shadow-sm">
                        <div className="bg-bg-page text-text-muted p-5 rounded-full mb-6">
                            <FolderOpen size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary mb-2">
                            {te("no_favorite_events")}
                        </h2>
                        <p className="text-text-secondary text-sm mb-6 max-w-sm">
                            {locale === 'vi' 
                                ? "Lưu lại những sự kiện bạn yêu thích để dễ dàng theo dõi và không bỏ lỡ cơ hội đặt vé." 
                                : "Save the events you love to easily track them and never miss a ticket purchase opportunity."
                            }
                        </p>
                        <Link
                            href={`/${locale}/user/events`}
                            className="px-6 py-2.5 bg-button-primary-bg-default hover:bg-button-primary-bg-hover text-button-primary-text-default font-semibold rounded-ds-lg text-sm shadow-sm transition-all"
                        >
                            {te("browse_events_btn")}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
