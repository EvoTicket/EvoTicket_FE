import { CreateEventState } from "./useCreateEventWizard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, FileText, Landmark, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
}


export function CreateEventStep4Settlement({ formData, updateField }: Props) {
    const params = useParams();
    const locale = typeof params.locale === "string" ? params.locale : "vi";
    const t = useTranslations("CreateEvent.Step4");

    return (
        <div className="space-y-6">
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">{t("settlement_title")}</h3>
                </div>
                <p className="text-sm text-text-muted">{t("settlement_desc")}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t("profile_label")} <span className="text-feedback-error-text">*</span></label>
                        <div className="space-y-3">
                            {formData.bankInfos?.length > 0 ? formData.bankInfos.map(profile => (
                                <label
                                    key={profile.id}
                                    className={`flex items-start gap-3 p-4 rounded-ds-xl border cursor-pointer transition-colors ${formData.selectedProfileId === profile.id
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
                                            <span className="font-bold text-text-primary">{profile.profileName || profile.bankName}</span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-feedback-success-text bg-feedback-success-bg/20 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 size={12} /> {t("verified")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-text-secondary mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                                            <div><span className="text-text-muted">{t("bank")}</span> {profile.bankName}</div>
                                            <div><span className="text-text-muted">{t("account_no")}</span> {profile.bankAccountNumber}</div>
                                            <div className="sm:col-span-2"><span className="text-text-muted">{t("account_name")}</span> {profile.bankOwnerName}</div>
                                        </div>
                                    </div>
                                </label>
                            )) : (
                                <div className="text-sm text-text-muted border border-dashed border-border-strong rounded-ds-xl p-6 text-center">
                                    <p>{t("no_bank")}</p>
                                    <button type="button" className="mt-3 inline-flex items-center gap-2 text-action-brand-text-default font-bold hover:underline">
                                        <Plus size={16} /> {t("add_bank")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">{t("notes_title")}</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">{t("notes_label")}</label>
                    <textarea
                        value={formData.reconciliationNotes}
                        onChange={e => updateField("reconciliationNotes", e.target.value)}
                        rows={4}
                        className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus outline-none resize-none text-sm"
                        placeholder={t("notes_placeholder")}
                    />
                </div>
            </div>
        </div>
    );
}
