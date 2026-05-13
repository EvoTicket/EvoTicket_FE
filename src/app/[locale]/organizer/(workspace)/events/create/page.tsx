"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/src/lib/axios";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import {
    Calendar, Image as ImageIcon,
    Plus, Trash2, Save, Info, Tag
} from "lucide-react";

const MapPicker = dynamic(() => import("@/src/components/MapPicker"), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

interface GenericOption {
    id?: number | string;
    code?: number;
    name?: string;
    categoryName?: string;
}

interface TicketTypeInput {
    typeName: string;
    description: string;
    price: number;
    quantityAvailable: number;
    minPurchase: number;
    maxPurchase: number;
    saleStartDate: string;
    saleEndDate: string;
    ticketTypeStatus: string;
}

function getApiErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        return response?.data?.message;
    }

    return undefined;
}

export default function CreateEventPage() {
    const { locale } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Lists
    const [categories, setCategories] = useState<GenericOption[]>([]);
    const [provinces, setProvinces] = useState<GenericOption[]>([]);
    const [wards, setWards] = useState<GenericOption[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        venue: "",
        address: "",
        provinceCode: 0,
        wardCode: 0,
        startDatetime: "",
        endDatetime: "",
        eventStatus: "PUBLISHED",
        eventType: "OFFLINE",
        totalSeats: 0,
        isFeatured: false,
        latitude: 0,
        longitude: 0,
        categoryId: 0,
        bannerImage: "", // URL string support for now
    });

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string>("");
    const [previewThumbnail, setPreviewThumbnail] = useState<string>("");

    const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([{
        typeName: "Vé thường",
        description: "Vé tham dự sự kiện tiêu chuẩn",
        price: 0,
        quantityAvailable: 100,
        minPurchase: 1,
        maxPurchase: 10,
        saleStartDate: "", // Sẽ set default khi user chọn ngày event
        saleEndDate: "",
        ticketTypeStatus: "AVAILABLE"
    }]);

    const fetchCategories = async () => {
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await api.get("/inventory-service/api/categories", { headers });
            if (res.data && res.data.data) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách danh mục");
        }
    };

    const fetchProvinces = async () => {
        try {
            const res = await api.get("/iam-service/api/locations/provinces");
            if (res.data) setProvinces(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchWards = async (provinceCode: number) => {
        try {
            const token = Cookies.get("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await api.get("/iam-service/api/locations/wards", {
                params: { provinceCode },
                headers
            });

            if (res.data) {
                const wardsData = Array.isArray(res.data) ? res.data : res.data.data;
                if (wardsData) {
                    setWards(wardsData);
                }
            }
        } catch (error) {
            console.error("Wards API error", error);
        }
    };

    // Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([fetchCategories(), fetchProvinces()]);
        };

        void loadInitialData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'provinceCode') {
            setWards([]);
            setFormData(prev => ({ ...prev, wardCode: 0 }));
            if (value) fetchWards(Number(value));
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'thumbnail') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'banner') {
                setBannerFile(file);
                setPreviewBanner(URL.createObjectURL(file));
            } else {
                setThumbnailFile(file);
                setPreviewThumbnail(URL.createObjectURL(file));
            }
        }
    };

    // Ticket Handlers
    const addTicketType = () => {
        setTicketTypes(prev => [...prev, {
            typeName: "",
            description: "",
            price: 0,
            quantityAvailable: 0,
            minPurchase: 1,
            maxPurchase: 5,
            saleStartDate: formData.startDatetime || "",
            saleEndDate: formData.endDatetime || "",
            ticketTypeStatus: "AVAILABLE"
        }]);
    };

    const removeTicketType = (index: number) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(prev => prev.filter((_, i) => i !== index));
        } else {
            toast.warning("Cần ít nhất một loại vé");
        }
    };

    const handleTicketChange = (index: number, field: keyof TicketTypeInput, value: string | number) => {
        const newTickets = [...ticketTypes];
        newTickets[index] = { ...newTickets[index], [field]: value };
        setTicketTypes(newTickets);
    };

    const formatDateForAPI = (dateString: string) => {
        // HTML datetime-local: 'YYYY-MM-DDTHH:MM' 
        // Need to ensure ISO 8601 with Seconds and TZ if required.
        // Input: 2026-01-04T16:33
        // Output Requirement: 2026-01-04T16:33:50.881Z
        if (!dateString) return null;
        return new Date(dateString).toISOString();
    };

    const uploadImage = async (file: File, eventId: number | string, type: 'thumbnail' | 'banner') => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('eventId', String(eventId));
        formDataUpload.append('type', type);

        const token = Cookies.get("token");
        await api.post("/inventory-service/api/upload/avatar", formDataUpload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = Cookies.get("token");

            // Validate basic
            if (!formData.eventName || !formData.categoryId || !formData.startDatetime || !formData.endDatetime) {
                toast.error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
                setLoading(false);
                return;
            }

            // Construct payload
            const payload = {
                eventName: formData.eventName,
                description: formData.description,
                venue: formData.venue,
                wardCode: Number(formData.wardCode),
                provinceCode: Number(formData.provinceCode),
                address: formData.address,
                startDatetime: formatDateForAPI(formData.startDatetime),
                endDatetime: formatDateForAPI(formData.endDatetime),
                eventStatus: formData.eventStatus,
                eventType: formData.eventType,
                totalSeats: ticketTypes.reduce((sum, t) => sum + Number(t.quantityAvailable), 0),
                isFeatured: formData.isFeatured,
                latitude: formData.latitude,
                longitude: formData.longitude,
                categoryId: Number(formData.categoryId),
                ticketTypes: ticketTypes.map(t => ({
                    ...t,
                    eventId: 0, // API seems to ignore this on create
                    price: Number(t.price),
                    quantityAvailable: Number(t.quantityAvailable),
                    minPurchase: Number(t.minPurchase),
                    maxPurchase: Number(t.maxPurchase),
                    takePlaceTime: formatDateForAPI(formData.startDatetime), // Probably event start time
                    saleStartDate: formatDateForAPI(t.saleStartDate),
                    saleEndDate: formatDateForAPI(t.saleEndDate)
                }))
            };

            const response = await api.post("/inventory-service/api/events", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && (response.data.status === 200 || response.data.status === 0)) {
                const newEventId = response.data.data.eventId;

                // Upload Images if exist
                const uploadPromises = [];
                if (bannerFile) uploadPromises.push(uploadImage(bannerFile, newEventId, 'banner'));
                if (thumbnailFile) uploadPromises.push(uploadImage(thumbnailFile, newEventId, 'thumbnail'));

                if (uploadPromises.length > 0) {
                    try {
                        await Promise.all(uploadPromises);
                    } catch (uploadError) {
                        console.error("Image upload error", uploadError);
                        toast.warning("Tạo sự kiện thành công nhưng upload ảnh thất bại.");
                    }
                }

                toast.success("Tạo sự kiện thành công!");
                router.push(`/${locale}/organizer/center`);
            } else {
                toast.error(response.data.message || "Có lỗi xảy ra");
            }

        } catch (error: unknown) {
            console.error("Create event error", error);
            toast.error(getApiErrorMessage(error) || "Không thể tạo sự kiện");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <h1 className="text-3xl font-bold text-text-primary mb-8">Tạo sự kiện mới</h1>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">

                {/* --- LEFT COLUMN: Basic Info --- */}
                <div className="w-full lg:w-2/3 space-y-8">

                    {/* General Info */}
                    <div className="	bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Info size={24} /> Thông tin chung
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên sự kiện <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="text" name="eventName" required
                                    value={formData.eventName} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Nhập tên sự kiện..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ảnh Banner <span className="text-feedback-error-text">*</span></label>
                                    <div className="relative border-2 border-dashed border-border-default rounded-lg p-4 hover:bg-bg-page/50 transition-colors cursor-pointer text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'banner')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {previewBanner ? (
                                            <div className="relative h-32 w-full">
                                                <img src={previewBanner} alt="Banner Preview" className="w-full h-full object-cover rounded" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
                                                <ImageIcon size={32} />
                                                <span className="text-xs mt-2">Upload Banner</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ảnh Thumbnail <span className="text-feedback-error-text">*</span></label>
                                    <div className="relative border-2 border-dashed border-border-default rounded-lg p-4 hover:bg-bg-page/50 transition-colors cursor-pointer text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'thumbnail')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {previewThumbnail ? (
                                            <div className="relative h-32 w-full">
                                                <img src={previewThumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover rounded" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
                                                <ImageIcon size={32} />
                                                <span className="text-xs mt-2">Upload Thumbnail</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Danh mục <span className="text-feedback-error-text">*</span></label>
                                    <select
                                        name="categoryId" required
                                        value={formData.categoryId} onChange={handleInputChange}
                                        className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value={0}>Chọn danh mục</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại hình</label>
                                    <select
                                        name="eventType"
                                        value={formData.eventType} onChange={handleInputChange}
                                        className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="ONLINE">Online</option>
                                        <option value="OFFLINE">Offline</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                                <textarea
                                    name="description" rows={5}
                                    value={formData.description} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Mô tả nội dung sự kiện..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time & Location */}
                    <div className="	bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Calendar size={24} /> Thời gian & Địa điểm
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Thời gian bắt đầu <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="datetime-local" name="startDatetime" required
                                    value={formData.startDatetime} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Thời gian kết thúc <span className="text-feedback-error-text">*</span></label>
                                <input
                                    type="datetime-local" name="endDatetime" required
                                    value={formData.endDatetime} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-border-default">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tỉnh / Thành phố <span className="text-feedback-error-text">*</span></label>
                                    <select
                                        name="provinceCode" required
                                        value={formData.provinceCode} onChange={handleInputChange}
                                        className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                    >
                                        <option value={0}>Chọn tỉnh/thành</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phường / Xã <span className="text-feedback-error-text">*</span></label>
                                    <select
                                        name="wardCode" required
                                        value={formData.wardCode} onChange={handleInputChange}
                                        className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                        disabled={!formData.provinceCode}
                                    >
                                        <option value={0}>Chọn phường/xã</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Tên địa điểm (Venue)</label>
                                <input
                                    type="text" name="venue"
                                    value={formData.venue} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                    placeholder="VD: Nhà hát lớn, Sân vận động Mỹ Đình..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Địa chỉ cụ thể</label>
                                <input
                                    type="text" name="address"
                                    value={formData.address} onChange={handleInputChange}
                                    className="w-full p-2 border border-border-default rounded-lg 	bg-bg-surface"
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>


                            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border-default relative">
                                <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs shadow-md">
                                    Click bản đồ để chọn vị trí
                                </div>
                                <MapPicker
                                    onLocationSelect={handleLocationSelect}
                                    initialPos={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : undefined}
                                />
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-text-muted">
                                <span>Lat: {formData.latitude.toFixed(6)}</span>
                                <span>Lng: {formData.longitude.toFixed(6)}</span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Tickets & Action --- */}
                <div className="w-full lg:w-1/3 space-y-8">

                    {/* Ticket Management */}
                    <div className="	bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                                <Tag size={24} /> Các loại vé
                            </h2>
                            <button type="button" onClick={addTicketType} className="p-2 bg-secondary rounded-full hover:bg-border transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {ticketTypes.map((ticket, idx) => (
                                <div key={idx} className="p-4 border border-border-default rounded-lg bg-bg-page relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeTicketType(idx)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Tên loại vé (VD: VIP)"
                                            className="w-full font-bold text-sm bg-transparent border-b border-border-default focus:border-primary focus:outline-none pb-1"
                                            value={ticket.typeName}
                                            onChange={(e) => handleTicketChange(idx, "typeName", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Mô tả vé"
                                            className="w-full text-xs text-text-secondary bg-transparent border-b border-border-default focus:border-primary focus:outline-none pb-1"
                                            value={ticket.description}
                                            onChange={(e) => handleTicketChange(idx, "description", e.target.value)}
                                        />

                                        <div className="flex gap-2">
                                            <div className="w-1/2">
                                                <label className="text-[10px] uppercase text-text-muted font-bold">Giá vé</label>
                                                <input
                                                    type="number" min={0}
                                                    className="w-full text-sm 	bg-bg-surface border border-border-default rounded p-1"
                                                    value={ticket.price}
                                                    onChange={(e) => handleTicketChange(idx, "price", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label className="text-[10px] uppercase text-text-muted font-bold">Số lượng</label>
                                                <input
                                                    type="number" min={1}
                                                    className="w-full text-sm 	bg-bg-surface border border-border-default rounded p-1"
                                                    value={ticket.quantityAvailable}
                                                    onChange={(e) => handleTicketChange(idx, "quantityAvailable", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="w-1/2">
                                                <label className="text-[10px] uppercase text-text-muted font-bold">Mở bán</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full text-[10px] 	bg-bg-surface border border-border-default rounded p-1"
                                                    value={ticket.saleStartDate}
                                                    onChange={(e) => handleTicketChange(idx, "saleStartDate", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label className="text-[10px] uppercase text-text-muted font-bold">Đóng bán</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full text-[10px] 	bg-bg-surface border border-border-default rounded p-1"
                                                    value={ticket.saleEndDate}
                                                    onChange={(e) => handleTicketChange(idx, "saleEndDate", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="	bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm sticky top-24">
                        <div className="flex items-center gap-2 mb-4">
                            {/* <input
                                type="checkbox"
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            /> */}
                            {/* <label htmlFor="isFeatured" className="text-sm font-medium">Đánh dấu là nổi bật (Featured)</label> */}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-button-primary-bg-defaultext-button-primary-text-default rounded-lg font-bold hover:bg-button-primary-bg-defaul-hover shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                                <Save size={20} />
                                {loading ? "Đang xử lý..." : "Công bố sự kiện"}
                            </button>
                            <button type="button" onClick={() => router.back()} className="w-full py-2 bg-transparent border border-border-default rounded-lg text-text-secondary hover:bg-secondary transition-colors">
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
