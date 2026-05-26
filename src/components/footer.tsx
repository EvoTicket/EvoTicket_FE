"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, Twitter, Instagram, Linkedin, Mail, Phone, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");


  return (
    <footer className="bg-secondary text-text-secondary transition-colors duration-300 text-sm pt-12">
      <div className="max-w-[90%] mx-auto px-4">

        {/* === TOP SECTION: 5 CỘT === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

          {/* CỘT 1: LOGO & GIỚI THIỆU */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col gap-2 mb-4 group hover:opacity-90 transition-opacity">
              <div className="flex items-center">
                <Image 
                    src="/evoticket-logo/light/light-primary=horizontal-logo.svg" 
                    alt="EvoTicket" 
                    width={150} 
                    height={36} 
                    className="object-contain dark:hidden" 
                />
                <Image 
                    src="/evoticket-logo/dark/dark-primary=horizontal-logo.svg" 
                    alt="EvoTicket" 
                    width={150} 
                    height={36} 
                    className="object-contain hidden dark:block" 
                />
              </div>
              <span className="text-[10px] text-text-muted mt-1">
                {t("desc_line1")}<br />{t("desc_line2")}
              </span>
            </Link>
            <p className="mb-4 text-xs leading-relaxed text-text-secondary">
              {t("slogan")}
            </p>
          </div>

          {/* CỘT 2: VỀ CHÚNG TÔI */}
          <div>
            <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">{t("about_us")}</h3>
            <ul className="space-y-2.5">
              {[t('about_evoticket'), t('careers'), t('blog'), t('press'), t('affiliate')].map((item, index) => (
                <li key={index}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: TRỢ GIÚP */}
          <div>
            <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">{t("help")}</h3>
            <ul className="space-y-2.5">
              {[t('help_center'), t('faq'), t('privacy_policy'), t('terms_of_use'), t('refund_policy'), t('dispute_resolution')].map((item, index) => (
                <li key={index}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 4: ĐỐI TÁC & SỰ KIỆN */}
          <div>
            <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">{t("partners_events")}</h3>
            <ul className="space-y-2.5">
              {[t('for_organizers'), t('sell_tickets'), t('concert_tickets'), t('workshop_tickets'), t('sport_tickets')].map((item, index) => (
                <li key={index}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 5: KẾT NỐI VỚI CHÚNG TÔI */}
          <div>
            <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">{t("connect_with_us")}</h3>
            <div className="flex gap-4 mb-4">
              {[Youtube, Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="text-text-muted hover:text-primary transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-text-muted" /> {t("hotline")}: <span className="font-semibold text-text-primary">1900 636 686</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-text-muted" /> {t("time")}: {t("time_value")}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-text-muted" /> {t("email")}: <span className="text-text-primary">support@evoticket.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* === MIDDLE SECTION: THANH TOÁN & CHỨNG NHẬN === */}
        <div className="border-t border-border-default py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div>
              <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">{t("payment_partners")}</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="	bg-bg-surface p-2 rounded border border-border-default w-24 h-12 flex items-center justify-center">
                  <span className="font-bold text-blue-600 italic">VietQR</span>
                </div>
                <div className="	bg-bg-surface p-2 rounded border border-border-default w-24 h-12 flex items-center justify-center">
                  <span className="font-bold text-red-600">VNPay</span>
                </div>
                <div className="	bg-bg-surface p-2 rounded-full border border-border-default w-10 h-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-blue-500">Zalo</span>
                </div>
                <div className="	bg-bg-surface p-2 rounded-full border border-border-default w-10 h-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-pink-500">MoMo</span>
                </div>
              </div>
            </div>

            {/* Chứng nhận */}
            <div className="md:text-right">
              <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider md:justify-end flex">{t("certification")}</h3>
              <div className="flex md:justify-end">
                <div className="w-32 h-12 bg-contain bg-no-repeat bg-center border border-dashed border-border-default rounded flex items-center justify-center text-[10px] text-center px-1 text-text-muted">
                  {t("bct_placeholder")}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* === BOTTOM BAR: COPYRIGHT (Màu tím cố định - Primary Color) === */}
      <div className="bg-button-primary-bg-defaultext-button-primary-text-default/90 py-6 text-[11px] leading-relaxed">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Left */}
          <div>
            <p className="font-semibold">{t("rights_reserved")}</p>
          </div>

          {/* Right */}
          <div className="md:text-right opacity-80">
            <p className="font-bold uppercase">{t("company_name")}</p>
            <p>{t("address_label")} {t("address_value")}</p>
            <p>{t("license_label")} {t("license_value")}</p>
          </div>

        </div>
      </div>
    </footer>
  );
}