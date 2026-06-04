"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const HeroNeuralBackgroundScene = dynamic(
  () => import("./HeroNeuralBackgroundScene"),
  {
    ssr: false,
    loading: () => <HeroBackgroundFallback />,
  }
);

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

function HeroBackgroundFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden bg-bg-page"
    >
      <div
        className={[
          "absolute inset-0",
          "bg-[radial-gradient(circle_at_72%_34%,rgba(140,132,204,0.22),transparent_30%),linear-gradient(to_bottom,#FCFCFF_0%,#F5F3FB_100%)]",
          "dark:bg-[radial-gradient(circle_at_72%_34%,rgba(140,132,204,0.24),transparent_34%),linear-gradient(to_bottom,#0B1020_0%,#1F1229_100%)]",
        ].join(" ")}
      />
    </div>
  );
}

export default function HeroNeuralBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  if (prefersReducedMotion) {
    return <HeroBackgroundFallback />;
  }

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-0 z-0 overflow-hidden bg-bg-page",
        "[mask-image:linear-gradient(to_bottom,black_0%,black_86%,transparent_100%)]",
        "[-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_86%,transparent_100%)]",
      ].join(" ")}
    >
      <HeroNeuralBackgroundScene isDark={isDark} />
    </div>
  );
}