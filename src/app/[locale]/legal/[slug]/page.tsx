import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { getLegalDoc } from "@/src/lib/legal/get-legal-doc";
import { getAllLegalSlugs } from "@/src/lib/legal/registry";
import { LegalFloatingActions } from "../../../../components/legal/LegalFloatingActions";
import { legalMdxComponents } from "@/src/components/legal/legal-mdx-components";
import { LegalDocumentLayout } from "@/src/components/legal/legal-document-layout";

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
        <main className="relative min-h-screen w-full bg-main text-txt-primary">
            <LegalFloatingActions />

            <LegalDocumentLayout
                locale={locale}
                slug={doc.slug}
                meta={doc.meta}
                content={doc.content}
            >
                <div>
                    <MDXRemote
                        source={doc.content}
                        components={legalMdxComponents}
                        options={{
                            mdxOptions: {
                                remarkPlugins: [remarkGfm],
                                rehypePlugins: [rehypeSlug],
                            },
                        }}
                    />
                </div>
            </LegalDocumentLayout>
        </main >
    );
}
