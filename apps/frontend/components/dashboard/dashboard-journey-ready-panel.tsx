"use client";

import NextImage from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const JOURNEY_READY_BG = "/images/landing/journey-ready-headphones.png";

export function DashboardJourneyReadyPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

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
      <motion.div
        className="absolute inset-0 origin-center will-change-transform"
        style={{ scale: reduceMotion ? 1 : scale }}
        aria-hidden
      >
        <NextImage
          src={JOURNEY_READY_BG}
          alt=""
          fill
          className="object-cover object-[center_42%]"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority={false}
        />
      </motion.div>

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