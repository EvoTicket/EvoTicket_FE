import Link from "next/link";
import type { ReactNode } from "react";

import {
    getAllLegalSlugs,
    getLegalHref,
    getLegalMeta,
    isLegalSlug,
    type LegalSlug,
} from "@/src/lib/legal/registry";
import type { LegalDocMeta } from "@/src/lib/legal/get-legal-doc";

type TocItem = {
    id: string;
    level: 2 | 3;
    title: string;
};

type RelatedPolicy = {
    slug: LegalSlug;
    title: string;
    description: string;
};

type LegalDocumentLayoutProps = {
    locale: string;
    slug: LegalSlug;
    meta: LegalDocMeta;
    content: string;
    children: ReactNode;
};

const headingRegex = /^(##|###)\s+(.+)$/gm;
const githubSluggerRegex = /[\0-\x1F\x7F-\x9F!-/:-@[-`{-~]/g;

function stripMarkdownInline(value: string) {
    return value
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/[`*_~]/g, "")
        .replace(/\s+#+\s*$/g, "")
        .trim();
}

function createGithubCompatibleSlugger() {
    const seen = new Map<string, number>();

    return (value: string) => {
        const base = value
            .toLowerCase()
            .replace(githubSluggerRegex, "")
            .replace(/ /g, "-");
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);

        return count === 0 ? base : `${base}-${count}`;
    };
}

function buildToc(content: string): TocItem[] {
    const slug = createGithubCompatibleSlugger();
    const toc: TocItem[] = [];

    for (const match of content.matchAll(headingRegex)) {
        const marker = match[1];
        const rawTitle = match[2];
        const title = stripMarkdownInline(rawTitle);

        if (!title) continue;

        toc.push({
            id: slug(title),
            level: marker.length as 2 | 3,
            title,
        });
    }

    return toc;
}

function getRelatedPolicies(meta: LegalDocMeta, currentSlug: LegalSlug): RelatedPolicy[] {
    const relatedFromFrontmatter = meta.relatedPolicies?.filter(isLegalSlug) ?? [];
    const relatedSlugs =
        relatedFromFrontmatter.length > 0
            ? relatedFromFrontmatter
            : getAllLegalSlugs().filter((slug) => slug !== currentSlug).slice(0, 5);

    return relatedSlugs
        .filter((slug) => slug !== currentSlug)
        .map((slug) => {
            const item = getLegalMeta(slug);

            return {
                slug,
                title: item.shortTitle,
                description: item.description,
            };
        });
}

function TocCard({ items, compact = false }: { items: TocItem[]; compact?: boolean }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Mục lục tài liệu"
            className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Mục lục
            </p>

            <div className={compact ? "mt-3 grid gap-2 sm:grid-cols-2" : "mt-3 space-y-1"}>
                {items.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={[
                            "block rounded-ds-lg px-3 py-2 text-sm leading-5 transition-colors",
                            "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                            item.level === 3 ? "md:ml-3 md:text-xs" : "font-medium",
                        ].join(" ")}
                    >
                        {item.title}
                    </a>
                ))}
            </div>
        </nav>
    );
}

function RelatedPoliciesCard({
    locale,
    policies,
}: {
    locale: string;
    policies: RelatedPolicy[];
}) {
    if (policies.length === 0) {
        return null;
    }

    return (
        <aside className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Tài liệu liên quan
            </p>

            <div className="mt-3 space-y-2">
                {policies.map((policy) => (
                    <Link
                        key={policy.slug}
                        href={getLegalHref(locale, policy.slug)}
                        className="block rounded-ds-lg border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-border-default hover:bg-bg-subtle"
                    >
                        <span className="block text-sm font-semibold text-text-primary">
                            {policy.title}
                        </span>
                        <div className="mt-1 line-clamp-1 text-xs leading-5 text-text-muted">
                            {policy.description}
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}

export function LegalDocumentLayout({
    locale,
    slug,
    meta,
    content,
    children,
}: LegalDocumentLayoutProps) {
    const toc = buildToc(content);
    const relatedPolicies = getRelatedPolicies(meta, slug);

    return (
        <section className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-24 md:px-6 md:pb-16 md:pt-28 xl:px-8">
            <header className="mx-auto mb-6 max-w-4xl rounded-2xl border border-border bg-surface p-5 shadow-sm md:mb-8 md:p-7">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
                    EvoTicket Legal Center
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                    {meta.title ?? "Chính sách EvoTicket"}
                </h1>

                {meta.description ? (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                        {meta.description}
                    </p>
                ) : null}

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    {meta.version ? (
                        <div className="rounded-ds-lg border border-border-subtle bg-bg-surface px-3 py-2">
                            <dt className="text-xs text-text-muted">Phiên bản</dt>
                            <dd className="mt-1 font-semibold text-text-primary">{meta.version}</dd>
                        </div>
                    ) : null}

                    {meta.effectiveDate ? (
                        <div className="rounded-ds-lg border border-border-subtle bg-bg-surface px-3 py-2">
                            <dt className="text-xs text-text-muted">Ngày hiệu lực</dt>
                            <dd className="mt-1 font-semibold text-text-primary">
                                {meta.effectiveDate}
                            </dd>
                        </div>
                    ) : null}

                    {meta.lastUpdated ? (
                        <div className="rounded-ds-lg border border-border-subtle bg-bg-surface px-3 py-2">
                            <dt className="text-xs text-text-muted">Cập nhật lần cuối</dt>
                            <dd className="mt-1 font-semibold text-text-primary">
                                {meta.lastUpdated}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            </header>

            <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,820px)_280px] xl:justify-center">
                <div className="lg:hidden">
                    <TocCard items={toc} compact />
                </div>

                <aside className="hidden lg:block">
                    <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                        <TocCard items={toc} />
                    </div>
                </aside>

                <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-8">
                    {children}
                </article>

                <aside className="xl:block">
                    <div className="xl:sticky xl:top-28">
                        <RelatedPoliciesCard locale={locale} policies={relatedPolicies} />
                    </div>
                </aside>
            </div>
        </section>
    );
}
