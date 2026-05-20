"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { Building2, FileText, Phone, Mail, Globe, Upload, MapPin, ChevronDown, Check, Loader2, Landmark, UserCheck } from "lucide-react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { updateToken } from "@/src/store/slices/authSlice";
import { persistor } from "@/src/store";

interface OrganizerFormData {
    organizationName: string;
    legalName: string;
    taxCode: string;
    description: string;
    businessAddress: string;
    wardCode: number;
    provinceCode: number;
    businessPhone: string;
    businessEmail: string;
    website: string;
    businessLicenseUrl: string;
}

interface Province {
    code: number;
    name: string;
    codename: string;
    division_type: string;
    phone_code: number;
}

interface Ward {
    code: number;
    name: string;
    codename: string;
    division_type: string;
    province_code: number | null;
}

interface Bank {
    id: number;
    name: string;
    code: string;
    shortName: string;
    logo: string;
}

interface OrganizationRegisterResponse {
    status?: number;
    message?: string;
    newToken?: string;
    token?: string;
    data?: {
        newToken?: string;
        token?: string;
        organizationProfile?: unknown;
    } | null;
}

interface ApiErrorResponse {
    message?: string;
}

function extractOrganizationToken(response: OrganizationRegisterResponse): string | undefined {
    return response.data?.newToken ?? response.newToken ?? response.data?.token ?? response.token;
}

export default function RegisterOrganizerPage() {
    const router = useRouter();
    const params = useParams();
    const locale = typeof params.locale === "string" ? params.locale : "vi";
    const dispatch = useAppDispatch();
    const { token } = useAppSelector((state) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    const [formData, setFormData] = useState<OrganizerFormData>({
        organizationName: "",
        legalName: "",
        taxCode: "",
        description: "",
        businessAddress: "",
        wardCode: 0,
        provinceCode: 0,
        businessPhone: "",
        businessEmail: "",
        website: "",
        businessLicenseUrl: "",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    // Bank Account States
    const [bankProfileName, setBankProfileName] = useState("");
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankOwnerName, setBankOwnerName] = useState("");
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    const [isCheckingOwner, setIsCheckingOwner] = useState(false);

    const fetchProvinces = useCallback(async () => {
        setIsLoadingProvinces(true);
        try {
            const response = await api.get("/iam-service/api/locations/provinces");
            if (response.data && Array.isArray(response.data)) {
                setProvinces(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch provinces", error);
            toast.error("Không thể tải danh sách tỉnh/thành phố");
        } finally {
            setIsLoadingProvinces(false);
        }
    }, []);

    const fetchWards = useCallback(async (provinceCode: number) => {
        setIsLoadingWards(true);
        try {
            const response = await api.get(
                `/iam-service/api/locations/wards?provinceCode=${provinceCode}`
            );
            if (response.data && Array.isArray(response.data)) {
                setWards(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch wards", error);
            toast.error("Không thể tải danh sách phường/xã");
        } finally {
            setIsLoadingWards(false);
        }
    }, []);

    const fetchBanks = useCallback(async () => {
        setIsLoadingBanks(true);
        try {
            const response = await api.get("/inventory-service/api/banks");
            if (response.data?.data && Array.isArray(response.data.data)) {
                setBanks(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setBanks(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch banks", error);
            toast.error("Không thể tải danh sách ngân hàng");
        } finally {
            setIsLoadingBanks(false);
        }
    }, []);

    // Fetch provinces and banks on component mount
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void fetchProvinces();
            void fetchBanks();
        });
        return () => cancelAnimationFrame(frame);
    }, [fetchProvinces, fetchBanks]);

    // Fetch wards when province changes
    useEffect(() => {
        if (formData.provinceCode > 0) {
            const frame = requestAnimationFrame(() => {
                void fetchWards(formData.provinceCode);
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [fetchWards, formData.provinceCode]);

    // Auto lookup bank account owner name
    useEffect(() => {
        if (selectedBank?.code && bankAccountNumber && bankAccountNumber.length >= 6) {
            const controller = new AbortController();
            const delayDebounceFn = setTimeout(async () => {
                setIsCheckingOwner(true);
                setBankOwnerName("");
                try {
                    const response = await api.get(
                        `/inventory-service/api/banks/owner-name?bankCode=${selectedBank.code}&bankAccountNumber=${bankAccountNumber}`,
                        { signal: controller.signal }
                    );
                    if (response.data?.data) {
                        setBankOwnerName(response.data.data);
                        toast.success("Xác thực tài khoản ngân hàng thành công!");
                    } else if (typeof response.data === "string") {
                        setBankOwnerName(response.data);
                        toast.success("Xác thực tài khoản ngân hàng thành công!");
                    }
                } catch (error: any) {
                    if (axios.isCancel(error)) return;
                    console.error("Failed to lookup owner name", error);
                    const errorMsg = error.response?.data?.message || "Không thể xác thực tài khoản ngân hàng";
                    toast.error(errorMsg);
                    setBankOwnerName("");
                } finally {
                    setIsCheckingOwner(false);
                }
            }, 800);

            return () => {
                clearTimeout(delayDebounceFn);
                controller.abort();
            };
        } else {
            setBankOwnerName("");
        }
    }, [selectedBank, bankAccountNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const nextValue = name === "wardCode" || name === "provinceCode" ? parseInt(value) || 0 : value;

        if (name === "provinceCode") {
            setWards([]);
            setFormData((prev) => ({
                ...prev,
                provinceCode: nextValue as number,
                wardCode: 0,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    const handleProvinceChange = (code: number) => {
        setWards([]);
        setFormData((prev) => ({
            ...prev,
            provinceCode: code,
            wardCode: 0,
        }));
    };

    const handleWardChange = (code: number) => {
        setFormData((prev) => ({
            ...prev,
            wardCode: code,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục");
            router.replace(`/${locale}/auth/login?callbackUrl=/${locale}/organizer/register`);
            return;
        }

        if (!licenseFile) {
            toast.error("Vui lòng tải lên Giấy phép kinh doanh");
            return;
        }

        if (!selectedBank) {
            toast.error("Vui lòng chọn ngân hàng");
            return;
        }

        if (!bankAccountNumber) {
            toast.error("Vui lòng nhập số tài khoản ngân hàng");
            return;
        }

        if (!bankOwnerName) {
            toast.error("Tên chủ tài khoản ngân hàng chưa được xác thực");
            return;
        }

        if (!bankProfileName) {
            toast.error("Vui lòng nhập tên gợi nhớ tài khoản");
            return;
        }

        setIsLoading(true);

        try {
            const orgPayload = {
                organizationName: formData.organizationName,
                legalName: formData.legalName,
                taxCode: formData.taxCode,
                description: formData.description,
                businessAddress: formData.businessAddress,
                wardCode: formData.wardCode,
                provinceCode: formData.provinceCode,
                businessPhone: formData.businessPhone,
                businessEmail: formData.businessEmail,
                website: formData.website,
                bankInfos: [
                    {
                        profileName: bankProfileName,
                        bankCode: selectedBank.code,
                        bankName: selectedBank.shortName || selectedBank.name,
                        bankAccountNumber: bankAccountNumber,
                        bankOwnerName: bankOwnerName
                    }
                ]
            };

            const submitFormData = new FormData();
            submitFormData.append(
                "organization",
                new Blob([JSON.stringify(orgPayload)], {
                    type: "application/json",
                })
            );

            if (logoFile) {
                submitFormData.append("logoFile", logoFile);
            }
            if (licenseFile) {
                submitFormData.append("licenseFile", licenseFile);
            }

            const response = await api.post<OrganizationRegisterResponse>(
                "/iam-service/api/organizations",
                submitFormData,
                {
                    headers: { "Content-Type": undefined }
                }
            );

            if (response.status === 201 || response.data?.status === 201) {
                const newToken = extractOrganizationToken(response.data);

                if (!newToken) {
                    console.error("Missing newToken in organization creation response:", response.data);
                    toast.error("Đăng ký thành công nhưng không nhận được token mới.");
                    return;
                }

                dispatch(updateToken({ token: newToken }));
                await persistor.flush();

                toast.success("Đăng ký organizer thành công!");
                router.replace(`/${locale}/organizer/center`);
            }
        } catch (error: unknown) {
            console.error("Failed to register organizer", error);

            if (!axios.isAxiosError<ApiErrorResponse>(error)) {
                toast.error("Đăng ký thất bại. Vui lòng thử lại.");
                return;
            }

            if (error.response?.status === 400) {
                toast.error("Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("Phiên đăng nhập không hợp lệ hoặc bạn không có quyền thực hiện thao tác này.");
            } else if (error.response?.status === 409) {
                toast.error("Tổ chức đã tồn tại.");
            } else {
                toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen 	bg-bg-surface py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-bg-page border border-border-default rounded-ds-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-text-primary mb-2">
                            Đăng ký trở thành Organizer
                        </h1>
                        <p className="text-text-muted">
                            Điền thông tin tổ chức của bạn để bắt đầu tạo sự kiện
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Logo Upload */}
                        <div className="bg-bg-subtle p-6 rounded-ds-lg border border-border-default mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Logo tổ chức
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-border-default overflow-hidden flex items-center justify-center bg-bg-surface shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="h-10 w-10 text-text-muted" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="logoFile"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            if (file) {
                                                setLogoFile(file);
                                                setLogoPreview(URL.createObjectURL(file));
                                            } else {
                                                setLogoFile(null);
                                                setLogoPreview(null);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="logoFile"
                                        className="inline-flex items-center px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary text-sm font-medium hover:bg-bg-subtle cursor-pointer transition-colors"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Chọn ảnh logo
                                    </label>
                                    <p className="text-xs text-text-muted mt-2">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Organization Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <Building2 className="inline mr-2 h-4 w-4" />
                                    Tên tổ chức *
                                </label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: Công ty ABC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <FileText className="inline mr-2 h-4 w-4" />
                                    Tên pháp lý *
                                </label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: Công ty TNHH ABC"
                                />
                            </div>
                        </div>

                        {/* Tax Code & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Mã số thuế *
                                </label>
                                <input
                                    type="text"
                                    name="taxCode"
                                    value={formData.taxCode}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: 0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <Phone className="inline mr-2 h-4 w-4" />
                                    Số điện thoại *
                                </label>
                                <input
                                    type="tel"
                                    name="businessPhone"
                                    value={formData.businessPhone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: 0901234567"
                                />
                            </div>
                        </div>

                        {/* Email & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <Mail className="inline mr-2 h-4 w-4" />
                                    Email doanh nghiệp *
                                </label>
                                <input
                                    type="email"
                                    name="businessEmail"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: contact@abc.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <Globe className="inline mr-2 h-4 w-4" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: https://abc.com"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                <MapPin className="inline mr-2 h-4 w-4" />
                                Địa chỉ kinh doanh *
                            </label>
                            <input
                                type="text"
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: 123 Đường ABC"
                            />
                        </div>

                        {/* Province & Ward Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <MapPin className="inline mr-2 h-4 w-4" />
                                    Tỉnh/Thành phố *
                                </label>
                                <Listbox
                                    value={formData.provinceCode}
                                    onChange={handleProvinceChange}
                                    disabled={isLoadingProvinces || provinces.length === 0}
                                >
                                    <div className="relative">
                                        <ListboxButton
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[42px]"
                                        >
                                            <span>
                                                {formData.provinceCode > 0
                                                    ? provinces.find((p) => p.code === formData.provinceCode)?.name
                                                    : isLoadingProvinces
                                                    ? "Đang tải..."
                                                    : "-- Chọn tỉnh/thành phố --"}
                                            </span>
                                            <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2" />
                                        </ListboxButton>
                                        <ListboxOptions
                                            anchor="bottom start"
                                            modal={false}
                                            className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                        >
                                            <ListboxOption
                                                value={0}
                                                className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm text-text-muted"
                                            >
                                                <span className="group-data-[selected]:font-semibold">-- Chọn tỉnh/thành phố --</span>
                                                <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                            </ListboxOption>
                                            {provinces.map((province) => (
                                                <ListboxOption
                                                    key={province.code}
                                                    value={province.code}
                                                    className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                                >
                                                    <span className="group-data-[selected]:font-semibold">{province.name}</span>
                                                    <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <MapPin className="inline mr-2 h-4 w-4" />
                                    Phường/Xã *
                                </label>
                                <Listbox
                                    value={formData.wardCode}
                                    onChange={handleWardChange}
                                    disabled={isLoadingWards || !formData.provinceCode || wards.length === 0}
                                >
                                    <div className="relative">
                                        <ListboxButton
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[42px]"
                                        >
                                            <span>
                                                {formData.wardCode > 0
                                                    ? wards.find((w) => w.code === formData.wardCode)?.name
                                                    : isLoadingWards
                                                    ? "Đang tải..."
                                                    : !formData.provinceCode
                                                    ? "-- Chọn tỉnh/thành phố trước --"
                                                    : wards.length === 0
                                                    ? "-- Không có dữ liệu --"
                                                    : "-- Chọn phường/xã --"}
                                            </span>
                                            <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2" />
                                        </ListboxButton>
                                        <ListboxOptions
                                            anchor="bottom start"
                                            modal={false}
                                            className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                        >
                                            <ListboxOption
                                                value={0}
                                                className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm text-text-muted"
                                            >
                                                <span className="group-data-[selected]:font-semibold">-- Chọn phường/xã --</span>
                                                <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                            </ListboxOption>
                                            {wards.map((ward) => (
                                                <ListboxOption
                                                    key={ward.code}
                                                    value={ward.code}
                                                    className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                                >
                                                    <span className="group-data-[selected]:font-semibold">{ward.name}</span>
                                                    <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Mô tả tổ chức
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Mô tả ngắn về tổ chức của bạn..."
                            />
                        </div>

                        {/* Bank Account Info */}
                        <div className="border-t border-border-default pt-8 mt-8">
                            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary" />
                                Thông tin tài khoản ngân hàng nhận tiền
                            </h3>
                            <p className="text-sm text-text-muted mb-6">
                                Cung cấp thông tin tài khoản ngân hàng để nhận thanh toán doanh thu từ vé bán được.
                            </p>

                            <div className="space-y-6 bg-bg-subtle p-6 rounded-ds-lg border border-border-default mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tên gợi nhớ */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Tên gợi nhớ tài khoản *
                                        </label>
                                        <input
                                            type="text"
                                            value={bankProfileName}
                                            onChange={(e) => setBankProfileName(e.target.value)}
                                            placeholder="VD: Tài khoản chính"
                                            required
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Ngân hàng */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Ngân hàng *
                                        </label>
                                        <Listbox
                                            value={selectedBank}
                                            onChange={setSelectedBank}
                                            disabled={isLoadingBanks || banks.length === 0}
                                        >
                                            <div className="relative">
                                                <ListboxButton
                                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[42px]"
                                                >
                                                    <span className="flex items-center gap-2 truncate">
                                                        {selectedBank ? (
                                                            <>
                                                                {selectedBank.logo && (
                                                                    <img src={selectedBank.logo} alt="" className="h-5 w-auto object-contain max-w-[60px]" />
                                                                )}
                                                                <span>{selectedBank.shortName || selectedBank.name}</span>
                                                            </>
                                                        ) : isLoadingBanks ? (
                                                            "Đang tải..."
                                                        ) : (
                                                            "-- Chọn ngân hàng --"
                                                        )}
                                                    </span>
                                                    <ChevronDown size={16} className="text-text-secondary shrink-0 ml-2" />
                                                </ListboxButton>
                                                <ListboxOptions
                                                    anchor="bottom start"
                                                    modal={false}
                                                    className="z-50 w-[var(--button-width)] [--anchor-gap:4px] !max-h-60 overflow-y-auto bg-bg-surface border border-border-default rounded-ds-lg shadow-lg text-text-primary focus:outline-none py-1 mt-1"
                                                >
                                                    {banks.map((bank) => (
                                                        <ListboxOption
                                                            key={bank.id}
                                                            value={bank}
                                                            className="group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle transition-colors text-sm"
                                                        >
                                                            <span className="flex items-center gap-3 truncate">
                                                                {bank.logo && (
                                                                    <img src={bank.logo} alt="" className="h-5 w-auto object-contain max-w-[60px]" />
                                                                )}
                                                                <span className="group-data-[selected]:font-semibold">{bank.shortName} - {bank.name}</span>
                                                            </span>
                                                            <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100 text-action-brand-text-default shrink-0 ml-2" />
                                                        </ListboxOption>
                                                    ))}
                                                </ListboxOptions>
                                            </div>
                                        </Listbox>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Số tài khoản */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Số tài khoản *
                                        </label>
                                        <input
                                            type="text"
                                            value={bankAccountNumber}
                                            onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Nhập số tài khoản"
                                            required
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Tên chủ tài khoản */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Tên chủ tài khoản *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={bankOwnerName}
                                                readOnly
                                                placeholder={isCheckingOwner ? "Đang xác thực..." : "Tự động hiển thị tên chủ tài khoản"}
                                                required
                                                className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-subtle text-text-primary focus:outline-none font-semibold uppercase disabled:opacity-75 h-[42px]"
                                            />
                                            {isCheckingOwner && (
                                                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                </div>
                                            )}
                                            {!isCheckingOwner && bankOwnerName && (
                                                <div className="absolute right-3 top-2.5">
                                                    <UserCheck className="h-5 w-5 text-action-success-text-default" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Business License Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                <FileText className="inline mr-2 h-4 w-4" />
                                Giấy phép kinh doanh *
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-default border-dashed rounded-ds-lg bg-bg-subtle hover:bg-bg-surface transition-colors">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-text-muted" />
                                    <div className="flex text-sm text-text-muted justify-center">
                                        <label
                                            htmlFor="licenseFile"
                                            className="relative cursor-pointer bg-transparent rounded-md font-semibold text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                        >
                                            <span>Tải tệp lên</span>
                                            <input
                                                id="licenseFile"
                                                name="licenseFile"
                                                type="file"
                                                accept="image/*,application/pdf"
                                                className="sr-only"
                                                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-text-muted">PDF hoặc hình ảnh (PNG, JPG) lên đến 10MB</p>
                                    {licenseFile && (
                                        <p className="text-sm font-medium text-action-success-text-default mt-2 flex items-center justify-center gap-1">
                                            <Check className="h-4 w-4" /> Đã chọn: {licenseFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 border border-border-default text-text-primary rounded-ds-lg font-semibold transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-ds-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {isLoading ? "Đang xử lý..." : "Đăng ký"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
