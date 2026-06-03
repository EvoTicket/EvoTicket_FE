import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

import { isLegalSlug, type LegalSlug } from "./registry";

export type LegalDocMeta = {
    title?: string;
    slug?: string;
    description?: string;
    version?: string;
    effectiveDate?: string;
    lastUpdated?: string;
    legalCategory?: string;
    documentType?: string;
    locale?: string;
    status?: string;
    requiredForFlow?: string[];
    relatedPolicies?: string[];
};

export type LegalDoc = {
    slug: LegalSlug;
    locale: string;
    meta: LegalDocMeta;
    content: string;
};

const SUPPORTED_LOCALES = ["vi"] as const;

function isSupportedLocale(locale: string): locale is (typeof SUPPORTED_LOCALES)[number] {
    return SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number]);
}

export async function getLegalDoc(locale: string, slug: string): Promise<LegalDoc> {
    if (!isSupportedLocale(locale)) {
        notFound();
    }

    if (!isLegalSlug(slug)) {
        notFound();
    }

    const filePath = path.join(
        process.cwd(),
        "src",
        "content",
        "legal",
        locale,
        `${slug}.mdx`
    );

    try {
        const raw = await fs.readFile(filePath, "utf8");
        const { content, data } = matter(raw);

        return {
            slug,
            locale,
            meta: data,
            content,
        };
    } catch {
        notFound();
    }
}