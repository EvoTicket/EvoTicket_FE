"use client";

import dynamic from "next/dynamic";

const HeroTicket3DScene = dynamic(
  () => import("./HeroTicket3DScene"),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[450px] w-full md:w-[85%] md:h-[600px] mx-auto">
        <div className="absolute inset-8 rounded-[2rem] bg-white/5 blur-2xl" />
        <div className="h-full w-full animate-pulse rounded-[2rem] bg-white/[0.03]" />
      </div>
    ),
  }
);

export default function HeroTicket3DLoader() {
  return <HeroTicket3DScene />;
}