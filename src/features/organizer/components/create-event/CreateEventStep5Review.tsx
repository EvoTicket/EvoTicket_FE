import { Image as ImageIcon, MapPin, Calendar, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { CreateEventState, getEventCategoryLabel } from "./useCreateEventWizard";
import type { StepErrors } from "./createEventValidation";

interface Props {
    formData: CreateEventState;
    setStep: (step: number) => void;
    errors?: StepErrors;
}

function formatShowtimeDate(startDatetime: string) {
    if (!startDatetime) return "Chưa đặt lịch";
    return new Date(startDatetime).toLocaleDateString("vi-VN");
}

export function CreateEventStep5Review({ formData, setStep, errors = {} }: Props) {
    const totalTickets = formData.ticketTypes.reduce((acc, t) => acc + t.quantityTotal, 0);

    return (
        <div className="space-y-6">
            <div className="bg-feedback-info-bg/30 border border-feedback-info-border text-text-primary rounded-xl p-4 flex gap-3 text-sm">
                <AlertCircle className="shrink-0 text-feedback-info-text mt-0.5" size={18} />
                <div>
                    <span className="font-bold">Kiểm tra thông tin trước khi gửi duyệt</span>
                    <p className="text-text-secondary mt-1">Sự kiện sẽ được đưa vào trạng thái &quot;Pending Review&quot; sau khi gửi. Quản trị viên EvoTicket sẽ kiểm duyệt nội dung và chính sách trong vòng 24h làm việc. Bạn vẫn có thể chỉnh sửa sự kiện trong lúc chờ duyệt.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Nhận diện sự kiện */}
                <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-bg-page/50">
                        <h4 className="font-bold text-text-primary text-sm">1. Thông tin cơ bản</h4>
                        <button type="button" onClick={() => setStep(1)} className="text-action-brand-text-default text-xs font-medium hover:underline">Sửa</button>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                            <div className="aspect-[3/4] rounded-lg bg-bg-subtle overflow-hidden border border-border-default">
                                {formData.thumbnailPreview ? (
                                    <img src={formData.thumbnailPreview} alt="Poster" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                                        <ImageIcon size={24} />
                                        <span className="text-xs mt-2">Poster 3:4</span>
                                    </div>
                                )}
                            </div>
                            <div className="aspect-video rounded-lg bg-bg-subtle overflow-hidden border border-border-default">
                                {formData.bannerPreview ? (
                                    <img src={formData.bannerPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                                        <ImageIcon size={24} />
                                        <span className="text-xs mt-2">Cover 16:9</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="font-bold text-text-primary text-lg leading-tight mb-1">{formData.eventName || "Chưa nhập tên sự kiện"}</h3>
                        <p className="text-text-secondary text-xs mb-3">{formData.tagline}</p>
                        
                        <div className="space-y-2 mt-4 text-sm">
                            <div className="flex items-center justify-between gap-3 text-text-secondary">
                                <span>Hình thức sự kiện</span>
                                <span className="font-medium text-text-primary">Offline</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-text-secondary">
                                <span>Thể loại sự kiện</span>
                                <span className="font-medium text-text-primary text-right">{getEventCategoryLabel(formData.category)}</span>
                            </div>
                            <div className="flex items-start gap-2 text-text-secondary">
                                <MapPin size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-text-primary block">{formData.venue || "Chưa nhập địa điểm"}</span>
                                    <span className="text-xs">{formData.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Suất diễn & Vé */}
                <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-bg-page/50">
                        <h4 className="font-bold text-text-primary text-sm">2. Suất diễn & Vé</h4>
                        <button type="button" onClick={() => setStep(2)} className="text-action-brand-text-default text-xs font-medium hover:underline">Sửa</button>
                    </div>
                    <div className="p-4 flex-1 space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex-1 bg-bg-subtle p-3 rounded-lg border border-border-default text-center">
                                <span className="block text-text-muted text-xs mb-1">Suất diễn</span>
                                <span className="font-bold text-text-primary text-lg">{formData.showtimes.length}</span>
                            </div>
                            <div className="flex-1 bg-bg-subtle p-3 rounded-lg border border-border-default text-center">
                                <span className="block text-text-muted text-xs mb-1">Tổng vé</span>
                                <span className="font-bold text-text-primary text-lg">{totalTickets}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {formData.showtimes.map(st => {
                                const tickets = formData.ticketTypes.filter(t => t.showtimeId === st.id);
                                return (
                                    <div key={st.id} className="border border-border-default rounded-lg p-3 text-sm">
                                        <div className="font-bold text-text-primary mb-1 flex items-center justify-between">
                                            <span>{st.name}</span>
                                            <span className="text-xs text-text-muted font-normal flex items-center gap-1"><Calendar size={12}/> {formatShowtimeDate(st.startDatetime)}</span>
                                        </div>
                                        <div className="space-y-1 mt-2">
                                            {tickets.length > 0 ? tickets.map(t => (
                                                <div key={t.id} className="flex justify-between items-center text-xs text-text-secondary bg-bg-page px-2 py-1.5 rounded">
                                                    <span className="flex items-center gap-1.5"><Ticket size={12}/> {t.typeName}</span>
                                                    <span>{t.isFree ? "Miễn phí" : `${t.price.toLocaleString('vi-VN')}đ`} • {t.quantityTotal} vé</span>
                                                </div>
                                            )) : (
                                                <div className="text-xs text-feedback-warning-text italic">Chưa có vé cho suất diễn này</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Cài đặt & Resale */}
                <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-bg-page/50">
                        <h4 className="font-bold text-text-primary text-sm">3. Cài đặt & Phân phối</h4>
                        <button type="button" onClick={() => setStep(3)} className="text-action-brand-text-default text-xs font-medium hover:underline">Sửa</button>
                    </div>
                    <div className="p-4 flex-1">
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li className="flex justify-between items-center">
                                <span>Trạng thái hiển thị:</span>
                                <span className="font-bold text-text-primary">{formData.visibility === "PUBLIC" ? "Công khai" : formData.visibility}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Mua nhiều loại vé / đơn:</span>
                                <span>{formData.allowMultipleTicketTypes ? <CheckCircle2 size={16} className="text-feedback-success-text"/> : "-"}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Sử dụng mã giảm giá:</span>
                                <span>{formData.allowVouchers ? <CheckCircle2 size={16} className="text-feedback-success-text"/> : "-"}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Tính năng Resale:</span>
                                <span className={formData.allowResale ? "font-bold text-action-brand-text-default" : ""}>{formData.allowResale ? "Bật" : "Tắt"}</span>
                            </li>
                            {formData.allowResale && (
                                <li className="flex justify-between items-center pl-4 border-l-2 border-border-default text-xs">
                                    <span>Giá trần: {formData.resaleMaxPriceCap}%</span>
                                    <span>Phí đối soát: {formData.royaltyFee}%</span>
                                </li>
                            )}
                            <li className="flex justify-between items-center">
                                <span>Cổng Check-in (Gates):</span>
                                <span className="font-bold text-text-primary">{formData.gates.length} cổng</span>
                            </li>
                            {formData.gates.map((gate) => (
                                <li key={gate.id} className="flex justify-between items-center pl-4 border-l-2 border-border-default text-xs">
                                    <span>{gate.name}</span>
                                    <span>{gate.code || "Chưa có mã"}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 4. Hồ sơ thanh toán */}
                <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-border-default flex justify-between items-center bg-bg-page/50">
                        <h4 className="font-bold text-text-primary text-sm">4. Đối soát & Thanh toán</h4>
                        <button type="button" onClick={() => setStep(4)} className="text-action-brand-text-default text-xs font-medium hover:underline">Sửa</button>
                    </div>
                    <div className="p-4 flex-1">
                        {formData.selectedProfileId ? (
                            <div className="bg-bg-subtle p-3 rounded-lg border border-border-default">
                                <span className="block text-xs text-text-muted mb-1">Hồ sơ đã chọn</span>
                                <div className="font-bold text-text-primary text-sm mb-1">Hồ sơ chính (Công ty TNHH Evo Culture)</div>
                                <div className="text-xs text-text-secondary mt-2 grid grid-cols-1 gap-y-1">
                                    <div><span className="text-text-muted">Ngân hàng:</span> Vietcombank</div>
                                    <div><span className="text-text-muted">Số TK:</span> 0071000898989</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-feedback-error-text flex items-center gap-2">
                                <AlertCircle size={16}/> Chưa chọn hồ sơ đối soát
                            </div>
                        )}

                        {formData.reconciliationNotes && (
                            <div className="mt-4">
                                <span className="block text-xs text-text-muted mb-1">Ghi chú đối soát</span>
                                <p className="text-xs text-text-secondary p-2 bg-bg-page rounded border border-border-default italic">{formData.reconciliationNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {errors.review && (
                <div className="rounded-xl border border-feedback-error-border bg-feedback-error-bg p-4 text-sm text-feedback-error-text" data-field="review" tabIndex={-1}>
                    <div className="flex items-start gap-2">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <span>{errors.review}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
