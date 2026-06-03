import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Link from "next/link";

import { getLegalDoc } from "@/src/lib/legal/get-legal-doc";
import { getAllLegalSlugs } from "@/src/lib/legal/registry";

type PageProps = {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
};

export async function generateStaticParams() {
    const locales = ["vi"];
    const slugs = getAllLegalSlugs();

    return locales.flatMap((locale) =>
        slugs.map((slug) => ({
            locale,
            slug,
        }))
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { locale, slug } = await params;
    const doc = await getLegalDoc(locale, slug);

    return {
        title: `${doc.meta.title ?? "Chính sách"} | EvoTicket`,
        description:
            doc.meta.description ??
            "Trang chính sách và điều khoản sử dụng của EvoTicket.",
    };
}

export default async function LegalPage({ params }: PageProps) {
    const { locale, slug } = await params;
    const doc = await getLegalDoc(locale, slug);

    return (
        <main className="min-h-screen bg-bg-page text-text-primary">
            <section className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
                <div className="mb-8 rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm md:p-6">
                    <div className="mb-4">
                        <Link
                            href={`/${locale}/user/homepage`}
                            className="text-sm font-medium text-text-link hover:underline"
                        >
                            ← Quay lại EvoTicket
                        </Link>
                    </div>

                    <p className="mb-2 text-sm font-medium text-text-secondary">
                        EvoTicket Legal Center
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        {doc.meta.title ?? "Chính sách EvoTicket"}
                    </h1>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
                        {doc.meta.version ? (
                            <span>Phiên bản: {doc.meta.version}</span>
                        ) : null}

                        {doc.meta.effectiveDate ? (
                            <span>Ngày hiệu lực: {doc.meta.effectiveDate}</span>
                        ) : null}

                        {doc.meta.lastUpdated ? (
                            <span>Cập nhật lần cuối: {doc.meta.lastUpdated}</span>
                        ) : null}
                    </div>
                </div>

                <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-text-link prose-a:no-underline hover:prose-a:underline">
                    <MDXRemote
                        source={doc.content}
                        options={{
                            mdxOptions: {
                                remarkPlugins: [remarkGfm],
                                rehypePlugins: [rehypeSlug],
                            },
                        }}
                    />
                </article>
            </section>
        </main>
    );
}