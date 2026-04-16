"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";
import { ArrowLeft, Check } from "lucide-react";
import { EventDetail } from "@/src/types/event";

export default function PaymentPage() {
    const { locale, id } = useParams();
    const router = useRouter();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [timeLeft, setTimeLeft] = useState(9 * 60 + 9); // 09:09

    // Mock user context if needed
    const [fullName, setFullName] = useState("Nguyễn Văn A");
    const [phone, setPhone] = useState("0795 xxx xxx");
    const [email, setEmail] = useState("hello@gmail.com");

    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(50000);
    const [paymentMethod, setPaymentMethod] = useState("vnpay");

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [checkedInfo, setCheckedInfo] = useState(false);
    const [understoodTime, setUnderstoodTime] = useState(false);

    useEffect(() => {
        if (id) {
            fetchEventDetail(id as string);
        }

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
                data.hasSeatMap = data.seatMapImage !== null;
                setEvent(data);
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
    const activeShowtime = event?.showtimes?.[0]; // Mock selected showtime

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

    // MOCK TICKET DATA
    const mockSelectedTickets = [
        { id: 1, name: "Standard", quantity: 2, price: 1900000 },
        { id: 2, name: "Standard", quantity: 2, price: 1900000 },
        { id: 3, name: "Standard", quantity: 2, price: 1900000 },
    ];

    const serviceFee = 2000;
    const ticketTotal = mockSelectedTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const subTotal = ticketTotal + serviceFee;
    const finalTotal = subTotal - appliedDiscount;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-bg-page flex flex-col font-sans">
            <Header />

            {/* TOP HEADER */}
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
                        <Link href={`/${locale}/events/${event.eventId}/booking`} className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-default rounded-button-radius hover:bg-bg-subtle transition-colors text-sm font-semibold text-text-primary h-fit">
                            <ArrowLeft size={16} /> Quay lại bước chọn vé
                        </Link>
                    </div>

                    {/* STEPPER & COUNTDOWN */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between bg-card-bg-elevated border border-border-default rounded-xl p-4">
                        <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                            {/* Step 1 - Done */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#1e463a] border border-[#2bad7f] text-[#2bad7f] flex items-center justify-center font-bold text-sm">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm font-bold text-text-primary">Chọn vé</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-primary mx-4"></div>
                            {/* Step 2 - Active */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-bg-surface border border-primary text-primary flex items-center justify-center font-bold text-sm">2</div>
                                <span className="text-sm font-bold text-text-primary">Thanh toán</span>
                            </div>
                            <div className="h-[1px] w-12 md:w-24 bg-border-strong mx-4"></div>
                            {/* Step 3 - Pending */}
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

                    {/* LEFT COLUMN: FORM NHẬP THÔNG TIN */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Block: Thông tin liên hệ */}
                        <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">Thông tin liên hệ</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors"
                                    />
                                    <p className="text-xs text-text-muted mt-2">Email dùng để gửi xác nhận giao dịch và thông tin vé điện tử.</p>
                                </div>

                                <div className="bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8]">
                                    Sau khi thanh toán thành công, vé sẽ được cập nhật vào Ví vé của bạn.
                                </div>
                            </div>
                        </div>

                        {/* Block: Mã giảm giá */}
                        <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">Mã giảm giá</h3>
                            <div className="flex gap-3 mb-2">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="flex-1 bg-bg-surface border border-border-default rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-primary transition-colors placeholder:text-text-muted"
                                />
                                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                                    Áp dụng
                                </button>
                            </div>
                            {appliedDiscount > 0 && (
                                <p className="text-sm text-text-secondary mb-4">Đã áp dụng mã giảm giá: -{appliedDiscount.toLocaleString("vi-VN")}đ</p>
                            )}
                            <div className="bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8]">
                                Mã hợp lệ sẽ được áp dụng trực tiếp vào tổng thanh toán.
                            </div>
                        </div>

                        {/* Block: Phương thức thanh toán */}
                        <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">Phương thức thanh toán</h3>
                            <p className="text-sm text-text-secondary mb-4">Chọn một phương thức để tiếp tục thanh toán qua cổng thanh toán an toàn.</p>

                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 p-3 border border-border-default hover:border-primary rounded-lg cursor-pointer bg-bg-surface transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        checked={paymentMethod === "vnpay"}
                                        onChange={() => setPaymentMethod("vnpay")}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0">
                                        {/* Mock logo vnPay */}
                                        <div className="flex gap-0.5 font-bold text-[10px]"><span className="text-blue-600">VN</span><span className="text-red-500">PAY</span></div>
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">VNPay / Ứng dụng ngân hàng</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default hover:border-primary rounded-lg cursor-pointer bg-bg-surface transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="momo"
                                        checked={paymentMethod === "momo"}
                                        onChange={() => setPaymentMethod("momo")}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="w-8 h-8 rounded bg-[#a50064] flex items-center justify-center p-1 shrink-0">
                                        <span className="text-white font-bold text-[8px]">MoMo</span>
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">MoMo</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default hover:border-primary rounded-lg cursor-pointer bg-bg-surface transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="zalopay"
                                        checked={paymentMethod === "zalopay"}
                                        onChange={() => setPaymentMethod("zalopay")}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0">
                                        <span className="text-blue-500 font-extrabold text-[8px]">Zalo</span><span className="text-green-500 font-extrabold text-[8px]">Pay</span>
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">Zalo Pay</span>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-border-default hover:border-primary rounded-lg cursor-pointer bg-bg-surface transition-colors">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vietqr"
                                        checked={paymentMethod === "vietqr"}
                                        onChange={() => setPaymentMethod("vietqr")}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-1 shrink-0 border border-gray-200">
                                        <span className="text-red-600 font-bold text-[10px]">Viet</span><span className="text-blue-800 font-bold text-[10px]">QR</span>
                                    </div>
                                    <span className="text-sm font-medium text-text-primary">VietQR</span>
                                </label>
                            </div>

                            <div className="bg-[#19274e] border border-[#253f7f] rounded-lg p-3 text-sm text-[#87a5f8]">
                                Bạn sẽ được chuyển tới cổng thanh toán để hoàn tất giao dịch. Thời gian giữ vé vẫn tiếp tục chạy trong suốt quá trình này.
                            </div>
                        </div>

                        {/* Block: Lưu ý trước khi thanh toán */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-3">Lưu ý trước khi thanh toán</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                <li>Vé/ghế chỉ được giữ trong thời gian đếm ngược ở đâu trang</li>
                                <li>Không đóng trang hoặc quay lại quá lâu khi đang thanh toán</li>
                                <li>Nếu giao dịch không hoàn tất trước khi hết giờ, đơn có thể bị hủy</li>
                                <li>Vui lòng kiểm tra kỹ thông tin người mua trước khi tiếp tục</li>
                            </ul>
                        </div>

                        {/* Block: Lưu ý sau khi thanh toán */}
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-3">Lưu ý sau khi thanh toán</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary marker:text-text-muted">
                                <li>Vé điện tử sẽ xuất hiện trong Ví vé của bạn</li>
                                <li>Email xác nhận giao dịch sẽ được gửi tới địa chỉ email đã cung cấp</li>
                                <li>Mỗi vé có mã riêng và sẽ sẵn sàng để sử dụng theo trạng thái của hệ thống</li>
                                <li>Bạn có thể xem chi tiết vé trong tài khoản ngay sau khi giao dịch hoàn tất</li>
                            </ul>
                        </div>

                        {/* Block: Xác nhận giao dịch */}
                        <div className="bg-card-bg-default border border-border-default rounded-xl p-6">
                            <h3 className="font-bold text-text-primary mb-4">Xác nhận giao dịch</h3>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={checkedInfo}
                                        onChange={(e) => setCheckedInfo(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Tôi xác nhận đã kiểm tra đúng thông tin người mua và vé đã chọn</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={understoodTime}
                                        onChange={(e) => setUnderstoodTime(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Tôi hiểu rằng thời gian giữ vé vẫn tiếp tục chạy trong quá trình thanh toán</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer"
                                    />
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Tôi đồng ý với điều khoản giao dịch và chính sách hỗ trợ của EvoTicket</span>
                                </label>
                            </div>
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
                                    <h4 className="font-bold text-sm text-text-primary mb-4">Vé đã chọn</h4>

                                    <div className="space-y-3">
                                        {mockSelectedTickets.map((t, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 text-sm border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">Loại vé:</span>
                                                    <span className="font-medium text-text-primary">{t.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">Số lượng:</span>
                                                    <span className="font-medium text-text-primary">{String(t.quantity).padStart(2, '0')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-text-secondary">Giá:</span>
                                                    <span className="font-medium text-text-primary">{(t.price * t.quantity).toLocaleString("vi-VN")}đ</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="border-t border-border-strong pt-4 mb-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Phí dịch vụ</span>
                                        <span className="font-medium text-text-primary text-right">{serviceFee.toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Tạm tính</span>
                                        <span className="font-medium text-text-primary text-right">{subTotal.toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Giảm giá</span>
                                            <span className="font-medium text-text-primary text-right">- {appliedDiscount.toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-border-strong">
                                        <span className="text-sm font-medium text-text-secondary">Tổng thanh toán</span>
                                        <span className="text-2xl font-bold text-text-primary text-right">
                                            {finalTotal.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-text-muted mb-4">
                                    Bằng việc bấm chọn "Thanh toán ngay", bạn đồng ý với điều khoản <Link href="#" className="text-primary hover:underline">Điều kiện Giao dịch chung</Link>.
                                </p>

                                <button
                                    className={`w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm mb-3 ${!(agreedToTerms && checkedInfo && understoodTime) ? 'bg-bg-subtle text-text-muted cursor-not-allowed border border-border-default' : 'bg-[#6D48D7] hover:bg-[#5b3bb8] text-white'}`}
                                    disabled={!(agreedToTerms && checkedInfo && understoodTime)}
                                    onClick={() => router.push(`/${locale}/events/${event.eventId}/payment/result?status=success`)}
                                >
                                    Thanh toán ngay
                                </button>

                                <button
                                    className="w-full py-3.5 rounded-button-radius font-semibold transition-colors shadow-sm bg-transparent hover:bg-bg-subtle text-text-secondary border border-border-strong"
                                    onClick={() => router.push(`/${locale}/events/${event.eventId}/booking`)}
                                >
                                    Chọn lại vé
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
