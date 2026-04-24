import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ReleaseSectionShell({
  id,
  kicker,
  title,
  subtitle,
  children,
  className,
}: {
  id?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-release-parameters-section className={cn("scroll-mt-28", className)}>
      {kicker ? (
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{kicker}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">{subtitle}</p>
      ) : null}
      <div className="mt-8 md:mt-10">{children}</div>
    </section>
  );
}
