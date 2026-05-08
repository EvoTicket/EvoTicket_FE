"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, CheckCircle2, User, Phone, Mail, Tag, CreditCard } from "lucide-react";

export default function ResaleCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || "vi";
    const listingId = params?.id || "LST-20260614-0061";

    // Timer logic 
    const [timeLeft, setTimeLeft] = useState(556); // ~9m16s
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return {
            m1: Math.floor(m / 10).toString(),
            m2: (m % 10).toString(),
            s1: Math.floor(s / 10).toString(),
            s2: (s % 10).toString()
        };
    };
    const timeObj = formatTime(timeLeft);

    // Form logic
    const [paymentMethod, setPaymentMethod] = useState("vnpay");
    
    // Checkboxes
    const [confirmedInfo, setConfirmedInfo] = useState(false);
    const [understoodOwnership, setUnderstoodOwnership] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);

    // Pricing
    const basePrice = 1950000;
    const serviceFee = 39000;
    const discountAmount = 50000;
    
    const totalPayment = basePrice + serviceFee - (discountApplied ? discountAmount : 0);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const handleApplyDiscount = () => {
        if (discountCode) {
            setDiscountApplied(true);
        }
    };

    return (
        <div className="container mx-auto px-4 pb-12 max-w-6xl pt-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                <Link href={`/${locale}/user/resale`} className="hover:text-primary transition-colors">Marketplace</Link>
                <ChevronRight size={14} />
                <Link href={`/${locale}/user/resale/${listingId}`} className="hover:text-primary transition-colors">Chi tiết vé bán lại</Link>
                <ChevronRight size={14} />
                <span className="text-text-primary">Xác nhận thanh toán</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-border-default">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Xác nhận mua vé bán lại</h1>
                    <p className="text-sm text-text-secondary max-w-2xl">
                        Kiểm tra lại thông tin và chọn phương thức thanh toán trước khi hoàn tất giao dịch.
                        <br />
                        <span className="text-[13px] opacity-80 mt-1 inline-block">Giao dịch được thực hiện qua chợ vé bán lại chính thức của EvoTicket.</span>
                    </p>
                </div>
                <button 
                    onClick={() => router.back()}
                    className="bg-[#f0f3f6] dark:bg-gray-800 hover:bg-[#e2e8f0] dark:hover:bg-gray-700 text-text-primary px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
                >
                    Quay lại chi tiết vé
                </button>
            </div>

            {/* Layout 2 columns */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Column */}
                <div className="flex-1 space-y-6 w-full">
                    {/* Thông tin liên hệ */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">Thông tin liên hệ</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">Họ tên</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <User size={16} />
                                    </div>
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted transition-colors" placeholder="Nhập họ tên của bạn" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">Số điện thoại</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Phone size={16} />
                                    </div>
                                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted transition-colors" placeholder="Nhập số điện thoại của bạn" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] text-text-secondary mb-2">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Mail size={16} />
                                    </div>
                                    <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted transition-colors" placeholder="Nhập email của bạn" />
                                </div>
                                <p className="text-[11px] text-text-muted mt-2">Email dùng để gửi xác nhận giao dịch và thông tin vé điện tử.</p>
                            </div>
                        </div>

                        <div className="mt-5 bg-[#fafafa] dark:bg-[#111827] p-3 rounded-lg border border-border-default text-[12px] text-text-secondary leading-relaxed">
                            Sau khi thanh toán thành công, vé sẽ được cập nhật vào Ví vé của bạn.
                        </div>
                    </div>

                    {/* Mã giảm giá */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-4">Mã giảm giá</h3>
                        <div className="flex gap-3 mb-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                    <Tag size={16} />
                                </div>
                                <input 
                                    type="text" 
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-text-muted transition-colors" 
                                    placeholder="Nhập mã giảm giá" 
                                />
                            </div>
                            <button 
                                onClick={handleApplyDiscount}
                                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shrink-0"
                            >
                                Áp dụng
                            </button>
                        </div>
                        {discountApplied && (
                            <p className="text-[12px] text-primary font-medium mt-2">Đã áp dụng mã giảm giá: - {formatVND(discountAmount)}</p>
                        )}
                        
                        <div className="mt-5 bg-[#fafafa] dark:bg-[#111827] p-3 rounded-lg border border-border-default text-[12px] text-text-secondary leading-relaxed">
                            Mã hợp lệ sẽ được áp dụng trực tiếp vào tổng thanh toán.
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-2">Phương thức thanh toán</h3>
                        <p className="text-[13px] text-text-secondary mb-5">Chọn một phương thức để tiếp tục thanh toán qua cổng thanh toán an toàn.</p>
                        
                        <div className="space-y-3">
                            {/* VNPay */}
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'border-border-default hover:bg-[#fafafa] dark:hover:bg-[#111827]'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    value="vnpay"
                                    checked={paymentMethod === 'vnpay'}
                                    onChange={() => setPaymentMethod('vnpay')}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border-default"
                                />
                                <div className="w-8 h-8 bg-white border border-border-default rounded flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#005BAA] text-[10px]">VNPAY</span>
                                </div>
                                <span className="text-[14px] text-text-primary font-medium">VNPay/Ứng dụng ngân hàng</span>
                            </label>

                            {/* Momo */}
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'border-border-default hover:bg-[#fafafa] dark:hover:bg-[#111827]'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    value="momo"
                                    checked={paymentMethod === 'momo'}
                                    onChange={() => setPaymentMethod('momo')}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border-default"
                                />
                                <div className="w-8 h-8 bg-white border border-border-default rounded flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#A50064] text-[10px]">MoMo</span>
                                </div>
                                <span className="text-[14px] text-text-primary font-medium">MoMo</span>
                            </label>

                            {/* Zalo Pay */}
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'zalopay' ? 'border-primary bg-primary/5' : 'border-border-default hover:bg-[#fafafa] dark:hover:bg-[#111827]'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    value="zalopay"
                                    checked={paymentMethod === 'zalopay'}
                                    onChange={() => setPaymentMethod('zalopay')}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border-default"
                                />
                                <div className="w-8 h-8 bg-white border border-border-default rounded flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#0088FF] text-[10px]">ZaloPay</span>
                                </div>
                                <span className="text-[14px] text-text-primary font-medium">Zalo Pay</span>
                            </label>

                            {/* VietQR */}
                            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'vietqr' ? 'border-primary bg-primary/5' : 'border-border-default hover:bg-[#fafafa] dark:hover:bg-[#111827]'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method" 
                                    value="vietqr"
                                    checked={paymentMethod === 'vietqr'}
                                    onChange={() => setPaymentMethod('vietqr')}
                                    className="w-4 h-4 text-primary focus:ring-primary border-border-default"
                                />
                                <div className="w-8 h-8 bg-white border border-border-default rounded flex items-center justify-center shrink-0">
                                    <span className="font-bold text-[#00A65A] text-[10px]">VietQR</span>
                                </div>
                                <span className="text-[14px] text-text-primary font-medium">VietQR</span>
                            </label>
                        </div>

                        <div className="mt-5 bg-[#fafafa] dark:bg-[#111827] p-3.5 rounded-lg border border-border-default text-[12px] text-text-secondary leading-relaxed">
                            Bạn sẽ được chuyển tới cổng thanh toán để hoàn tất giao dịch. Thời gian giữ vé vẫn tiếp tục chạy trong suốt quá trình này.
                        </div>
                    </div>

                    {/* Lưu ý trước khi thanh toán */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-[#fafafa] dark:bg-[#111827]">
                        <h3 className="text-[15px] font-bold text-text-primary mb-4">Lưu ý trước khi thanh toán</h3>
                        <ul className="space-y-2.5 text-[13px] text-text-secondary list-disc pl-5 marker:text-text-muted">
                            <li>Vé/ghế chỉ được giữ trong thời gian đếm ngược ở đầu trang</li>
                            <li>Không đóng trang hoặc quay lại quá lâu khi đang thanh toán</li>
                            <li>Nếu giao dịch không hoàn tất trước khi hết giờ, đơn có thể bị hủy</li>
                            <li>Vui lòng kiểm tra kỹ thông tin người mua trước khi tiếp tục</li>
                        </ul>
                    </div>
                    
                    {/* Sau khi bạn thanh toán thành công */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-[#fafafa] dark:bg-[#111827]">
                        <h3 className="text-[15px] font-bold text-text-primary mb-4">Sau khi bạn thanh toán thành công</h3>
                        <ul className="space-y-2.5 text-[13px] text-text-secondary list-disc pl-5 marker:text-text-muted">
                            <li>Vé resale sẽ xuất hiện trong Ví vé của bạn</li>
                            <li>Quyền sở hữu vé được cập nhật ngay trong hệ thống</li>
                            <li>Mã QR cũ của người bán sẽ không còn hiệu lực</li>
                            <li>Bạn có thể xem provenance sau khi giao dịch hoàn tất</li>
                        </ul>
                    </div>

                    {/* Xác nhận giao dịch Checkboxes */}
                    <div className="border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        <h3 className="text-[16px] font-bold text-text-primary mb-5">Xác nhận giao dịch</h3>
                        <div className="space-y-3.5">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input 
                                        type="checkbox" 
                                        checked={confirmedInfo}
                                        onChange={(e) => setConfirmedInfo(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                                    />
                                </div>
                                <span className={`text-[13px] ${confirmedInfo ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    Tôi xác nhận đã kiểm tra đúng thông tin vé resale
                                </span>
                            </label>
                            
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input 
                                        type="checkbox" 
                                        checked={understoodOwnership}
                                        onChange={(e) => setUnderstoodOwnership(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                                    />
                                </div>
                                <span className={`text-[13px] ${understoodOwnership ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    Tôi hiểu rằng sau khi giao dịch hoàn tất, quyền sở hữu sẽ chuyển sang tài khoản của tôi
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="mt-0.5">
                                    <input 
                                        type="checkbox" 
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                                    />
                                </div>
                                <span className={`text-[13px] ${agreedToTerms ? 'text-text-primary' : 'text-text-secondary'} group-hover:text-text-primary transition-colors leading-tight`}>
                                    Tôi đồng ý với điều khoản giao dịch và chính sách hỗ trợ
                                </span>
                            </label>
                        </div>
                    </div>

                </div>

                {/* Right Column / Sidebar */}
                <div className="w-full lg:w-[360px] shrink-0">
                    <div className="sticky top-6 border border-border-default rounded-xl p-6 shadow-sm bg-bg-surface">
                        
                        {/* Countdown block inside sticky box as shown in mockup */}
                        <div className="flex flex-col items-center mb-6">
                            <span className="text-[12px] text-text-secondary mb-2">Thời gian thanh toán còn lại</span>
                            <div className="flex items-center gap-1.5">
                                <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default px-2.5 py-1.5 rounded-md font-mono text-[14px] font-bold text-text-primary">{timeObj.m1}</div>
                                <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default px-2.5 py-1.5 rounded-md font-mono text-[14px] font-bold text-text-primary">{timeObj.m2}</div>
                                <span className="font-bold text-text-secondary pb-1">:</span>
                                <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default px-2.5 py-1.5 rounded-md font-mono text-[14px] font-bold text-text-primary">{timeObj.s1}</div>
                                <div className="bg-[#fafafa] dark:bg-[#111827] border border-border-default px-2.5 py-1.5 rounded-md font-mono text-[14px] font-bold text-text-primary">{timeObj.s2}</div>
                            </div>
                        </div>

                        <div className="border-t border-border-default my-5"></div>

                        <h3 className="font-bold text-[16px] text-text-primary mb-5">Tóm tắt giao dịch</h3>
                        
                        <div className="mb-5">
                            <div className="inline-flex items-center gap-2 mb-3 bg-[#1a1a1a] dark:bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                                <CheckCircle2 size={12} /> Resale chính thức
                            </div>
                            <h4 className="font-bold text-[14px] text-text-primary mb-2">Swan Lake Ballet Night 2026</h4>
                            <p className="text-[12px] text-text-secondary mb-1">20:00 · Chủ Nhật, 14/06/2026</p>
                            <p className="text-[12px] text-text-secondary">Nhà hát Hòa Bình, TP.HCM</p>
                        </div>

                        <div className="border-t border-border-default border-dashed my-4"></div>

                        <div className="space-y-3.5 text-[12px] mb-6">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Loại vé:</span>
                                <span className="font-bold text-text-primary">VIP</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Ghế / khu vực:</span>
                                <span className="font-bold text-text-primary">B08</span>
                            </div>
                        </div>

                        <div className="border-t border-border-default border-dashed my-4"></div>

                        <div className="space-y-3.5 text-[13px] mb-5">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Giá vé bán lại:</span>
                                <span className="font-bold text-text-primary">{formatVND(basePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Phí dịch vụ:</span>
                                <span className="font-bold text-text-primary">+ {formatVND(serviceFee)}</span>
                            </div>
                            {discountApplied && (
                                <div className="flex justify-between text-primary">
                                    <span className="font-medium">Giảm giá:</span>
                                    <span className="font-bold">- {formatVND(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-6 pt-5 border-t border-border-default">
                            <span className="text-[14px] font-bold text-text-secondary">Tổng thanh toán:</span>
                            <span className="text-[20px] font-bold text-text-primary">{formatVND(totalPayment)}</span>
                        </div>

                        <div className="bg-[#fafafa] dark:bg-[#111827] rounded-lg p-4 border border-border-default mb-6">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-text-primary mb-3">
                                <ShieldCheck size={16} className="text-green-600" /> Cam kết an toàn
                            </div>
                            <ul className="space-y-2.5 text-[11px] text-text-secondary">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>Vé đã xác minh nguồn gốc</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>Ownership chuyển tự động sau giao dịch</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full mt-[5px] shrink-0" />
                                    <span>QR cũ của người bán bị vô hiệu hóa</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => router.push(`/${locale}/user/resale/${listingId}/status?state=success`)}
                                className={`w-full py-3 rounded-lg text-[13px] font-bold transition-all duration-200 shadow-sm
                                ${confirmedInfo && understoodOwnership && agreedToTerms 
                                    ? 'bg-primary hover:bg-primary-hover text-white active:scale-[0.98]' 
                                    : 'bg-[#f0f3f6] dark:bg-gray-800 text-text-muted cursor-not-allowed border border-border-default'
                                }`}
                                disabled={!(confirmedInfo && understoodOwnership && agreedToTerms)}
                            >
                                Tiếp tục thanh toán
                            </button>
                            <button 
                                onClick={() => router.back()}
                                className="w-full py-3 bg-[#f0f3f6] dark:bg-[#1f2937] hover:bg-[#e2e8f0] dark:hover:bg-gray-700 text-text-primary rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.98]"
                            >
                                Quay lại chi tiết vé
                            </button>
                            <button className="w-full py-3 bg-[#fafafa] dark:bg-transparent border border-border-default hover:bg-[#f0f3f6] dark:hover:bg-gray-800 text-text-primary rounded-lg text-[13px] font-semibold transition-colors active:scale-[0.98]">
                                Liên hệ hỗ trợ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

