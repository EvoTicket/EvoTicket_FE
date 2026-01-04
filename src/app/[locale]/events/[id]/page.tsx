"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import {
    MapPin, Calendar, Clock, User, Star, Image as ImageIcon,
    Send, Share2, Heart, Ticket, Phone, Mail, ChevronLeft
} from "lucide-react";
import { decodeJWT } from "@/src/lib/jwt";

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import("@/src/components/Map"), {
    ssr: false,
    loading: () => <div className="h-80 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Đang tải bản đồ...</div>
});

// --- Interfaces ---
interface TicketType {
    ticketTypeId: number;
    typeName: string;
    description: string;
    price: number;
    quantityAvailable: number;
    quantitySold: number;
    saleStartDate: string;
    saleEndDate: string;
}

interface OrganizationInfo {
    id: number;
    organizationName: string;
    logoUrl: string;
    businessPhone: string;
    businessEmail: string;
    addressInfo: {
        fullAddress: string;
    };
}

interface Review {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    images: string[] | null;
    createdAt: string;
    // Sẽ update thêm user info nếu API trả về, hiện tại API review mẫu chưa thấy user info chi tiết
}

interface EventDetail {
    eventId: number;
    eventName: string;
    description: string;
    venue: string;
    address: string;
    startDatetime: string;
    endDatetime: string;
    eventStatus: string;
    eventType: string;
    bannerImage: string | null;
    thumbnailImage: string | null;
    orgClientResponse: OrganizationInfo;
    ticketTypes: TicketType[];
    reviews: Review[];
    latitude?: number;
    longitude?: number;
}

export default function EventDetailPage() {
    const { locale, id } = useParams();
    const router = useRouter();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Review State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewImages, setReviewImages] = useState<File[]>([]);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        // Check auth
        const token = Cookies.get("token");
        setIsAuthenticated(!!token);

        if (id) {
            fetchEventDetail(id as string);
        }
    }, [id]);

    const fetchEventDetail = async (eventId: string) => {
        setLoading(true);
        try {
            // Dùng endpoint public nếu có, hoặc endpoint authenticated
            // Theo curl user đưa: /inventory-service/api/events/1 (GET)
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await api.get(`/inventory-service/api/events/${eventId}`, { headers });

            if (response.data && response.data.data) {
                setEvent(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch event detail", error);
            toast.error("Không thể tải thông tin sự kiện");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setReviewImages(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setReviewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.info("Vui lòng đăng nhập để đánh giá");
            router.push(`/${locale}/auth/login?redirect=events/${id}`);
            return;
        }

        if (!comment.trim()) {
            toast.warning("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setSubmittingReview(true);
        const token = Cookies.get("token");

        try {
            const formData = new FormData();
            // API yêu cầu files là form-data
            reviewImages.forEach((file) => {
                formData.append('files', file);
            });

            // API yêu cầu eventId, comment, rating qua Query Params theo như description
            // Tuy nhiên axios params sẽ đưa vào query string
            await api.post("/inventory-service/api/reviews", formData, {
                params: {
                    eventId: id,
                    comment: comment,
                    rating: rating
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });

            toast.success("Đánh giá của bạn đã được gửi!");
            // Reset form
            setComment("");
            setRating(5);
            setReviewImages([]);
            setImagePreviews([]);

            // Refresh event data to show new review
            if (id) fetchEventDetail(id as string);

        } catch (error) {
            console.error("Failed to submit review", error);
            toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
                <h2 className="text-2xl font-bold text-txt-primary">Không tìm thấy sự kiện</h2>
                <Link href={`/${locale}/user/homepage`} className="text-primary hover:underline">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface pb-20">
            {/* 1. Header & Breadcrumb */}
            <div className="bg-main border-b border-border sticky top-0 z-10 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-txt-secondary hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span>Quay lại</span>
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-secondary rounded-full transition-colors text-txt-secondary">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 hover:bg-secondary rounded-full transition-colors text-txt-secondary">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Banner & Title */}
                        <div className="space-y-6">
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                                {event.bannerImage ? (
                                    <Image
                                        src={event.bannerImage}
                                        alt={event.eventName}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <ImageIcon size={64} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                                    {event.eventType}
                                </div>
                            </div>

                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-txt-primary mb-4 leading-tight">
                                    {event.eventName}
                                </h1>

                                <div className="flex flex-wrap gap-4 text-txt-secondary">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-primary" />
                                        <span>{formatDate(event.startDatetime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-primary" />
                                        <span>{event.venue || "Online"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-main border border-border rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-txt-primary mb-4">Giới thiệu sự kiện</h2>
                            <div className="prose prose-sm max-w-none text-txt-secondary whitespace-pre-line">
                                {event.description}
                            </div>
                        </div>

                        {/* Map Section - Only show if coordinates exist and are non-zero */}
                        {(event.latitude && event.longitude && (event.latitude !== 0 || event.longitude !== 0)) && (
                            <div className="bg-main border border-border rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-txt-primary mb-4 flex items-center gap-2">
                                    <MapPin className="text-primary" />
                                    Bản đồ địa điểm
                                </h2>
                                <div className="h-80 w-full rounded-xl overflow-hidden shadow-inner border border-border z-0 relative">
                                    <Map
                                        pos={[event.latitude, event.longitude]}
                                        popupText={event.venue || event.address}
                                    />
                                </div>
                                <p className="mt-3 text-sm text-txt-secondary flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    {event.address || event.venue}
                                </p>
                            </div>
                        )}


                        {/* Reviews Section */}
                        <div className="bg-main border border-border rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                                    <Star className="fill-yellow-400 text-yellow-400" />
                                    Đánh giá & Bình luận
                                    <span className="text-sm font-normal text-txt-muted ml-2">({event.reviews.length})</span>
                                </h2>
                            </div>

                            {/* Review List */}
                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {event.reviews.length === 0 ? (
                                    <div className="text-center py-8 text-txt-muted italic">
                                        Chưa có đánh giá nào. Hãy là người đầu tiên!
                                    </div>
                                ) : (
                                    event.reviews.map((review) => (
                                        <div key={review.id} className="bg-surface rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        U
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-txt-primary">User #{review.userId}</div>
                                                        <div className="text-xs text-txt-muted">{formatDate(review.createdAt)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                    <span className="font-bold text-yellow-600">{review.rating}</span>
                                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                </div>
                                            </div>

                                            <div className="text-txt-primary pl-14">
                                                {review.comment}
                                            </div>

                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 pl-14 overflow-x-auto pb-2">
                                                    {review.images.map((img, idx) => (
                                                        <div key={idx} className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                                                            <Image src={img} alt="review" fill className="object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Review Form */}
                            <div className="border-t border-border pt-6 mt-6">
                                <h3 className="font-semibold text-txt-primary mb-4">Viết đánh giá của bạn</h3>
                                {isAuthenticated ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        {/* Rating Stars */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-txt-secondary mr-2">Chất lượng:</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={28}
                                                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Comment Area */}
                                        <div className="relative">
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                                                className="w-full bg-surface border border-border rounded-lg p-4 text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                                            />

                                            {/* Image Upload Button */}
                                            <div className="absolute bottom-3 right-3">
                                                <input
                                                    type="file"
                                                    id="review-images"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="review-images"
                                                    className="cursor-pointer p-2 hover:bg-main rounded-full text-txt-secondary hover:text-primary transition-colors inline-block"
                                                    title="Thêm ảnh"
                                                >
                                                    <ImageIcon size={20} />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {imagePreviews.map((src, idx) => (
                                                    <div key={idx} className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border border-border group">
                                                        <Image src={src} alt="preview" fill className="object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="sr-only">Xóa</span>
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submittingReview || !comment.trim()}
                                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {submittingReview ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <Send size={18} />
                                            )}
                                            Gửi đánh giá
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-surface rounded-lg p-6 text-center border border-border">
                                        <p className="text-txt-secondary mb-3">Bạn cần đăng nhập để gửi đánh giá</p>
                                        <Link
                                            href={`/${locale}/auth/login?redirect=events/${id}`}
                                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover inline-block"
                                        >
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sidebar Info */}
                    <div className="space-y-6">

                        {/* Organizer Card */}
                        <div className="bg-main border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-txt-muted uppercase tracking-wider mb-4">Ban tổ chức</h3>
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20">
                                    <Image
                                        src={event.orgClientResponse.logoUrl || "/placeholder-avatar.png"}
                                        alt={event.orgClientResponse.organizationName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-txt-primary">
                                        {event.orgClientResponse.organizationName}
                                    </h4>
                                    <p className="text-sm text-txt-muted mt-1">{event.orgClientResponse.businessEmail}</p>
                                </div>
                                <div className="w-full pt-4 border-t border-border mt-2 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-txt-secondary">
                                        <MapPin size={16} />
                                        <span className="text-left truncate">{event.orgClientResponse.addressInfo.fullAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-txt-secondary">
                                        <Phone size={16} />
                                        <span>{event.orgClientResponse.businessPhone}</span>
                                    </div>
                                </div>
                                <button className="w-full py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors text-sm">
                                    Xem hồ sơ
                                </button>
                            </div>
                        </div>

                        {/* Ticket Info */}
                        <div className="bg-main border border-border rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-txt-primary mb-4 flex items-center gap-2">
                                <Ticket className="text-primary" />
                                Thông tin vé
                            </h3>

                            <div className="space-y-4">
                                {event.ticketTypes.map((ticket) => (
                                    <div key={ticket.ticketTypeId} className="p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-txt-primary">{ticket.typeName}</span>
                                            <span className="font-bold text-primary">
                                                {ticket.price.toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>
                                        <p className="text-xs text-txt-muted mb-2 line-clamp-2">{ticket.description}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className={`px-2 py-0.5 rounded-full ${ticket.quantityAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {ticket.quantityAvailable > 0 ? 'Còn vé' : 'Hết vé'}
                                            </span>
                                            <span className="text-txt-muted">{ticket.quantitySold} đã bán</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]">
                                Mua vé ngay
                            </button>
                            <p className="text-xs text-center text-txt-muted mt-3">
                                Được bảo đảm bởi EvoTicket
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
