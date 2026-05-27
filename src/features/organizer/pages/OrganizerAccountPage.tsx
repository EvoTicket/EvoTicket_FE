"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Phone, Lock, ShieldCheck, Building2, Globe, Landmark,
  Users, Camera, ExternalLink, CreditCard, KeyRound, LogOut, Pencil,
  Trash2, Plus, X, Loader2, Check
} from "lucide-react";
import Image from "next/image";
import { OrganizerStatusBadge } from "@/src/features/organizer/components/common/OrganizerStatusBadge";
import type { StatusTone } from "@/src/features/organizer/constants/organizerStatusMapping";
import { organizationApi } from "@/src/features/organizer/api/organizationApi";
import type { OrganizerAccountProfileResponse } from "@/src/features/organizer/types/api";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions } from "@headlessui/react";

/* ── Local helpers ───────────────────────────────────────── */

function Panel({ title, subtitle, right, children }: {
  title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, icon, editable = true, helper }: {
  label: string; value: string; icon?: React.ReactNode; editable?: boolean; helper?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</label>
      <div className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2">
        {icon && <span className="flex text-[var(--color-icon-muted)]">{icon}</span>}
        <input defaultValue={value} readOnly={!editable}
          className="flex-1 border-none bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none" />
        {editable && <Pencil size={13} className="text-[var(--color-icon-muted)]" />}
      </div>
      {helper && <span className="text-[11px] text-[var(--color-text-muted)]">{helper}</span>}
    </div>
  );
}

function SummaryStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="flex flex-col gap-1 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--color-badge-${tone}-text)` }} />
      </div>
      <span className="text-lg font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function Toggle({ on = false }: { on?: boolean }) {
  return (
    <span className="relative inline-flex h-5 w-9 items-center rounded-full border transition-colors"
      style={{
        background: on ? "var(--color-action-brand-bg-default)" : "var(--color-bg-elevated)",
        borderColor: on ? "var(--color-action-brand-bg-hover)" : "var(--color-border-default)",
      }}>
      <span className="block h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </span>
  );
}

function NotifRow({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{label}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{desc}</span>
      </div>
      <Toggle on={defaultOn} />
    </div>
  );
}

function SecurityAction({ icon, title, desc, tone = "brand" }: {
  icon: React.ReactNode; title: string; desc: string; tone?: StatusTone;
}) {
  return (
    <button className="flex items-start gap-3 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3 text-left">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-md"
        style={{ background: `var(--color-badge-${tone}-bg)`, color: `var(--color-badge-${tone}-text)` }}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{title}</span>
        <span className="text-[11.5px] text-[var(--color-text-muted)]">{desc}</span>
      </div>
    </button>
  );
}

function SummaryLine({ icon, label, value, tone = "neutral" }: {
  icon: React.ReactNode; label: string; value: string; tone?: StatusTone;
}) {
  return (
    <div className="flex items-start gap-3 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-md"
        style={{ background: "var(--color-badge-brand-bg)", color: "var(--color-badge-brand-text)" }}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{value}</span>
      </div>
      {tone === "success" && <OrganizerStatusBadge tone="success">✓</OrganizerStatusBadge>}
    </div>
  );
}

function HistoryItem({ icon, label, time, meta, tone = "neutral" }: {
  icon: React.ReactNode; label: string; time: string; meta?: string; tone?: StatusTone;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-ds-md"
        style={{ background: `var(--color-badge-${tone}-bg)`, color: `var(--color-badge-${tone}-text)` }}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{label}</span>
          <span className="text-[11px] text-[var(--color-text-muted)]">{time}</span>
        </div>
        {meta && <span className="text-xs text-[var(--color-text-muted)]">{meta}</span>}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */

export default function AccountPage() {
  const t = useTranslations("Organizer.Account");
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : "vi";

  const [profile, setProfile] = useState<OrganizerAccountProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add payment modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bankList, setBankList] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankOwnerName, setBankOwnerName] = useState("");
  const [isFetchingOwner, setIsFetchingOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete payment states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getAccountProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load account profile", err);
      setError(t("load_error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Fetch bank list when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
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
  }, [isAddModalOpen]);

  // Fetch bank owner name automatically
  useEffect(() => {
    if (!bankCode || !bankAccountNumber || bankAccountNumber.length < 6) {
      setBankOwnerName("");
      return;
    }

    const fetchOwner = async () => {
      setIsFetchingOwner(true);
      try {
        const response = await api.get(
          `/inventory-service/api/banks/owner-name?bankCode=${bankCode}&bankAccountNumber=${bankAccountNumber}`
        );
        let ownerName = "";
        if (response.data) {
          if (typeof response.data === "string") {
            ownerName = response.data;
          } else if (response.data.ownerName) {
            ownerName = response.data.ownerName;
          } else if (response.data.data) {
            if (typeof response.data.data === "string") {
              ownerName = response.data.data;
            } else if (response.data.data.ownerName) {
              ownerName = response.data.data.ownerName;
            }
          }
        }

        if (ownerName) {
          setBankOwnerName(ownerName.toUpperCase());
        } else {
          setBankOwnerName("");
        }
      } catch (err) {
        console.error("Failed to fetch bank owner name", err);
        setBankOwnerName("");
      } finally {
        setIsFetchingOwner(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOwner();
    }, 2000);

    return () => clearTimeout(timer);
  }, [bankCode, bankAccountNumber]);

  const handleAddPayment = async (e: React.FormEvent) => {
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
        
        // Refresh the profile info
        await loadProfile();

        // Reset fields
        setProfileName("");
        setBankCode("");
        setBankAccountNumber("");
        setBankOwnerName("");
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to add bank info", err);
      toast.error(locale === "vi" ? "Thêm tài khoản ngân hàng thất bại!" : "Failed to add bank account!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!bankToDelete) return;
    setIsDeleting(true);
    try {
      const response = await api.delete(`/iam-service/api/organizations/bank-info/${bankToDelete.id}`);
      if (response.status === 200 || response.data?.status === 0 || response.status === 204) {
        toast.success(locale === "vi" ? "Xóa tài khoản ngân hàng thành công!" : "Bank account deleted successfully!");
        
        // Refresh the profile info
        await loadProfile();

        setIsDeleteModalOpen(false);
        setBankToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete bank info", err);
      toast.error(locale === "vi" ? "Xóa tài khoản ngân hàng thất bại!" : "Failed to delete bank account!");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <div className="h-8 w-64 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />
        <div className="flex items-center gap-5 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
          <div className="h-20 w-20 animate-pulse rounded-ds-xl bg-[var(--color-bg-elevated)]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-6 w-48 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />
            <div className="h-4 w-72 animate-pulse rounded-ds-md bg-[var(--color-bg-elevated)]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 flex flex-col gap-5">
            <div className="h-48 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
            <div className="h-64 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
          </div>
          <div className="h-64 animate-pulse rounded-ds-lg bg-[var(--color-bg-elevated)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-sm text-[var(--color-feedback-error-text)]">{error}</p>
        <button onClick={loadProfile} className="rounded-ds-md border border-[var(--color-border-default)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">{t("retry")}</button>
      </div>
    );
  }

  const joinedDate = profile?.joinedAt ? new Date(profile.joinedAt) : null;
  const joinedText = joinedDate
    ? t("member_since", { date: `${String(joinedDate.getMonth() + 1).padStart(2, "0")}/${joinedDate.getFullYear()}` })
    : t("member_since", { date: "03/2026" });

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="m-0 text-2xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">{t("subtitle")}</p>
      </div>

      {/* Profile summary */}
      <div className="flex items-center gap-5 rounded-ds-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-ds-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
            <Image src={profile?.logoUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?w=160&q=80"} alt={profile?.organizationName || "Logo"} width={80} height={80} className="h-full w-full object-cover" unoptimized />
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-[var(--color-action-brand-bg-default)] text-white">
            <Camera size={12} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="m-0 text-xl font-semibold text-[var(--color-text-primary)]">{profile?.organizationName || "Evo Culture Studio"}</h2>
            <OrganizerStatusBadge tone={profile?.status?.toUpperCase() === "ACTIVE" ? "success" : "neutral"}>
              {profile?.status || "Active"}
            </OrganizerStatusBadge>
            <OrganizerStatusBadge tone="info">
              {profile?.verificationLevel || "Basic verified"}
            </OrganizerStatusBadge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5"><Building2 size={13} className="text-[var(--color-icon-muted)]" />{profile?.organizationType || "Doanh nghiệp tổ chức sự kiện"}</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span>{joinedText}</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span>{t("primary_contact")} <span className="font-medium text-[var(--color-text-primary)]">{profile?.primaryContactName || "Nguyễn Lê Hoàng Phúc"}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-[13px] text-[var(--color-text-secondary)]">
            <ExternalLink size={13} />{t("view_public_page")}
          </button>
          <button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">
            <ShieldCheck size={13} />{t("upgrade_verification")}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      {/* <div className="grid grid-cols-3 gap-5"> */}
      <div className="col-span-2 flex flex-col gap-5">
        {/* Account owner */}
        <Panel title={t("owner_panel_title")} subtitle={t("owner_panel_subtitle")} right={<OrganizerStatusBadge tone={profile?.ownerInfo?.twoFactorEnabled ? "success" : "warning"}>{profile?.ownerInfo?.twoFactorEnabled ? t("two_factor_on") : t("two_factor_off")}</OrganizerStatusBadge>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("field_fullname")} value={profile?.ownerInfo?.fullName || "Nguyễn Lê Hoàng Phúc"} />
            <Field label={t("field_email")} value={profile?.ownerInfo?.email || "phuc.organizer@evoticket.vn"} icon={<Mail size={13} />} />
            <Field label={t("field_phone")} value={profile?.ownerInfo?.phone || "09xx xxx xxx"} icon={<Phone size={13} />} />
            <Field label={t("field_emp_code")} value={profile?.ownerInfo?.employeeCode || "EVO-OP-0042"} editable={false} />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <SecurityAction icon={<KeyRound size={14} />} title={t("change_password")} desc={t("last_changed")} />
            <SecurityAction icon={<Lock size={14} />} title={t("enable_2fa")} desc={t("enable_2fa_desc")} tone={profile?.ownerInfo?.twoFactorEnabled ? "success" : "warning"} />
            <SecurityAction icon={<LogOut size={14} />} title={t("sessions")} desc={t("sessions_desc", { count: profile?.ownerInfo?.activeSessions || 3 })} />
          </div>
        </Panel>

        {/* Organization profile */}
        <Panel title={t("org_panel_title")} subtitle={t("org_panel_subtitle")}
          right={<button className="flex items-center gap-2 rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"><Pencil size={12} />{t("edit")}</button>}>
          <div className="relative h-[120px] overflow-hidden rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
            <Image src={profile?.coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80"} alt="cover" fill className="object-cover" unoptimized />
            <button className="absolute right-3 top-3 flex items-center gap-1.5 rounded-ds-md border border-[var(--color-border-default)] px-2.5 py-1.5 text-xs text-white backdrop-blur-sm" style={{ background: "rgba(15,10,24,0.7)" }}>
              <Camera size={12} />{t("change_cover")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("field_org_name")} value={profile?.organizationName || "Evo Culture Studio"} />
            <Field label={t("field_website")} value={profile?.website || "https://evoculture.vn"} icon={<Globe size={13} />} />
            <Field label={t("field_support_email")} value={profile?.supportEmail || "support@evoculture.vn"} icon={<Mail size={13} />} />
            <Field label={t("field_support_phone")} value={profile?.supportPhone || "1900 6868"} icon={<Phone size={13} />} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{t("field_short_desc")}</label>
            <textarea defaultValue={profile?.shortDescription || "Evo Culture Studio là đơn vị tổ chức các sự kiện văn hoá - giải trí hiện đại, ứng dụng blockchain cho vé và resale minh bạch."} rows={2}
              className="resize-y rounded-ds-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{t("field_public_bio")}</label>
            <textarea defaultValue={profile?.publicBio || "Chúng tôi mang đến những trải nghiệm âm nhạc, triển lãm và hội thảo chất lượng cao tại Việt Nam — từ sân khấu Livestage đến các không gian sáng tạo đa ngành."} rows={3}
              className="resize-y rounded-ds-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none" />
          </div>
        </Panel>

        {/* Legal / payout */}
        <Panel title={t("legal_panel_title")} subtitle={t("legal_panel_subtitle")} right={<OrganizerStatusBadge tone={profile?.taxVerified ? "success" : "neutral"}>{profile?.taxVerified ? t("verified") : t("unverified")}</OrganizerStatusBadge>}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <SummaryLine icon={<Building2 size={14} />} label={t("business_type")} value={profile?.businessType || "Công ty TNHH"} />
              <SummaryLine icon={<ShieldCheck size={14} />} label={t("tax_code")} value={`${profile?.taxCode || "0316xxxxxx"} · ${profile?.taxVerified ? t("verified") : t("unverified")}`} tone={profile?.taxVerified ? "success" : "neutral"} />
              <SummaryLine icon={<Building2 size={14} />} label={t("billing_address")} value={profile?.billingAddress || "Tầng 7, Toà nhà Sonatus, Q.1, TP.HCM"} />
            </div>

            <div className="flex flex-col gap-2.5 pt-3 border-t border-[var(--color-border-subtle)]">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{t("payout_accounts")}</span>
              <div className="grid grid-cols-2 gap-3">
                {profile?.payoutInfo && profile.payoutInfo.length > 0 ? (
                  profile.payoutInfo.map((bank, index) => (
                    <div key={index} className="flex flex-col gap-2 rounded-ds-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
                          <Landmark size={13} className="text-[var(--color-icon-muted)]" />
                          {bank.bankName}
                        </span>
                        <div className="flex items-center gap-2">
                          <OrganizerStatusBadge tone="success">{t("active")}</OrganizerStatusBadge>
                          <button
                            type="button"
                            onClick={() => {
                              setBankToDelete(bank);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer flex items-center justify-center"
                            title={locale === "vi" ? "Xóa tài khoản" : "Delete account"}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 text-[11px] text-[var(--color-text-secondary)]">
                        <span>Chủ TK: <span className="font-medium text-[var(--color-text-primary)]">{bank.accountName}</span></span>
                        <span>Số TK: <span className="font-medium text-[var(--color-text-primary)]">{bank.accountNumber}</span></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-ds-md border border-dashed border-[var(--color-border-subtle)] p-6 text-center text-xs text-[var(--color-text-muted)]">
                    {t("no_payout")}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end pt-2 border-t border-[var(--color-border-subtle)] mt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-3 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)] cursor-pointer"
            >
              <Plus size={13} />
              {locale === "vi" ? "Thêm tài khoản nhận tiền" : "Add payout account"}
            </button>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title={t("notif_panel_title")} subtitle={t("notif_panel_subtitle")}>
          <div className="grid grid-cols-2 gap-3">
            <NotifRow label={t("notif_email")} desc={t("notif_email_desc")} defaultOn />
            <NotifRow label={t("notif_payout")} desc={t("notif_payout_desc")} defaultOn />
            <NotifRow label={t("notif_review")} desc={t("notif_review_desc")} defaultOn />
            <NotifRow label={t("notif_checker")} desc={t("notif_checker_desc")} defaultOn={false} />
          </div>
        </Panel>
      </div>


      {/* </div> */}

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 mt-2 flex items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] px-6 py-4 backdrop-blur-md" style={{ background: "var(--color-bg-overlay)" }}>
        <span className="text-xs text-[var(--color-text-muted)]">{t("unsaved_changes")}</span>
        <div className="flex items-center gap-2">
          <button className="rounded-ds-md border border-[var(--color-border-default)] bg-transparent px-4 py-2 text-[13px] text-[var(--color-text-secondary)]">{t("cancel")}</button>
          <button className="rounded-ds-md border border-[var(--color-action-brand-bg-hover)] bg-[var(--color-action-brand-bg-default)] px-4 py-2 text-[13px] font-medium text-[var(--color-action-brand-text-default)]">{t("save_changes")}</button>
        </div>
      </div>

      {/* Add Payout Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-ds-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Landmark size={20} className="text-[var(--color-action-brand-bg-default)]" />
              {locale === "vi" ? "Thêm tài khoản thụ hưởng" : "Add Settlement Account"}
            </h3>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                  {locale === "vi" ? "Tên gợi nhớ" : "Profile Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === "vi" ? "Ví dụ: Tài khoản chính, BIDV cá nhân..." : "e.g. Primary Account, Personal BIDV..."}
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full p-2.5 border border-[var(--color-border-default)] rounded-ds-lg bg-[var(--color-bg-elevated)] focus:border-[var(--color-action-brand-bg-hover)] outline-none text-sm text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                  {locale === "vi" ? "Ngân hàng" : "Bank"} <span className="text-red-500">*</span>
                </label>
                <Combobox
                  value={bankCode}
                  onChange={(val) => {
                    setBankCode(val || "");
                    setSearchQuery("");
                  }}
                >
                  <div className="relative">
                    <div className="relative w-full cursor-default overflow-hidden rounded-ds-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-left focus:outline-none text-sm">
                      <ComboboxInput
                        className="w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-[var(--color-text-primary)] bg-transparent focus:ring-0 outline-none"
                        displayValue={(code: string) => {
                          const bank = bankList.find((b) => b.code === code);
                          return bank ? `${bank.shortName || bank.name} (${bank.code})` : "";
                        }}
                        placeholder={locale === "vi" ? "Tìm kiếm ngân hàng..." : "Search bank..."}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                          }
                        }}
                      />
                      <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[var(--color-text-secondary)]"><path d="m6 9 6 6 6-6"/></svg>
                      </ComboboxButton>
                    </div>
                    <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-ds-md bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                      {(() => {
                        const filteredBanks = searchQuery === ""
                          ? bankList
                          : bankList.filter((bank) => {
                            const query = searchQuery.toLowerCase().trim();
                            return (
                              (bank.name ?? "").toLowerCase().includes(query) ||
                              (bank.shortName ?? "").toLowerCase().includes(query) ||
                              (bank.code ?? "").toLowerCase().includes(query)
                            );
                          });

                        if (filteredBanks.length === 0 && searchQuery !== "") {
                          return (
                            <div className="relative cursor-default select-none py-2 px-4 text-[var(--color-text-secondary)]">
                              {locale === "vi" ? "Không tìm thấy ngân hàng." : "No banks found."}
                            </div>
                          );
                        }

                        return filteredBanks.map((bank) => (
                          <ComboboxOption
                            key={bank.id}
                            value={bank.code}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 text-sm ${active ? "bg-[var(--color-action-brand-bg-default)] text-white" : "text-[var(--color-text-primary)]"
                              }`
                            }
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                  {bank.shortName || bank.name} ({bank.code})
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-[var(--color-action-brand-bg-default)]"
                                    }`}
                                  >
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </ComboboxOption>
                        ));
                      })()}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                  {locale === "vi" ? "Số tài khoản" : "Account Number"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === "vi" ? "Nhập số tài khoản ngân hàng" : "Enter bank account number"}
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-2.5 border border-[var(--color-border-default)] rounded-ds-lg bg-[var(--color-bg-elevated)] focus:border-[var(--color-action-brand-bg-hover)] outline-none text-sm text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]">
                  {locale === "vi" ? "Tên chủ tài khoản" : "Account Owner Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    placeholder={
                      isFetchingOwner
                        ? (locale === "vi" ? "Đang xác thực..." : "Validating...")
                        : (locale === "vi" ? "Tự động điền khi nhập đủ số tài khoản" : "Auto-filled based on account number")
                    }
                    value={bankOwnerName}
                    className="w-full p-2.5 pr-10 border border-[var(--color-border-default)] rounded-ds-lg bg-[var(--color-bg-elevated)] outline-none text-sm text-[var(--color-text-primary)] font-bold uppercase cursor-not-allowed select-none"
                  />
                  {isFetchingOwner && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="animate-spin h-4 w-4 text-[var(--color-action-brand-bg-default)]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-border-default)] rounded-ds-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] cursor-pointer"
                >
                  {locale === "vi" ? "Hủy" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !bankOwnerName}
                  className="px-4 py-2 bg-[var(--color-action-brand-bg-default)] hover:bg-[var(--color-action-brand-bg-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-ds-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer animate-pulse-subtle"
                >
                  {isSaving && <Loader2 className="animate-spin h-4 w-4" />}
                  {locale === "vi" ? "Thêm" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payout Confirmation Modal */}
      {isDeleteModalOpen && bankToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-ds-2xl max-w-md w-full p-6 relative shadow-2xl text-center">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              {locale === "vi" ? "Xác nhận xóa tài khoản nhận tiền" : "Confirm Payout Account Deletion"}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              {locale === "vi"
                ? `Bạn có chắc chắn muốn xóa tài khoản ngân hàng ${bankToDelete.bankName} (Số TK: ${bankToDelete.accountNumber}) không?`
                : `Are you sure you want to delete payout account ${bankToDelete.bankName} (Acc No: ${bankToDelete.accountNumber})?`}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-[var(--color-border-default)] rounded-ds-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] cursor-pointer"
              >
                {locale === "vi" ? "Hủy" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeletePayment}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-ds-lg text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 className="animate-spin h-4 w-4" />}
                {locale === "vi" ? "Xác nhận" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
