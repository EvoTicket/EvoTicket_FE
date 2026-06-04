"use client";

import type { MouseEvent, ReactNode } from "react";

type TocLinkProps = {
    href: `#${string}`;
    children: ReactNode;
    className?: string;
};

export function TocLink({ href, children, className }: TocLinkProps) {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.altKey ||
            event.ctrlKey ||
            event.shiftKey
        ) {
            return;
        }

        const target = document.getElementById(decodeURIComponent(href.slice(1)));

        if (!target) {
            return;
        }

        event.preventDefault();

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
        });

        window.history.pushState(null, "", href);

        if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
        }

        target.focus({ preventScroll: true });
    }

    return (
        <a href={href} className={className} onClick={handleClick}>
            {children}
        </a>
    );
}
