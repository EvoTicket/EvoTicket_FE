import React from 'react';
import { useTranslations } from 'next-intl';

export default function PolicyPage() {
    const t = useTranslations('Policy');

    return (
        <div className="min-h-screen bg-bg-page pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">{t('page_title', { defaultMessage: 'Quy Chế & Chính Sách Nền Tảng' })}</h1>
                
                <div className="space-y-12">
                    {/* Quy chế và thông tin bán lại vé */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('resale_rules_title', { defaultMessage: '1. Quy chế và Thông tin Bán lại vé (Resale)' })}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('resale_rules_desc1', { defaultMessage: 'Nền tảng của chúng tôi cung cấp thị trường thứ cấp an toàn, minh bạch để người dùng có thể bán lại vé (resale) khi không có nhu cầu sử dụng.' })}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('resale_rule_1', { defaultMessage: 'Chỉ các vé được mua chính thức từ hệ thống mới có thể đăng bán lại.' })}</li>
                                <li>{t('resale_rule_2', { defaultMessage: 'Người bán có thể đặt giá bán, tuy nhiên phải tuân thủ quy định về Giá Trần (Price Ceiling) để chống đầu cơ.' })}</li>
                                <li>{t('resale_rule_3', { defaultMessage: 'Vé sau khi giao dịch thành công trên chợ Resale sẽ tự động được thu hồi từ người bán và phát hành cho người mua mới với thông tin mã QR động hoàn toàn mới.' })}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Quy định chuyển nhượng */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('transfer_rules_title', { defaultMessage: '2. Quy định Chuyển nhượng (Transfer)' })}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('transfer_rules_desc1', { defaultMessage: 'Người dùng có quyền chuyển nhượng vé cho bạn bè, người thân mà không thông qua chợ Resale.' })}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('transfer_rule_1', { defaultMessage: 'Chuyển nhượng qua ví/số điện thoại/email tài khoản người nhận.' })}</li>
                                <li>{t('transfer_rule_2', { defaultMessage: 'Một số sự kiện đặc biệt (theo yêu cầu của Ban tổ chức) có thể bị khóa tính năng chuyển nhượng để đảm bảo an ninh.' })}</li>
                                <li>{t('transfer_rule_3', { defaultMessage: 'Sau khi chuyển nhượng, toàn bộ quyền sở hữu vé sẽ thuộc về người nhận.' })}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Giá trần */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('price_ceiling_title', { defaultMessage: '3. Quy định về Giá Trần (Price Ceiling)' })}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('price_ceiling_desc1', { defaultMessage: 'Nhằm tạo môi trường công bằng và hạn chế tình trạng chợ đen (scalping), mọi giao dịch bán lại đều chịu sự kiểm soát của cơ chế Giá Trần.' })}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('price_ceiling_rule_1', { defaultMessage: 'Giá bán lại tối đa không được vượt quá X% so với giá gốc (tùy thuộc vào thiết lập của từng Ban tổ chức, thường là 120% - 150%).' })}</li>
                                <li>{t('price_ceiling_rule_2', { defaultMessage: 'Mọi tin đăng bán vượt mức giá trần sẽ bị hệ thống từ chối tự động bằng Smart Contract.' })}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Royalty Fee */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('royalty_fee_title', { defaultMessage: '4. Phí Bản Quyền (Royalty Fee)' })}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('royalty_fee_desc1', { defaultMessage: 'Với mỗi giao dịch bán lại thành công trên thị trường thứ cấp, một tỷ lệ phần trăm nhỏ sẽ được trích xuất làm Royalty Fee.' })}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('royalty_fee_rule_1', { defaultMessage: 'Phí này được tự động chuyển trực tiếp cho Ban tổ chức (Organizer) của sự kiện thông qua hợp đồng thông minh.' })}</li>
                                <li>{t('royalty_fee_rule_2', { defaultMessage: 'Royalty Fee giúp bảo vệ quyền lợi của nghệ sĩ và nhà tổ chức, khuyến khích họ tạo ra những sự kiện chất lượng hơn.' })}</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
