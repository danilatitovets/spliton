"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fade-up when section enters viewport (landing). */
export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.75, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Logo / mark: enter from left when block scrolls into view. */
export function LandingRevealFromLeft({
  children,
  className,
  delay = 0,
}: LandingRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: -72 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

type LandingScrollRootProps = {
  children: ReactNode;
};

/** Enables smooth document scroll + header offset while landing is mounted. */
export function LandingScrollRoot({ children }: LandingScrollRootProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const root = document.documentElement;
    root.classList.add("landing-scroll-smooth");
    return () => {
      root.classList.remove("landing-scroll-smooth");
    };
  }, [reduceMotion]);

  return <>{children}</>;
}