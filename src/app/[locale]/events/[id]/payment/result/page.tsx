"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { ArrowLeft, Check, X, Clock, Pause, Loader2 } from "lucide-react";
import { EventDetail } from "@/src/types/event";

function PaymentResultContent() {
    const { locale, id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Status can be: 'success', 'pending', 'failed', 'expired', 'cancelled'
    const status = searchParams.get("status") || "success"; 

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEventDetail(id as string);
        }
    }, [id]);

    const fetchEventDetail = async (eventId: string) => {
        setLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/inventory-service/api/events/${eventId}`, { headers });
            if (response.data && response.data.data) {
                setEvent(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch event detail", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) return null;

    const renderIcon = () => {
        switch (status) {
            case "success":
                return <div className="w-16 h-16 rounded-full bg-[#82e1a3] flex items-center justify-center mb-6"><Check size={40} className="text-[#104825] stroke-[3]" /></div>;
            case "pending":
                return <div className="w-16 h-16 flex items-center justify-center mb-6"><Loader2 size={64} className="text-[#72aef8] animate-spin stroke-1" /></div>;
            case "failed":
                return <div className="w-16 h-16 rounded-full bg-[#f88585] flex items-center justify-center mb-6"><X size={40} className="text-[#6b1e1e] stroke-[3]" /></div>;
            case "expired":
                return <div className="w-16 h-16 rounded-full bg-[#f6c445] flex items-center justify-center mb-6"><Clock size={40} className="text-[#64490f] stroke-[3]" /></div>;
            case "cancelled":
                return <div className="w-16 h-16 rounded-full bg-[#f6c445] flex items-center justify-center mb-6"><Pause size={32} className="text-[#64490f] fill-current" /></div>;
            default:
                return null;
        }
    };

    const renderContent = () => {
        switch (status) {
            case "success":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Thanh toán thành công</h2>
                        <p className="text-sm text-text-secondary mb-8">Đơn hàng của bạn đã được xác nhận. Vé sẽ xuất hiện trong Ví của bạn ngay khi hệ thống hoàn tất phát hành.</p>
                        
                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">#EVO-88291.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">Momo</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã giao dịch</span>
                                <span className="font-bold text-text-primary">123acd45679</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời gian thanh toán thành công</span>
                                <span className="font-bold text-text-primary">20:14 - 15/09/2025</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Email nhận vé / email xác nhận</span>
                                <span className="font-bold text-text-primary text-right max-w-[200px] break-all">phuc.nguyenlehoang707@hcmut.edu.vn</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            NFT ticket đang được phát hành ở nền. Bạn vẫn có thể theo dõi trạng thái trong Ví của tôi.
                        </div>

                        <div className="w-full space-y-3">
                            <button className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors">Xem chi tiết vé</button>
                            <button className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors">Xem danh sách vé</button>
                            <button 
                                className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/user/homepage`)}
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </>
                );

            case "pending":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Đang xác nhận thanh toán</h2>
                        <p className="text-sm text-text-secondary mb-8">Chúng tôi đang kiểm tra kết quả từ cổng thanh toán. Vui lòng không đóng trang trong lúc hệ thống xác nhận giao dịch.</p>
                        
                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">#EVO-88291.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">Momo</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã giao dịch</span>
                                <span className="font-bold text-text-primary">123acd45679</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời gian ghi nhận giao dịch</span>
                                <span className="font-bold text-text-primary">20:14 - 15/09/2025</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            Hệ thống sẽ tự động cập nhật khi có kết quả.
                        </div>

                        <div className="w-full space-y-3">
                            <button className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors">Làm mới trạng thái</button>
                            <button className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors">Xem lịch sử đơn hàng</button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">Liên hệ hỗ trợ</button>
                        </div>
                    </>
                );

            case "failed":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Thanh toán không thành công</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">Giao dịch của bạn chưa được hoàn tất. Bạn có thể thử lại bằng phương thức hiện tại hoặc chọn phương thức khác.</p>
                        
                        <div className="w-full text-sm mb-8 border-t border-b border-border-strong py-6 text-left flex gap-12">
                            <div className="flex-1">
                                <span className="font-bold text-text-primary block mb-2">Nguyên nhân có thể</span>
                                <ul className="list-disc pl-5 text-text-secondary space-y-1">
                                    <li>giao dịch bị từ chối,</li>
                                    <li>hết thời gian xác thực,</li>
                                    <li>hoặc có lỗi xác minh từ ngân hàng.</li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                <span className="font-bold text-text-primary block mb-2">Mã tham chiếu lỗi</span>
                                <ul className="list-disc pl-5 text-text-secondary space-y-1">
                                    <li>404</li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-full bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8] mb-8 text-left">
                            Hệ thống sẽ tự động cập nhật khi có kết quả.
                        </div>

                        <div className="w-full space-y-3">
                            <button className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors">Thử lại thanh toán</button>
                            <button 
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events/${event.eventId}/booking`)}
                            >
                                Quay lại chọn vé
                            </button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">Chọn phương thức khác</button>
                        </div>

                        <div className="w-full bg-[#3d2a13] border border-[#5c401d] rounded-lg p-4 text-sm text-[#d49942] mt-6 text-left">
                            <span className="font-bold flex items-center gap-2 mb-1"><Clock size={16} /> Lưu ý</span>
                            Nếu tài khoản đã bị trừ tiền nhưng trạng thái vẫn báo thất bại, vui lòng kiểm tra lịch sử đơn hàng hoặc liên hệ hỗ trợ.
                        </div>
                    </>
                );

            case "expired":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Đơn hàng đã hết hạn</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">Thời gian giữ vé đã kết thúc trước khi giao dịch được xác nhận. Vé/ghế đã được giải phóng và bạn cần chọn lại để tiếp tục.</p>
                        
                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">EVT-2025-0915-00128</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">VNPay</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời điểm bắt đầu giữ vé</span>
                                <span className="font-bold text-text-primary">10:14 - 15/09/2025</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời điểm hết hạn</span>
                                <span className="font-bold text-text-primary">20:14 - 15/09/2025</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events/${event.eventId}/booking`)}
                            >
                                Chọn vé lại
                            </button>
                            <button 
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events`)}
                            >
                                Xem sự kiện khác
                            </button>
                            <button 
                                className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events/${event.eventId}`)}
                            >
                                Về trang sự kiện
                            </button>
                        </div>
                        
                        <div className="w-full bg-[#3d2a13] border border-[#5c401d] rounded-lg p-4 text-sm text-[#d49942] mt-6 text-left">
                            <span className="font-bold flex items-center gap-2 mb-1"><Clock size={16} /> Lưu ý</span>
                            Nếu bạn đã thanh toán thành công tại ngân hàng nhưng màn hình này vẫn xuất hiện, vui lòng liên hệ hỗ trợ kèm mã đơn hàng.
                        </div>
                    </>
                );

            case "cancelled":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Bạn đã hủy thanh toán</h2>
                        <p className="text-sm text-text-secondary mb-8 text-left w-full">Giao dịch chưa được thực hiện. Bạn vẫn có thể quay lại để tiếp tục thanh toán nếu thời gian giữ vé còn hiệu lực.</p>
                        
                        <div className="w-full space-y-4 text-sm mb-8 border-t border-b border-border-strong py-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">EVT-2025-0915-00128</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">VNPay</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời điểm hủy</span>
                                <span className="font-bold text-text-primary">10:14 - 15/09/2025</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                className="w-full py-3 bg-[#6D48D7] hover:bg-[#5b3bb8] text-white rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events/${event.eventId}/payment`)}
                            >
                                Tiếp tục thanh toán
                            </button>
                            <button 
                                className="w-full py-3 bg-bg-surface border border-border-default hover:bg-bg-subtle text-text-primary rounded-button-radius font-semibold transition-colors"
                                onClick={() => router.push(`/${locale}/events/${event.eventId}/booking`)}
                            >
                                Quay lại chọn vé
                            </button>
                            <button className="w-full py-3 bg-transparent border border-border-strong hover:bg-bg-subtle text-text-secondary rounded-button-radius font-semibold transition-colors">
                                Chọn phương thức khác
                            </button>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            <Header />

            {/* TOP HEADER */}
            <div className="bg-bg-page border-b border-border-default pt-6 pb-4">
                <div className="max-w-7xl mx-auto px-4">
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

                    {/* STEPPER */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-card-bg-elevated border border-border-default rounded-xl p-4">
                        <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                            {/* Step 1 - Done */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f] flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-text-primary">Chọn vé</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-[#2bad7f] mx-4 opacity-50"></div>
                            {/* Step 2 - Done */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f] flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-text-primary">Thanh toán</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-[#2bad7f] mx-4 opacity-50"></div>
                            {/* Step 3 - Active */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-primary text-primary flex items-center justify-center font-bold text-sm">3</div>
                                <span className="text-sm font-bold text-text-primary">Hoàn tất</span>
                            </div>
                        </div>

                        {/* Only show timer if not success or expired, adjust based on real logic, here just mocking disabled state */}
                        {status !== 'success' && status !== 'expired' && status !== 'failed' && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-text-secondary">Thời gian giữ vé còn lại:</span>
                                <div className="flex items-center gap-1 font-mono text-lg font-bold text-feedback-error-text">
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">0</div>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">9</div>
                                    <span>:</span>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">0</div>
                                    <div className="w-8 py-1 bg-bg-surface border border-border-strong rounded flex justify-center items-center">9</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex justify-center">
                <div className="w-full max-w-2xl bg-card-bg-elevated border border-border-default rounded-xl shadow-xl flex flex-col items-center text-center p-10">
                    {renderIcon()}
                    {renderContent()}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}
