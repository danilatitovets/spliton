const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../components/dashboard/dashboard-journey-ready-panel.tsx");
fs.writeFileSync(
  p,
  `"use client";

import NextImage from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { cn } from "@/lib/utils";

const JOURNEY_READY_BG = "/images/landing/journey-ready-headphones.png";

function JourneyReadyBackgroundImage() {
  return (
    <NextImage
      src={JOURNEY_READY_BG}
      alt=""
      fill
      className="object-cover object-[center_42%]"
      sizes="(max-width: 1200px) 100vw, 1200px"
      priority={false}
    />
  );
}

export function DashboardJourneyReadyPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useClientMounted();
  const reduceMotion = useReducedMotion();
  const animateParallax = mounted && !reduceMotion;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "end 0.2"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.28]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mt-10 min-h-[min(380px,68vh)] overflow-hidden rounded-[22px] sm:mt-12 md:min-h-[340px]",
        className,
      )}
    >
      {animateParallax ? (
        <motion.div
          className="absolute inset-0 origin-center will-change-transform"
          style={{ scale }}
          aria-hidden
        >
          <JourneyReadyBackgroundImage />
        </motion.div>
      ) : (
        <div className="absolute inset-0 origin-center will-change-transform" aria-hidden>
          <JourneyReadyBackgroundImage />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/92 via-black/78 to-black/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35"
        aria-hidden
      />

      <div className="relative z-10 p-5 sm:p-6 md:p-8">{children}</div>
    </div>
  );
}
`,
  "utf8",
);

// Also drop unused intlLocaleFor import from mini-order-book if unused
const mini = path.join(__dirname, "../components/dashboard/dashboard-mini-order-book.tsx");
let ms = fs.readFileSync(mini, "utf8");
if (!ms.includes("intlLocaleFor(") && ms.includes('import { intlLocaleFor }')) {
  ms = ms.replace('import { intlLocaleFor } from "@/lib/i18n/formatters";\n', "");
  fs.writeFileSync(mini, ms, "utf8");
  console.log("removed unused intl import");
}
console.log("ok");
