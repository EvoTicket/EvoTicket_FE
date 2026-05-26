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
import { isValidEmail, isValidPhone, isValidTaxCode, isValidWebsite } from "@/src/lib/validations";

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
    shortDescription?: string;
    publicBio?: string;
    businessType: string;
    billingAddress: string;
    organizationType: string;
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

    const [errors, setErrors] = useState<Record<string, string>>({});
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
        shortDescription: "",
        publicBio: "",
        businessType: "Công ty TNHH",
        billingAddress: "",
        organizationType: "Doanh nghiệp tổ chức sự kiện",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

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
        let nextValue = name === "wardCode" || name === "provinceCode" ? parseInt(value) || 0 : value;

        if (name === "businessPhone") {
            nextValue = (nextValue as string).replace(/\D/g, "").slice(0, 11);
        } else if (name === "taxCode") {
            nextValue = (nextValue as string).replace(/[^0-9-]/g, "").slice(0, 14);
        }

        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "provinceCode") {
            setErrors((prev) => ({ ...prev, provinceCode: "", wardCode: "" }));
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

        const newErrors: Record<string, string> = {};

        if (!logoFile) newErrors.logoFile = "Vui lòng tải lên Logo tổ chức";
        if (!formData.organizationType) newErrors.organizationType = "Vui lòng chọn Loại hình tổ chức";
        if (!formData.businessType) newErrors.businessType = "Vui lòng chọn Loại hình kinh doanh";
        if (!formData.organizationName.trim()) newErrors.organizationName = "Vui lòng nhập Tên tổ chức";
        if (!formData.legalName.trim()) newErrors.legalName = "Vui lòng nhập Tên pháp lý";

        if (!formData.taxCode.trim()) newErrors.taxCode = "Vui lòng nhập Mã số thuế";
        else if (!isValidTaxCode(formData.taxCode)) newErrors.taxCode = "Mã số thuế không hợp lệ (10 số, hoặc 10 số - 3 số)";

        if (!formData.businessPhone.trim()) newErrors.businessPhone = "Vui lòng nhập Số điện thoại";
        else if (!isValidPhone(formData.businessPhone)) newErrors.businessPhone = "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số";

        if (!formData.businessEmail.trim()) newErrors.businessEmail = "Vui lòng nhập Email doanh nghiệp";
        else if (!isValidEmail(formData.businessEmail)) newErrors.businessEmail = "Email doanh nghiệp không hợp lệ";

        if (!formData.website.trim()) newErrors.website = "Vui lòng nhập Website";
        else if (!isValidWebsite(formData.website)) newErrors.website = "Website phải hợp lệ và bắt đầu bằng http:// hoặc https://";
        if (!formData.businessAddress.trim()) newErrors.businessAddress = "Vui lòng nhập Địa chỉ kinh doanh";
        if (!formData.billingAddress.trim()) newErrors.billingAddress = "Vui lòng nhập Địa chỉ xuất hoá đơn";

        if (formData.provinceCode === 0) newErrors.provinceCode = "Vui lòng chọn Tỉnh/Thành phố";
        if (formData.wardCode === 0) newErrors.wardCode = "Vui lòng chọn Phường/Xã";

        if (!formData.description.trim()) newErrors.description = "Vui lòng nhập Mô tả tổ chức";
        if (!coverFile) newErrors.coverFile = "Vui lòng tải lên Ảnh bìa tổ chức";
        if (!formData.shortDescription?.trim()) newErrors.shortDescription = "Vui lòng nhập Mô tả ngắn";
        if (!formData.publicBio?.trim()) newErrors.publicBio = "Vui lòng nhập Tiểu sử công khai";

        if (!bankProfileName.trim()) newErrors.bankProfileName = "Vui lòng nhập tên gợi nhớ tài khoản";
        if (!selectedBank) newErrors.selectedBank = "Vui lòng chọn ngân hàng";
        if (!bankAccountNumber.trim()) newErrors.bankAccountNumber = "Vui lòng nhập số tài khoản ngân hàng";
        if (!bankOwnerName.trim()) newErrors.bankOwnerName = "Tên chủ tài khoản ngân hàng chưa được xác thực";

        if (!licenseFile) newErrors.licenseFile = "Vui lòng tải lên Giấy phép kinh doanh";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại các trường thông tin bị lỗi");
            setTimeout(() => {
                const firstErrorElement = document.querySelector(".text-red-500");
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 100);
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
                businessType: formData.businessType,
                billingAddress: formData.billingAddress || formData.businessAddress,
                organizationType: formData.organizationType,
                shortDescription: formData.shortDescription || formData.description,
                publicBio: formData.publicBio || formData.description,
                bankInfos: [
                    {
                        profileName: bankProfileName,
                        bankCode: selectedBank!.code,
                        bankName: selectedBank!.shortName || selectedBank!.name,
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
            if (coverFile) {
                submitFormData.append("coverFile", coverFile);
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
            <div className="max-w-[90%] mx-auto">
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
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Logo Upload */}
                        <div className="bg-bg-subtle p-6 rounded-ds-lg border border-border-default mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                Logo tổ chức *
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
                                    {errors.logoFile && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.logoFile}</p>}
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
                                {errors.organizationName && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.organizationName}</p>}
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
                                {errors.legalName && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.legalName}</p>}
                            </div>
                        </div>

                        {/* Organization Type & Business Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Loại hình tổ chức *
                                </label>
                                <select
                                    name="organizationType"
                                    value={formData.organizationType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary h-[42px]"
                                >
                                    <option value="Doanh nghiệp tổ chức sự kiện">Doanh nghiệp tổ chức sự kiện</option>
                                    <option value="Nhà hát/Đoàn nghệ thuật">Nhà hát/Đoàn nghệ thuật</option>
                                    <option value="Cá nhân tự do">Cá nhân tự do</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                {errors.organizationType && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.organizationType}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Loại hình kinh doanh *
                                </label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary h-[42px]"
                                >
                                    <option value="Công ty TNHH">Công ty TNHH</option>
                                    <option value="Công ty Cổ phần">Công ty Cổ phần</option>
                                    <option value="Hộ kinh doanh">Hộ kinh doanh</option>
                                    <option value="Cá nhân">Cá nhân</option>
                                </select>
                                {errors.businessType && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.businessType}</p>}
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
                                {errors.taxCode && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.taxCode}</p>}
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
                                {errors.businessPhone && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.businessPhone}</p>}
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
                                {errors.businessEmail && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.businessEmail}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    <Globe className="inline mr-2 h-4 w-4" />
                                    Website *
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: https://abc.com"
                                />
                                {errors.website && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.website}</p>}
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
                            {errors.businessAddress && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.businessAddress}</p>}
                        </div>

                        {/* Billing Address */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-text-primary">
                                    <MapPin className="inline mr-2 h-4 w-4" />
                                    Địa chỉ xuất hoá đơn *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, billingAddress: prev.businessAddress }))}
                                    className="text-xs text-primary hover:text-primary-hover font-semibold"
                                >
                                    Sao chép địa chỉ kinh doanh
                                </button>
                            </div>
                            <input
                                type="text"
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Địa chỉ để xuất hoá đơn tài chính"
                            />
                            {errors.billingAddress && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.billingAddress}</p>}
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
                                {errors.provinceCode && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.provinceCode}</p>}
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
                                {errors.wardCode && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.wardCode}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Mô tả tổ chức *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-border-default rounded-ds-lg 	bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Mô tả ngắn về tổ chức của bạn..."
                            />
                            {errors.description && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.description}</p>}
                        </div>

                        {/* Cover Image Upload */}
                        <div className="bg-bg-subtle p-6 rounded-ds-lg border border-border-default">
                            <label className="block text-sm font-medium text-text-primary mb-3">
                                <Upload className="inline mr-2 h-4 w-4" />
                                Ảnh bìa tổ chức (Cover Image) *
                            </label>
                            {/* Preview banner */}
                            <div className="relative w-full h-36 rounded-ds-lg border-2 border-dashed border-border-default overflow-hidden flex items-center justify-center bg-bg-surface mb-3">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-text-muted">
                                        <Upload className="h-8 w-8" />
                                        <span className="text-xs">Chưa có ảnh bìa</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="coverFile"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        setCoverFile(file);
                                        setCoverPreview(URL.createObjectURL(file));
                                    } else {
                                        setCoverFile(null);
                                        setCoverPreview(null);
                                    }
                                }}
                            />
                            <label
                                htmlFor="coverFile"
                                className="inline-flex items-center px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary text-sm font-medium hover:bg-bg-subtle cursor-pointer transition-colors"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Chọn ảnh bìa
                            </label>
                            <p className="text-xs text-text-muted mt-2">Hỗ trợ JPG, PNG. Tỷ lệ 16:9 khuyến nghị. Tối đa 5MB.</p>
                            {errors.coverFile && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.coverFile}</p>}
                        </div>

                        {/* Short Description & Public Bio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Mô tả ngắn (Hiển thị trang chủ) *
                                </label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Tóm tắt về tổ chức"
                                />
                                {errors.shortDescription && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.shortDescription}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Tiểu sử công khai (Public Bio) *
                                </label>
                                <textarea
                                    name="publicBio"
                                    value={formData.publicBio}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    placeholder="Giới thiệu chi tiết cho công chúng"
                                />
                                {errors.publicBio && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.publicBio}</p>}
                            </div>
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
                                            onChange={(e) => {
                                                setBankProfileName(e.target.value);
                                                setErrors((prev) => ({ ...prev, bankProfileName: "" }));
                                            }}
                                            placeholder="VD: Tài khoản chính"
                                            required
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        {errors.bankProfileName && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.bankProfileName}</p>}
                                    </div>

                                    {/* Ngân hàng */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">
                                            Ngân hàng *
                                        </label>
                                        <Listbox
                                            value={selectedBank}
                                            onChange={(val) => {
                                                setSelectedBank(val);
                                                setErrors((prev) => ({ ...prev, selectedBank: "" }));
                                            }}
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
                                        {errors.selectedBank && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.selectedBank}</p>}
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
                                            onChange={(e) => {
                                                setBankAccountNumber(e.target.value.replace(/\D/g, ""));
                                                setErrors((prev) => ({ ...prev, bankAccountNumber: "" }));
                                            }}
                                            placeholder="Nhập số tài khoản"
                                            required
                                            className="w-full px-4 py-2 border border-border-default rounded-ds-lg bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        {errors.bankAccountNumber && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.bankAccountNumber}</p>}
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
                                        {errors.bankOwnerName && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.bankOwnerName}</p>}
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
                                                onChange={(e) => {
                                                    setLicenseFile(e.target.files?.[0] || null);
                                                    setErrors((prev) => ({ ...prev, licenseFile: "" }));
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-text-muted">PDF hoặc hình ảnh (PNG, JPG) lên đến 10MB</p>
                                    {errors.licenseFile && <p className="text-[11px] text-red-500 mt-1 pl-1 select-none animate-fadeIn">{errors.licenseFile}</p>}
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
