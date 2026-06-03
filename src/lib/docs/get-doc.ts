/**
 * @file src/lib/docs/get-doc.ts
 *
 * Loader MDX chung cho mọi loại tài liệu:
 *   - Legal  → src/content/legal/<locale>/<slug>.mdx
 *   - Help   → src/content/help/<locale>/<slug>.mdx
 *   - About  → src/content/about/<locale>/index.mdx
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

import {
    isLegalSlug,
    isHelpSlug,
    getLegalMeta,
    getHelpMeta,
    getAboutMeta,
    type LegalSlug,
    type HelpSlug,
    type AnyDocSlug,
    type AnyRegistryItem,
} from "./registry";

// ─── Shared types ──────────────────────────────────────────────────────────────

/** Frontmatter fields parsed from any MDX file */
export type DocFrontmatter = {
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

export type AnyDoc = {
    slug: AnyDocSlug;
    locale: string;
    /** Frontmatter từ file MDX (overrides registry khi có giá trị) */
    frontmatter: DocFrontmatter;
    /** Meta từ registry (luôn đầy đủ) */
    registryMeta: AnyRegistryItem;
    content: string;
};

// ─── Supported locales ─────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ["vi"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
    return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

// ─── Path resolvers ────────────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), "src", "contents");

function resolveLegalPath(locale: string, slug: LegalSlug): string {
    return path.join(CONTENT_ROOT, "legal", locale, `${slug}.mdx`);
}

function resolveHelpPath(locale: string, slug: HelpSlug): string {
    return path.join(CONTENT_ROOT, "help", locale, `${slug}.mdx`);
}

function resolveAboutPath(locale: string): string {
    // About có 1 file duy nhất per locale: about/<locale>/index.mdx
    return path.join(CONTENT_ROOT, "about", locale, "index.mdx");
}

// ─── Core loader ───────────────────────────────────────────────────────────────

async function readMdx(filePath: string): Promise<{ frontmatter: DocFrontmatter; content: string }> {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        const { content, data } = matter(raw);
        return { frontmatter: data as DocFrontmatter, content };
    } catch {
        notFound();
    }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Load a legal document.
 * Validates locale and slug, resolves file path, returns merged meta + content.
 */
export async function getLegalDoc(locale: string, slug: string): Promise<AnyDoc> {
    if (!isSupportedLocale(locale)) notFound();
    if (!isLegalSlug(slug)) notFound();

    const { frontmatter, content } = await readMdx(resolveLegalPath(locale, slug));

    return {
        slug,
        locale,
        frontmatter,
        registryMeta: getLegalMeta(slug),
        content,
    };
}

/**
 * Load a help document (faq | help-center).
 */
export async function getHelpDoc(locale: string, slug: string): Promise<AnyDoc> {
    if (!isSupportedLocale(locale)) notFound();
    if (!isHelpSlug(slug)) notFound();

    const { frontmatter, content } = await readMdx(resolveHelpPath(locale, slug));

    return {
        slug,
        locale,
        frontmatter,
        registryMeta: getHelpMeta(slug),
        content,
    };
}

/**
 * Load the about page for a given locale.
 */
export async function getAboutDoc(locale: string): Promise<AnyDoc> {
    if (!isSupportedLocale(locale)) notFound();

    const { frontmatter, content } = await readMdx(resolveAboutPath(locale));

    return {
        slug: "about",
        locale,
        frontmatter,
        registryMeta: getAboutMeta("about"),
        content,
    };
}
