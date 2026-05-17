import { Landmark, FileText, CheckCircle2 } from "lucide-react";
import { CreateEventState } from "./useCreateEventWizard";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
}

// Mock settlement profiles for UI completeness
const mockProfiles = [
    {
        id: "prof-1",
        name: "Hồ sơ chính (Công ty TNHH Evo Culture)",
        bank: "Vietcombank",
        accountNumber: "0071000898989",
        accountName: "CÔNG TY TNHH EVO CULTURE",
        status: "VERIFIED"
    },
    {
        id: "prof-2",
        name: "Hồ sơ phụ (Cá nhân)",
        bank: "Techcombank",
        accountNumber: "19034567891011",
        accountName: "NGUYEN VAN A",
        status: "PENDING"
    }
];

export function CreateEventStep4Settlement({ formData, updateField }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Hồ sơ thanh toán và Đối soát</h3>
                </div>
                <p className="text-sm text-text-muted">Chọn hồ sơ pháp lý và tài khoản ngân hàng sẽ nhận tiền đối soát từ sự kiện này.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Hồ sơ áp dụng <span className="text-feedback-error-text">*</span></label>
                        <div className="space-y-3">
                            {mockProfiles.map(profile => (
                                <label 
                                    key={profile.id}
                                    className={`flex items-start gap-3 p-4 rounded-ds-xl border cursor-pointer transition-colors ${
                                        formData.selectedProfileId === profile.id
                                            ? "border-action-brand-bg-default bg-action-brand-bg-default/5 shadow-sm"
                                            : "border-border-default hover:bg-bg-subtle"
                                    }`}
                                >
                                    <div className="mt-1">
                                        <input 
                                            type="radio" 
                                            name="settlementProfile"
                                            checked={formData.selectedProfileId === profile.id}
                                            onChange={() => updateField("selectedProfileId", profile.id)}
                                            className="w-4 h-4 text-action-brand-bg-default border-border-default focus:ring-action-brand-bg-default"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-text-primary">{profile.name}</span>
                                            {profile.status === "VERIFIED" ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-feedback-success-text bg-feedback-success-bg/20 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 size={12} /> Đã xác thực
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-feedback-warning-text bg-feedback-warning-bg/20 px-2 py-0.5 rounded-full">
                                                    Chờ duyệt
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-text-secondary mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                                            <div><span className="text-text-muted">Ngân hàng:</span> {profile.bank}</div>
                                            <div><span className="text-text-muted">Số TK:</span> {profile.accountNumber}</div>
                                            <div className="sm:col-span-2"><span className="text-text-muted">Chủ TK:</span> {profile.accountName}</div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">Ghi chú đối soát (Tùy chọn)</h3>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Yêu cầu đặc biệt về hóa đơn / đối soát</label>
                    <textarea 
                        value={formData.reconciliationNotes}
                        onChange={e => updateField("reconciliationNotes", e.target.value)}
                        rows={4}
                        className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                        placeholder="Ví dụ: Cần xuất hóa đơn VAT điện tử, tần suất đối soát 1 tuần/lần..."
                    />
                </div>
            </div>
        </div>
    );
}
