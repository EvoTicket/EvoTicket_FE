"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import { Building2, FileText, Phone, Mail, Globe, Upload, MapPin } from "lucide-react";

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

export default function RegisterOrganizerPage() {
    const router = useRouter();
    const { locale } = useParams();
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

    // Fetch provinces on component mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Fetch wards when province changes
    useEffect(() => {
        if (formData.provinceCode > 0) {
            fetchWards(formData.provinceCode);
        } else {
            setWards([]);
            setFormData(prev => ({ ...prev, wardCode: 0 }));
        }
    }, [formData.provinceCode]);

    const fetchProvinces = async () => {
        const token = Cookies.get("token");
        if (!token) return;

        setIsLoadingProvinces(true);
        try {
            const response = await api.get("/iam-service/api/locations/provinces", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && Array.isArray(response.data)) {
                setProvinces(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch provinces", error);
            toast.error("Không thể tải danh sách tỉnh/thành phố");
        } finally {
            setIsLoadingProvinces(false);
        }
    };

    const fetchWards = async (provinceCode: number) => {
        const token = Cookies.get("token");
        if (!token) return;

        setIsLoadingWards(true);
        try {
            const response = await api.get(
                `/iam-service/api/locations/wards?provinceCode=${provinceCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "wardCode" || name === "provinceCode" ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = Cookies.get("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục");
            router.push(`/${locale}/auth/login`);
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post(
                "/iam-service/api/organizations",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && response.data.status === 201) {
                toast.success("Đăng ký organizer thành công!");

                // Lấy token mới từ response
                const newToken = response.data.data["New token"];

                // Thay thế token cũ bằng token mới
                Cookies.set("token", newToken);

                // Chuyển đến trang Organizer Center
                router.push(`/${locale}/organizer/center`);
            }
        } catch (error: any) {
            console.error("Failed to register organizer", error);
            if (error.response?.status === 400) {
                toast.error("Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
            } else if (error.response?.status === 409) {
                toast.error("Tổ chức đã tồn tại.");
            } else {
                toast.error("Đăng ký thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-main border border-border rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-txt-primary mb-2">
                            Đăng ký trở thành Organizer
                        </h1>
                        <p className="text-txt-muted">
                            Điền thông tin tổ chức của bạn để bắt đầu tạo sự kiện
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Organization Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <Building2 className="inline mr-2 h-4 w-4" />
                                    Tên tổ chức *
                                </label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: Công ty ABC"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <FileText className="inline mr-2 h-4 w-4" />
                                    Tên pháp lý *
                                </label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: Công ty TNHH ABC"
                                />
                            </div>
                        </div>

                        {/* Tax Code & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    Mã số thuế *
                                </label>
                                <input
                                    type="text"
                                    name="taxCode"
                                    value={formData.taxCode}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: 0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
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
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: 0901234567"
                                />
                            </div>
                        </div>

                        {/* Email & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <Mail className="inline mr-2 h-4 w-4" />
                                    Email doanh nghiệp *
                                </label>
                                <input
                                    type="email"
                                    name="businessEmail"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: contact@abc.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <Globe className="inline mr-2 h-4 w-4" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="VD: https://abc.com"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-txt-primary mb-2">
                                <MapPin className="inline mr-2 h-4 w-4" />
                                Địa chỉ kinh doanh *
                            </label>
                            <input
                                type="text"
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: 123 Đường ABC"
                            />
                        </div>

                        {/* Province & Ward Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <MapPin className="inline mr-2 h-4 w-4" />
                                    Tỉnh/Thành phố *
                                </label>
                                <select
                                    name="provinceCode"
                                    value={formData.provinceCode || ""}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoadingProvinces}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {isLoadingProvinces ? "Đang tải..." : "-- Chọn tỉnh/thành phố --"}
                                    </option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-txt-primary mb-2">
                                    <MapPin className="inline mr-2 h-4 w-4" />
                                    Phường/Xã *
                                </label>
                                <select
                                    name="wardCode"
                                    value={formData.wardCode || ""}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoadingWards || !formData.provinceCode || wards.length === 0}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {isLoadingWards
                                            ? "Đang tải..."
                                            : !formData.provinceCode
                                                ? "-- Chọn tỉnh/thành phố trước --"
                                                : wards.length === 0
                                                    ? "-- Không có dữ liệu --"
                                                    : "-- Chọn phường/xã --"}
                                    </option>
                                    {wards.map((ward) => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-txt-primary mb-2">
                                Mô tả tổ chức
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Mô tả ngắn về tổ chức của bạn..."
                            />
                        </div>

                        {/* Business License URL */}
                        <div>
                            <label className="block text-sm font-medium text-txt-primary mb-2">
                                <Upload className="inline mr-2 h-4 w-4" />
                                URL Giấy phép kinh doanh
                            </label>
                            <input
                                type="url"
                                name="businessLicenseUrl"
                                value={formData.businessLicenseUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="VD: https://example.com/license.pdf"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-border text-txt-primary rounded-lg font-medium hover:bg-secondary transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Đang xử lý..." : "Đăng ký"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
