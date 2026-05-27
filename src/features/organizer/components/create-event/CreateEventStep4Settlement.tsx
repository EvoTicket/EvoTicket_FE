import { CreateEventState } from "./useCreateEventWizard";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, FileText, Landmark, Plus, X, ChevronDown, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions } from "@headlessui/react";

import { type StepErrors } from "./createEventValidation";

interface Props {
    formData: CreateEventState;
    updateField: <K extends keyof CreateEventState>(field: K, value: CreateEventState[K]) => void;
    errors?: StepErrors;
}


export function CreateEventStep4Settlement({ formData, updateField, errors = {} }: Props) {
    const params = useParams();
    const locale = typeof params.locale === "string" ? params.locale : "vi";
    const t = useTranslations("CreateEvent.Step4");
    const tValidation = useTranslations("CreateEvent.Validation");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bankList, setBankList] = useState<any[]>([]);
    const [profileName, setProfileName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankOwnerName, setBankOwnerName] = useState("");
    const [isFetchingOwner, setIsFetchingOwner] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch bank list on mount/modal open
    useEffect(() => {
        if (isModalOpen) {
            const fetchBanks = async () => {
                try {
                    const res = await api.get("/inventory-service/api/banks");
                    if (res.data?.data) {
                        setBankList(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch bank list", err);
                }
            };
            fetchBanks();
        }
    }, [isModalOpen]);

    // Fetch bank owner name automatically
    useEffect(() => {
        if (!bankCode || !bankAccountNumber || bankAccountNumber.length < 6) {
            setBankOwnerName("");
            return;
        }

        const fetchOwner = async () => {
            setIsFetchingOwner(true);
            try {
                const res = await api.get(
                    `/inventory-service/api/banks/owner-name?bankCode=${bankCode}&bankAccountNumber=${bankAccountNumber}`
                );
                let owner = "";
                if (res.data) {
                    if (typeof res.data === "string") owner = res.data;
                    else if (res.data.ownerName) owner = res.data.ownerName;
                    else if (res.data.data) {
                        if (typeof res.data.data === "string") owner = res.data.data;
                        else if (res.data.data.ownerName) owner = res.data.data.ownerName;
                    }
                }
                setBankOwnerName(owner ? owner.toUpperCase() : "");
            } catch (err) {
                console.error("Failed to fetch bank owner name", err);
                setBankOwnerName("");
            } finally {
                setIsFetchingOwner(false);
            }
        };

        const timer = setTimeout(fetchOwner, 1500);
        return () => clearTimeout(timer);
    }, [bankCode, bankAccountNumber]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileName || !bankCode || !bankAccountNumber || !bankOwnerName) {
            toast.warning(locale === "vi" ? "Vui lòng điền đầy đủ và chính xác thông tin tài khoản." : "Please fill in all account details correctly.");
            return;
        }

        setIsSaving(true);
        try {
            const selectedBank = bankList.find(b => b.code === bankCode);
            const bankName = selectedBank ? (selectedBank.shortName || selectedBank.name) : bankCode;

            const payload = {
                profileName,
                bankCode,
                bankName,
                bankAccountNumber,
                bankOwnerName
            };

            const response = await api.post("/iam-service/api/organizations/bank-info", payload);
            if (response.status === 200 || response.data?.status === 0 || response.status === 201) {
                toast.success(locale === "vi" ? "Thêm tài khoản ngân hàng thành công!" : "Bank account added successfully!");
                
                // Fetch the updated list from organizations/me
                const meRes = await api.get("/iam-service/api/organizations/me");
                const newProfiles = meRes.data?.data?.bankInfos || [];
                
                updateField("bankInfos", newProfiles);
                
                if (newProfiles.length > 0) {
                    const matched = newProfiles.find((p: any) => p.bankAccountNumber === bankAccountNumber);
                    if (matched) {
                        updateField("selectedProfileId", matched.id);
                    } else {
                        updateField("selectedProfileId", newProfiles[newProfiles.length - 1].id);
                    }
                }

                // Reset fields
                setProfileName("");
                setBankCode("");
                setBankAccountNumber("");
                setBankOwnerName("");
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error("Failed to add bank info", err);
            toast.error(locale === "vi" ? "Thêm tài khoản ngân hàng thất bại!" : "Failed to add bank account!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-surface border border-border-default rounded-ds-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Landmark className="text-text-secondary" size={20} />
                    <h3 className="text-lg font-bold text-text-primary">{t("settlement_title")}</h3>
                </div>
                <p className="text-sm text-text-muted">{t("settlement_desc")}</p>

                <div className="space-y-4">
                    <div data-field="selectedProfileId">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">{t("profile_label")} <span className="text-feedback-error-text">*</span></label>
                            {formData.bankInfos?.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 text-xs text-action-brand-text-default font-bold hover:underline cursor-pointer"
                                >
                                    <Plus size={14} /> {locale === "vi" ? "Thêm tài khoản thụ hưởng" : "Add settlement account"}
                                </button>
                            )}
                        </div>
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
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-3 inline-flex items-center gap-2 text-action-brand-text-default font-bold hover:underline cursor-pointer"
                                    >
                                        <Plus size={16} /> {t("add_bank")}
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.selectedProfileId && (
                            <p className="mt-2 text-sm text-feedback-error-text">
                                {tValidation(errors.selectedProfileId.replace("Validation.", ""))}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-bg-surface border border-border-default rounded-ds-2xl max-w-md w-full p-6 relative shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-subtle text-text-secondary transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Landmark size={20} className="text-action-brand-text-default" />
                            {locale === "vi" ? "Thêm tài khoản thụ hưởng" : "Add Settlement Account"}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {locale === "vi" ? "Tên gợi nhớ" : "Profile Name"} <span className="text-feedback-error-text">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={locale === "vi" ? "Ví dụ: Tài khoản chính, BIDV cá nhân..." : "e.g. Primary Account, Personal BIDV..."}
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                    className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {locale === "vi" ? "Ngân hàng" : "Bank"} <span className="text-feedback-error-text">*</span>
                                </label>
                                <Combobox
                                    value={bankCode}
                                    onChange={(val) => {
                                        setBankCode(val || "");
                                        setSearchQuery("");
                                    }}
                                >
                                    <div className="relative">
                                        <div className="w-full flex items-center justify-between p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus-within:border-field-border-focus focus-within:ring-1 focus-within:ring-focus-ring outline-none text-sm text-left">
                                            <ComboboxInput
                                                className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-muted cursor-pointer"
                                                placeholder={locale === "vi" ? "-- Chọn ngân hàng --" : "-- Select Bank --"}
                                                displayValue={(code) => {
                                                    const bank = bankList.find(b => b.code === code);
                                                    return bank ? `${bank.shortName || bank.name} (${bank.code})` : "";
                                                }}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <ComboboxButton className="flex items-center text-text-secondary cursor-pointer">
                                                <ChevronDown size={16} />
                                            </ComboboxButton>
                                        </div>
                                        <ComboboxOptions
                                            anchor="bottom start"
                                            modal={false}
                                            className="z-[9999] w-[var(--input-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                        >
                                            <ComboboxOption
                                                value=""
                                                className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm text-text-muted"
                                            >
                                                <span>{locale === "vi" ? "-- Chọn ngân hàng --" : "-- Select Bank --"}</span>
                                            </ComboboxOption>
                                            {bankList
                                                .filter(bank => {
                                                    const q = searchQuery.toLowerCase();
                                                    return (
                                                        (bank.shortName || "").toLowerCase().includes(q) ||
                                                        (bank.name || "").toLowerCase().includes(q) ||
                                                        (bank.code || "").toLowerCase().includes(q)
                                                    );
                                                })
                                                .map(bank => (
                                                    <ComboboxOption
                                                        key={bank.id}
                                                        value={bank.code}
                                                        className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {bank.logo && (
                                                                <img
                                                                    src={bank.logo}
                                                                    alt={bank.shortName || bank.name}
                                                                    className="w-6 h-6 object-contain rounded bg-white border p-0.5 border-border-default"
                                                                />
                                                            )}
                                                            <span>{bank.shortName || bank.name} ({bank.code})</span>
                                                        </div>
                                                        <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                                    </ComboboxOption>
                                                ))}
                                        </ComboboxOptions>
                                    </div>
                                </Combobox>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {locale === "vi" ? "Số tài khoản" : "Account Number"} <span className="text-feedback-error-text">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={locale === "vi" ? "Nhập số tài khoản ngân hàng" : "Enter bank account number"}
                                    value={bankAccountNumber}
                                    onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                                    className="w-full p-2.5 border border-border-default rounded-ds-lg bg-field-bg-default focus:border-field-border-focus outline-none text-sm font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {locale === "vi" ? "Tên chủ tài khoản" : "Account Owner Name"}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder={
                                            isFetchingOwner
                                                ? (locale === "vi" ? "ĐANG TRUY VẤN TÊN CHỦ TÀI KHOẢN..." : "QUERYING OWNER...")
                                                : (locale === "vi" ? "TỰ ĐỘNG XÁC THỰC TÊN CHỦ TÀI KHOẢN" : "AUTOMATICALLY RETRIEVED")
                                        }
                                        value={bankOwnerName}
                                        className="w-full p-2.5 border border-border-default rounded-ds-lg bg-bg-muted outline-none text-sm font-bold text-text-primary uppercase cursor-not-allowed select-none"
                                    />
                                    {isFetchingOwner && (
                                        <div className="absolute inset-y-0 right-3 flex items-center">
                                            <Loader2 size={16} className="text-action-brand-text-default animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-text-muted mt-1.5">
                                    {locale === "vi"
                                        ? "* Tên chủ tài khoản sẽ được tự động truy vấn dựa trên số tài khoản và ngân hàng đã chọn."
                                        : "* Account owner name is automatically queried based on the selected bank and account number."}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-border-default rounded-ds-lg text-sm font-medium text-text-secondary hover:bg-bg-subtle transition-colors"
                                >
                                    {locale === "vi" ? "Hủy" : "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || isFetchingOwner || !bankOwnerName}
                                    className="px-4 py-2 bg-action-brand-bg-default text-action-brand-text-default rounded-ds-lg text-sm font-bold hover:bg-action-brand-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                                >
                                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                                    {locale === "vi" ? "Thêm mới" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
