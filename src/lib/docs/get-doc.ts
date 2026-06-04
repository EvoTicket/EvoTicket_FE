/**
 * @file src/lib/docs/get-doc.ts
 *
 * Loader MDX chung cho mọi loại tài liệu:
 *   - Legal  → src/contents/legal/<locale>/<slug>.mdx
 *   - Help   → src/contents/help/<locale>/<slug>.mdx
 *   - About  → src/contents/about/<locale>/index.mdx
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
} from "./registry";

// ─── Shared types ──────────────────────────────────────────────────────────────

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

export type LocalizedDocRegistryMeta =
  | ReturnType<typeof getLegalMeta>
  | ReturnType<typeof getHelpMeta>
  | ReturnType<typeof getAboutMeta>;

export type AnyDoc = {
  slug: AnyDocSlug;
  locale: "vi" | "en";
  frontmatter: DocFrontmatter;
  registryMeta: LocalizedDocRegistryMeta;
  content: string;
};

// ─── Supported locales ─────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ["vi", "en"] as const;

function isSupportedLocale(
  locale: string
): locale is (typeof SUPPORTED_LOCALES)[number] {
  return SUPPORTED_LOCALES.includes(
    locale as (typeof SUPPORTED_LOCALES)[number]
  );
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
  return path.join(CONTENT_ROOT, "about", locale, "index.mdx");
}

// ─── Core loader ───────────────────────────────────────────────────────────────

async function readMdx(
  filePath: string
): Promise<{ frontmatter: DocFrontmatter; content: string }> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { content, data } = matter(raw);

    return {
      frontmatter: data as DocFrontmatter,
      content,
    };
  } catch (error) {
    console.error("[get-doc] Failed to read MDX file:", {
      filePath,
      error,
    });

    notFound();
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getLegalDoc(
  locale: string,
  slug: string
): Promise<AnyDoc> {
  if (!isSupportedLocale(locale)) notFound();
  if (!isLegalSlug(slug)) notFound();

  const { frontmatter, content } = await readMdx(
    resolveLegalPath(locale, slug)
  );

  return {
    slug,
    locale,
    frontmatter,
    registryMeta: getLegalMeta(slug, locale),
    content,
  };
}

export async function getHelpDoc(
  locale: string,
  slug: string
): Promise<AnyDoc> {
  if (!isSupportedLocale(locale)) notFound();
  if (!isHelpSlug(slug)) notFound();

  const { frontmatter, content } = await readMdx(resolveHelpPath(locale, slug));

  return {
    slug,
    locale,
    frontmatter,
    registryMeta: getHelpMeta(slug, locale),
    content,
  };
}

export async function getAboutDoc(locale: string): Promise<AnyDoc> {
  if (!isSupportedLocale(locale)) notFound();

  const { frontmatter, content } = await readMdx(resolveAboutPath(locale));

  return {
    slug: "about",
    locale,
    frontmatter,
    registryMeta: getAboutMeta("about", locale),
    content,
  };
}