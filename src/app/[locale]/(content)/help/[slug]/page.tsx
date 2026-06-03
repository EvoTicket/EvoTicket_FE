import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getHelpDoc } from "@/src/lib/docs/get-doc";
import { getAllHelpSlugs } from "@/src/lib/docs/registry";
import { LegalFloatingActions } from "@/src/components/contents/floatingActions";
import { legalMdxComponents } from "@/src/components/contents/mdx-components";
import { ContentLayout } from "@/src/components/contents/contents-layout";
type PageProps = {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
};
export async function generateStaticParams() {
    const locales = ["vi"];
    const slugs = getAllHelpSlugs();
    return locales.flatMap((locale) =>
        slugs.map((slug) => ({ locale, slug }))
    );
}
export async function generateMetadata({ params }: PageProps) {
    const { locale, slug } = await params;
    const doc = await getHelpDoc(locale, slug);
    return {
        title: `${doc.registryMeta.title} | EvoTicket`,
        description: doc.registryMeta.description,
    };
}
export default async function HelpPage({ params }: PageProps) {
    const { locale, slug } = await params;
    const doc = await getHelpDoc(locale, slug);
    return (
        <main className="relative min-h-screen w-full bg-main text-txt-primary">
            <LegalFloatingActions />
            <ContentLayout
                locale={locale}
                slug={doc.slug}
                meta={doc.frontmatter}
                registryMeta={doc.registryMeta}
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
            </ContentLayout>
        </main>
    );
}
