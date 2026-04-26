"use client";

import { useEffect, useState } from "react";

import { GUIDE_IN_PAGE_NAV } from "@/constants/guide/selection";
import { cn } from "@/lib/utils";

export function GuideInPageNav() {
  const [active, setActive] = useState<string>(GUIDE_IN_PAGE_NAV[0]?.id ?? "guide-top");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-guide-section]"));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.target.id)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const next = visible[0]?.target.id;
        if (next) setActive(next);
      },
      { root: null, rootMargin: "-12% 0px -55% 0px", threshold: [0.08, 0.2, 0.35, 0.55] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="На что смотреть по гиду" className="sticky top-24">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">На что смотреть</div>
      <ol className="mt-2 list-none space-y-0 border-l border-white/10 pl-2.5">
        {GUIDE_IN_PAGE_NAV.map((item, idx) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex w-full gap-1.5 rounded-md py-1.5 pl-1.5 pr-1.5 text-left text-[11px] leading-snug transition-[background-color,color,opacity] duration-200 md:text-[12px]",
                  isActive
                    ? "bg-zinc-800/75 font-medium text-white"
                    : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "w-5 shrink-0 pt-px font-mono text-[10px] tabular-nums",
                    isActive ? "text-white/75" : "text-zinc-600",
                  )}
                >
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                <span className="min-w-0">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
