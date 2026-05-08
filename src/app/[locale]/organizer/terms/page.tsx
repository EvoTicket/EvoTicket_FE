"use client";

import { useState, useEffect } from "react";
import { OrganizerSidebar } from "@/src/components/organizer/OrganizerSidebar";
import { OrganizerHeader } from "@/src/components/organizer/OrganizerHeader";
import { FileText, Download, CheckCircle2, AlertTriangle, Check, ArrowRight } from "lucide-react";

export default function OrganizerTermsPage() {
    const [activeSection, setActiveSection] = useState("section-1");
    const [isAgreed, setIsAgreed] = useState(false);

    // Xử lý Highlight Mục lục khi scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section[id^='section-']");
            let current = "section-1";

            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 120) {
                    current = section.getAttribute("id") || "section-1";
                }
            });

            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-bg-surface flex">
            <OrganizerSidebar />

            <div className="flex-1 flex flex-col ml-[280px]">
                <OrganizerHeader />

                <main className="flex-1 px-8 py-10">
                    <div className="max-w-6xl mx-auto">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border-default pb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">
                                    <FileText size={14} /> TÀI LIỆU PHÁP LÝ
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
                                    Điều khoản & Chính sách<br />dành cho Ban tổ chức
                                </h1>
                                <p className="text-text-muted">Cập nhật lần cuối: 27/04/2026</p>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-bg-page border border-border-default hover:bg-secondary text-text-primary rounded-lg font-medium transition-colors">
                                <Download size={18} />
                                Tải bản PDF
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12 relative">
                            {/* Table of Contents - Left Column */}
                            <div className="w-full lg:w-72 flex-shrink-0">
                                <div className="sticky top-28 bg-bg-page border border-border-default rounded-xl p-6">
                                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                                        Mục lục
                                    </h3>
                                    <nav className="space-y-1">
                                        {[
                                            { id: "section-1", title: "1. Quy định chung" },
                                            { id: "section-2", title: "2. Trách nhiệm của Ban tổ chức" },
                                            { id: "section-3", title: "3. Quy định về tài chính & Thanh toán" },
                                            { id: "section-4", title: "4. Xử lý tranh chấp & Hoàn vé" },
                                            { id: "section-5", title: "5. Điều khoản về dữ liệu & Bảo mật" },
                                        ].map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                onClick={(e) => scrollToSection(e, item.id)}
                                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                    activeSection === item.id
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                                                }`}
                                            >
                                                {item.title}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            {/* Content - Right Column */}
                            <div className="flex-1 max-w-3xl space-y-16 pb-32">

                                {/* Section 1 */}
                                <section id="section-1" className="scroll-mt-28">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                                        Quy định chung
                                    </h2>
                                    <div className="space-y-4 text-text-secondary leading-relaxed">
                                        <p>
                                            Chào mừng bạn đến với EvoTicket. Bằng việc đăng ký tài khoản Organizer (Ban tổ chức) và sử dụng nền tảng của chúng tôi để tạo, quản lý và phân phối vé sự kiện, bạn đồng ý tuân thủ toàn bộ các điều khoản và điều kiện được nêu trong tài liệu này.
                                        </p>
                                        <p>
                                            EvoTicket cung cấp nền tảng trung gian giúp Ban tổ chức tiếp cận khách hàng và quản lý việc bán vé thông qua công nghệ Blockchain (NFT Ticket) nhằm đảm bảo tính minh bạch và chống gian lận.
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 mt-4 text-text-primary">
                                            <li>Tài khoản Organizer chỉ được cấp cho các pháp nhân hoặc cá nhân có đầy đủ năng lực hành vi dân sự.</li>
                                            <li>Nội dung sự kiện không được vi phạm pháp luật, thuần phong mỹ tục của Việt Nam.</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Section 2 */}
                                <section id="section-2" className="scroll-mt-28">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                                        Trách nhiệm của Ban tổ chức
                                    </h2>
                                    <div className="space-y-4 text-text-secondary leading-relaxed">
                                        <p>
                                            Ban tổ chức là đơn vị chịu trách nhiệm duy nhất và toàn diện đối với việc tổ chức sự kiện, chất lượng sự kiện, cũng như các rủi ro phát sinh tại địa điểm tổ chức.
                                        </p>
                                        
                                        <div className="bg-bg-page border-l-4 border-primary rounded-r-lg p-5 my-6">
                                            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                                <CheckCircle2 size={18} className="text-primary" />
                                                Cam kết chất lượng
                                            </h4>
                                            <p className="text-sm">
                                                Ban tổ chức cam kết cung cấp dịch vụ đúng như mô tả trên trang bán vé. Mọi thay đổi về thời gian, địa điểm, nghệ sĩ khách mời (nếu có) phải được thông báo công khai tới người mua vé ít nhất 48 giờ trước sự kiện.
                                            </p>
                                        </div>

                                        <p>
                                            Trong trường hợp sự kiện bị hủy hoặc hoãn, Ban tổ chức phải thông báo ngay lập tức cho EvoTicket và chịu trách nhiệm truyền thông tới toàn bộ khách hàng đã mua vé.
                                        </p>
                                    </div>
                                </section>

                                {/* Section 3 */}
                                <section id="section-3" className="scroll-mt-28">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</span>
                                        Quy định về tài chính & Thanh toán
                                    </h2>
                                    <div className="space-y-4 text-text-secondary leading-relaxed">
                                        <p>
                                            Doanh thu từ việc bán vé sẽ được hệ thống tạm giữ và đối soát. Lịch thanh toán định kỳ diễn ra vào ngày 15 và 30 hàng tháng đối với các sự kiện đã kết thúc thành công.
                                        </p>
                                        
                                        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 my-6">
                                            <h4 className="font-bold text-warning flex items-center gap-2 mb-3">
                                                <AlertTriangle size={20} />
                                                Lưu ý quan trọng về phí dịch vụ
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-2 text-warning/90 text-sm font-medium">
                                                <li>Phí nền tảng (Platform fee) áp dụng ở mức <strong>5%</strong> trên tổng doanh thu vé bán ra.</li>
                                                <li>Phí giao dịch thanh toán qua cổng điện tử là <strong>1.5% + 2,000đ</strong> mỗi giao dịch (do đối tác cổng thanh toán thu).</li>
                                                <li>Royalty fee (nếu cấu hình tính năng bán lại) sẽ được chia tự động bằng Smart Contract ngay khi giao dịch thứ cấp hoàn tất.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4 */}
                                <section id="section-4" className="scroll-mt-28">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">4</span>
                                        Xử lý tranh chấp & Hoàn vé
                                    </h2>
                                    <div className="space-y-4 text-text-secondary leading-relaxed">
                                        <p>
                                            Mặc định, EvoTicket không hỗ trợ hoàn vé (No Refund Policy) cho người mua trừ trường hợp sự kiện bị hủy từ phía Ban tổ chức. Người dùng được khuyến khích sử dụng tính năng <strong>Thị trường bán lại (Resale Market)</strong> nếu không thể tham dự.
                                        </p>
                                        <p>
                                            Trong trường hợp sự kiện bị hủy, Ban tổ chức có trách nhiệm hoàn lại 100% tiền vé cho khách hàng. EvoTicket sẽ hỗ trợ cung cấp danh sách và công cụ thực hiện hoàn tiền, tuy nhiên phí dịch vụ ban đầu có thể không được hoàn lại tùy theo thỏa thuận.
                                        </p>
                                    </div>
                                </section>

                                {/* Section 5 */}
                                <section id="section-5" className="scroll-mt-28">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">5</span>
                                        Điều khoản về dữ liệu & Bảo mật
                                    </h2>
                                    <div className="space-y-4 text-text-secondary leading-relaxed">
                                        <p>
                                            Dữ liệu người mua vé (Tên, SĐT, Email) được EvoTicket thu thập và có thể chia sẻ với Ban tổ chức nhằm mục đích quản lý sự kiện và hỗ trợ khách hàng. Ban tổ chức cam kết:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 mt-4 text-text-primary">
                                            <li>Chỉ sử dụng dữ liệu khách hàng cho mục đích liên quan trực tiếp đến sự kiện hiện tại.</li>
                                            <li>Không mua bán, chia sẻ hoặc để lộ dữ liệu cho bất kỳ bên thứ 3 nào khác.</li>
                                            <li>Tuân thủ tuyệt đối Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân của Việt Nam.</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Confirmation Box */}
                                <div className="mt-16 bg-bg-page border-2 border-border-default rounded-2xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                                    <h3 className="text-xl font-bold text-text-primary mb-6">Xác nhận thỏa thuận</h3>
                                    
                                    <label className="flex items-start gap-4 cursor-pointer group mb-8">
                                        <div className="relative flex items-center justify-center mt-1">
                                            <input 
                                                type="checkbox" 
                                                className="peer sr-only"
                                                checked={isAgreed}
                                                onChange={(e) => setIsAgreed(e.target.checked)}
                                            />
                                            <div className="w-6 h-6 rounded-md border-2 border-border-default bg-bg-surface peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                                                <Check size={16} className={`text-white opacity-0 peer-checked:opacity-100 transition-opacity`} strokeWidth={3} />
                                            </div>
                                        </div>
                                        <div className="text-text-primary leading-relaxed font-medium">
                                            Tôi đã đọc, hiểu rõ và đồng ý tuân thủ toàn bộ các Điều khoản & Chính sách dành cho Ban tổ chức của EvoTicket được nêu trên.
                                        </div>
                                    </label>

                                    <button 
                                        disabled={!isAgreed}
                                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 disabled:bg-bg-surface disabled:text-text-muted disabled:border-border-default disabled:cursor-not-allowed border border-transparent text-white rounded-xl font-bold transition-all"
                                    >
                                        Xác nhận & Tiếp tục <ArrowRight size={18} />
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
