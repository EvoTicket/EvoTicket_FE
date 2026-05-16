"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, Check, X, Clock, Pause, Loader2, AlertCircle } from "lucide-react";

export default function ResalePaymentStatusPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const locale = params?.locale || "vi";
    const listingId = params?.id || "LST-20260614-0061";
    
    // Allow toggle via URL ?state=... or local state
    const initialState = searchParams?.get("state") || "success";
    const [status, setStatus] = useState(initialState);
    
    // Update local state if URL changes
    useEffect(() => {
        const urlState = searchParams?.get("state");
        if (urlState && ['success', 'pending', 'failed', 'expired', 'cancelled'].includes(urlState)) {
             setStatus(urlState);
        }
    }, [searchParams]);

    // Mock data
    const orderData = {
        orderCode: "EVT-2025-0915-00128",
        listingCode: "#23rew4321",
        paymentMethod: "VNPay",
        transactionId: "123acd45679",
        timeSuccess: "20:14 - 15/09/2025",
        timeStartHold: "10:14 - 15/09/2025",
        timeExpired: "20:14 - 15/09/2025",
        email: "nguyenlehoangphuc707@gmail.com"
    };

    const StatusIcon = () => {
        switch(status) {
            case 'success': return <div className="w-16 h-16 bg-[#262626] dark:bg-black rounded-full flex items-center justify-center mb-6"><Check size={32} className="text-white" strokeWidth={3} /></div>;
            case 'pending': return <div className="w-16 h-16 border-2 border-transparent border-t-[#262626] border-r-[#262626] dark:border-t-white dark:border-r-white rounded-full animate-spin mb-6"></div>;
            case 'failed': return <div className="w-16 h-16 bg-[#262626] dark:bg-black rounded-full flex items-center justify-center mb-6"><X size={32} className="text-white" strokeWidth={3} /></div>;
            case 'expired': return <div className="w-16 h-16 bg-[#262626] dark:bg-black rounded-full flex items-center justify-center mb-6"><Clock size={32} className="text-white" strokeWidth={2.5} /></div>;
            case 'cancelled': return <div className="w-16 h-16 bg-[#262626] dark:bg-black rounded-full flex items-center justify-center mb-6"><Pause size={32} className="text-white fill-white" strokeWidth={0} /></div>;
            default: return null;
        }
    };

    const renderContent = () => {
        switch(status) {
            case 'success':
                return (
                    <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default rounded-ds-xl p-8 max-w-2xl w-full flex flex-col items-center shadow-sm">
                        <StatusIcon />
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Mua vé bán lại thành công</h2>
                        <p className="text-[13px] text-text-secondary text-center mb-6 leading-relaxed">
                            Giao dịch của bạn đã được xác nhận. Quyền sở hữu vé sẽ được cập nhật vào tài khoản của bạn và mã QR cũ của người bán sẽ không còn hiệu lực.
                        </p>
                        
                        <div className="w-full space-y-3.5 text-[13px] border-t border-b border-border-default py-6 mb-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">{orderData.orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã niêm yết</span>
                                <span className="font-bold text-text-primary">{orderData.listingCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">{orderData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã giao dịch</span>
                                <span className="font-bold text-text-primary">{orderData.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời gian thanh toán thành công</span>
                                <span className="font-bold text-text-primary">{orderData.timeSuccess}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Email nhận xác nhận</span>
                                <span className="font-bold text-text-primary">{orderData.email}</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#f0f4ff] dark:bg-[#1e1b4b] text-[#3b82f6] dark:text-[#818cf8] text-[12px] p-4 rounded-ds-lg text-center mb-6 border border-[#bfdbfe] dark:border-[#4338ca]">
                            Vé bán lại sẽ xuất hiện trong Ví vé của bạn ngay sau khi hệ thống hoàn tất cập nhật quyền sở hữu.
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]">
                                Xem chi tiết vé
                            </button>
                            <button className="flex-1 bg-white dark:bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Xem danh sách vé
                            </button>
                        </div>
                        <button className="w-2/3 bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                            Về chợ vé bán lại
                        </button>
                    </div>
                );
            case 'pending':
                return (
                    <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default rounded-ds-xl p-8 max-w-2xl w-full flex flex-col items-center shadow-sm">
                        <StatusIcon />
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Đang xác nhận thanh toán vé bán lại</h2>
                        <p className="text-[13px] text-text-secondary text-center mb-6 leading-relaxed">
                            Chúng tôi đang kiểm tra kết quả từ cổng thanh toán. Vui lòng không đóng trang trong lúc hệ thống xác nhận giao dịch mua vé resale của bạn.
                        </p>
                        
                        <div className="w-full space-y-3.5 text-[13px] border-t border-b border-border-default py-6 mb-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">{orderData.orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã niêm yết</span>
                                <span className="font-bold text-text-primary">{orderData.listingCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã giao dịch</span>
                                <span className="font-bold text-text-primary">{orderData.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">{orderData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời gian ghi nhận giao dịch</span>
                                <span className="font-bold text-text-primary">{orderData.timeSuccess}</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#f0f4ff] dark:bg-[#1e1b4b] text-[#3b82f6] dark:text-[#818cf8] text-[12px] p-4 rounded-ds-lg text-center mb-6 border border-[#bfdbfe] dark:border-[#4338ca]">
                            Niêm yết này đang được giữ tạm cho bạn trong thời gian xác nhận thanh toán.
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]">
                                Làm mới trạng thái
                            </button>
                            <button className="flex-1 bg-white dark:bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Xem lịch sử đơn hàng
                            </button>
                        </div>
                        <button className="w-2/3 bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                            Liên hệ hỗ trợ
                        </button>
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-full max-w-2xl">
                        <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default rounded-ds-xl p-8 w-full flex flex-col items-center shadow-sm">
                            <StatusIcon />
                            <h2 className="text-2xl font-bold text-text-primary mb-3 text-center">Thanh toán vé bán lại không thành công</h2>
                            <p className="text-[13px] text-text-secondary text-center mb-6 leading-relaxed">
                                Giao dịch của bạn chưa được hoàn tất. Bạn có thể thử lại bằng phương thức hiện tại hoặc chọn một phương thức thanh toán khác.
                            </p>
                            
                            <div className="w-full grid grid-cols-2 gap-6 text-[13px] border-t border-b border-border-default py-6 mb-6">
                                <div>
                                    <span className="block font-bold text-text-primary mb-2">Nguyên nhân có thể</span>
                                    <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                                        <li>giao dịch bị từ chối,</li>
                                        <li>hết thời gian xác thực,</li>
                                        <li>hoặc có lỗi xác minh từ ngân hàng.</li>
                                    </ul>
                                </div>
                                <div>
                                    <span className="block font-bold text-text-primary mb-2">Mã tham chiếu lỗi</span>
                                    <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                                        <li>404</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="w-full text-center text-[#3b82f6] dark:text-[#818cf8] text-[12px] mb-6">
                                Nếu niêm yết vẫn còn trong thời gian giữ, bạn có thể tiếp tục thanh toán mà không cần chọn lại từ đầu.
                            </p>

                            <div className="w-full flex gap-3 mb-3">
                                <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]">
                                    Thử lại thanh toán
                                </button>
                                <button className="flex-1 bg-white dark:bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                    Chọn phương thức khác
                                </button>
                            </div>
                            <button className="w-2/3 bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Quay lại chi tiết vé bán lại
                            </button>
                        </div>

                        {/* Bottom Warning */}
                        <div className="mt-4 border border-border-default rounded-ds-lg p-4 bg-white dark:bg-transparent flex gap-3 shadow-sm">
                            <AlertCircle size={18} className="text-[#ef4444] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[13px] font-bold text-[#ef4444] mb-1">Lưu ý</h4>
                                <p className="text-[12px] text-[#ef4444]">Nếu tài khoản đã bị trừ tiền nhưng trạng thái vẫn báo thất bại, vui lòng kiểm tra lịch sử đơn hàng hoặc liên hệ hỗ trợ.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'expired':
                return (
                    <div className="w-full max-w-2xl">
                        <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default rounded-ds-xl p-8 w-full flex flex-col items-center shadow-sm">
                            <StatusIcon />
                            <h2 className="text-2xl font-bold text-text-primary mb-3">Phiên thanh toán vé bán lại đã hết hạn</h2>
                            <p className="text-[13px] text-text-secondary text-center mb-6 leading-relaxed">
                                Thời gian giữ quyền mua đã kết thúc trước khi giao dịch được xác nhận. Niêm yết có thể đã quay lại trạng thái đang bán hoặc không còn khả dụng.
                            </p>
                            
                            <div className="w-full space-y-3.5 text-[13px] border-t border-b border-border-default py-6 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Mã đơn hàng</span>
                                    <span className="font-bold text-text-primary">{orderData.orderCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Mã niêm yết</span>
                                    <span className="font-bold text-text-primary">{orderData.listingCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Phương thức thanh toán</span>
                                    <span className="font-bold text-text-primary">{orderData.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Thời điểm bắt đầu giữ vé</span>
                                    <span className="font-bold text-text-primary">{orderData.timeStartHold}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Thời điểm hết hạn</span>
                                    <span className="font-bold text-text-primary">{orderData.timeExpired}</span>
                                </div>
                            </div>

                            <div className="w-full flex gap-3 mb-3">
                                <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]">
                                    Xem lại niêm yết
                                </button>
                                <button className="flex-1 bg-white dark:bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                    Về chợ vé bán lại
                                </button>
                            </div>
                            <button className="w-2/3 bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Xem niêm yết tương tự
                            </button>
                        </div>

                        {/* Bottom Warning */}
                        <div className="mt-4 border border-border-default rounded-ds-lg p-4 bg-white dark:bg-transparent flex gap-3 shadow-sm">
                            <AlertCircle size={18} className="text-[#ef4444] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[13px] font-bold text-[#ef4444] mb-1">Lưu ý</h4>
                                <p className="text-[12px] text-[#ef4444]">Nếu bạn đã thanh toán thành công tại ngân hàng nhưng màn hình này vẫn xuất hiện, vui lòng liên hệ hỗ trợ kèm mã đơn hàng.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default rounded-ds-xl p-8 max-w-2xl w-full flex flex-col items-center shadow-sm">
                        <StatusIcon />
                        <h2 className="text-2xl font-bold text-text-primary mb-3">Bạn đã hủy thanh toán vé bán lại</h2>
                        <p className="text-[13px] text-text-secondary text-center mb-6 leading-relaxed">
                            Giao dịch chưa được thực hiện. Bạn vẫn có thể quay lại để tiếp tục thanh toán nếu thời gian giữ niêm yết còn hiệu lực.
                        </p>
                        
                        <div className="w-full space-y-3.5 text-[13px] border-t border-b border-border-default py-6 mb-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã đơn hàng</span>
                                <span className="font-bold text-text-primary">{orderData.orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Mã niêm yết</span>
                                <span className="font-bold text-text-primary">{orderData.listingCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phương thức thanh toán</span>
                                <span className="font-bold text-text-primary">{orderData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Thời điểm hủy</span>
                                <span className="font-bold text-text-primary">{orderData.timeStartHold}</span>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 mb-3">
                            <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-[0.98]">
                                Tiếp tục thanh toán
                            </button>
                            <button className="flex-1 bg-white dark:bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Chọn phương thức khác
                            </button>
                        </div>
                        <button className="w-2/3 bg-transparent border border-border-default hover:bg-[#f8f9fa] dark:hover:bg-gray-800 text-primary py-2.5 rounded-full text-[13px] font-semibold transition-colors active:scale-[0.98]">
                            Quay lại chi tiết vé bán lại
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 pb-12 pt-6 min-h-[70vh]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-12 max-w-6xl mx-auto">
                <Link href={`/${locale}/user/resale`} className="hover:text-primary transition-colors">Marketplace</Link>
                <ChevronRight size={14} />
                <Link href={`/${locale}/user/resale/${listingId}`} className="hover:text-primary transition-colors">Chi tiết vé bán lại</Link>
                <ChevronRight size={14} />
                <span className="text-text-secondary">Xác nhận thanh toán</span>
                <ChevronRight size={14} />
                <span className="text-text-primary">Trạng thái thanh toán</span>
            </div>

            {/* Main Center Content */}
            <div className="flex justify-center w-full">
                {renderContent()}
            </div>

            {/* Dev toggle buttons (for demonstration) */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur flex justify-center gap-4 text-xs z-50 overflow-x-auto whitespace-nowrap">
                <span className="text-white/60 self-center hidden sm:inline-block">Simulate State:</span>
                {['success', 'pending', 'failed', 'expired', 'cancelled'].map((s) => (
                    <button 
                        key={s} 
                        onClick={() => router.push(`/${locale}/user/resale/${listingId}/status?state=${s}`)}
                        className={`px-3 py-1.5 rounded-full ${status === s ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
}

