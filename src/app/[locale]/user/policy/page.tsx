import React from 'react';
import { useTranslations } from 'next-intl';

export default function PolicyPage() {
    const t = useTranslations('Policy');

    return (
        <div className="min-h-screen bg-bg-page pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">{t('page_title')}</h1>
                
                <div className="space-y-12">
                    {/* Quy chế và thông tin bán lại vé */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('resale_rules_title')}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('resale_rules_desc1')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('resale_rule_1')}</li>
                                <li>{t('resale_rule_2')}</li>
                                <li>{t('resale_rule_3')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Quy định chuyển nhượng */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('transfer_rules_title')}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('transfer_rules_desc1')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('transfer_rule_1')}</li>
                                <li>{t('transfer_rule_2')}</li>
                                <li>{t('transfer_rule_3')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Giá trần */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('price_ceiling_title')}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('price_ceiling_desc1')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('price_ceiling_rule_1')}</li>
                                <li>{t('price_ceiling_rule_2')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Royalty Fee */}
                    <section className="bg-bg-surface p-6 md:p-8 rounded-ds-2xl border border-border-default shadow-sm">
                        <h2 className="text-2xl font-bold text-text-primary mb-4">{t('royalty_fee_title')}</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>{t('royalty_fee_desc1')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>{t('royalty_fee_rule_1')}</li>
                                <li>{t('royalty_fee_rule_2')}</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
