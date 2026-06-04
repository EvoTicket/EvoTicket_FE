"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

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
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(95,74,157,0.18),transparent_38%,rgba(223,169,42,0.14)_68%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--ev-color-bg-page)_0%,rgba(255,255,255,0)_42%,var(--ev-color-bg-page)_100%)] dark:bg-[linear-gradient(to_bottom,var(--ev-color-bg-page)_0%,rgba(31,18,41,0.48)_46%,var(--ev-color-bg-page)_100%)]" />
    </div>
  );
}

export default function HeroNeuralBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <HeroBackgroundFallback />;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-bg-page"
    >
      <HeroNeuralBackgroundScene />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--ev-color-bg-page)_0%,rgba(255,255,255,0.32)_42%,var(--ev-color-bg-page)_100%)] dark:bg-[linear-gradient(to_bottom,var(--ev-color-bg-page)_0%,rgba(31,18,41,0.42)_46%,var(--ev-color-bg-page)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ev-color-bg-page)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,var(--ev-color-bg-page)_100%)] dark:bg-[linear-gradient(90deg,var(--ev-color-bg-page)_0%,rgba(31,18,41,0)_30%,rgba(31,18,41,0)_70%,var(--ev-color-bg-page)_100%)]" />
    </div>
  );
}
