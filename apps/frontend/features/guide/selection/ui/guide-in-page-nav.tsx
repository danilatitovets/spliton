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
    <nav aria-label="Содержание гида" className="sticky top-28">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">On this page</div>
      <ul className="mt-3 space-y-1">
        {GUIDE_IN_PAGE_NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  isActive
                    ? "bg-[#B7F500]/14 font-medium text-[#d4f570]"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
