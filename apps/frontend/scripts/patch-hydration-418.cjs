const fs = require("fs");
const path = require("path");

const landingPath = path.join(__dirname, "../components/dashboard/landing-motion.tsx");
const landing = `"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

import { useClientMounted } from "@/hooks/use-client-mounted";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fade-up when section enters viewport (landing). */
export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const mounted = useClientMounted();
  const reduceMotion = useReducedMotion();
  // Gate on mount: useReducedMotion is null on SSR and may flip on the client (React #418).
  if (mounted && reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={mounted ? { opacity: 0, y: 28 } : false}
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
  const mounted = useClientMounted();
  const reduceMotion = useReducedMotion();
  if (mounted && reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={mounted ? { opacity: 0, x: -72 } : false}
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
`;
fs.writeFileSync(landingPath, landing, "utf8");

const heroPath = path.join(__dirname, "../components/dashboard/dashboard-hero.tsx");
let hero = fs.readFileSync(heroPath, "utf8");
if (hero.charCodeAt(1) === 0) hero = Buffer.from(hero, "binary").toString("utf16le");
if (!hero.includes("useClientMounted")) {
  hero = hero.replace(
    'import { cn } from "@/lib/utils";',
    'import { useClientMounted } from "@/hooks/use-client-mounted";\nimport { cn } from "@/lib/utils";',
  );
}
hero = hero.replace(
  `export function DashboardHero({ className }: { className?: string }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const easeOut = [0.22, 1, 0.36, 1] as const;`,
  `export function DashboardHero({ className }: { className?: string }) {
  const { t } = useI18n();
  const mounted = useClientMounted();
  const reduceMotion = useReducedMotion();
  const easeOut = [0.22, 1, 0.36, 1] as const;
  const animateIn = mounted && !reduceMotion;`,
);
hero = hero.replace(
  /initial=\{reduceMotion \? false : \{ opacity: 0, y: 32 \}\}\s*\n\s*animate=\{reduceMotion \? undefined : \{ opacity: 1, y: 0 \}\}/,
  `initial={animateIn ? { opacity: 0, y: 32 } : false}
          animate={animateIn ? { opacity: 1, y: 0 } : undefined}`,
);
fs.writeFileSync(heroPath, hero, "utf8");
console.log("ok", landingPath, heroPath.includes("animateIn") || hero.includes("animateIn"));
