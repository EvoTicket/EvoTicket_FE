import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

function H1(props: ComponentPropsWithoutRef<"h1">) {
    return <h1 {...props} className="sr-only" />;
}

function H2(props: ComponentPropsWithoutRef<"h2">) {
    return (
        <h2
            {...props}
            className="group mt-12 scroll-mt-28 border-b border-border-subtle pb-3 text-2xl font-bold tracking-tight text-text-primary"
        />
    );
}

function H3(props: ComponentPropsWithoutRef<"h3">) {
    return (
        <h3
            {...props}
            className="mt-8 scroll-mt-28 text-xl font-semibold text-text-primary"
        />
    );
}

function Paragraph(props: ComponentPropsWithoutRef<"p">) {
    return (
        <p
            {...props}
            className="my-4 text-[15px] leading-8 text-text-secondary md:text-base"
        />
    );
}

function UnorderedList(props: ComponentPropsWithoutRef<"ul">) {
    return (
        <ul
            {...props}
            className="my-5 space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-5 text-text-secondary"
        />
    );
}

function OrderedList(props: ComponentPropsWithoutRef<"ol">) {
    return (
        <ol
            {...props}
            className="my-5 space-y-2 rounded-2xl border border-border-subtle bg-bg-surface p-5 pl-8 text-text-secondary"
        />
    );
}

function ListItem(props: ComponentPropsWithoutRef<"li">) {
    return <li {...props} className="pl-1 leading-8 marker:text-text-link" />;
}

function Anchor(props: ComponentPropsWithoutRef<"a">) {
    const href = props.href ?? "#";

    if (href.startsWith("/")) {
        return (
            <Link
                href={href}
                className="font-medium text-text-link underline-offset-4 hover:text-text-link-hover hover:underline"
            >
                {props.children}
            </Link>
        );
    }

    return (
        <a
            {...props}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-text-link underline-offset-4 hover:text-text-link-hover hover:underline"
        />
    );
}

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
    return (
        <blockquote
            {...props}
            className="my-6 rounded-2xl border border-feedback-info-border bg-feedback-info-bg px-5 py-4 text-feedback-info-text"
        />
    );
}

function Table(props: ComponentPropsWithoutRef<"table">) {
    return (
        <div className="my-6 overflow-x-auto rounded-2xl border border-border-subtle bg-bg-surface">
            <table
                {...props}
                className="w-full border-collapse text-left text-sm text-text-secondary"
            />
        </div>
    );
}

function Th(props: ComponentPropsWithoutRef<"th">) {
    return (
        <th
            {...props}
            className="border-b border-border-subtle bg-bg-subtle px-4 py-3 font-semibold text-text-primary"
        />
    );
}

function Td(props: ComponentPropsWithoutRef<"td">) {
    return (
        <td
            {...props}
            className="border-b border-border-subtle px-4 py-3 leading-7 text-text-secondary"
        />
    );
}

function Hr(props: ComponentPropsWithoutRef<"hr">) {
    return <hr {...props} className="my-10 border-border-subtle" />;
}

function Strong(props: ComponentPropsWithoutRef<"strong">) {
    return <strong {...props} className="font-semibold text-text-primary" />;
}

export const legalMdxComponents = {
    h1: H1,
    h2: H2,
    h3: H3,
    p: Paragraph,
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    a: Anchor,
    blockquote: Blockquote,
    table: Table,
    th: Th,
    td: Td,
    hr: Hr,
    strong: Strong,
};
