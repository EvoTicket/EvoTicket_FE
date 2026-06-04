"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Youtube, Twitter, Instagram, Linkedin, Mail, Phone, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  getLegalHref,
  getLegalMeta,
  getHelpHref,
  getHelpMeta,
  getAboutHref,
  getAboutMeta,
  getFooterAboutDocs,
  getFooterHelpDocs,
  type LegalSlug,
} from "@/src/lib/docs/registry";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FooterLink = { href: string; label: string };

// ─── Sub-component ─────────────────────────────────────────────────────────────

function FooterLinkGroup({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Social icons — disabled until real URLs exist ────────────────────────────

const SOCIAL_ICONS = [Youtube, Facebook, Twitter, Instagram, Linkedin] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("Footer");

  // ── Cột 2: EvoTicket — about + help pages ────────────────────────────────────
  const evoticketLinks: FooterLink[] = [
    ...getFooterAboutDocs().map((slug) => ({
      href: getAboutHref(locale),
      label: getAboutMeta(slug, locale).shortTitle,
    })),
    ...getFooterHelpDocs().map((slug) => ({
      href: getHelpHref(locale, slug),
      label: getHelpMeta(slug, locale).shortTitle,
    })),
  ];

  // ── Cột 3: Legal (7 mục) ─────────────────────────────────────────────────────
  const legalSlugs: LegalSlug[] = [
    "terms-of-use",
    "privacy-policy",
    "general-transaction-conditions",
    "ticket-policy",
    "payment-policy",
    "refund-policy",
    "dispute-resolution",
  ];

  const legalLinks: FooterLink[] = legalSlugs.map((slug) => ({
    href: getLegalHref(locale, slug),
    label: getLegalMeta(slug, locale).shortTitle,
  }));

  // ── Cột 4: Organizer (4 mục) ─────────────────────────────────────────────────
  const organizerSlugs: LegalSlug[] = [
    "organizer-terms",
    "resale-policy",
    "ai-chatbot-policy",
    "blockchain-nft-policy",
  ];

  const organizerLinks: FooterLink[] = organizerSlugs.map((slug) => ({
    href: getLegalHref(locale, slug),
    label: getLegalMeta(slug, locale).shortTitle,
  }));

  return (
    <footer className="bg-secondary text-text-secondary transition-colors duration-300 text-sm pt-12">
      <div className="max-w-[90%] mx-auto px-4">

        {/* === TOP SECTION: 4 CỘT CÂN ĐỐI === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* CỘT 1: LOGO, CONTACT & SOCIAL */}
          <div>
            <Link href={`/${locale}/user/homepage`} className="flex flex-col gap-2 mb-4 group hover:opacity-90 transition-opacity">
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

            {/* Contact */}
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-text-muted shrink-0" />
                {t("hotline")}:{" "}
                <span className="font-semibold text-text-primary">1900 636 686</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-text-muted shrink-0" />
                {t("time")}: {t("time_value")}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-text-muted shrink-0" />
                {t("email")}:{" "}
                <span className="text-text-primary">support@evoticket.vn</span>
              </li>
            </ul>

            {/* Social — disabled until real URLs are available */}
            <div className="flex gap-3 mt-4">
              {SOCIAL_ICONS.map((Icon, i) => (
                <span
                  key={i}
                  aria-disabled="true"
                  title={t("social_coming_soon")}
                  className="text-text-muted opacity-40 cursor-not-allowed select-none"
                >
                  <Icon size={18} />
                </span>
              ))}
            </div>
          </div>

          {/* CỘT 2: EVOTICKET */}
          <FooterLinkGroup title={t("group_evoticket")} links={evoticketLinks} />

          {/* CỘT 3: LEGAL */}
          <FooterLinkGroup title={t("group_legal")} links={legalLinks} />

          {/* CỘT 4: ORGANIZER */}
          <FooterLinkGroup title={t("group_organizer")} links={organizerLinks} />

        </div>

        {/* === MIDDLE SECTION: THANH TOÁN & CHỨNG NHẬN === */}
        <div className="border-t border-border-default py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div>
              <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider">
                {t("payment_partners")}
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-bg-surface p-2 rounded border border-border-default w-24 h-12 flex items-center justify-center">
                  <span className="font-bold text-blue-600 italic">VietQR</span>
                </div>
                <div className="bg-bg-surface p-2 rounded border border-border-default w-24 h-12 flex items-center justify-center">
                  <span className="font-bold text-red-600">VNPay</span>
                </div>
                <div className="bg-bg-surface p-2 rounded-full border border-border-default w-10 h-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-blue-500">Zalo</span>
                </div>
                <div className="bg-bg-surface p-2 rounded-full border border-border-default w-10 h-10 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-pink-500">MoMo</span>
                </div>
              </div>
            </div>

            {/* Chứng nhận */}
            <div className="md:text-right">
              <h3 className="font-bold text-text-primary uppercase mb-4 text-xs tracking-wider md:justify-end flex">
                {t("certification")}
              </h3>
              <div className="flex md:justify-end">
                <div className="w-32 h-12 bg-contain bg-no-repeat bg-center border border-dashed border-border-default rounded flex items-center justify-center text-[10px] text-center px-1 text-text-muted">
                  {t("bct_placeholder")}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* === BOTTOM BAR: COPYRIGHT === */}
      <div className="bg-button-primary-bg-default text-button-primary-text-default/90 py-6 text-[11px] leading-relaxed">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <p className="font-semibold">{t("rights_reserved")}</p>
          </div>

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
