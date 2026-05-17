import { CheckCircle2, Home, PlusCircle, Settings, FileText, Image as ImageIcon, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CreateEventState } from "./useCreateEventWizard";

interface Props {
    formData: CreateEventState;
}

export function CreateEventSuccessScreen({ formData }: Props) {
    const { locale } = useParams();

    return (
        <div className="max-w-[800px] mx-auto py-10 px-4">
            <div className="bg-bg-surface border border-border-default rounded-ds-2xl overflow-hidden shadow-sm mb-8 text-center pt-10 pb-8 px-6">
                <div className="w-20 h-20 bg-feedback-success-bg border-[4px] border-feedback-success-bg/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-feedback-success-text" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Sự kiện đã được gửi duyệt!</h1>
                <p className="text-text-secondary max-w-[500px] mx-auto mb-6">
                    Hồ sơ sự kiện của bạn đã được gửi đến ban quản trị EvoTicket. Chúng tôi sẽ tiến hành kiểm duyệt trong vòng <span className="font-bold text-text-primary">24h làm việc</span>.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-feedback-warning-bg/20 border border-feedback-warning-border text-feedback-warning-text font-bold text-sm rounded-full">
                    <span className="w-2 h-2 rounded-full bg-feedback-warning-text animate-pulse"></span>
                    Trạng thái: Pending Review
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-text-secondary"/> Thông tin sự kiện
                    </h3>
                    
                    <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-ds-lg bg-bg-subtle border border-border-default overflow-hidden shrink-0">
                            {formData.thumbnailPreview ? (
                                <img src={formData.thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-text-primary text-base leading-tight mb-1">{formData.eventName}</h4>
                            <p className="text-text-secondary text-xs mb-3">{formData.tagline}</p>
                            
                            <div className="space-y-1 text-sm text-text-secondary">
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="shrink-0 mt-0.5" />
                                    <span className="text-xs">{formData.venue}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar size={14} className="shrink-0 mt-0.5" />
                                    <span className="text-xs">{formData.showtimes.length} suất diễn • {formData.ticketTypes.length} loại vé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border-default">
                        <h4 className="font-bold text-sm text-text-primary mb-3">Quy trình duyệt sự kiện</h4>
                        <div className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-feedback-success-bg text-feedback-success-text flex items-center justify-center font-bold mb-2">1</div>
                                <span className="text-xs font-medium">Gửi duyệt</span>
                            </div>
                            <div className="flex-1 h-px bg-border-strong mx-2 mb-6"></div>
                            <div className="flex flex-col items-center opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-strong text-text-secondary flex items-center justify-center font-bold mb-2">2</div>
                                <span className="text-xs font-medium">Kiểm tra</span>
                            </div>
                            <div className="flex-1 h-px bg-border-default mx-2 mb-6"></div>
                            <div className="flex flex-col items-center opacity-50">
                                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-strong text-text-secondary flex items-center justify-center font-bold mb-2">3</div>
                                <span className="text-xs font-medium">Công bố</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-bg-surface border border-border-default rounded-ds-xl p-5 shadow-sm">
                        <h3 className="font-bold text-sm text-text-primary mb-3">Ý nghĩa các trạng thái</h3>
                        <ul className="space-y-3 text-xs">
                            <li className="flex gap-2">
                                <span className="text-feedback-warning-text font-bold whitespace-nowrap">Pending:</span>
                                <span className="text-text-secondary">Đang chờ EvoTicket kiểm duyệt nội dung. Bạn vẫn có thể sửa.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-feedback-success-text font-bold whitespace-nowrap">Published:</span>
                                <span className="text-text-secondary">Đã duyệt. Sự kiện sẵn sàng hiển thị (nếu public).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-feedback-error-text font-bold whitespace-nowrap">Rejected:</span>
                                <span className="text-text-secondary">Bị từ chối. Kèm lý do để bạn chỉnh sửa và gửi lại.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-bg-subtle border border-border-default rounded-ds-xl p-5 text-sm text-text-secondary">
                        <span className="font-bold text-text-primary block mb-1">Lưu ý:</span>
                        Vé sẽ không được mở bán chính thức cho đến khi sự kiện chuyển sang trạng thái Published.
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                    href={`/${locale}/organizer/events/new-event-123/overview`} // Fixture link
                    className="px-6 py-3 bg-action-brand-bg-default text-action-brand-text-default font-bold rounded-ds-xl hover:bg-action-brand-bg-hover transition-colors flex items-center justify-center gap-2"
                >
                    <Settings size={18} /> Vào quản trị sự kiện này
                </Link>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-bg-surface border border-border-default text-text-primary font-bold rounded-ds-xl hover:bg-bg-subtle transition-colors flex items-center justify-center gap-2"
                >
                    <PlusCircle size={18} /> Tạo sự kiện khác
                </button>
                <Link 
                    href={`/${locale}/organizer/center`}
                    className="px-6 py-3 bg-transparent text-text-secondary font-bold rounded-ds-xl hover:text-text-primary hover:bg-bg-surface transition-colors flex items-center justify-center gap-2"
                >
                    <Home size={18} /> Về Organizer Center
                </Link>
            </div>
        </div>
    );
}
